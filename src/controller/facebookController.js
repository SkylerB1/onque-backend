const FacebookService = require("../services/facebookService");
const UserService = require("../services/userServices");
const userService = new UserService();
const { FacebookProfile } = require("../utils/CommonString");
const facebookService = new FacebookService();

const facebookPages = async (req, res) => {
  try {
    const userId = req.user.id;
    const brandId = +req.query.brandId;
    const creds = await userService.getTokenByIdPlatform(
      userId,
      FacebookProfile,
      0,
      brandId
    );
    const { accessToken, id } = creds;

    let response = [];

    const pageData = await facebookService.getFacebookPages(id, accessToken);
    // if (pageData.success) {
    //   for (let page of pageData.data) {
    //     await facebookService.setConnection(
    //       brandId,
    //       page,
    //       userId,
    //       FacebookPagePlatform,
    //       0,
    //       page.name
    //     );

    //     const instaAccount = await facebookService.getInstagramAccount(
    //       page.id,
    //       page.access_token
    //     );
    //     console.log({ instaAccount });

    //     if (instaAccount.data) {
    //       const data = {
    //         pageId: page.id,
    //         access_token: page.access_token,
    //         ...instaAccount.data,
    //       };

    //       await facebookService.setConnection(
    //         brandId,
    //         data,
    //         userId,
    //         InstagramPlatform,
    //         0,
    //         instaAccount.data.username
    //       );
    //     }

    //     response.push({ id: page.id, name: page.name, profile: page.profile });
    //   }
    // }

    return res.status(pageData.status).json(pageData.data);
  } catch (err) {
    console.log(err);
  }
};

const facebookConnect = async (req, res) => {
  try {
    const userId = req.user?.id;
    const data = req.body;
    const brandId = +req.query.brandId;

    const creds = await userService.getTokenByIdPlatform(
      userId,
      FacebookProfile,
      0,
      brandId
    );
    const { accessToken } = creds;

    const response = await facebookService.connectPage(
      userId,
      brandId,
      data,
      accessToken
    );
    if (response.success) {
      return res.status(200).json({ msg: "connected successfully" });
    } else {
      return res.status(400).json(response.data);
    }
  } catch (err) {
    console.log(err);
    return res
      .status(err?.response?.status ?? 400)
      .json(err?.response?.data ?? err);
  }
};

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
  facebookPages,
  facebookConnect,
};
