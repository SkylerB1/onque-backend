const express = require("express");
const router = express.Router();
const UserController = require("../controller/userController");
const authorization = require("../middleware/auth.middleware");
const { userSchema } = require("../utils/schema/schema");
const { ValidationSource, validator } = require("../utils/validator")

router.get('/twitter/reverse',UserController.twitterLogin)
router.post('/media_token',UserController.setUserToken)

module.exports = router;