const passport = require("passport");
const { encryptToken } = require("../../middleware/encryptToken");
const { saveConnection } = require("../postUtils");
const { Strategy } = require("passport-tiktok-auth");
const { TikTokPlatform } = require("../CommonString");

const tiktokStrategy = (req, res, next) => {
  const { TIKTOK_CLIENT_ID, TIKTOK_CLIENT_SECRET, TIKTOK_CALLBACK_URL } =
    process.env;

  const userId = req.query.userId;
  const brandId = req.query.brandId;

  passport.use(
    new Strategy(
      {
        clientID: TIKTOK_CLIENT_ID,
        clientSecret: TIKTOK_CLIENT_SECRET,
        scope: ["user.info.basic", "video.publish", "video.upload"],
        callbackURL: TIKTOK_CALLBACK_URL,
      },
      async (token, tokenSecret, profile, cb) => {
        console.log(token, tokenSecret, profile, cb);
        const creds = {
          token,
          tokenSecret,
          ...profile._json,
        };
        const encryptedCreds = encryptToken(creds);
        const response = await saveConnection(
          encryptedCreds,
          userId,
          brandId,
          profile.username,
          TikTokPlatform
        );

        if (response.success) {
          return cb(null, profile);
        } else {
          return cb(response.data, null);
        }
      }
    )
  );

  passport.serializeUser((user, cb) => {
    cb(null, user);
  });

  passport.deserializeUser((user, cb) => {
    cb(null, user);
  });

  next();
};

module.exports = {
  tiktokStrategy,
};
