const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const router = require("./src/routes/index");

const https = require("https");
const fs = require("fs");

const https_options = {
  key: fs.readFileSync(
    "/etc/letsencrypt/live/api.jjmedia.appwrk.com/privkey.pem"
  ),
  cert: fs.readFileSync(
    "/etc/letsencrypt/live/api.jjmedia.appwrk.com/fullchain.pem"
  ),
};

require("dotenv").config();
require("./src/config/db.config");
require("./src/models/index");

global._basedir = __dirname;

const corsOptions = {
  origin: "*",
};

app.use(cors(corsOptions));
// body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// global-route
app.use("/api", router);

const httpsServer = https.createServer(https_options, app);

httpsServer.listen(process.env.PORT);
