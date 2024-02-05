const passport = require("passport");
const { encryptToken } = require("../../middleware/encryptToken");
const { LinkedInPlatform, LinkedInPagePlatform } = require("../CommonString");
const { saveConnection } = require("../postUtils");
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;

const linkdInStrategy = (req, res, next) => {
  const {
    LINKEDIN_CLIENT_ID,
    LINKEDIN_CLIENT_SECRET,
    LINKEDIN_REDIRECT_URI,
  } = process.env;

  const userId = req.query.userId;
  const brandId = req.query.brandId;

  passport.use(new LinkedInStrategy({
    clientID: LINKEDIN_CLIENT_ID,
    clientSecret: LINKEDIN_CLIENT_SECRET,
    callbackURL: LINKEDIN_REDIRECT_URI,
    scope: ['w_member_social', 'r_organization_social', 'r_organization_followers', 'rw_organization_admin', 'r_organization_social_feed', 'w_organization_social', 'r_basicprofile', 'w_organization_social_feed', 'w_member_social_feed'
    ],
  }, async (accessToken, refreshToken, profile, done) => {
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
      creds.displayName,
      LinkedInPagePlatform,
      0
    );

    if (response.success) {
      return done(null, profile);
    } else {
      return done(response.data, null);
    }
  }));

  passport.serializeUser((user, cb) => {
    cb(err, user);
  });

  passport.deserializeUser((user, cb) => {
    cb(err, user);
  });

  next();

};


const linkdInProfileStrategy = (req, res, next) => {
  const {
    LINKEDIN_CLIENT_ID,
    LINKEDIN_CLIENT_SECRET,
    LINKEDIN_PROFILE_REDIRECT_URI,
  } = process.env;

  const userId = req.query.userId;
  const brandId = req.query.brandId;

  passport.use(new LinkedInStrategy({
    clientID: LINKEDIN_CLIENT_ID,
    clientSecret: LINKEDIN_CLIENT_SECRET,
    callbackURL: LINKEDIN_PROFILE_REDIRECT_URI,
    scope: ['w_member_social', 'r_organization_social', 'r_organization_followers', 'rw_organization_admin', 'r_organization_social_feed', 'w_organization_social', 'r_basicprofile', 'w_organization_social_feed', 'w_member_social_feed'
    ],
  }, async (accessToken, refreshToken, profile, done) => {
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
      creds.displayName,
      LinkedInPlatform,
      0
    );

    if (response.success) {
      return done(null, profile);
    } else {
      return done(response.data, null);
    }
  }));

  passport.serializeUser((user, cb) => {
    cb(err, user);
  });

  passport.deserializeUser((user, cb) => {
    cb(err, user);
  });

  next();

};


module.exports = {
  linkdInStrategy,
  linkdInProfileStrategy,
};