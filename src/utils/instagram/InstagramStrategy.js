const passport = require("passport");
const FacebookStrategy = require("passport-facebook").Strategy;
const { encryptToken } = require("../../middleware/encryptToken");
const {  FacebookProfile } = require("../CommonString");
const { saveConnection } = require("../postUtils");

const instagramStrategy = (req, res, next) => {
  const { FACEBOOK_CLIENT_ID, FACEBOOK_CLIENT_SECRET, INSTAGRAM_CALLBACK_URL } =
    process.env;

  const userId = req.query.userId;
  const brandId = req.query.brandId;

  passport.use(
    new FacebookStrategy(
      {
        clientID: FACEBOOK_CLIENT_ID,
        clientSecret: FACEBOOK_CLIENT_SECRET,
        includeEmail: true,
        callbackURL: INSTAGRAM_CALLBACK_URL,
        profileFields: ["id", "displayName", "photos", "email"],
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
          FacebookProfile,
          0
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
    cb(err, user);
  });

  passport.deserializeUser((user, cb) => {
    cb(err, user);
  });

  next();
};

module.exports = {
  instagramStrategy,
};
