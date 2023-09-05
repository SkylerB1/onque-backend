const UserService = require("../services/userServices");
const userInterface = new UserService();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
var request = require("request");
const { default: axios } = require("axios");
const _ = require("lodash");
const { TwitterApi } = require("twitter-api-v2");
const fs = require("fs");
const moment = require("moment");
const {
  twitterPost,
  postOnTwitter,
} = require("../controller/twitterController");
const { uplodYouTubeVideo } = require("../controller/youTubeController");
const { google } = require("googleapis");
const { googleBusinessPost } = require("./googleBusinessController");

const method = {};

// Register a new User
/**
 *
 * @param {object} req
 * @param {object} res
 * @since 18/06/2023
 * @author Aston | <from Appwrk>
 * @return {object} Json Response
 */

method.register = async (req, res) => {
  try {
    const verifiedEmail = await userInterface.checkEmail(req.body.email);
    if (!verifiedEmail) {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const data = await userInterface.createUser({
        email: req.body.email,
        password: hashedPassword,
      });

      const authToken = jwt.sign({ user: data.id }, process.env.SECRETKEY);
      res.status(200).json({
        data: data,
        token: authToken,
        message: "user created successfully",
      });
    } else {
      res.status(400).json({ message: "user already exist" });
    }
  } catch (err) {
    res.send({ message: "Somithing wrong" }).status(500);
  }
};

/**
 *
 * @param {object} req
 * @param {object} res
 * @since 18/06/2023
 * @author Aston | <from Appwrk>
 * @return {object} Json Response
 * Comment: This function take the data and authenticate the user
 */

method.logInUser = async (req, res) => {
  const verifiedEmail = await userInterface.checkEmail(req.body.email);
  if (verifiedEmail) {
    const verifiedPassword = await bcrypt.compare(
      req.body.password,
      verifiedEmail.password
    );
    if (verifiedPassword) {
      const authToken = jwt.sign(
        { user: verifiedEmail.id },
        process.env.SECRETKEY
      );
      res.status(200).json({
        data: { id: verifiedEmail.id, email: verifiedEmail.email },
        token: authToken,
        message: "user Login successfully",
      });
    } else {
      res.status(400).json({ message: "user not exist" });
    }
  } else {
    res.status(400).json({ message: " this email is not exist" });
  }
};

method.twitterLogin = (req, res) => {
  request.post(
    {
      url: "https://api.twitter.com/oauth/request_token",
      oauth: {
        oauth_callback: process.env.OAUTH_CALLBACKURL,
        consumer_key: process.env.LIVE_TWITTER__CONSUMER_KEY,
        consumer_secret: process.env.LIVE_TWITTER_CONSUMER_SECRET,
      },
    },
    function (err, r, body) {
      if (err) {
        return res.send(500, { message: e.message });
      }
      var jsonStr =
        '{ "' + body.replace(/&/g, '", "').replace(/=/g, '": "') + '"}';
      res.send(JSON.parse(jsonStr));
    }
  );
};

method.twitterAccessToken = async (req, res) => {
  try {
    const oauth_token = req.body.oauth_token;
    const oauth_verifier = req.body.oauth_verifier;
    const response = await axios.post(
      `https://api.twitter.com/oauth/access_token?oauth_verifier=${oauth_verifier}&oauth_token=${oauth_token}`
    );

    const data = response.data.split("&");
    const accessToken = data[0].split("=")[1];
    const accessSecret = data[1].split("=")[1];
    const user_id = data[2].split("=")[1];
    const screen_name = data[3].split("=")[1];
    const userData = {
      accessToken: accessToken,
      accessSecret: accessSecret,
      platform: "twitter",
      screenName: screen_name,
    };

    await userInterface.setMediaToken(userData);

    res.status(200).json({
      data: userData,
    });
  } catch (err) {
    res.status(500).json(err);
    console.log(err);
  }
};

method.mediaPost = async (req, res) => {
  try {
    const platform = req.body.platform;

    if (platform === "twitter") {
      const data = await twitterPost(req, res);
    } 
    if (platform === "youtube") {
      const data = await uplodYouTubeVideo(req, res);
    }
    if (platform === "google-business") {
      const data = await googleBusinessPost(req, res);
    }
  } catch (err) {
    console.log(err);
  }
};

method.getPostData = async (req, res) => {
  let data = await userInterface.getPostData();
  if (data) {
    res.status(200).json({
      data: data,
    });
  } else {
    res.status(400).json({ message: "No data found" });
  }
};

method.getSpecificPostData = async (req, res) => {
  let post_id = req.headers.post_id;
  try {
    let data = await userInterface.getSpecificPostData(post_id);
    if (data) {
      res.status(200).json({
        data: data,
        message: "specific post data",
      });
    } else {
      res.status(200).json({
        data: "",
        message: "no data found",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};

method.deletePostData = async (req, res) => {
  try {
    let post_id = req.headers.post_id;
    let data = await userInterface.updateSpecificPostData(post_id);
    if (data.delete == 0) {
      res.status(200).json({
        message: "Post not deleted",
      });
    } else {
      res.status(200).json({
        data: data,
        message: "Post deleted successfully",
      });
    }
  } catch (err) {
    res.status(500).json({
      message: "Something went wrong",
      error: err.message,
    });
  }
};

const crons = async (req, res) => {
  try {
    const getScheduleData = await userInterface.scheduleData();
    if (getScheduleData.length > 0) {
      const directoryPath = _basedir + "/assets/";
      getScheduleData.map(async (item) => {
        const post_id = item.id;
        const screenName = item.screenName;
        const platform = item.platform;
        const getAccess = await userInterface.getAccessToken(screenName);
        const text = item.text;
        const imagePathDataArray = item.files ? JSON.parse(item.files) : [];
        const imageNames = imagePathDataArray.map(
          (imageData) => imageData.name
        );
        const imagePath = imageNames.map(
          (imageName) => directoryPath + imageName
        );
        const access_token = getAccess.accessToken;
        const token_secret = getAccess.accessSecret;
        try {
          if (platform === "twitter") {
            await postOnTwitter(access_token, token_secret, text, imagePath);

            await userInterface.storePostData({ status: "published" }, post_id);
          } else if (platform === "youtube") {
          //   await uplodYouTubeVideo(access_token, text, imagePath);

          // await userInterface.storePostData({ status: "published" }, post_id);
          }
        } catch (apiError) {
          console.error("Error creating post:", apiError);
        }
      });
    } else {
      console.log("Empty data");
    }
  } catch (error) {
    console.log(error);
  }
};

const callEveryFiveMinutes = async () => {
  console.log("Starting the interval...");
  await crons();
  const interval = 1 * 60 * 1000; // 5 minutes in milliseconds
  console.log(
    `Scheduling mainFunction to run every ${interval / 1000 / 60} minutes.`
  );
  setInterval(crons, interval);
};
// Call the function to start the interval
callEveryFiveMinutes();

module.exports = method;
