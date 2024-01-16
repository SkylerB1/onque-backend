const UserService = require("../services/userServices");
const { google } = require("googleapis");
const userInterface = new UserService();
const moment = require("moment");
const { OAuth2Client } = require("google-auth-library");
const axios = require("axios");
const { el } = require("date-fns/locale");
const { encryptToken, decryptToken } = require("../middleware/encryptToken");
const googleBusinessServices = require('../services/googlebusinessServices')


const getGoogleBusinessAuthUrl = async (req, res) => {
  try {
    const accessToken = req.headers.accesstoken;
    const platform = req.headers.platform;
    const id = req.headers.loginid;
    const brandId = req.query.brandId;

    const response = await axios.get(
      "https://mybusinessaccountmanagement.googleapis.com/v1/accounts/",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const account = response.data.accounts[0];
    const Id = account.name;
    const data = Id.split("/");
    const accountId = data[1];
    const forLocation = { accountId, accessToken, account };
    const loc = await getLocations(forLocation);
    const accountdata = response.data.accounts[0];
    const accountLocationData = loc.locations[0];

    const credentials = {
      accountID: accountdata.name ?? "",
      accountName: accountdata.accountName ?? "",
      type: accountdata?.type ?? "",
      verificationState: accountdata.verificationState ?? "",
      locations: accountLocationData.name ?? "",
      title: accountLocationData.title ?? "",
      storefrontAddress: accountLocationData?.storefrontAddress ?? "",
    };
    const accountNumber = response.data.accounts[0].name;
    const accountID = accountNumber.replace(/\D/g, '');

    const encryptedCreds = encryptToken(credentials);


    const userData = {
      brandId: brandId,
      userId: id,
      credentials: encryptedCreds,
      platform: platform,
      screenName: response.data.accounts[0].accountName,
    };
     await googleBusinessServices.mediaData(userData);
    return res.json(loc);
  } catch (error) {
    console.error("Error fetching business info:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getLocations = async (forLocation) => {
  try {
    // return
    const resp = await axios.get(
      `https://mybusinessbusinessinformation.googleapis.com/v1/${forLocation.account.name}/locations?readMask=name,title,storefrontAddress`,
      {
        headers: {
          Authorization: `Bearer ${forLocation.accessToken}`,
        },
      }
    );
    if (resp.status === 200) {
      const location = resp.data;
      return location;
    } else {
      console.error("Error:", resp.status, resp.statusText);
    }
  } catch (error) {
    // Handle any exceptions or network errors
    console.error("Error:", error.message);
  }
};

const googleBusinessPost = async (req, res) => {
  try {
    const headers = JSON.parse(req.headers.headersarraystring);
    const getHeaders = (platform) => {
      return headers.filter((headers) => headers.platform === platform)[0];
    };

    const googleBusinessHeaders = getHeaders("google-business");
    const accessToken = googleBusinessHeaders.accessToken;
    const accountId = googleBusinessHeaders.businessName;
    const location = googleBusinessHeaders.location;
    const getMediaType = req.body.getMediaType;
    const summary = req.body.text;
    let userId = req.body.userId;
    const googleBusinessPresets = req.body.googleBusinessPresets;
    const businessData = JSON.parse(googleBusinessPresets);
    const file = req.files[0].path;

    const receivedDateString = req.body.post_send_date;
    const receivedDate = moment(
      receivedDateString,
      "ddd MMM DD YYYY HH:mm:ss ZZ"
    );
    const currentDate = moment();
    const post_send_type = receivedDate.isSame(currentDate, "minute")
      ? "now"
      : "scheduled";

    if (getMediaType === "POST") {
      await googleBusinessActionMedia(
        accessToken,
        location,
        accountId,
        businessData,
        summary,
        userId,
        post_send_type,
        file
      );
    } else if (getMediaType === "OFFER") {
    } else if (getMediaType === "EVENT") {
    }
  } catch (err) {
    console.log(err);
  }
};

const googleBusinessActionMedia = async (
  accessToken,
  location,
  accountId,
  businessData,
  summary,
  userId,
  post_send_type,
  file
) => {
  try {
    const postData = {
      languageCode: "en-US",
      summary: summary,
      callToAction: {
        actionType: businessData?.button,
        url: businessData?.buttonLink,
      },
      media: [
        {
          mediaFormat: "PHOTO",
          sourceUrl: file,
        },
      ],
      // "topicType": "OFFER"
    };
    const response = await axios.post(
      `https://mybusiness.googleapis.com/v4/${accountId}/${location}/localPosts`,
      postData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error posting to Google My Business API:", error);
  }
};

module.exports = {
  getGoogleBusinessAuthUrl,
  googleBusinessPost,
  googleBusinessActionMedia,
};
