const FacebookService = require("../../services/facebookService");
const UserService = require("../../services/userServices");
const moment = require("moment");
const { REEL } = require("../CommonString");

const facebookService = new FacebookService();
const userService = new UserService();

const FacebookSharePost = async (data, platformType, mediaType, userId) => {
  try {
    const mimetype = data.files[0]?.mimetype ?? null;
    const isVideo = mimetype?.includes("video") ?? false;
    const isPhoto = mimetype?.includes("image") ?? false;
    const platform = platformType;

    const creds = await userService.getTokenByIdPlatform(userId, platform);
    console.log(creds)
    const pageId = creds.id;
    const accessToken = creds.access_token;
    //   const currentTimestamp = moment();
    //   const tokenExpirationTimestamp = moment().add(creds.expires_in, "seconds");
    //   console.log(moment())
    //   console.log(tokenExpirationTimestamp)
    //   if (currentTimestamp.isAfter(tokenExpirationTimestamp)) {
    //       const newToken = await facebookService.refreshAccessToken(creds.refresh_token)
    //       creds = { ...creds, ...newToken.data }
    //       await facebookService.setMediaToken(creds,userId,platform)
    //       console.log(creds)

    //   }

    let response;
    if (!isVideo) {
      response = await facebookService.sharePost(
        data,
        pageId,
        accessToken,
        isPhoto
      );
    } else {
      if (mediaType === REEL) {
        response = await facebookService.shareReel(data, pageId, accessToken);
      } else {
        response = await facebookService.shareVideo(data, pageId, accessToken);
      }
    }
    return {
      success: response.success,
      data: response.data,
    };
  } catch (err) {
    console.log(err);
    return { status: 400, data: err.response.data };
  }
};

module.exports = {
  FacebookSharePost,
};
