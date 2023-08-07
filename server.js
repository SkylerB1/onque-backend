const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const router =  require("./src/routes/index");

require("dotenv").config();
require("./src/config/db.config");
require("./src/models/index");

global._basedir = __dirname;

var corsOptions = {
  origin: "*"
};

app.use(cors(corsOptions));
// body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// global-route
app.use("/api", router);

// app.use((req, res, next) => {
//     if (req.protocol === 'http') {
//         console.log(`https://${req.headers.host}${req.url}`)
//         return res.redirect(302, `https://${req.headers.host}${req.url}`);
//     }
//     next();
// });


app.listen(process.env.PORT, () => {
    console.log(`Server is running on port: ${process.env.PORT}`);
  });