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

    const pageData = await facebookService.getFacebookPages(id, accessToken);

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

const instagramAccounts = async (req, res) => {
  try {
    const userId = req.user?.id;
    const brandId = +req.query.brandId;

    const creds = await userService.getTokenByIdPlatform(
      userId,
      FacebookProfile,
      0,
      brandId
    );
    const { accessToken } = creds;

    const response = await facebookService.getInstagramAccounts(accessToken);
    if (response.success) {
      return res.status(200).json(response.data);
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

const instagramConnect = async (req, res) => {
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

    const response = await facebookService.connectInstagram(
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

module.exports = {
  facebookPages,
  facebookConnect,
  instagramAccounts,
  instagramConnect,
};
