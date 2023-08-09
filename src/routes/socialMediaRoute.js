const express = require("express");
const router = express.Router();
const UserController = require("../controller/userController");
const uploadSingleFileMiddleware = require('../middleware/upload');

router.get('/twitter/reverse',UserController.twitterLogin)
router.post('/twitter/accessToken',UserController.twitterAccessToken)
router.post('/twitter/postTweet', uploadFileMiddleware, UserController.twitterPost)
router.get('/twitter/getTweetData', uploadFileMiddleware, UserController.getTwitterData)
router.post('/media_token',UserController.setUserToken)

module.exports = router;