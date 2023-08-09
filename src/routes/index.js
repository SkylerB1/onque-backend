const express = require("express");
const router = express.Router();

// Import all routes here
const UploadRoute = require("./fileUpload");
const UserRoute = require("./userRoutes");
const SocialMediaRoute = require("./socialMediaRoute");
const authorization = require("../middleware/auth.middleware");

router.use("/files", UploadRoute);
router.use("/user", UserRoute);
router.use("/auth", SocialMediaRoute);

module.exports = router;
