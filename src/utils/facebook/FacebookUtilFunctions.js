const { default: axios } = require("axios");

const facebookReelUpload = async (REEL_UPLOAD_URL, accessToken, fileUrl) => {
  try {
    const response = await axios.post(REEL_UPLOAD_URL, null, {
      headers: {
        Authorization: `OAuth ${accessToken}`,
        file_url: fileUrl,
      },
    });
    return { status: response.status, data: response.data };
  } catch (err) {
    console.log("UploadREEL Error", err.response);
    return {
      status: err.response.status,
      data: err.response.data,
    };
  }
};

const getReelUploadStatus = async (videoId, accessToken) => {
  try {
    const URL = `https://graph.facebook.com/v18.0/${videoId}?fields=status&access_token=${accessToken}`;
    const response = await axios.get(URL);
    return { status: response.status, data: response.data };
  } catch (err) {
    return { status: err.response.status, data: err.response.data };
  }
};

module.exports = {
  facebookReelUpload,
  getReelUploadStatus,
};
