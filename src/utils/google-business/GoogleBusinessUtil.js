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

const googleMyBusinessAction = google.mybusinessplaceactions({
  version: "v1",
  auth: oAuth2Client,
});

const GBusinessSharePost = async (data, platform, userId) => {
  const { files, caption, additionalPresets } = data;

  try {
    const creds = await userService.getTokenByIdPlatform(userId, platform);
    console.log(creds);
    const { accessToken, refreshToken, id, account } = creds;
    console.log({ accessToken, refreshToken, id, account });

    oAuth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    await isTokenExpired(creds, userId);

    const file = files[0];

    const data = {
      languageCode: "en-US",
      summary: caption,
      // callToAction: {
      //   actionType: "ORDER",
      //   url: "http://google.com/order_turkeys_here",
      // },
      media: [
        {
          mediaFormat: "PHOTO",
          sourceUrl:
            "https://api.jjmedia.appwrk.com/assets/files-1705469897444.png",
        },
      ],
      topicType: "STANDARD",
    };

    try {
      const res = await axios.post(
        `https://mybusiness.googleapis.com/v4/${account}/${id}/localPosts`,
        data,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      console.log(res);

      return { success: true, data: res.data.id };
    } catch (err) {
      console.log(err);
      console.log(JSON.stringify(err.response.data));
      return { success: false, data: err.response.data };
    }
  } catch (err) {
    return { status: 400, data: err.response.data, success: false };
  }
};

const isTokenExpired = async (creds, userId) => {
  let { accessToken, refreshToken, ...rest } = creds;
  try {
    await oAuth2Client.getTokenInfo(accessToken);
  } catch (err) {
    if (err.response.data.error === "invalid_token") {
      const { credentials, res } = await oAuth2Client.refreshAccessToken();
      console.log(res);
      console.log(credentials);

      const { access_token, refresh_token } = credentials;
      accessToken = access_token;
      refreshToken = refresh_token;
      const encryptedCreds = encryptToken({
        accessToken,
        refreshToken,
        ...rest,
      });
      await updateUserCreds(encryptedCreds, userId, GoogleBusinessPlatform);

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
    console.log(JSON.stringify(accounts.data));
    const account = accounts.data.accounts[0].name;
    return { success: true, data: account };
  } catch (err) {
    console.log(JSON.stringify(err.response.data));
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
    console.log({ creds });
    const { accessToken, refreshToken } = creds;
    oAuth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    await isTokenExpired(creds, userId);
    const account = await GetBusinessAccounts();
    console.log({ account });
    if (account.success) {
      const res = await googleBusinessInfo.accounts.locations.list({
        parent: account.data,
        readMask: "name,title,storefrontAddress",
      });
      console.log(res.data);

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
