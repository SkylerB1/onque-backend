const InstagramService = require("../services/InstagramService");
const { InstagramPlatform } = require("../utils/CommonString");
const instagramService = new InstagramService();

const sharePost = async (req, res) => {
  try {
    const data = req.body;
    const userId = req.user?.id;
    // const mimetype = data.files[0].mimetype;
    // const isVideo = mimetype.includes("video");
    // const platform =
    //   req.query.type === "page" ? LinkedInPagePlatform : LinkedInPlatform;

    // const creds = await userService.getTokenByIdPlatform(userId, platform);
    // let response;
    // if (data.files && !isVideo) {
    //   response = await service.shareImage(data, creds, platform);
    // } else if (data.files && isVideo) {
    //   response = await service.shareVideo(data, creds);
    // } else {
    //   response = await service.shareText(data, creds);
    // }
    // if (response.status) {
    //   res.status(200).json({ data: response.data });
    // } else {
    //   res.status(400).json(response.data);
    // }
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};

module.exports = {
  sharePost,
};
