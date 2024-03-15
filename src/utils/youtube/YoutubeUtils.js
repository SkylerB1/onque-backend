const UserService = require("../../services/userServices");
const moment = require("moment");
const userService = new UserService();
const path = require("path");
const { google } = require("googleapis");
const fs = require("fs");
const { YouTubePlatform } = require("../CommonString");
const { encryptToken } = require("../../middleware/encryptToken");
const { updateUserCreds } = require("../userUtil");
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, YOUTUBE_CALLBACK_URL } =
  process.env;

const oAuth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  YOUTUBE_CALLBACK_URL
);

const youtube = google.youtube({
  version: "v3",
  auth: oAuth2Client,
});

const YoutubeShareVideo = async (data, platform, userId, brandId) => {
  const { files, caption, additionalPresets } = data;
  const { title, category, visibility, madeForKids } = additionalPresets;

  if (!files || files?.length === 0) {
    return { success: false, data: "No file available", status: 204 };
  }

  try {
    const creds = await userService.getTokenByIdPlatform(
      userId,
      platform,
      1,
      brandId
    );
    const { accessToken, refreshToken } = creds;

    oAuth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    oAuth2Client.on("tokens", (tokens) => {
      updateYoutubeToken(creds, tokens, userId, brandId);
    });
    const file = files[0];
    const videoPath = path.join(__dirname, `../../../assets/${file?.filename}`);

    const videoMetadata = {
      snippet: {
        title: title,
        description: caption,
        tags: [],
        categoryId: category,
      },
      status: {
        privacyStatus: visibility,
        selfDeclaredMadeForKids: madeForKids,
      },
    };

    try {
      const res = await youtube.videos.insert({
        part: ["snippet,status"],
        requestBody: videoMetadata,
        media: {
          body: fs.createReadStream(videoPath),
        },
      });
      return { success: true, data: res.data.id };
    } catch (err) {
      console.log(err);
      return { success: false, data: err.response.data };
    }
  } catch (err) {
    console.log(err);
    return { status: 400, data: err.response.data, success: false };
  }
};

const YoutubeCategories = async (userId, brandId) => {
  try {
    const creds = await userService.getTokenByIdPlatform(
      userId,
      YouTubePlatform,
      1,
      brandId
    );
    const { accessToken, refreshToken, expiry_date = 0 } = creds;
    
    oAuth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
      expiry_date: expiry_date,
    });

    oAuth2Client.on("tokens", (tokens) => {
      updateYoutubeToken(creds, tokens, userId, brandId);
    });

    const res = await youtube.videoCategories.list({
      part: ["snippet"],
      regionCode: "GB",
    });
    const filteredData = res.data.items.map((item) => {
      return { label: item.snippet.title, value: item.id };
    });
    return { success: true, data: filteredData };
  } catch (err) {
    console.log(err);
    return { success: false, data: err.response.data };
  }
};

const updateYoutubeToken = async (creds, tokens, userId, brandId) => {
  try {
    let { refreshToken } = creds;
    const { access_token, expiry_date } = tokens;

    creds.accessToken = access_token;
    creds.expiry_date = expiry_date;

    const encryptedCreds = encryptToken(creds);
    const res = await updateUserCreds(
      encryptedCreds,
      userId,
      YouTubePlatform,
      1,
      brandId
    );
    

    oAuth2Client.setCredentials({
      access_token: access_token,
      refresh_token: refreshToken,
    });
  } catch (err) {
    console.log("updateYoutubeToken", JSON.stringify(err));
  }
};

module.exports = {
  YoutubeShareVideo,
  YoutubeCategories,
};
