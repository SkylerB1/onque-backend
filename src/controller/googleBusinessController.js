const UserService = require("../services/userServices");
const { google } = require("googleapis");
const userInterface = new UserService();
const moment = require("moment");
const { OAuth2Client } = require("google-auth-library");
const axios = require("axios");

const client = new OAuth2Client({
  clientId:
    "585227327062-na3cm988g4a3lkstuepo9snk7e0ra4cm.apps.googleusercontent.com",
  clientSecret: "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",
  redirectUri: "http://localhost:3000/api/auth/callback/google",
});

const getGoogleBusinessAuthUrl = async (req, res) => {
  try {
    const accessToken = req.headers.accesstoken;
    const platform = req.headers.platform;

    const response = await axios.get(
      "https://mybusinessaccountmanagement.googleapis.com/v1/accounts",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    res.json(response.data);
    const accountsname = response.data.accounts[0].accountName;

    const userData = {
      accessToken: accessToken,
      accessSecret: "",
      platform: platform,
      screenName: response.data.accounts[0].name,
    };
    await userInterface.setMediaToken(userData);
  } catch (error) {
    console.error("Error fetching business info:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const googleBusinessPost = async (req, res) => {
  try{ const headers = JSON.parse(req.headers.headersarraystring);
    const getHeaders = (platform) => {
      return headers.filter((headers) => headers.platform === platform)[0];
    };
  
    const googleBusinessHeaders = getHeaders("google-business");
    console.log(googleBusinessHeaders)
    const accessToken = googleBusinessHeaders.accessToken;
    const getMediaType = req.body.getMediaType;
    console.log(accessToken, getMediaType)


  }catch(err){

  }
};

module.exports = { getGoogleBusinessAuthUrl, googleBusinessPost };
