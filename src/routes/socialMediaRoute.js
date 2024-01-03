const express = require("express");
const router = express.Router();
const passport = require("passport");
const UserController = require("../controller/userController");
const LinkedInController = require("../controller/linkedInController");
const FacebookController = require("../controller/facebookController");
const TokenController = require("../controller/tokenController");
const YouTubeController = require("../controller/youTubeController");
const googleBusinessController = require("../controller/googleBusinessController");
const { verifyToken } = require("../middleware/auth.middleware");
const { twitterStrategy } = require("../utils/twitter");
const { youtubeStrategy } = require("../utils/youtube");


router.get(
  "/youtube",
  youtubeStrategy,
  passport.authenticate("youtube")
);

router.get(
  "/youtube/callback",
  passport.authenticate("youtube", {
    successRedirect: process.env.REDIRECT_URL,
    failureRedirect: process.env.REDIRECT_URL,
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
    successRedirect: process.env.REDIRECT_URL,
    failureRedirect: process.env.REDIRECT_URL,
  })
);

router.get("/get_specific_post_data", UserController.getSpecificPostData);
router.post("/youtube", YouTubeController.getYouTubeAuthUrl);
router.get(
  "/google-business/login",
  googleBusinessController.getGoogleBusinessAuthUrl
);
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
