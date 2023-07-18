const express = require("express");
const router = express.Router();

// Import all routes here
const UploadRoute = require("./fileUpload");
const UserRoute = require('./userRoutes')

router.use('/uploads', UploadRoute);
router.use('/users', UserRoute)


module.exports = router;