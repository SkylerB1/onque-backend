const express = require("express");
const router = express.Router();
const UserController = require("../controller/userController");
const uploadFileMiddleware = require('../middleware/upload');

router.get('/twitter/reverse',UserController.twitterLogin)
router.post('/twitter/accessToken',UserController.twitterAccessToken)
router.post('/twitter/postTweet', uploadFileMiddleware, UserController.twitterPost)
router.post('/media_token',UserController.setUserToken)

module.exports = router;