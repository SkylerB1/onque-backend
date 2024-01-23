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
const { verifyToken } = require("../middleware/auth.middleware");
const { twitterStrategy } = require("../utils/twitter");
const { youtubeStrategy } = require("../utils/youtube");
const { googleBusinessStrategy } = require("../utils/google-business");
const { GoogleBusinessPlatform } = require("../utils/CommonString");
const { REDIRECT_URL } = process.env;

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
  })
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
router.post("/facebook/pages", verifyToken, FacebookController.facebookPages);
router.post(
  "/facebook/connection",
  verifyToken,
  FacebookController.facebookConnect
);

router.post("/setToken", TokenController.setToken);

module.exports = router;
