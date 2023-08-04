const { SuccessResponse, ErrorResponse } = require("../utils/apiResponse");
const UserService = require("../services/userServices")
const loginInterface = new UserService();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Users = require("../models/Users");
var request = require("request");
const { default: axios } = require("axios");
const crypto = require('crypto');
const _ = require('lodash');

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
                consumer_key: process.env.TWITTER__CONSUMER_KEY,
                consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
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
    const accessTokenSecret = req.body.accessTokenSecret;

    const apiUrl = 'https://api.twitter.com/2/tweets';

    //for oauth_nonce
    function generateRandomBase64String(length) {
        const randomBytes = crypto.randomBytes(length);
        const base64String = randomBytes.toString('base64');

        // Strip out non-word characters using lodash
        const strippedString = _.replace(base64String, /\W/g, '');

        return strippedString;
    }
    const randomBase64Data = generateRandomBase64String(32);
    //END

    //for oauth_timestamp
    function generateOAuthTimestamp() {
        return Math.floor(Date.now() / 1000);
    }
    const oauthTimestamp = generateOAuthTimestamp();
    //END

    //for oauth_signature
    function percentEncode(value) {
        return encodeURIComponent(value).replace(/[!'()*]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase());
    }

    function calculateHmacSha1(signatureBaseString, signingKey) {
        const hmac = crypto.createHmac('sha1', signingKey);
        hmac.update(signatureBaseString);
        return hmac.digest('base64');
    }

    function generateOAuthSignature(baseString, signingKey) {
        const hmac = crypto.createHmac('sha1', signingKey);
        hmac.update(baseString);
        const signatureBinary = hmac.digest();
        const signatureBase64 = Buffer.from(signatureBinary).toString('base64');
        return signatureBase64;
    }

    const httpMethod = 'POST'; // HTTP method (e.g., POST)
    const baseURL = 'https://api.twitter.com/2/tweets'; // Base URL for the request
    const queryParams = 'include_entities=true'; // Query parameters (if any)
    const oauthParams = `oauth_consumer_key=${process.env.TWITTER__CONSUMER_KEY}&oauth_nonce=${randomBase64Data}&oauth_signature_method=HMAC-SHA1&oauth_timestamp=${oauthTimestamp}&oauth_version=1.0&oauth_token=${req.body.accessToken}`; // OAuth parameters (excluding the oauth_signature)

    const encodedHTTPMethod = percentEncode(httpMethod);
    // console.log(encodedHTTPMethod)
    const encodedBaseURL = percentEncode(baseURL);
    // console.log(encodedBaseURL)
    const encodedQueryParams = percentEncode(queryParams);
    // console.log(encodedQueryParams)
    const encodedOAuthParams = percentEncode(oauthParams);
    // console.log(encodedOAuthParams)

    const baseString = `${encodedHTTPMethod}&${encodedBaseURL}&${encodedQueryParams}&${encodedOAuthParams}`;

    console.log(baseString)
    const signingKey = process.env.TWITTER__CONSUMER_KEY + '&' + accessTokenSecret;

    const signature = generateOAuthSignature(baseString, signingKey);
    console.log('OAuth Signature:', signature);
   // END

    // const tweetData = {
    //     text: req.body.text,
    // };

    // axios.post(apiUrl, tweetData, {
    //     headers: {
    //         'Authorization': `OAuth oauth_consumer_key=${process.env.TWITTER__CONSUMER_KEY},oauth_token=${req.body.accessToken},oauth_signature_method="HMAC-SHA1",oauth_timestamp=${oauthTimestamp},oauth_nonce=${randomBase64Data},oauth_signature=${signature}, oauth_version="1.0"`,
    //     }
    // })
    //     .then(response => {
    //         console.log('Tweet posted successfully:', response.data);
    //     })
    //     .catch(error => {
    //         console.error('Error posting tweet:', error);
    //     });
}


module.exports = method