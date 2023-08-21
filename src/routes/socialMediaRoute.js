const express = require("express");
const router = express.Router();
const UserController = require("../controller/userController");
const uploadFileMiddleware = require('../middleware/upload');

router.get('/twitter/reverse',UserController.twitterLogin)
router.post('/twitter/accessToken',UserController.twitterAccessToken)
router.post('/twitter/postTweet', uploadFileMiddleware, UserController.twitterPost)
router.get('/get_specific_post_data',UserController.getSpecificPostData)

module.exports = router;