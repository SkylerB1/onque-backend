const express = require("express");
const router = express.Router();
const UserController = require("../controller/userController");
const {verifyToken} = require("../middleware/auth.middleware");
const { userSchema } = require("../utils/schema/schema");
const { ValidationSource, validator } = require("../utils/validator")

router.post('/register', validator(userSchema.login, ValidationSource.BODY) ,UserController.register)
router.post('/login', validator(userSchema.login, ValidationSource.BODY), UserController.logInUser)
router.post('/send-email', UserController.sendEmail)
router.patch('/forgot-password', UserController.forgotPassword)
router.get("/connections", verifyToken, UserController.userConnections)
router.get('/getPostData', verifyToken, UserController.getPostData)
router.post("/scheduler/posts",verifyToken,UserController.schedulePosts);
router.patch('/deletePost', UserController.deletePostData)

module.exports = router;