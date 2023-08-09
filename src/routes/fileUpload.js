const express = require("express");
const router = express.Router();

const controller = require("../controller/file.controller");
const uploadFileMiddleware = require('../middleware/upload');

router.post("/upload", uploadFileMiddleware, controller.upload);
router.get("/get-files", controller.getListFiles);
router.get("/get-files/:name", controller.download);

module.exports = router;