
const UserService = require("../services/userServices")
const userInterface = new UserService();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
var request = require("request");
const { default: axios } = require("axios");
const _ = require('lodash');
const { TwitterApi } = require("twitter-api-v2");
const fs = require("fs");
const moment = require('moment');

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
                consumer_key: process.env.TWITTER__CONSUMER_KEY,
                consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
            },
        },
        function (err, r, body) {
            if (err) {
                return res.send(500, { message: e.message });
            }
            var jsonStr = '{ "' + body.replace(/&/g, '", "').replace(/=/g, '": "') + '"}';
            res.send(JSON.parse(jsonStr));
        }
    );
}

method.twitterAccessToken = async (req, res) => {
    try {
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
            userId: user_id,
            platform: "twitter",
            screenName: screen_name,
        }

        await userInterface.setMediaToken(userData);

        res.status(200).json({
            data: userData,
        })
    } catch (err) {
        console.log(err)
    }
}


let postOnTwitter = async (access_token, token_secret, text = '', imagePath = []) => {

    const client = new TwitterApi({
        appKey: "weNnuWHuaoOLpFbsOY4sivVL1",
        appSecret: "9xYuCgH3nBQJHvdVRi0fMLsKVhbwsVqYldO1sym1m0Di2WAkOj",
        accessToken: access_token,
        accessSecret: token_secret,
        bearerToken: "AAAAAAAAAAAAAAAAAAAAAGwEpAEAAAAAvv29%2Bqg59ZhC9j9YsmfVXtR9SHk%3Do5mgkyL3JVcveruJ5fPgGMEwZDoAquiZV6QeTCAVmb37qHWsdj",
    });
    const rwClient = client.readWrite;
    let mediaIds = [];
    for (let i = 0; i < imagePath.length; i++) {
        const mediaId = await client.v1.uploadMedia(
            imagePath[i]
        );
        mediaIds.push(mediaId);
    }
    // return;
    if (mediaIds.length > 0) {
        await rwClient.v2.tweet({
            text: text,
            media: { media_ids: mediaIds },
        });
    } else {
        await rwClient.v2.tweet({
            text: text,
        });
    }
}

method.twitterPost = async (req, res) => {
    const text = req.body.text;
    let token_secret = req.headers.accesstokensecret;
    let access_token = req.headers.accesstoken;
    let user_id = req.headers.userid;
    let scheduledDate = (req.body.post_send_date) ? req.body.post_send_date : Date();
    let prev_files = (req.body.prev_files && req.body.prev_files.length > 0) ? JSON.parse(req.body.prev_files) : '';
    let prev_file_name = [];

    //for post_send_type 
    const receivedDateString = req.body.post_send_date;
    const receivedDate = moment(receivedDateString, "ddd MMM DD YYYY HH:mm:ss ZZ");
    const currentDate = moment();
    const post_send_type = receivedDate.isSame(currentDate, 'minute') ? 'now' : 'scheduled';
    //end

    if (prev_files.length > 0) {
        prev_files.forEach(img => {
            prev_file_name.push(img.name);
        })
    } else { }

    /***  it is used for update  */

    const directoryPath = _basedir + "/assets/";
    let post_id = (req.headers.post_id) ? req.headers.post_id : '';

    if (post_id != '') {
        let data = await userInterface.getSpecificPostData(post_id, user_id);
        if (data && data.files != '') {
            let posted_file_data = JSON.parse(data.files);

            /** delete values if previous one is deleted at frontend*/

            if (posted_file_data.length > 0) {
                posted_file_data.forEach(async element => {
                    let img_name = element.name;
                    if (!prev_file_name.includes(img_name)) {
                        let file_path = directoryPath + img_name;
                        if (fs.existsSync(file_path)) {
                            fs.unlink(file_path, (err) => {
                                if (err) {
                                    throw err;
                                }
                            });
                        }
                    }
                });
            }
        }
    } else { }

    /***  end it is used for update  */

    const imagePath = req.files.map((item) => {
        return item.path;
    })

    let imageData = req.files.map((item) => {
        let data = {
            name: item.filename.trim(),
            type: item.mimetype,
            size: item.size
        }
        return data;
    })

    imageData = [...imageData, ...prev_files];
    imageData = (imageData.length > 0) ? JSON.stringify(imageData) : '';

    try {
        let objData = {
            userId: user_id,
            text: req.body.text,
            files: imageData,
            platform: req.body.platform,
            scheduledDate: scheduledDate,
        };

        objData['status'] = (post_send_type == 'scheduled') ? 'pending' : 'published';
        const data = await userInterface.storePostData(objData, post_id);

        if (post_send_type != 'scheduled') {
            await postOnTwitter(access_token, token_secret, text, imagePath);
        } else { }

        /** end it is post in twitter */

        res.status(200).json({
            data: data,
            message: 'Tweet posted successfully.'
        });

    } catch (error) {
        res.status(500).json({
            message: 'Something went wrong',
            error: error.message,
        });
    }
}

method.getPostData = async (req, res) => {
    let data = await userInterface.getPostData();
    if (data) {
        res.status(200).json({
            data: data
        })
    } else {
        res.status(400).json({ message: "No data found" })
    }
}

method.getSpecificPostData = async (req, res) => {
    let post_id = req.headers.post_id;
    let user_id = req.headers.user_id;
    try {
        let data = await userInterface.getSpecificPostData(post_id, user_id);
        if (data) {
            res.status(200).json({
                data: data,
                message: 'specific post data'
            });
        } else {
            res.status(200).json({
                data: '',
                message: 'no data found'
            });
        }
    } catch (error) {
        res.status(500).json({
            message: 'Something went wrong',
            error: error.message,
        });
    }
}

method.deletePostData = async (req, res) => {
    try {
        let post_id = req?.body?.headers.post_id;
        let user_id = req?.body?.headers.userId;
        let data = await userInterface.updateSpecificPostData(post_id, user_id);
        if (data.delete == 0) {
            res.status(200).json({
                message: 'Post not deleted'
            });
        } else {
            res.status(200).json({
                data: data,
                message: 'Post deleted successfully'
            })
        }
    } catch (err) {
        res.status(500).json({
            message: 'Something went wrong',
            error: err.message
        });
    }
}

let crons = async (req, res) => {
    try {
        const getScheduleData = await userInterface.scheduleData();
        if (getScheduleData.length > 0) {
            const directoryPath = _basedir + "/assets/";
            getScheduleData.map(async (item) => {
                const post_id = item.id;
                const userId = item.userId;
                const getAccess = await userInterface.getAccessToken(userId)
                const text = item.text;
                const imagePathDataArray = item.files ? JSON.parse(item.files) : [];
                const imageNames = imagePathDataArray.map((imageData) => imageData.name);
                const imagePath = imageNames.map((imageName) => directoryPath + imageName);
                const access_token = getAccess.accessToken;
                const token_secret = getAccess.accessSecret;
                try {
                    await postOnTwitter(access_token, token_secret, text, imagePath);

                    await userInterface.storePostData({ status: 'published' }, post_id);

                } catch (apiError) {
                    console.error('Error creating post:', apiError);
                }
            });
        } else {
            console.log("Empty data")
        }

    } catch (error) {
        console.log(error);
    }
}

const callEveryFiveMinutes = async () => {
    console.log("Starting the interval...");
    // Call the mainFunction immediately
    await crons();
    // Call the mainFunction every 5 minutes (300,000 milliseconds)
    const interval = 1 * 60 * 1000; // 5 minutes in milliseconds
    console.log(`Scheduling mainFunction to run every ${interval / 1000 / 60} minutes.`);
    setInterval(crons, interval);
}
// Call the function to start the interval
callEveryFiveMinutes();


module.exports = method