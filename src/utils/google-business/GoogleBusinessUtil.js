const UserService = require("../../services/userServices");
const moment = require("moment");
const userService = new UserService();
const path = require("path");
const { google } = require("googleapis");
const { GoogleBusinessPlatform } = require("../CommonString");
const { encryptToken } = require("../../middleware/encryptToken");
const { updateUserCreds } = require("../userUtil");
const { default: axios } = require("axios");
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, YOUTUBE_CALLBACK_URL } =
  process.env;

const oAuth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  YOUTUBE_CALLBACK_URL
);

const googleBusinessInfo = google.mybusinessbusinessinformation({
  version: "v1",
  auth: oAuth2Client,
});

const googleBusinessManage = google.mybusinessaccountmanagement({
  version: "v1",
  auth: oAuth2Client,
});

const GBusinessSharePost = async (data, mediaType, userId, brandId) => {
  try {
    const { caption, files, additionalPresets } = data;
    if (files.length > 1) {
      return { status: 400, data: "Max 1 image allowed", success: false };
    }
    const file = files[0];
    if (file?.mimetype?.includes("video")) {
      return {
        status: 400,
        data: "Video not allowed",
        success: false,
      };
    }
    const creds = await userService.getTokenByIdPlatform(
      userId,
      GoogleBusinessPlatform,
      1,
      brandId
    );
    const { accessToken, refreshToken, id, account } = creds;

    oAuth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    await isTokenExpired(creds, userId, brandId);
    const media = [];
    let postData = {
      languageCode: "en-US",
      summary: caption,
    };

    switch (mediaType) {
      case "OFFER":
        postData = offerPostData(postData, additionalPresets);
        postData.topicType = "OFFER";
        break;
      case "POST":
        postData = callToActionPost(postData, additionalPresets);
        postData.topicType = "STANDARD";
        break;
      case "EVENT":
        postData = eventPostData(postData, additionalPresets);
        postData.topicType = "EVENT";
        break;
      default:
        return { status: 400, data: "Invalid mediaType", success: false };
    }

    if (file) {
      media.push({
        mediaFormat: "PHOTO",
        sourceUrl:
          "https://api.jjmedia.appwrk.com/assets/files-1706085350825.png",
      });
      postData.media = media;
    }

    try {
      const res = await axios.post(
        `https://mybusiness.googleapis.com/v4/${account}/${id}/localPosts`,
        postData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      return { success: true, data: res.data.name };
    } catch (err) {
      console.log(err);
      console.log(JSON.stringify(err.response.data));
      return { success: false, data: err.response.data };
    }
  } catch (err) {
    return { status: 400, data: err.response.data, success: false };
  }
};

const offerPostData = (obj, data) => {
  const { couponCode, offerLink, termsCondition } = data;
  obj.offer = {
    couponCode: couponCode,
    redeemOnlineUrl: offerLink,
    termsConditions: termsCondition,
  };
  obj = eventPostData(obj, data);
  return obj;
};

const callToActionPost = (obj, data) => {
  const { button, buttonLink } = data;
  obj.callToAction = {
    actionType: button != "" ? button : "",
    url: buttonLink,
  };

  return obj;
};

const eventPostData = (obj, data) => {
  const { title, startDate, endDate, startTime, endTime, button, buttonLink } =
    data;

  obj.event = {
    title: title,
    schedule: {},
  };
  if (startDate && startDate !== "") {
    const splitStartDate = startDate !== "" ? startDate.split("-") : null;
    obj.event.schedule.startDate = {
      year: splitStartDate[0],
      month: splitStartDate[1],
      day: splitStartDate[2],
    };
  }
  if (endDate && endDate !== "") {
    const splitEndDate = endDate.split("-");
    obj.event.schedule.endDate = {
      year: splitEndDate[0],
      month: splitEndDate[1],
      day: splitEndDate[2],
    };
  }
  if (startTime && startTime != "") {
    const splitStartTime = startTime.split(":");
    obj.event.schedule.startTime = {
      hours: splitStartTime[0],
      minutes: splitStartTime[1],
      seconds: 0,
      nanos: 0,
    };
  }

  if (endTime && endTime != "") {
    const splitEndTime = endTime.split(":");
    obj.event.schedule.endTime = {
      hours: splitEndTime[0],
      minutes: splitEndTime[1],
      seconds: 0,
      nanos: 0,
    };
  }

  if (button && button !== "" && buttonLink && buttonLink !== "") {
    obj = callToActionPost(obj, data);
  }
  return obj;
};

const isTokenExpired = async (creds, userId, brandId) => {
  let { accessToken, refreshToken, ...rest } = creds;
  try {
    await oAuth2Client.getTokenInfo(accessToken);
  } catch (err) {
    if (err.response.data.error === "invalid_token") {
      const { credentials } = await oAuth2Client.refreshAccessToken();

      const { access_token, refresh_token } = credentials;
      accessToken = access_token;
      refreshToken = refresh_token;
      const encryptedCreds = encryptToken({
        accessToken,
        refreshToken,
        ...rest,
      });
      await updateUserCreds(
        encryptedCreds,
        userId,
        GoogleBusinessPlatform,
        1,
        brandId
      );

      oAuth2Client.setCredentials({
        access_token: access_token,
        refresh_token: refresh_token,
      });
    }
  }
};

const GetBusinessAccounts = async () => {
  try {
    const accounts = await googleBusinessManage.accounts.list();
    const account = accounts.data.accounts[0].name;
    return { success: true, data: account };
  } catch (err) {
    return { success: false, data: err.response.data };
  }
};

const GetBusinessLocations = async (userId, brandId) => {
  try {
    const creds = await userService.getTokenByIdPlatform(
      userId,
      GoogleBusinessPlatform,
      0,
      brandId
    );
    const { accessToken, refreshToken } = creds;
    oAuth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    await isTokenExpired(creds, userId);
    const account = await GetBusinessAccounts();
    if (account.success) {
      const res = await googleBusinessInfo.accounts.locations.list({
        parent: account.data,
        readMask: "name,title,storefrontAddress",
      });

      return {
        success: true,
        data: { locations: res.data.locations, account: account.data },
      };
    } else {
      return { success: false, data: account.data };
    }
  } catch (err) {
    console.log(err);
    return { success: false, data: err };
  }
};

const SetBusinessLocation = async (userId, data, brandId) => {
  try {
    const creds = await userService.getTokenByIdPlatform(
      userId,
      GoogleBusinessPlatform,
      0,
      brandId
    );

    const newCreds = { ...creds, ...data };
    const encryptedCreds = encryptToken(newCreds);

    const updatedCredResponse = await updateUserCreds(
      encryptedCreds,
      userId,
      GoogleBusinessPlatform,
      1,
      brandId
    );
    if (updatedCredResponse) {
      return { success: true };
    } else {
      return { success: false };
    }
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  GBusinessSharePost,
  isTokenExpired,
  GetBusinessLocations,
  SetBusinessLocation,
};
