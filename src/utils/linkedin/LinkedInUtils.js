const LinkedInServices = require("../../services/linkedInServices");
const UserService = require("../../services/userServices");
const moment = require("moment");
const { LinkedInPagePlatform, LinkedInPlatform } = require("../CommonString");

const linkedInService = new LinkedInServices();
const userService = new UserService();

const LinkedInSharePost = async (data, platform, userId, brandId) => {
  try {
    let mimetype, isVideo, isImage;
    const isFiles = data?.files?.length > 0;
    if (isFiles) {
      mimetype = data?.files[0]?.mimetype;
      isVideo = mimetype?.includes("video");
      isImage = mimetype?.includes("image");
    }

    const creds = await userService.getTokenByIdPlatform(
      userId,
      platform,
      1,
      brandId
    );
    //   const currentTimestamp = moment();
    //   const tokenExpirationTimestamp = moment().add(creds.expires_in, "seconds");
    //   console.log(moment())
    //   console.log(tokenExpirationTimestamp)
    //   if (currentTimestamp.isAfter(tokenExpirationTimestamp)) {
    //       const newToken = await linkedInService.refreshAccessToken(creds.refresh_token)
    //       creds = { ...creds, ...newToken.data }
    //       await linkedInService.setMediaToken(creds,userId,platform)
    //       console.log(creds)

    //   }
    let response;
    if (isFiles && isImage) {
      response = await linkedInService.shareImage(data, creds, platform);
    } else if (isFiles && isVideo) {
      response = await linkedInService.shareVideo(data, creds, platform);
    } else {
      response = await linkedInService.shareText(data, creds, platform);
    }
    
    if (response.status) {
      return { success: true, data: response.data };
    } else {
      return { success: false, data: response.data };
    }
  } catch (err) {
    return { success: false, data: response.data };
  }
};

module.exports = {
  LinkedInSharePost,
};
