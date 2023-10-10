const { default: axios } = require("axios");
const UserService = require("../services/userServices");
const { google } = require("googleapis");
const userInterface = new UserService();
const moment = require("moment");
const readline = require("readline");

const getYouTubeAuthUrl = async (req, res) => {
  try {
    let access_token = req.headers.accesstoken;
    let screenName = req.headers.screenname;
    let platform = req.headers.platform;

    const userData = {
      accessToken: access_token,
      accessSecret: "",
      platform: platform,
      screenName: screenName,
    };

    await userInterface.setMediaToken(userData);

    res.status(200).json({
      data: userData,
    });
  } catch (err) {
    console.log(err);
  }
};

const uplodYouTubeVideo = async (req, res) => {
  try {
    const headers = JSON.parse(req.headers.headersarraystring);
    const getHeaders = (platform) => {
      return headers.filter((headers) => headers.platform === platform)[0];
    };
    const youtubeHeaders = getHeaders("youtube");
    const discription = req.body.text;
    const youTubePresets = req.body.youTubePresets;
    const data = JSON.parse(youTubePresets);

    const socialPresets = JSON.stringify(data);
    let userId = req.body.userId;

    // Access individual properties
    const title = data.title;
    const category = data.category;
    const audienceConfiguration = data.audience_configuration;
    const visibility = data.visibility;

    // Define the scheduled publish date and time
    const scheduledDate = req.body.post_send_date
      ? new Date(req.body.post_send_date)
      : new Date();

    let prev_files =
      req.body.prev_files && req.body.prev_files.length > 0
        ? JSON.parse(req.body.prev_files)
        : "";
    let prev_file_name = [];

    //for post_send_type
    const receivedDateString = req.body.post_send_date;
    const receivedDate = moment(
      receivedDateString,
      "ddd MMM DD YYYY HH:mm:ss ZZ"
    );
    const currentDate = moment();
    const post_send_type = receivedDate.isSame(currentDate, "minute")
      ? "now"
      : "scheduled";

    if (prev_files.length > 0) {
      prev_files.forEach((img) => {
        prev_file_name.push(img.name);
      });
    }

    /***  it is used for update  */

    const directoryPath = _basedir + "/assets/";
    let post_id = youtubeHeaders.post_id ? youtubeHeaders.post_id : "";

    if (post_id != "") {
      let data = await userInterface.getSpecificPostData(post_id);
      if (data && data.files != "") {
        let posted_file_data = JSON.parse(data.files);

        /** delete values if previous one is deleted at frontend*/

        if (posted_file_data.length > 0) {
          posted_file_data.forEach(async (element) => {
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
    }

    /***  end it is used for update  */

    let imageData = req.files.map((item) => {
      let data = {
        name: item.filename.trim(),
        type: item.mimetype,
        size: item.size,
      };
      return data;
    });
    imageData = [...imageData, ...prev_files];
    imageData = imageData.length > 0 ? JSON.stringify(imageData) : "";

    let objData = {
      userId: userId,
      screenName: youtubeHeaders.screenName,
      text: req.body.text,
      socialPresets: socialPresets,
      files: imageData,
      platform: req.body.platform,
      scheduledDate: scheduledDate,
    };

    objData["status"] = post_send_type == "scheduled" ? "pending" : "published";
    await userInterface.storePostData(objData, post_id);

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    const credentials = {
      access_token: youtubeHeaders.accessToken,
    };

    oauth2Client.setCredentials(credentials);

    // Construct the YouTube API client
    const youtube = google.youtube({
      version: "v3",
      auth: oauth2Client,
    });

    // Define video metadata
    const videoMetadata = {
      snippet: {
        title: title,
        description: discription,
        tags: ["tag1", "tag2"],
        categoryId: "22",
      },
      status: {
        privacyStatus: visibility, // Set the privacy status of the video
      },
    };

    // Set the scheduled publish time in ISO 8601 format
    if (post_send_type === "scheduled") {
      videoMetadata.snippet.scheduledStartTime = scheduledDate.toISOString();
    }

    if (post_send_type !== "scheduled") {
      const data = await youtube.videos.insert({
        part: "snippet,status",
        media: {
          body: require("fs").createReadStream(req.files[0].path), // Use the uploaded file
        },
        requestBody: videoMetadata,
      });
      if (res.status(200)) {
        res.send("Video uploaded successfully!");
      } else {
        response.status(401).json({ data: response.data });
      }
    } else {
      const scheduledData = await youtube.videos.insert({
        part: "snippet,status",
        media: {
          body: require("fs").createReadStream(req.files[0].path), // Use the uploaded file
        },
        requestBody: videoMetadata,
        notifySubscribers: false, // Set to true if you want to notify subscribers
      });

      // Schedule the video for publishing
      await youtube.videos.update({
        part: "status",
        requestBody: {
          id: scheduledData.data.id,
          status: {
            privacyStatus: visibility, // Set the privacy status of the video
            publishAt: scheduledDate.toISOString(), // Set the scheduled publish time
          },
        },
      });

      res.status(200).json({
        message: "Video scheduled successfully",
      });
    }
  } catch (error) {
    console.error("Error uploading video:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};


module.exports = { uplodYouTubeVideo, getYouTubeAuthUrl };
