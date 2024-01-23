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

const YoutubeShareVideo = async (data, platform, userId) => {
  const { files, caption, additionalPresets } = data;
  const { title, category, visibility, madeForKids } = additionalPresets;

  if (!files || files?.length === 0) {
    return { success: false, data: "No file available", status: 204 };
  }

  try {
    const creds = await userService.getTokenByIdPlatform(userId, platform);
    const { accessToken, refreshToken } = creds;

    oAuth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    await CheckYoutubeToken(creds, userId);

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
        madeForKids: madeForKids,
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
      console.log(res);
      return { success: true, data: res.data.id };
    } catch (err) {
      console.log(err);
      console.log(JSON.stringify(err.response.data));
      return { success: false, data: err.response.data };
    }
  } catch (err) {
    return { status: 400, data: err.response.data, success: false };
  }
};

const YoutubeCategories = async (userId) => {
  try {
    const creds = await userService.getTokenByIdPlatform(
      userId,
      YouTubePlatform
    );
    const { accessToken, refreshToken } = creds;
    oAuth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    await CheckYoutubeToken(creds, userId);
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

const CheckYoutubeToken = async (creds, userId) => {
  let { accessToken, refreshToken, ...rest } = creds;
  try {
    await oAuth2Client.getTokenInfo(accessToken);
  } catch (err) {
    console.log(err.response.data);
    if (err.response.data.error === "invalid_token") {
      const data = await oAuth2Client.refreshAccessToken();
      console.log(data);
      const { access_token, refresh_token } = data.credentials;
      accessToken = access_token;
      refreshToken = refresh_token;
      const encryptedCreds = encryptToken({
        accessToken,
        refreshToken,
        ...rest,
      });
      const res = await updateUserCreds(
        encryptedCreds,
        userId,
        YouTubePlatform
      );
      console.log("Creds Update?", res);

      oAuth2Client.setCredentials({
        access_token: access_token,
        refresh_token: refresh_token,
      });
    }
  }
};

module.exports = {
  YoutubeShareVideo,
  YoutubeCategories,
  CheckYoutubeToken,
};
