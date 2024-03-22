const passport = require("passport");
const { encryptToken } = require("../../middleware/encryptToken");
const { saveConnection } = require("../postUtils");
const { Strategy } = require("passport-tiktok-auth");
const {
  TikTokPersonalPlatform,
  TikTokBusinessPlatform,
} = require("../CommonString");

const tiktokStrategy = (req, res, next) => {
  const { TIKTOK_CLIENT_ID, TIKTOK_CLIENT_SECRET, TIKTOK_CALLBACK_URL } =
    process.env;
  const type =
    req.query.type === "business"
      ? TikTokBusinessPlatform
      : TikTokPersonalPlatform;
  const userId = req.query.userId;
  const brandId = req.query.brandId;

  passport.use(
    new Strategy(
      {
        clientID: TIKTOK_CLIENT_ID,
        clientSecret: TIKTOK_CLIENT_SECRET,
        scope: [
          "user.info.basic",
          "user.info.profile",
          "user.info.stats",
          "video.publish",
          "video.upload",
        ],
        callbackURL: TIKTOK_CALLBACK_URL,
      },
      async (token, tokenSecret, params, profile, cb) => {
        const creds = {
          token,
          tokenSecret,
          ...params,
          access_token_expiration_time:
            new Date().getTime() + params.expires_in * 1000,
          refresh_token_expiration_time:
            new Date().getTime() + params.refresh_expires_in * 1000,
          ...profile._json.data.user,
        };
        const encryptedCreds = encryptToken(creds);
        const response = await saveConnection(
          encryptedCreds,
          userId,
          brandId,
          profile.username,
          type
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
