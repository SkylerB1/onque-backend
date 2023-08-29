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
const uploadYouTubeVideo = require("../controller/youTubeController");

const method = {};

const postOnTwitter = async (
  access_token,
  token_secret,
  text = "",
  imagePath = []
) => {
  const client = new TwitterApi({
    appKey: "EsjCJaczKFyzdaBLfSoe36YMh",
    appSecret: "IJYArxAxOs5p0oaBNrcyYIqROZ8ZWEAuT2GYcNJifGAuP3xQag",
    accessToken: access_token,
    accessSecret: token_secret,
    bearerToken:
      "AAAAAAAAAAAAAAAAAAAAAIBJpAEAAAAAbH3c2R%2FhK7y9J%2FeAR4raGZAtYiU%3D1RyNDwnJS7QraHViRkhRf3Lg3DoSIxJCv1bshti4u7o0axuHdQ",
  });
  const rwClient = client.readWrite;
  let mediaIds = [];
  for (let i = 0; i < imagePath.length; i++) {
    const mediaId = await client.v1.uploadMedia(imagePath[i]);
    mediaIds.push(mediaId);
  }
  // return;
  if (mediaIds.length > 0) {
    await rwClient.v2.tweet({
      text: text,
      media: { media_ids: mediaIds },
    });
  } else {
    await rwClient.v2.tweet({
      text: text,
    });
    console.log("first");
  }
};

const twitterPost = async (req, res) => {
  const headers = JSON.parse(req.headers.headersarraystring);
  const getHeaders = (platform) => {
    return headers.filter((headers) => headers.platform === platform)[0];
  };

  const twitterHeaders = getHeaders("twitter");
  const text = req.body.text;
  let token_secret = twitterHeaders.accessTokenSecret;
  let access_token = twitterHeaders.accessToken;
  let screen_name = twitterHeaders.screenName;
  let scheduledDate = req.body.post_send_date
    ? req.body.post_send_date
    : Date();

  let prev_files =
    req.body.prev_files && req.body.prev_files.length > 0
      ? JSON.parse(req.body.prev_files)
      : "";
  let prev_file_name = [];

  //for post_send_type
  const receivedDateString = req.body.post_send_date;
  const receivedDate = moment(
    receivedDateString,
    "ddd MMM DD YYYY HH:mm:ss ZZ"
  );
  const currentDate = moment();
  const post_send_type = receivedDate.isSame(currentDate, "minute")
    ? "now"
    : "scheduled";
  //end

  if (prev_files.length > 0) {
    prev_files.forEach((img) => {
      prev_file_name.push(img.name);
    });
  } else {
  }

  /***  it is used for update  */

  const directoryPath = _basedir + "/assets/";
  let post_id = twitterHeaders.post_id ? twitterHeaders.post_id : "";

  if (post_id != "") {
    let data = await userInterface.getSpecificPostData(post_id);
    if (data && data.files != "") {
      let posted_file_data = JSON.parse(data.files);

      /** delete values if previous one is deleted at frontend*/

      if (posted_file_data.length > 0) {
        posted_file_data.forEach(async (element) => {
          let img_name = element.name;
          if (!prev_file_name.includes(img_name)) {
            let file_path = directoryPath + img_name;
            if (fs.existsSync(file_path)) {
              fs.unlink(file_path, (err) => {
                if (err) {
                  throw err;
                }
              });
            }
          }
        });
      }
    }
  } else {
  }

  /***  end it is used for update  */

  const imagePath = req.files.map((item) => {
    return item.path;
  });

  let imageData = req.files.map((item) => {
    let data = {
      name: item.filename.trim(),
      type: item.mimetype,
      size: item.size,
    };
    return data;
  });
  imageData = [...imageData, ...prev_files];
  imageData = imageData.length > 0 ? JSON.stringify(imageData) : "";
  try {
    let objData = {
      screenName: screen_name,
      text: req.body.text,
      files: imageData,
      platform: req.body.platform,
      scheduledDate: scheduledDate,
    };

    objData["status"] = post_send_type == "scheduled" ? "pending" : "published";
    const data = await userInterface.storePostData(objData, post_id);

    if (post_send_type != "scheduled") {
      await postOnTwitter(access_token, token_secret, text, imagePath);
    } else {
      res.status(200).json({
        message: "Post scheduled successfully",
      });
    }

    /** end it is post in twitter */
    res.status(200).json({
      message: "Tweet posted successfully.",
    });
  } catch (error) {
    console.log(error);
    // res.status(500).json({
    //   message: "Something went wrong",
    // });
  }
};

module.exports = { twitterPost, postOnTwitter };
