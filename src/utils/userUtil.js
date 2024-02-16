const SocialMediaToken = require("../models/SocialMediaToken");
const UserService = require("../services/userServices");
const userService = new UserService();

const updateUserCreds = async (
  encryptedCreds,
  userId,
  platform,
  isConnected = 1,
  brandId,
  screenName
) => {
  try {
    const data = {
      credentials: encryptedCreds,
      isConnected: isConnected,
    };
    if (screenName) {
      data.screenName = screenName;
    }

    const condition = {
      userId,
      platform,
      brandId,
    };
    await SocialMediaToken.update(data, {
      where: condition,
    });
    return true;
  } catch (err) {
    console.log("Error updating creds");
    return false;
  }
};

const getUserCreds = async (userId, brandId, platform, isConnected = 1) => {
  try {
    const creds = await userService.getTokenByIdPlatform(
      userId,
      platform,
      isConnected,
      brandId
    );

    return creds;
  } catch (err) {
    return null;
  }
};

module.exports = {
  updateUserCreds,
  getUserCreds,
};
