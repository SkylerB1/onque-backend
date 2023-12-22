const { decryptToken } = require("../middleware/encryptToken");
const SocialMediaToken = require("../models/SocialMediaToken");
const LinkedInServices = require("../services/linkedInServices");
const UserService = require("../services/userServices");
const {
  LinkedInPlatform,
  LinkedInPagePlatform,
} = require("../utils/CommonString");

const service = new LinkedInServices();
const userService = new UserService();



const linkedinToken = async (req, res) => {
  try {
    const code = req.body?.code;
    const userId = req.user?.id;
    const token = await service.getAccessToken(code);
    console.log(token.data);
    if (token.success) {
      const profile = await service.getProfile(token.data.access_token);
      console.log(profile.data);
      if (profile.success) {
        res.status(200).json(profile.data);
        const data = { ...token.data, ...profile.data };
        await service.setMediaToken(data, userId,LinkedInPlatform);
      } else {
        res.status(400).json(profile.data);
      }
    } else {
      res.status(400).json(token.data);
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

const linkedInPages = async (req, res) => {
  try {
    const code = req.body?.code;
    const userId = req.user?.id;

    const token = await service.getAccessToken(code);
    if (token.success) {
      const accessToken = token.data.access_token;

      const [tokenResponse, pageData] = await Promise.all([
        await service.setMediaToken(token.data, userId, LinkedInPagePlatform),
        await service.getLinkedInPageIds(accessToken),
      ]);

      if (pageData.success && tokenResponse.status) {
        const pages = await service.getLinkedInPages(
          pageData.data.elements,
          accessToken
        );
        return res.status(pages.status).json(pages.data);
      } else {
        return res.status(pageData.status).json(pageData.data);
      }
    } else {
      return res.status(token.status).json(token.data);
    }
  } catch (err) {
    console.log(err);
  }
};
const linkedInConnect = async (req, res) => {
  try {
    const data = req?.body;
    const userId = req.user?.id;
    const platform =
      req.query.type === "page" ? LinkedInPagePlatform : LinkedInPlatform;

    const userConnection = await service.getLinkedInCreds(userId, platform);

    const creds = decryptToken(userConnection.credentials);

    const response = await service.setMediaToken(
      { ...data, ...creds },
      userId,
      platform
    );
    if (response.status) {
      const attributes = ["id", "platform", "screenName"];
      const connections = await userService.getUserConnections(userId,attributes)
      return res.status(200).json(connections);
    } else {
      return res.status(400).json(response.data);
    }
  } catch (err) {
    console.log(err);
    return res
      .status(err.response.status ?? 400)
      .json(err.response.data ?? err);
  }
};

const sharePost = async (req, res) => {
  try {
    const data = req.body;
    const userId = req.user?.id;
    const mimetype = data.files[0].mimetype;
    const isVideo = mimetype.includes("video");
    const platform =
      req.query.type === "page" ? LinkedInPagePlatform : LinkedInPlatform;

    const creds = await userService.getTokenByIdPlatform(userId, platform);
    let response;
    if (data.files && !isVideo) {
      response = await service.shareImage(data, creds, platform);
    } else if (data.files && isVideo) {
      response = await service.shareVideo(data, creds);
    } else {
      response = await service.shareText(data, creds);
    }
    if (response.status) {
      res.status(200).json({ data: response.data });
    } else {
      res.status(400).json(response.data);
    }
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};

module.exports = {
  linkedinToken,
  sharePost,
  linkedInPages,
  linkedInConnect,
};
