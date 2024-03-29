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
const {
  GoogleBusinessPlatform,
  FacebookPagePlatform,
  LinkedInPagePlatform,
  InstagramPlatform,
  YouTubePlatform,
} = require("../utils/CommonString");
const { tiktokStrategy } = require("../utils/tiktok");
const {
  facebookStrategy,
  facebookloginStrategy,
} = require("../utils/facebook");
const { REDIRECT_URL, LOGIN_REDIRECT_URL } = process.env;
const {
  linkdInStrategy,
  linkdInProfileStrategy,
} = require("../utils/linkedin");
const { instagramStrategy } = require("../utils/instagram/InstagramStrategy");

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
router.get("/youtube/callback", (req, res, next) => {
  passport.authenticate("youtube", (err, user, info) => {
    if (err) {
      res.redirect(`${REDIRECT_URL}?platform=${YouTubePlatform}&error=${err}`);
    } else {
      res.redirect(`${REDIRECT_URL}?platform=${YouTubePlatform}`);
    }
  })(req, res, next);
});

router.get(
  "/twitter/login",
  twitterLoginStrategy,
  passport.authenticate("twitter", {
    scope: ["tweet.read", "tweet.write", "users.read", "offline.access"],
  })
);

router.get(
  "/twitter/login/callback",
  passport.authenticate("twitter", {
    failureRedirect: REDIRECT_URL,
  }),
  (req, res) => {
    const { id } = req.user;
    const { accessToken, refreshToken } = createToken(id);
    const redirectUrl = LOGIN_REDIRECT_URL;
    res
      .cookie("refresh_token", refreshToken, { httpOnly: true })
      .cookie("access_token", accessToken, { httpOnly: true });

    res.redirect(redirectUrl);
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

router.get(
  "/tiktok",
  tiktokStrategy,
  passport.authenticate("tiktok", {
    scope: [
      "user.info.basic",
      "user.info.profile",
      "user.info.stats",
      "video.publish",
      "video.upload",
    ],
  })
);

router.get(
  "/tiktok/callback",
  passport.authenticate("tiktok", {
    successRedirect: REDIRECT_URL,
    failureRedirect: REDIRECT_URL,
  })
);

router.get("/youtube/categories", verifyToken, YoutubeController.getCategories);

router.get("/get_specific_post_data", UserController.getSpecificPostData);

//linkedin
router.get(
  "/linkedin/page",
  linkdInStrategy,
  passport.authenticate("linkedin")
);

router.get(
  "/linkedin/callback",
  passport.authenticate("linkedin", {
    successRedirect: REDIRECT_URL + `?platform=${LinkedInPagePlatform}`,
    failureRedirect: REDIRECT_URL + `?platform=${LinkedInPagePlatform}`,
  })
);

router.get(
  "/linkedin/profile",
  linkdInProfileStrategy,
  passport.authenticate("linkedin")
);

router.get(
  "/linkedin/profile/callback",
  passport.authenticate("linkedin", {
    successRedirect: REDIRECT_URL,
    failureRedirect: REDIRECT_URL,
  })
);

router.get("/linkedin/pages", verifyToken, LinkedInController.linkedInPages);
router.post(
  "/linkedin/connection",
  verifyToken,
  LinkedInController.linkedInConnect
);
router.post("/linkedin/share", verifyToken, LinkedInController.sharePost);

//facebook
router.get(
  "/facebook/login",
  facebookloginStrategy,
  passport.authenticate(`facebook`, { scope: ["public_profile", "email"] })
);

router.get(
  "/facebook/login/callback",
  passport.authenticate("facebook", {
    failureRedirect: LOGIN_REDIRECT_URL,
  }),
  (req, res) => {
    const { id } = req.user.response;
    const { accessToken, refreshToken } = createToken(id);
    const redirectUrl = LOGIN_REDIRECT_URL;
    res
      .cookie("refresh_token", refreshToken)
      .cookie("access_token", accessToken);

    res.redirect(redirectUrl);
  }
);

router.get(
  "/facebook",
  facebookStrategy,
  passport.authenticate("facebook", { scope: ["public_profile", "email"] })
);

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    successRedirect: REDIRECT_URL + `?platform=${FacebookPagePlatform}`,
    failureRedirect: REDIRECT_URL + `?platform=${FacebookPagePlatform}`,
  })
);

router.get(
  "/instagram",
  instagramStrategy,
  passport.authenticate("facebook", { scope: ["public_profile", "email"] })
);

router.get(
  "/instagram/callback",
  passport.authenticate("facebook", {
    successRedirect: REDIRECT_URL + `?platform=${InstagramPlatform}`,
    failureRedirect: REDIRECT_URL + `?platform=${InstagramPlatform}`,
  })
);

router.get("/facebook/pages", verifyToken, FacebookController.facebookPages);
router.get(
  "/instagram-business-accounts",
  verifyToken,
  FacebookController.instagramAccounts
);
router.post(
  "/facebook/connection",
  verifyToken,
  FacebookController.facebookConnect
);

router.post(
  "/instagram/connection",
  verifyToken,
  FacebookController.instagramConnect
);

router.post("/setToken", TokenController.setToken);

module.exports = router;
