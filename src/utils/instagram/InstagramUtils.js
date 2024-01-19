const UserService = require("../../services/userServices");
const moment = require("moment");
const InstagramService = require("../../services/InstagramService");
const instagramService = new InstagramService();
const userService = new UserService();

const InstagramSharePost = async (data, platformType, mediaType, userId, brandId) => {
  try {
    const mimetype = data.files[0]?.mimetype ?? null;
    const isVideo = mimetype?.includes("video") ?? false;
    const isPhoto = mimetype?.includes("image") ?? false;
    const platform = platformType;

    const creds = await userService.getTokenByIdPlatform(userId, brandId, platform);
    const user_id = creds.id;
    const access_token = creds.access_token;
    //   const currentTimestamp = moment();
    //   const tokenExpirationTimestamp = moment().add(creds.expires_in, "seconds");
    //   console.log(moment())
    //   console.log(tokenExpirationTimestamp)
    //   if (currentTimestamp.isAfter(tokenExpirationTimestamp)) {
    //       const newToken = await instagramService.refreshAccessToken(creds.refresh_token)
    //       creds = { ...creds, ...newToken.data }
    //       await instagramService.setMediaToken(creds,userId,platform)
    //       console.log(creds)

    //   }

    let response;
    if (mediaType === "POST") {
      if (data.files.length === 1 && isVideo) {
        response = await instagramService.shareReel(
          data,
          user_id,
          access_token
        );
      } else {
        response = await instagramService.sharePost(
          data,
          user_id,
          access_token,
          isPhoto
        );
      }
    } else if (mediaType === "REEL") {
      response = await instagramService.shareReel(data, user_id, access_token);
    } else if (mediaType === "STORY") {
      response = await instagramService.shareStory(data, user_id, access_token);
    } else {
      response = { success: "false", data: "Invalid Media Type" };
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
  InstagramSharePost,
};
