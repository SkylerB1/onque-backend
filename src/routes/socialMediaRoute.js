require("dotenv").config();
const express = require("express");
const router = express.Router();
require("dotenv").config();
const passport = require("passport");
const UserController = require("../controller/userController");
const LinkedInController = require("../controller/linkedInController");
const FacebookController = require("../controller/facebookController");
const YoutubeController = require("../controller/youTubeController");
const GoogleBusinessController = require("../controller/GoogleBusinessController");

const TokenController = require("../controller/tokenController");
const { verifyToken, createToken } = require("../middleware/auth.middleware");
const { twitterStrategy, twitterLoginStrategy } = require("../utils/twitter");
const { youtubeStrategy } = require("../utils/youtube");
const { googleBusinessStrategy } = require("../utils/google-business");
const { GoogleBusinessPlatform } = require("../utils/CommonString");
const { facebookStrategy } = require("../utils/facebook");
const { REDIRECT_URL, LOGIN_REDIRECT_URL } = process.env;
const jwt = require("jsonwebtoken");

router.get(
  "/google_business",
  googleBusinessStrategy,
  passport.authenticate("google", { accessType: "offline" })
);
router.get(
  "/google_business/callback",
  passport.authenticate("google", {
    successRedirect: REDIRECT_URL + `?platform=${GoogleBusinessPlatform}`,
    failureRedirect: REDIRECT_URL + `?platform=${GoogleBusinessPlatform}`,
  })
);

router.get("/youtube", youtubeStrategy, passport.authenticate("youtube"));
router.get(
  "/youtube/callback",
  passport.authenticate("youtube", {
    successRedirect: REDIRECT_URL,
    failureRedirect: REDIRECT_URL,
  })
);

router.get("/twitter/login",
  twitterLoginStrategy,
  passport.authenticate("twitter", {
    scope: ["tweet.read", "tweet.write", "users.read", "offline.access"],
  })
);

router.get(
  "/twitter/login/callback",
  passport.authenticate("twitter", {
    // successRedirect: LOGIN_REDIRECT_URL,
    failureRedirect: REDIRECT_URL,
  }),
  (req, res) => {
    const { id } = req.user
    const { accessToken, refreshToken } = createToken(id)
    const redirectUrl = LOGIN_REDIRECT_URL
    res.cookie('refresh_token', refreshToken, { httpOnly: true }).cookie('access_token', accessToken, { httpOnly: true });

    res.redirect(redirectUrl)

  }
);


router.get(
  "/twitter",
  twitterStrategy,
  passport.authenticate("twitter", {
    scope: ["tweet.read", "tweet.write", "users.read", "offline.access"],
  })
);

router.get(
  "/twitter/callback",
  passport.authenticate("twitter", {
    successRedirect: REDIRECT_URL,
    failureRedirect: REDIRECT_URL,
  }),
);

router.get(
  "/google_business/locations",
  verifyToken,
  GoogleBusinessController.GetLocations
);

router.post(
  "/google_business/connect",
  verifyToken,
  GoogleBusinessController.ConnectLocation
);

router.get("/youtube/categories", verifyToken, YoutubeController.getCategories);

router.get("/get_specific_post_data", UserController.getSpecificPostData);

//linkedin
router.post("/linkedin/profile", verifyToken, LinkedInController.linkedinToken);
router.post("/linkedin/pages", verifyToken, LinkedInController.linkedInPages);
router.post(
  "/linkedin/connection",
  verifyToken,
  LinkedInController.linkedInConnect
);
router.post("/linkedin/share", verifyToken, LinkedInController.sharePost);

//facebook
router.get(
  "/facebook/login",
  facebookStrategy,
  passport.authenticate(`facebook`, { scope: ['public_profile', 'email'], },
  ),
);

router.get('/facebook/login/callback',
  passport.authenticate('facebook', {
    failureRedirect: LOGIN_REDIRECT_URL
  }),
  (req, res) => {
    const { id } = req.user.response
    const { accessToken, refreshToken } = createToken(id)
    const redirectUrl = LOGIN_REDIRECT_URL
    res.cookie('refresh_token', refreshToken).cookie('access_token', accessToken);

    res.redirect(redirectUrl)

  }
);

router.post("/facebook/pages", verifyToken, FacebookController.facebookPages);
router.post(
  "/facebook/connection", verifyToken, FacebookController.facebookConnect
);

router.post("/setToken", TokenController.setToken);

module.exports = router;
