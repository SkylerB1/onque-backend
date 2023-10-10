const express = require("express");
const router = express.Router();
// const got = require('got');


// Import all routes here
const UploadRoute = require("./fileUpload");
const UserRoute = require("./userRoutes");
const SocialMediaRoute = require("./socialMediaRoute");

router.use("/files", UploadRoute);
router.use("/user", UserRoute);
router.use("/auth", SocialMediaRoute);
router.use("/social-media", SocialMediaRoute);

module.exports = router;
