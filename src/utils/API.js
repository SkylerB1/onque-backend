const { default: axios } = require("axios");

const PostReq = async (url, data, config) => {
  try {
    const response = await axios.post(url, data, config);
    return { status: response.status, success: true, data: response.data };
  } catch (err) {
    console.log(JSON.stringify(err.response.data));
    return {
      status: err.response.status,
      success: false,
      data: err.response.data,
    };
  }
};

module.exports = { PostReq };
