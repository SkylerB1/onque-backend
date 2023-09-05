const express = require("express");
const router = express.Router();
const UserController = require("../controller/userController");
const YouTubeController = require("../controller/youTubeController");
const uploadFileMiddleware = require('../middleware/upload');

router.get('/twitter/reverse',UserController.twitterLogin)
router.post('/twitter/accessToken',UserController.twitterAccessToken)
router.post('/mediaPost', uploadFileMiddleware, UserController.mediaPost)
router.get('/get_specific_post_data',UserController.getSpecificPostData)
router.post('/youtube',  YouTubeController.getYouTubeAuthUrl)

module.exports = router;