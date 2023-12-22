const SocialMediaToken = require("../models/SocialMediaToken");

const storeCreds = async (data, where) => {
  const IsToken = await SocialMediaToken.findOne({
    where: where,
  });

  if (IsToken) {
    return {
      success: true,
      data: await SocialMediaToken.update(data, {
        where: where,
        returning: true,
      }),
    };
  } else {
    return {
      success: true,
      data: await SocialMediaToken.create(data, { returning: true }),
    };
  }
};
module.exports = {
  storeCreds,
};
