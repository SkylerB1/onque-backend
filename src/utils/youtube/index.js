const passport = require("passport");
const { Strategy } = require("passport-youtube-v3");
const { encryptToken } = require("../../middleware/encryptToken");
const { saveConnection } = require("../postUtils");
const { YouTubePlatform } = require("../CommonString");

const youtubeStrategy = async (req, res, next) => {
  const { YOUTUBE_APP_ID, YOUTUBE_APP_SECRET, YOUTUBE_CALLBACK_URL } =
    process.env;
  const userId = req.query.userId;

  passport.use(
    new Strategy(
      {
        clientID: YOUTUBE_APP_ID,
        clientSecret: YOUTUBE_APP_SECRET,
        callbackURL: YOUTUBE_CALLBACK_URL,
        scope: [
          "https://www.googleapis.com/auth/youtube.readonly",
          "https://www.googleapis.com/auth/youtube",
          "https://www.googleapis.com/auth/youtube.upload",
        ],
      },
      async function (accessToken, refreshToken, profile, cb) {
        const creds = {
          accessToken,
          refreshToken,
          ...profile._json,
        };
        const encryptedCreds = encryptToken(creds);
        const response = await saveConnection(
          encryptedCreds,
          userId,
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
