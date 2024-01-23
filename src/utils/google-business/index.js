const passport = require("passport");
const { Strategy } = require("passport-google-oauth20");
const { encryptToken } = require("../../middleware/encryptToken");
const { saveConnection } = require("../postUtils");
const { GoogleBusinessPlatform } = require("../CommonString");

const googleBusinessStrategy = async (req, res, next) => {
  const {
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_BUSINESS_CALLBACK_URL,
  } = process.env;

  const userId = req.query.userId;
  const brandId = req.query.brandId;

  passport.use(
    new Strategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: GOOGLE_BUSINESS_CALLBACK_URL,
        scope: [
          "https://www.googleapis.com/auth/business.manage",
          "https://www.googleapis.com/auth/userinfo.profile",
          "https://www.googleapis.com/auth/userinfo.email",
        ],
      },
      async function (accessToken, refreshToken, profile, cb) {
        const profileJson = profile._json;
        const creds = {
          accessToken,
          refreshToken,
          ...profileJson,
        };
        const encryptedCreds = encryptToken(creds);
        const response = await saveConnection(
          encryptedCreds,
          userId,
          brandId,
          profileJson.name,
          GoogleBusinessPlatform,
          0
        );
        console.log(response)

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
  googleBusinessStrategy,
};
