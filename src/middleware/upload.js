const util = require("util");
const multer = require("multer");
const maxSize = 50 * 1024 * 1024;

let storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, _basedir + "/assets/");
  },
  filename: function (req, file, cb) {
    let ext = file.originalname.substring(file.originalname.lastIndexOf("."));

    cb(null, file.fieldname + "-" + Date.now() + ext);
  },
});

let uploadFile = multer({
  storage: storage,
}).array("files", 10);

let uploadFileMiddleware = util.promisify(uploadFile);
module.exports = uploadFileMiddleware;
