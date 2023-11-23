const UserService = require("../services/userServices");
const userInterface = new UserService();
const bcrypt = require("bcryptjs");
const moment = require("moment");
const jwt = require("jsonwebtoken");
var request = require("request");
const { default: axios } = require("axios");
const _ = require("lodash");
const {
  twitterPost,
  postOnTwitter,
} = require("../controller/twitterController");
const { uplodYouTubeVideo } = require("../controller/youTubeController");
const { googleBusinessPost } = require("./googleBusinessController");
const mailer = require("@sendgrid/mail");
const { LinkedInSharePost } = require("../utils/linkedin/LinkedInUtils");
const Posts = require("../models/Posts");
const cron = require("node-cron");
const { createPost, publishPosts } = require("../utils/postUtils");

const method = {};

// Register a new User
/**
 *
 * @param {object} req
 * @param {object} res
 * @since 18/06/2023
 * @return {object} Json Response
 */

method.register = async (req, res) => {
  try {
    const verifiedEmail = await userInterface.checkEmail(req.body.email);
    if (!verifiedEmail) {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const data = await userInterface.createUser({
        email: req.body.email,
        password: hashedPassword,
      });

      const authToken = jwt.sign({ user: data.id }, process.env.SECRETKEY);
      res.status(200).json({
        data: data,
        token: authToken,
        message: "user created successfully",
      });
    } else {
      res.status(400).json({ message: "user already exist" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Somithing wrong" });
  }
};

/**
 *
 * @param {object} req
 * @param {object} res
 * @since 18/06/2023
 * @return {object} Json Response
 * Comment: This function take the data and authenticate the user
 */
method.addPostData = async (req, res) => {
  try {
    const response = await userInterface.storePostData(req.body);
    return res.status(200).json(response);
  } catch (err) {
    return res.status(400).json(err);
  }
};

method.logInUser = async (req, res) => {
  try {
    const verifiedEmail = await userInterface.checkEmail(req.body.email);
    if (verifiedEmail) {
      const verifiedPassword = await bcrypt.compare(
        req.body.password,
        verifiedEmail.password
      );
      if (verifiedPassword) {
        const authToken = jwt.sign(
          { id: verifiedEmail.id, email: verifiedEmail.email },
          process.env.SECRETKEY
        );

        res.status(200).json({
          id: verifiedEmail.id,
          userId: verifiedEmail.userId,
          email: verifiedEmail.email,
          access_token: authToken,
          message: "user Login successfully",
        });
      } else {
        res.status(400).json({ message: "Invalid credentials" });
      }
    } else {
      res.status(400).json({ message: "this email is not exist" });
    }
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

/**
 *
 * @param {request} req
 * @param {response} res
 * @returns {object} returns the json response
 * @comment This function send the e-mail to the user for the re-set the password
 */
method.sendEmail = async (req, res) => {
  try {
    const email = req.body.email;
    const verifiedEmail = await userInterface.checkEmail(email);
    if (verifiedEmail) {
      // Insert your API key here
      mailer.setApiKey(
        "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"
      );

      // Setting configurations
      const msg = {
        to: email,
        from: "helder.g@appwrk.com",
        subject: "Password Reset Request",
        html: `
      <html>
        <head>
          <style>
            /* Add your CSS styles here */
            body {
              font-family: Arial, sans-serif;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              text-align: center;
            }
            .logo {
              margin-bottom: 20px;
            }
            .headerLogo{              
              color: #A7C7ED;
            }
            .message {
              font-size: 18px;
              margin-bottom: 20px;
            }
            .button {
              display: inline-block;
              padding: 10px 20px;
              background-color: #C65880;
              color: #fff;
              text-decoration: none;
              border-radius: 5px;
              font-weight: bold;
            }
            .myMail{
              color: blue;
              text-decoration: underline;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 class="headerLogo">OnQue</h1>
            <p class="message">
            You're getting this email because you requested recover your account. If you didn't intend to do this, just ignore this email.</p>
            <a href="https://jjmedia.appwrk.com//setting/iIdentification?email=${email}" class="button">
            Recover my password
            </a>
            <p class="myMail"><a>${email}</a></p>            
          </div>
        </body>
      </html>
    `,
      };
      // Sending mail
      mailer.send(msg, function (err, json) {
        if (err) {
          // Writing error message
          res.write("Can't send message sent");
        } else {
          // Writing success message
          res.write("Message sent");
        }
      });

      res.status(200).json({
        message:
          "If there's an existing account associated with this email, you will receive a recovery message shortly.",
      });
      res.end();
    } else {
      res.status(400).json({ message: "Please enter a valid email address!" });
    }
  } catch (error) {}
};

/**
 *
 * @param {request} req
 * @param {response} res
 * @returns {object} returns the json response
 * @comment This function updates the user password
 */
method.forgotPassword = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const verifiedEmail = await userInterface.checkEmail(email);
    if (verifiedEmail) {
      const hashedPassword = await bcrypt.hash(password, 10);

      const userData = {
        email: email,
        password: hashedPassword,
      };
      const data = await userInterface.updatePassword(userData);
      if (data.success) {
        res.status(200).json({
          data: data.body,
          msg: data.message,
          success: data.success,
        });
      } else {
        res.status(400).json({
          msg: data.error,
          success: data.success,
        });
      }
    }
  } catch (error) {}
};

/**
 *
 * @param {request} req
 * @param {Response} res
 * @returns {Object} returns the json response
 * @comment This function give the auth token and auth-verify token of twitter lpgin user
 */
method.twitterLogin = (req, res) => {
  request.post(
    {
      url: "https://api.twitter.com/oauth/request_token",
      oauth: {
        oauth_callback: process.env.OAUTH_CALLBACKURL,
        consumer_key: process.env.LIVE_TWITTER__CONSUMER_KEY,
        consumer_secret: process.env.LIVE_TWITTER_CONSUMER_SECRET,
      },
    },
    function (err, r, body) {
      if (err) {
        return res.send(500, { message: e.message });
      }
      var jsonStr =
        '{ "' + body.replace(/&/g, '", "').replace(/=/g, '": "') + '"}';
      res.send(JSON.parse(jsonStr));
    }
  );
};

/**
 *
 * @param {request} req
 * @param {Response} res
 * @returns {Object} returns the json response
 */
method.twitterAccessToken = async (req, res) => {
  try {
    const oauth_token = req.body.oauth_token;
    const oauth_verifier = req.body.oauth_verifier;
    const userId = req.body.userId;

    // Specify the scope to request the email address
    const scope = "email";
    const response = await axios.post(
      `https://api.twitter.com/oauth/access_token?oauth_verifier=${oauth_verifier}&oauth_token=${oauth_token}&scope=${scope}`,
      {
        params: {
          include_email: true,
        },
      }
    );

    const data = response.data.split("&");
    const accessToken = data[0].split("=")[1];
    const accessSecret = data[1].split("=")[1];
    const user_id = data[2].split("=")[1];
    const screen_name = data[3].split("=")[1];
    const userData = {
      userId: user_id,
      accessToken: accessToken,
      accessSecret: accessSecret,
      platform: "twitter",
      screenName: screen_name,
    };

    await userInterface.setMediaToken(userData);
    await userInterface.updateUserId(userData);
    let twitterLoginData = await userInterface.getUserId(userData);

    res.status(200).json({
      data: twitterLoginData,
    });
  } catch (err) {
    res.status(500).json(err);
  }
};

method.mediaPost = async (req, res) => {
  try {
    const platform = req.body.platform;

    if (platform === "twitter") {
      await twitterPost(req, res);
    }
    if (platform === "youtube") {
      await uplodYouTubeVideo(req, res);
    }
    if (platform === "google-business") {
      await googleBusinessPost(req, res);
    }
  } catch (err) {}
};

method.getPostData = async (req, res) => {
  const userId = req.user?.id;
  let data = await userInterface.getPostData(userId);
  if (data) {
    res.status(200).json(data);
  } else {
    res.status(400).json({ message: "No data found" });
  }
};

method.getSpecificPostData = async (req, res) => {
  let post_id = req.headers.post_id;
  try {
    let data = await userInterface.getSpecificPostData(post_id);
    if (data) {
      res.status(200).json({
        data: data,
        message: "specific post data",
      });
    } else {
      res.status(200).json({
        data: "",
        message: "no data found",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};

method.deletePostData = async (req, res) => {
  try {
    let post_id = req.headers.post_id;
    let data = await userInterface.updateSpecificPostData(post_id);
    if (data.delete == 0) {
      res.status(200).json({
        message: "Post not deleted",
      });
    } else {
      res.status(200).json({
        data: data,
        message: "Post deleted successfully",
      });
    }
  } catch (err) {
    res.status(500).json({
      message: "Something went wrong",
      error: err.message,
    });
  }
};

method.userConnections = async (req, res) => {
  const userId = req.user?.id;
  const attributes = ["id", "platform", "screenName"];
  try {
    const connections = await userInterface.getUserConnections(
      userId,
      attributes
    );

    return res.status(200).json(connections);
  } catch (err) {
    return res.status(400).json(err);
  }
};

method.schedulePosts = async (req, res) => {
  const userId = req.user?.id;
  const data = req.body;
  const { providers, scheduledDate } = data;
  const canPublish = moment(scheduledDate).isSameOrBefore(moment());


  if (providers.length > 0) {
    if (canPublish) {
      var postStatus = await publishPosts(data, userId);

      if (!postStatus.success) {
        return res.status(400).json(postStatus.data);
      }
    }
    const response = await createPost(userId, data, postStatus?.data);
    if (response.success) {
      return res.status(200).json(response.data);
    } else {
      return res.status(400).json(response.data);
    }
  } else {
    return res.status(400).json({ msg: "No selected platform" });
  }
};

module.exports = method;
