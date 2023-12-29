const express = require("express");
const router = express.Router();
// const got = require('got');


// Import all routes here
const UploadRoute = require("./fileUpload");
const UserRoute = require("./userRoutes");
const SocialMediaRoute = require("./socialMediaRoute");
const BrandsRoute = require("./brandsRoute")

router.use("/files", UploadRoute);
router.use("/user", UserRoute);
router.use("/auth", SocialMediaRoute);
router.use("/social-media", SocialMediaRoute);
router.use("/brands", BrandsRoute);

module.exports = router;
