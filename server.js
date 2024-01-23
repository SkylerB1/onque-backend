require("dotenv").config();
const express = require("express");
const session = require("express-session");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const router = require("./src/routes/index");
const path = require("path");
const cron = require("node-cron");
const { schedulePosts } = require("./src/utils/postUtils");
const passport = require("passport");

require("./src/config/db.config");
require("./src/models/index");


global._basedir = __dirname;

var corsOptions = {
  origin: "*",
};

app.use(cors(corsOptions));
app.use(
  session({
    secret: "dsbbddfnrieumcjb",
    resave: false,
    saveUninitialized: true,
  })
);
// body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// global-route
app.use("/assets", express.static(path.join(__dirname, "assets")));
app.use(passport.initialize());
app.use(passport.session());
app.use("/api", router);
passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});




cron.schedule("*/10 * * * * *", schedulePosts);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port: ${process.env.PORT}`);
});
