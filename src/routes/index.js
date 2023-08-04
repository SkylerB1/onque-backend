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


const T = {
  consumer_key: "EsjCJaczKFyzdaBLfSoe36YMh",
  consumer_secret: "IJYArxAxOs5p0oaBNrcyYIqROZ8ZWEAuT2GYcNJifGAuP3xQag",
  access_token: "1671076857670959104-9EF6h8ltaI7ttiTnQbe3iWOZmGk6Jd",
  access_token_secret: "PnIlqUrn8gGCAlx4HurlIZP2zZbX1h7Ol2K0MbpXUM68y",
};

module.exports = router;
