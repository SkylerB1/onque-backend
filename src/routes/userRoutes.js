const express = require("express");
const router = express.Router();
const UserController = require("../controller/userController");
const authorization = require("../middleware/auth.middleware");
const { userSchema } = require("../utils/schema/schema");
const { ValidationSource, validator } = require("../utils/validator")

router.post('/register', validator(userSchema.login, ValidationSource.BODY) ,UserController.register)
router.post('/login', validator(userSchema.login, ValidationSource.BODY), UserController.logInUser)
router.get('/getPostData', UserController.getPostData)
router.patch('/deletePost', UserController.deletePostData)

module.exports = router;