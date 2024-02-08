const { default: axios } = require("axios");
const UserService = require("../../services/userServices");
const userService = new UserService();

const TiktokSharePost = async (data, mediaType, userId, brandId, platform) => {
  console.log(data, mediaType, userId, brandId, platform);
  const creds = await userService.getTokenByIdPlatform(
    userId,
    platform,
    1,
    brandId
  );
  // console.log(creds);
  const { token } = creds;
  const user = await getCreatorInfo(token);
  console.log(user);
  

  try {
    const res = await postVideo(token);
    console.log('video upload??',res)
  } catch (err) {
    console.log(err)
  }
};

const getCreatorInfo = async (token) => {
  try {
    const res = await axios.post(
      "https://open.tiktokapis.com/v2/post/publish/creator_info/query/",
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json; charset=UTF-8",
        },
      }
    );
    return res.data;
  } catch (err) {
    console.log(err);
    console.log(JSON.stringify(err.response.data));

    return null;
  }
};

const postVideo = async (token) => {
  try {
    const res = await axios.post(
      "https://open.tiktokapis.com/v2/post/publish/inbox/video/init/",
      {
        post_info: {
          title: "this will be a funny #cat video on your @tiktok #fyp",
          privacy_level: "MUTUAL_FOLLOW_FRIENDS",
          disable_duet: false,
          disable_comment: false,
          disable_stitch: false,
          video_cover_timestamp_ms: 1000,
        },
        source_info: {
          source: "PULL_FROM_URL",
          video_url:
            "https://api.jjmedia.appwrk.com/assets/files-1707301683072.mp4",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json; charset=UTF-8",
        },
      }
    );
    return res.data;
  } catch (err) {
    console.log(err);
    console.log(JSON.stringify(err.response.data));

    return null;
  }
};

const postPhoto = async token => {
  try {
    const res = await axios.post(
      "https://open.tiktokapis.com/v2/post/publish/content/init/",
      {
        post_info: {
          title: "funny cat",
          description: "this will be a #funny photomode on your @tiktok #fyp",
          disable_comment: true,
          privacy_level: "PUBLIC_TO_EVERYONE",
          auto_add_music: true,
        },
        source_info: {
          source: "PULL_FROM_URL",
          photo_cover_index: 0,
          photo_images: [
            "https://api.jjmedia.appwrk.com/assets/files-1707305046291.png",
          ],
        },
        post_mode: "DIRECT_POST",
        media_type: "PHOTO",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json; charset=UTF-8",
        },
      }
    );
    return res.data;
  } catch (err) {
    console.log(err);
    console.log(JSON.stringify(err.response.data));

    return null;
  }
}

module.exports = {
  TiktokSharePost,
  getCreatorInfo,
};
