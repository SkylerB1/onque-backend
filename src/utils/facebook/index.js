const passport = require("passport");
const { Strategy } = require("passport-twitter");
const FacebookStrategy = require('passport-facebook').Strategy;
const FacebookService = require('../../services/facebookService');
const { encryptToken } = require("../../middleware/encryptToken");
const facebookService = new FacebookService();
const { FacebookPagePlatform } = require("../CommonString");
const { saveConnection } = require("../postUtils");

const facebookloginStrategy = (req, res, next) => {
  const {
    FACEBOOK_CLIENT_ID,
    FACEBOOK_CLIENT_SECRET,
    LOGIN_FACEBOOK_CALLBACK_URL,
  } = process.env;

  passport.use(
    new FacebookStrategy(
      {
        clientID: FACEBOOK_CLIENT_ID,
        clientSecret: FACEBOOK_CLIENT_SECRET,
        includeEmail: true,
        callbackURL: LOGIN_FACEBOOK_CALLBACK_URL,
        profileFields: ['id', 'displayName', 'photos', 'email']
      },
      async (accessToken, refreshToken, profile, cb) => {
        const creds = {
          ...profile._json,
        };
        const response = await facebookService.saveLoginFacebookDetails(creds);

        return cb(null, { profile, response });
      }
    )
  );

  passport.serializeUser((user, cb) => {
    cb(err, user);
  });

  passport.deserializeUser((user, cb) => {
    cb(err, user);
  });

  next();
};

const facebookStrategy = (req, res, next) => {
  const {
    FACEBOOK_CLIENT_ID,
    FACEBOOK_CLIENT_SECRET,
    FACEBOOK_CALLBACK_URL,
  } = process.env;



  const userId = req.query.userId;
  const brandId = req.query.brandId;

  passport.use(
    new FacebookStrategy(
      {
        clientID: FACEBOOK_CLIENT_ID,
        clientSecret: FACEBOOK_CLIENT_SECRET,
        includeEmail: true,
        callbackURL: FACEBOOK_CALLBACK_URL,
        profileFields: ['id', 'displayName', 'photos', 'email']
      },
      async (accessToken, refreshToken, profile, cb) => {
        const creds = {
          accessToken,
          refreshToken,
          ...profile._json,
        };
        const encryptedCreds = encryptToken(creds);
        const response = await saveConnection(
          encryptedCreds,
          userId,
          brandId,
          creds.name,
          FacebookPagePlatform,
          0
        )
        if (response.success) {
          return cb(null, profile);
        } else {
          return cb(response.data, null);
        }
      }
    )
  );

  passport.serializeUser((user, cb) => {
    cb(err, user);
  });

  passport.deserializeUser((user, cb) => {
    cb(err, user);
  });

  next();
};

module.exports = {
  facebookloginStrategy,
  facebookStrategy,
};