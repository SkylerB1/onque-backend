const passport = require("passport");
const { Strategy } = require("passport-twitter");
const FacebookStrategy = require('passport-facebook').Strategy;
const FacebookService = require('../../services/facebookService');
const facebookService = new FacebookService();

const facebookStrategy = (req, res, next) => {
  const {
    FACEBOOK_CLIENT_ID,
    FACEBOOK_CLIENT_SECRET,
    FACEBOOK_CALLBACK_URL,
  } = process.env;

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
          ...profile._json,
        };
        const response = await facebookService.saveLoginFacebookDetails(creds);
        
        return cb(null, {profile,response});
        // if (response.success) {
        // } else {
        //   return cb(response.data, null);
        // }
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
  facebookStrategy,
};