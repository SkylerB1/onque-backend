const { SuccessResponse, ErrorResponse } = require("../utils/apiResponse");
const UserService = require("../services/userServices")
const loginInterface = new UserService();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Users = require("../models/Users");
var request = require("request");

const method = {}

// Register a new User

/**
   *
   * @param {object} req
   * @param {object} res
   * @since 18/06/2023
   * @author Aston | <from Appwrk>
   * @return {object} Json Response
   */

method.register = async (req, res) => {
    try {
        const verifiedEmail = await loginInterface.checkEmail(req.body.email);
        if (!verifiedEmail) {
            const hashedPassword = await bcrypt.hash(req.body.password, 10)
            const data = await loginInterface.createUser({
                email: req.body.email,
                password: hashedPassword,
            });
            const authToken = jwt.sign({ user: data.id }, process.env.SECRETKEY)
            res.status(200).json({
                data: data,
                token: authToken,
                message: "user created successfully",
            })

        } else {
            res.status(400).json({ message: "user already exist" })
        }
    } catch (err) {
        res.send({ message: "Somithing wrong" }).status(500)
    }
}

/**
   *
   * @param {object} req
   * @param {object} res
   * @since 18/06/2023
   * @author Aston | <from Appwrk>
   * @return {object} Json Response
   * Comment: This function take the data and authenticate the user
   */

method.logInUser = async (req, res) => {
    // const result = loginInterface.logInUser();
    const verifiedEmail = await loginInterface.checkEmail(req.body.email)
    if (verifiedEmail) {
        const verifiedPassword = await bcrypt.compare(req.body.password, verifiedEmail.password)
        if (verifiedPassword) {
            const authToken = jwt.sign({ user: verifiedEmail.id }, process.env.SECRETKEY)
            res.status(200).json({
                data: { id: verifiedEmail.id, email: verifiedEmail.email },
                token: authToken,
                message: "user Login successfully",
            })

        } else {
            res.status(400).json({ message: "user not exist" })
        }
    } else {
        res.status(400).json({ message: " this email is not exist" })
    }
}

method.facebooklogin = async (req, res) => {   
    try {
        const { accessToken, userId, platform } = req.body;

        const id = await loginInterface.checkId(userId)
        if (!id) {
            const data = await loginInterface.setMediaToken({
                id: userId,
                platform: platform,
                oauth_token: accessToken,
            });
            res.status(200).json({
                data: data,
                message: "user created successfully",
            })
        }else {
            res.status(400).json({ message: "user already exist" })
        }
    } catch (err) {
        res.status(500).json({
            message: err.message
        })

    }
}

method.twitterLogin = (req, res) => {
    request.post(
        {
            url: "https://api.twitter.com/oauth/request_token",
            oauth: {
                oauth_callback: process.env.LOCAL_OAUTH_CALLBACKURL,
                consumer_key: process.env.OTHER_TWITTER__CONSUMER_KEY,
                consumer_secret: process.env.OTHER_TWITTER_CONSUMER_SECRET,
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
}

method.setUserToken = async (req, res) => {
    try {
        const { accessToken, userId, platform } = req.body;

        const id = await loginInterface.checkId(userId)
        if (!id) {
            const data = await loginInterface.setMediaToken({
                id: userId,
                platform: platform,
                oauth_token: accessToken,
            });
            res.status(200).json({
                data: data,
                message: "user created successfully",
            })
        }else {
            res.status(400).json({ message: "user already exist" })
        }
    } catch (err) {
        res.status(500).json({
            message: err.message
        })

    }
}


module.exports = method