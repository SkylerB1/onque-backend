const express = require("express");
const router = express.Router();

// Import all routes here
const UploadRoute = require("./fileUpload");
const UserRoute = require('./userRoutes')

router.use('/files', UploadRoute);
router.use('/user', UserRoute)


module.exports = router;