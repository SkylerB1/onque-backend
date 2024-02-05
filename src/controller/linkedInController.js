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
    const userId = req.user?.id;
    const brandId = req.query.brandId;
    const creds = await userService.getTokenByIdPlatform(
      userId,
      LinkedInPlatform,
      0,
      brandId
    );
    const profile = await service.getProfile(creds?.accessToken);
    if (profile.success) {
      const data = { ...creds.data, ...profile.data };
      await service.setMediaToken(data, userId, brandId, LinkedInPlatform, 0);
      return res.status(200).json(profile.data);
    } else {
      res.status(400).json(profile.data);
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

const linkedInPages = async (req, res) => {
  try {
    const userId = req.user?.id;
    const brandId = req.query.brandId;

    const creds = await userService.getTokenByIdPlatform(
      userId,
      LinkedInPagePlatform,
      0,
      brandId
    );

    const [tokenResponse, pageData] = await Promise.all([
      await service.setMediaToken(creds, userId, brandId, LinkedInPagePlatform),
      await service.getLinkedInPageIds(creds?.accessToken),
    ]);

    if (pageData.success && tokenResponse.status) {
      const pages = await service.getLinkedInPages(
        pageData.data.elements,
        creds?.accessToken
      );

      return res.status(pages.status).json(pages.data);
    } else {

      return res.status(pageData.status).json(pageData.data);
    }
  } catch (err) {
    console.log(err);
  }
};
const linkedInConnect = async (req, res) => {
  try {
    const data = req?.body;
    const userId = req.user?.id;
    const brandId = req.query.brandId;
    const platform = req.query.type === "page" ? LinkedInPagePlatform : LinkedInPlatform;

    const userConnection = await service.getLinkedInCreds(userId, platform);

    const creds = decryptToken(userConnection.credentials);

    const response = await service.setMediaToken(
      { ...data, ...creds },
      userId,
      brandId,
      platform
    );
    if (response.status) {
      const attributes = ["id", "platform", "screenName"];
      const connections = await userService.getUserConnections(
        userId,
        attributes
      );
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
