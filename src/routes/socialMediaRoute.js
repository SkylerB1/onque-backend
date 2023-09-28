const express = require("express");
const router = express.Router();
const UserController = require("../controller/userController");
const YouTubeController = require("../controller/youTubeController");
const googleBusinessController = require("../controller/googleBusinessController");
const twitterController = require("../controller/twitterController");
const uploadFileMiddleware = require('../middleware/upload');

router.get('/twitter/reverse',UserController.twitterLogin)
router.post('/twitter/accessToken',UserController.twitterAccessToken)
router.post('/mediaPost', uploadFileMiddleware, UserController.mediaPost)
router.get('/get_specific_post_data',UserController.getSpecificPostData)
router.post('/youtube',  YouTubeController.getYouTubeAuthUrl)
router.get('/google-business/login',  googleBusinessController.getGoogleBusinessAuthUrl)
router.get('/getAllTweeData',  twitterController.getAllTweeData)

module.exports = router;