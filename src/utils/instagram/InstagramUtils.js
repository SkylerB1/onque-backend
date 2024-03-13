const UserService = require("../../services/userServices");
const InstagramService = require("../../services/InstagramService");
const instagramService = new InstagramService();
const userService = new UserService();

const InstagramSharePost = async (
  data,
  platformType,
  mediaType,
  userId,
  brandId
) => {
  try {
    const mimetype = data.files[0]?.mimetype ?? null;
    const isVideo = mimetype?.includes("video") ?? false;
    const platform = platformType;

    const creds = await userService.getTokenByIdPlatform(
      userId,
      platform,
      1,
      brandId
    );
    const { id, access_token } = creds;
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
        response = await instagramService.shareReel(data, id, access_token);
      } else {
        response = await instagramService.sharePost(data, id, access_token);
      }
    } else if (mediaType === "REEL") {
      response = await instagramService.shareReel(data, id, access_token);
    } else if (mediaType === "STORY") {
      response = await instagramService.shareStory(data, id, access_token);
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
