const express = require("express");
const router = express.Router();

const controller = require("../controller/file.controller");
const uploadSingleFileMiddleware = require('../middleware/upload');
const uploadMultpleFileMiddleware = require('../middleware/upload');

router.post("/upload", uploadSingleFileMiddleware, controller.upload);
router.post("/upload-multple-file", uploadMultpleFileMiddleware, controller.uploadMultipleFile);
router.get("/get-files", controller.getListFiles);
router.get("/get-files/:name", controller.download);

module.exports = router;