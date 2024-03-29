const UserService = require("../../services/userServices");
const moment = require("moment");
const InstagramService = require("../../services/InstagramService");
const instagramService = new InstagramService();
const userService = new UserService();
const { TwitterApi } = require("twitter-api-v2");
const path = require("path");
const { areMimeTypesEqual } = require("../CommonFunctions");

const TwitterSharePost = async (data, platform, userId, brandId) => {
  const {
    TWITTER_CONSUMER_KEY,
    TWITTER_CONSUMER_SECRET,
    TWITTER_BEARER_TOKEN,
  } = process.env;

  try {
    const { caption, files } = data;
    const creds = await userService.getTokenByIdPlatform(
      userId,
      platform,
      1,
      brandId
    );

    const { token, tokenSecret } = creds;

    const client = new TwitterApi({
      appKey: TWITTER_CONSUMER_KEY,
      appSecret: TWITTER_CONSUMER_SECRET,
      accessToken: token,
      accessSecret: tokenSecret,
      bearerToken: TWITTER_BEARER_TOKEN,
    });

    if (files && files.length > 0) {
      let mediaIds = [];
      const isEqual = areMimeTypesEqual(files);
      if (!isEqual) {
        return {
          status: 400,
          success: false,
          data: "Mixing images/gifs/videos/documents is not allowed nor selecting more than 1 gif/video/document",
        };
      }

      for (let file of files) {
        const size = file.size;
        const pathname = path.join(
          __dirname,
          `../../../assets/${file?.filename}`
        );
        const response = await client.v1.uploadMedia(pathname, {
          mimeType: file.mimetype,
          longVideo: size > 120,
        });
        mediaIds.push(response);
      }

      const response = await client.v2.tweet({
        text: caption,
        media: {
          media_ids: mediaIds,
          tagged_user_ids: [],
        },
      });

      if (response.errors) {
        return { status: 400, success: false, data: response.errors };
      } else {
        return { status: 200, success: true, data: response.data };
      }
    } else {
      const response = await client.v2.tweet({
        text: caption,
      });

      if (response.errors) {
        return { status: 400, success: false, data: response.errors };
      } else {
        return { status: 200, success: true, data: response.data };
      }
    }
  } catch (err) {
    return { status: 400, data: err.response.data, success: false };
  }
};

const twitterLogin = async (encryptedCreds, username) => {
  const existingUser = await userInterface.findUserByName(username);

  if (existingUser) {
    return existingUser;
  } else {
    const data = await userInterface.createUser({
      firstName: username,
      lastName: "",
      email: "",
      password: "",
    });
    const user_id = data.id;
    const brand_name = "Empty Brand";
    await brandServicesInterface.createBrand(brand_name, user_id);
    return data;
  }
};

module.exports = {
  TwitterSharePost,
  twitterLogin,
};
