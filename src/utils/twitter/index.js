const passport = require("passport");
const { encryptToken } = require("../../middleware/encryptToken");
const { saveConnection } = require("../postUtils");
const { Strategy } = require("passport-twitter");
const { TwitterPlatform } = require("../CommonString");

const twitterStrategy = (req, res, next) => {
  const {
    TWITTER_CONSUMER_KEY,
    TWITTER_CONSUMER_SECRET,
    TWITTER_CALLBACK_URL,
  } = process.env;
  const userId = req.query.userId;

  passport.use(
    new Strategy(
      {
        consumerKey: TWITTER_CONSUMER_KEY,
        consumerSecret: TWITTER_CONSUMER_SECRET,
        includeEmail: true,
        callbackURL: TWITTER_CALLBACK_URL,
      },
      async (token, tokenSecret, profile, cb) => {
        const creds = {
          token,
          tokenSecret,
          ...profile._json,
        };
        const encryptedCreds = encryptToken(creds);
        const response = await saveConnection(
          encryptedCreds,
          userId,
          profile.username,
          TwitterPlatform
        );

        if (response.success) {
          return cb(null, profile);
        } else {
          return cb(response.data, null);
        }
      }
    )
  );
  next();
};

module.exports = {
  twitterStrategy,
};
