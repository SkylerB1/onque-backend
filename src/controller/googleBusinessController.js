const UserService = require("../services/userServices");
const { google } = require("googleapis");
const userInterface = new UserService();
const moment = require("moment");
const { OAuth2Client } = require("google-auth-library");
const axios = require("axios");
const { el } = require("date-fns/locale");


const getGoogleBusinessAuthUrl = async (req, res) => {
  try {
    const accessToken = req.headers.accesstoken;
    const platform = req.headers.platform;

    const response = await axios.get(
      "https://mybusinessaccountmanagement.googleapis.com/v1/accounts/",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    // res.json(response.data);
    const account = response.data.accounts[0];
    // const accountName = account.accountName;
    const Id = account.name;
    const data = Id.split("/");
    const accountId = data[1];
    const forLocation = { accountId, accessToken, account };
    const loc = await getLocations(forLocation);
    //  console.log(loc)
    res.json({
      data: response.data,
      locationId: loc,
    });

    const userData = {
      userId: response.data.accounts[0].name,
      accessToken: accessToken,
      accessSecret: "",
      platform: platform,
      screenName: response.data.accounts[0].accountName,
      //  locations: loc,
    };
    await userInterface.setMediaToken(userData);
  } catch (error) {
    console.error("Error fetching business info:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getLocations = async (forLocation) => {
  try {
    // return
    const resp = await axios.get(
      `https://mybusinessbusinessinformation.googleapis.com/v1/${forLocation.account.name}/locations?readMask=name`,
      {
        headers: {
          Authorization: `Bearer ${forLocation.accessToken}`,
        },
      }
    );
    if (resp.status === 200) {
      // const locations = resp.data.name;
      // console.log('Locations:', locations);
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
    // console.log(req)
    const headers = JSON.parse(req.headers.headersarraystring);
    const getHeaders = (platform) => {
      return headers.filter((headers) => headers.platform === platform)[0];
    };

    const googleBusinessHeaders = getHeaders("google-business");
    const accessToken = googleBusinessHeaders.accessToken;
    // console.log(accessToken)
    const accountId = googleBusinessHeaders.businessName;
    const location = googleBusinessHeaders.location;
    const getMediaType = req.body.getMediaType;
    const summary = req.body.text;
    let userId = req.body.userId;
    const googleBusinessPresets = req.body.googleBusinessPresets;
    const businessData = JSON.parse(googleBusinessPresets);
    const file = req.files[0].path;
    // console.log(req.body)
    // console.log(accessToken,"first",accountId, "second",location, "third",getMediaType, summary, userId);

    const receivedDateString = req.body.post_send_date;
    const receivedDate = moment(
      receivedDateString,
      "ddd MMM DD YYYY HH:mm:ss ZZ"
    );
    const currentDate = moment();
    const post_send_type = receivedDate.isSame(currentDate, "minute")
      ? "now"
      : "scheduled";
    console.log(post_send_type);

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
      console.log("second");
    } else if (getMediaType === "EVENT") {
      console.log("third");
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
    // console.log(accessToken, location, accountId,businessData, summary, userId, post_send_type);
    // console.log(businessData, summary, userId, post_send_type);

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
    console.log(postData,`https://mybusiness.googleapis.com/v4/${accountId}/${location}/localPosts`);
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
    console.log("Post successful:");
    console.log(response.data);
  } catch (error) {
    console.error("Error posting to Google My Business API:", error);
  }
};

module.exports = {
  getGoogleBusinessAuthUrl,
  googleBusinessPost,
  googleBusinessActionMedia,
};
