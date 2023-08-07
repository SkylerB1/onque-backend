const { SuccessResponse, ErrorResponse } = require("../utils/apiResponse");
const UserService = require("../services/userServices")
const userInterface = new UserService();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Users = require("../models/Users");
var request = require("request");
const { default: axios } = require("axios");
const crypto = require('crypto');
const _ = require('lodash');
const { TwitterApi } = require("twitter-api-v2");

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
        const verifiedEmail = await userInterface.checkEmail(req.body.email);
        if (!verifiedEmail) {
            const hashedPassword = await bcrypt.hash(req.body.password, 10)
            const data = await userInterface.createUser({
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
    // const result = userInterface.logInUser();
    const verifiedEmail = await userInterface.checkEmail(req.body.email)
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

        const id = await userInterface.checkId(userId)
        if (!id) {
            const data = await userInterface.setMediaToken({
                id: userId,
                platform: platform,
                oauth_token: accessToken,
            });
            res.status(200).json({
                data: data,
                message: "user created successfully",
            })
        } else {
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
                oauth_callback: process.env.OAUTH_CALLBACKURL,
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

method.twitterAccessToken = async (req, res) => {
    const oauth_token = req.body.oauth_token;
    const oauth_verifier = req.body.oauth_verifier;

    const response = await axios.post(`https://api.twitter.com/oauth/access_token?oauth_verifier=${oauth_verifier}&oauth_token=${oauth_token}`);
    const data = response.data.split("&");
    const accessToken = data[0].split("=")[1];
    const accessSecret = data[1].split("=")[1];
    const user_id = data[2].split("=")[1];
    const screen_name = data[3].split("=")[1];
    const userData = {
        accessToken: accessToken,
        accessSecret: accessSecret,
        user_id: user_id,
        screen_name: screen_name,
    }
    res.status(200).json({
        data: userData,
    })
}

method.setUserToken = async (req, res) => {
    try {
        const { accessToken, userId, platform } = req.body;

        const id = await userInterface.checkId(userId)
        if (!id) {
            const data = await userInterface.setMediaToken({
                id: userId,
                platform: platform,
                oauth_token: accessToken,
            });
            res.status(200).json({
                data: data,
                message: "user created successfully",
            })
        } else {
            res.status(400).json({ message: "user already exist" })
        }
    } catch (err) {
        res.status(500).json({
            message: err.message
        })

    }
}

method.twitterPost = async (req, res) => {
    const text = req.body.text;

    const client = new TwitterApi({
        appKey: "EsjCJaczKFyzdaBLfSoe36YMh",
        appSecret: "IJYArxAxOs5p0oaBNrcyYIqROZ8ZWEAuT2GYcNJifGAuP3xQag",
        accessToken: req.body.accessToken,
        accessSecret: req.body.accessTokenSecret,
        bearerToken: "AAAAAAAAAAAAAAAAAAAAAIBJpAEAAAAAbH3c2R%2FhK7y9J%2FeAR4raGZAtYiU%3D1RyNDwnJS7QraHViRkhRf3Lg3DoSIxJCv1bshti4u7o0axuHdQ",
    });

    const rwClient = client.readWrite;
    const mediaTweet = async () => {
        try {

            // Create mediaID 
            // const mediaId = await client.v1.uploadMedia(

            //     // Put path of image you wish to post
            //     "./1605232393098780672example.png"
            // );

            // Use tweet() method and pass object with text 
            // in text feild and media items in media feild
            await rwClient.v2.tweet({
                text: text,
                // media: { media_ids: [mediaId] },
            });
            res.status(200).json({ message: 'Tweet posted successfully.' });
        } catch (error) {
            console.log(error);
        }
    };

    // Call any of methods and you are done 
    mediaTweet();
}

method.twitterPostData = async (req, res) => {
    // console.log(req.body,"twitter data ")
    const data = await userInterface.storePostData({
        userId: req.body.userId,
        text: req.body.text,
        files: req.body.file,
        platform: req.body.platform,
        status: 1,
    });
    const files = await userInterface.uploadMediaFile({
        userId: req.body.userId,
        files: req.body.files,
    });
    res.status(200).json({
        data: data,
        files: files,
        message: "user data stored successfully",
    })

}

module.exports = method