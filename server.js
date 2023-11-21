const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const router = require("./src/routes/index");
const path = require("path");
const cron = require("node-cron");
const { schedulePosts } = require("./src/utils/postUtils");

require("dotenv").config();
require("./src/config/db.config");
require("./src/models/index");

global._basedir = __dirname;

var corsOptions = {
  origin: "*",
};

app.use(cors(corsOptions));
// body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// global-route
app.use("/api", router);
app.use("/assets", express.static(path.join(__dirname, "assets")));

cron.schedule("*/10 * * * * *", schedulePosts);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port: ${process.env.PORT}`);
});
