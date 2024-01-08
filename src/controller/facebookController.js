const FacebookService = require("../services/facebookService");
const {
  FacebookPagePlatform,
  InstagramPlatform,
} = require("../utils/CommonString");
const facebookService = new FacebookService();

const facebookPages = async (req, res) => {
  try {
    const data = req.body;
    const userId = req.user.id;
    const { accessToken, userID } = data;

    let response = [];

    const pageData = await facebookService.getFacebookPages(
      userID,
      accessToken
    );
    // console.log(pageData)
    console.log("1")
    if (pageData.success) {
      for (let page of pageData.data) {
        await facebookService.setConnection(
          page,
          userId,
          FacebookPagePlatform,
          0,
          page.name
        );
        console.log("3")


        const instaAccount = await facebookService.getInstagramAccount(
          page.id,
          page.access_token
        );
        // console.log(instaAccount)
        console.log("2")


        if (instaAccount.data) {
          const data = {
            pageId: page.id,
            access_token: page.access_token,
            ...instaAccount.data,
          };
          console.log("1", data)

          await facebookService.setConnection(
            data,
            userId,
            InstagramPlatform,
            0,
            instaAccount.data.username
          );
          console.log("first")
        }

        response.push({ id: page.id, name: page.name, profile: page.profile });
      }
    }
    console.log(response, "wedfghujisdfghj")

    return res.status(pageData.status).json(response);
  } catch (err) {
    console.log(err);
  }
};
const facebookConnect = async (req, res) => {
  try {
    const userId = req.user?.id;
    const data = req.body;
    // console.log(userId,data)

    const response = await facebookService.connectPage(userId, data);
    if (response.success) {
      // console.log(response)
      return res.status(200).json(response.data);
    } else {
      // console.log(response)
      return res.status(400).json(response.data);
    }
  } catch (err) {
    return res
      .status(err.response.status ?? 400)
      .json(err.response.data ?? err);
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
