const passport = require("passport");
const { encryptToken } = require("../../middleware/encryptToken");
const { saveConnection } = require("../postUtils");
const { Strategy } = require("passport-twitter");
const { TwitterPlatform } = require("../CommonString");
const { twitterLogin } = require("./TwitterUtils");

const twitterStrategy = (req, res, next) => {
  const {
    TWITTER_CONSUMER_KEY,
    TWITTER_CONSUMER_SECRET,
    TWITTER_CALLBACK_URL,
  } = process.env;
  
  const userId = req.query.userId;
  const brandId = req.query.brandId;


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
          brandId,
          profile.username,
          TwitterPlatform,
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

const twitterLoginStrategy = (req, res, next) => {
  const { TWITTER_CONSUMER_KEY, TWITTER_CONSUMER_SECRET, LOGIN_TWITTER_CALLBACK_URL, REDIRECT_URL } = process.env;

  passport.use(
    new Strategy(
      {
        consumerKey: TWITTER_CONSUMER_KEY,
        consumerSecret: TWITTER_CONSUMER_SECRET,
        includeEmail: true,
        callbackURL: LOGIN_TWITTER_CALLBACK_URL,
      },
      async (token, tokenSecret, profile, cb) => {
        const creds = {
          token,
          tokenSecret,
          ...profile._json,
        };
        const encryptedCreds = encryptToken(creds);
        const response = await twitterLogin(
          encryptedCreds,
          profile.username,
        );
        return cb(null, response);
        // if (response.success) {
        //   return cb(null, profile);
        // } else {
        //   return cb(response.data, null);
        // }
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
}

module.exports = {
  twitterStrategy,
  twitterLoginStrategy,
};
