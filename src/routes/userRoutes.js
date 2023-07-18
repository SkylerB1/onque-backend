const express = require("express");
const router = express.Router();
const UserController = require("../controller/userController");
const authorization = require("../middleware/auth.middleware");

router.post('/register', UserController.register)
router.post('/login', UserController.logInUser)

module.exports = router;