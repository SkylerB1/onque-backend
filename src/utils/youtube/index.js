const passport = require("passport");
const { Strategy } = require("passport-youtube-v3");
const { encryptToken } = require("../../middleware/encryptToken");
const { saveConnection } = require("../postUtils");
const { YouTubePlatform } = require("../CommonString");

const youtubeStrategy = async (req, res, next) => {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, YOUTUBE_CALLBACK_URL } =
    process.env;
  const userId = req.query.userId;
  const brandId = req.query.brandId;

  passport.use(
    new Strategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: YOUTUBE_CALLBACK_URL,
        scope: [
          "https://www.googleapis.com/auth/youtube.readonly",
          "https://www.googleapis.com/auth/youtube",
          "https://www.googleapis.com/auth/youtube.upload",
        ],
        accessType: "offline",
      },
      async function (accessToken, refreshToken, params, profile, cb) {
        const creds = {
          accessToken,
          refreshToken,
          expiry_date: new Date().getTime() + params.expires_in * 1000,
          ...profile._json,
        };
        const encryptedCreds = encryptToken(creds);
        const response = await saveConnection(
          encryptedCreds,
          userId,
          brandId,
          profile.displayName,
          YouTubePlatform
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
  youtubeStrategy,
};
