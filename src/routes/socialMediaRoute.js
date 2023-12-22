const express = require("express");
const router = express.Router();
const UserController = require("../controller/userController");
const LinkedInController = require("../controller/linkedInController")
const FacebookController = require("../controller/facebookController");
const TokenController = require("../controller/tokenController")
const YouTubeController = require("../controller/youTubeController");
const googleBusinessController = require("../controller/googleBusinessController");
const twitterController = require("../controller/twitterController");
const uploadFileMiddleware = require('../middleware/upload');
const {verifyToken} = require("../middleware/auth.middleware");

router.get('/twitter/reverse',UserController.twitterLogin)
router.post('/twitter/accessToken',UserController.twitterAccessToken)
router.post('/mediaPost', uploadFileMiddleware, UserController.mediaPost)
router.get('/get_specific_post_data',UserController.getSpecificPostData)
router.post('/youtube',  YouTubeController.getYouTubeAuthUrl)
router.get('/google-business/login',  googleBusinessController.getGoogleBusinessAuthUrl)
router.get('/getAllTweeData', twitterController.getAllTweeData)

//linkedin
router.post("/linkedin/profile", verifyToken, LinkedInController.linkedinToken);
router.post("/linkedin/pages", verifyToken, LinkedInController.linkedInPages);
router.post("/linkedin/connection", verifyToken, LinkedInController.linkedInConnect);
router.post("/linkedin/share", verifyToken, LinkedInController.sharePost);

//facebook
router.post("/facebook/pages", verifyToken, FacebookController.facebookPages);
router.post("/facebook/connection", verifyToken, FacebookController.facebookConnect);


router.post("/setToken",TokenController.setToken)



module.exports = router;