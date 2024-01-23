const SocialMediaToken = require("../models/SocialMediaToken");

const updateUserCreds = async (
  encryptedCreds,
  userId,
  platform,
  isConnected = 1,
  brandId
) => {
  try {
    const data = {
      credentials: encryptedCreds,
      isConnected: isConnected,
    };
    console.log(data);

    const condition = {
      userId,
      platform,
      brandId,
    };
    console.log(condition);
    await SocialMediaToken.update(data, {
      where: condition,
    });
    return true;
  } catch (err) {
    console.log("Error updating creds");
    return false;
  }
};

module.exports = {
  updateUserCreds,
};
