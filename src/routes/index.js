const express = require("express");
const router = express.Router();
var request = require("request");
const crypto = require('crypto');
// const got = require('got');

const OAuth = require('oauth-1.0a');

const Twit = require('twit');

// Import all routes here
const UploadRoute = require("./fileUpload");
const UserRoute = require("./userRoutes");
const SocialMediaRoute = require("./socialMediaRoute");
const authorization = require("../middleware/auth.middleware");
const axios = require("axios");

router.use("/files", UploadRoute);
router.use("/user", UserRoute);
router.use("/auth", SocialMediaRoute);

module.exports = router;
