const express = require("express");
const router = express.Router();
const UserController = require("../controller/userController");
const TiktokController = require("../controller/tiktokController");
const {verifyToken} = require("../middleware/auth.middleware");
const { registerSchema, loginSchema } = require("../utils/schema/schema");
const { ValidationSource, validator } = require("../utils/validator");
const { verifyTiktokToken } = require("../utils/tiktok/TikTokUtils");

router.post('/register', validator(registerSchema.register, ValidationSource.BODY) ,UserController.register)
router.post('/login', validator(loginSchema.login, ValidationSource.BODY), UserController.logInUser)
router.get("/user-info", verifyToken, UserController.getUserInfo)
router.post('/send-email', UserController.sendEmail)
router.patch('/forgot-password', UserController.forgotPassword)
router.get("/connections", verifyToken, UserController.userConnections)
router.get("/brand", verifyToken, UserController.userBrand)
router.get('/getPostData/:id', verifyToken, UserController.getPostData)
router.post("/scheduler/posts", verifyToken, UserController.schedulePosts);
router.put("/update/post/:id", verifyToken, UserController.editScheduledPost);
router.delete("/delete/post/:id", verifyToken, UserController.deleteScheduledPost);
router.patch('/deletePost', UserController.deletePostData)
router.delete('/delete/client/:id', UserController.delete)
router.delete('/logout/socialMedia/:id', UserController.logoutSocialMedia)
router.get(
  "/tiktok/creator-info",
  verifyToken,
  verifyTiktokToken,TiktokController.getTiktokCreatorInfo
);
module.exports = router;