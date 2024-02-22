const { getCreatorInfo } = require("../utils/tiktok/TikTokUtils");
const { getUserCreds } = require("../utils/userUtil");

const getTiktokCreatorInfo = async (req, res) => {
  const { id } = req.user;
  const { brandId, platform } = req.query;
  if (brandId === "undefined" && platform === "undefined") {
    return res.status(400).json({ msg: "Missing params" });
  } else {
    try {
      const creds = await getUserCreds(id, brandId, platform);

      if (creds) {
        const { token } = creds;
        const infoRespone = await getCreatorInfo(token);
        if (infoRespone) {
          res.status(200).json(infoRespone);
        } else {
          res.status(400).json({ msg: "Failed to get user info" });
        }
      } else {
        res.status(400).json({ msg: "Failed to fetch user creds" });
      }
    } catch (err) {
      console.log(err);
      res.status(400).json({ msg: err });
    }
  }
};

module.exports = { getTiktokCreatorInfo };
