const express = require("express");
const router = express.Router();
var request = require("request");


// Import all routes here
const UploadRoute = require("./fileUpload");
const UserRoute = require('./userRoutes')
const SocialMediaRoute = require("./socialMediaRoute")
const authorization = require("../middleware/auth.middleware")

router.use('/files', UploadRoute);
router.use('/user', UserRoute)
router.use("/auth", SocialMediaRoute);

// router.route("/auth/twitter/reverse").get(function (req, res) {
//   request.post(
//     {
//       url: "https://api.twitter.com/oauth/request_token",
//       oauth: {
//         oauth_callback: "http%3A%2F%2Flocalhost%3A3000%2Fauth%2Flogin",
//         consumer_key: "EsjCJaczKFyzdaBLfSoe36YMh",
//         consumer_secret: "IJYArxAxOs5p0oaBNrcyYIqROZ8ZWEAuT2GYcNJifGAuP3xQag",
//       },
//     },
//     function (err, r, body) {
//       if (err) {
//         return res.send(500, { message: e.message });
//       }
//       var jsonStr =
//         '{ "' + body.replace(/&/g, '", "').replace(/=/g, '": "') + '"}';
//       res.send(JSON.parse(jsonStr));
//     }
//   );
// });


module.exports = router;