const { default: axios } = require("axios");
const UserService = require("../../services/userServices");
const { getUserCreds, updateUserCreds } = require("../userUtil");
const { encryptToken } = require("../../middleware/encryptToken");
const userService = new UserService();

const { TIKTOK_CLIENT_ID, TIKTOK_CLIENT_SECRET, FILE_URL } = process.env;

const TiktokSharePost = async (data, mediaType, userId, brandId, platform) => {
  const curr_time = new Date().getTime();
  const creds = await userService.getTokenByIdPlatform(
    userId,
    platform,
    1,
    brandId
  );
  const { token, access_token_expiration_time, refresh_token } = creds;
  if (curr_time >= access_token_expiration_time) {
    const response = await refreshToken(refresh_token);
    const newCreds = response.data;
    await updateTiktokCreds(creds, newCreds, userId, brandId, platform);
    token = newCreds.access_token;
  }
  const { files } = data;
  const media = [];

  files.forEach((file) => {
    media.push(`${FILE_URL}files-1707301683072.mp4`);
  });

  let res;
  if (mediaType === "PHOTO") {
    res = await postPhoto(token, data, media);
    return res;
  } else if (mediaType === "VIDEO") {
    if (media.length > 1) {
      return { success: false, data: "Max video supported is 1" };
    } else {
      res = await postVideo(token, data, media);
      return res;
    }
  } else {
    return { success: false, data: "Invalid Media Type" };
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
    console.log(JSON.stringify(err.response.data));
    return null;
  }
};

const postVideo = async (token, data, media) => {
  try {
    const { caption, additionalPresets } = data;
    const {
      commentDisabled,
      duetDisabled,
      stitchDisabled,
      privacyLevel,
      commercialContentThirdParty,
      commercialContentOwnBrand,
    } = additionalPresets;

    const res = await axios.post(
      "https://open.tiktokapis.com/v2/post/publish/video/init/",
      {
        post_info: {
          title: caption,
          privacy_level: privacyLevel,
          disable_duet: duetDisabled,
          disable_comment: commentDisabled,
          disable_stitch: stitchDisabled,
          brand_content_toggle: commercialContentThirdParty,
          brand_organic_toggle: commercialContentOwnBrand,
          video_cover_timestamp_ms: 1000,
        },
        source_info: {
          source: "PULL_FROM_URL",
          video_url: media[0],
          // "https://api.jjmedia.appwrk.com/assets/files-1707301683072.mp4",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json; charset=UTF-8",
        },
      }
    );
    return { success: true, data: res.data };
  } catch (err) {
    console.log(JSON.stringify(err.response.data));
    return { success: false, data: err.response.data };
  }
};

const postPhoto = async (token, data, media) => {
  try {
    const { caption, additionalPresets } = data;
    const {
      commentDisabled,
      privacyLevel,
      commercialContentThirdParty,
      commercialContentOwnBrand,
    } = additionalPresets;

    const res = await axios.post(
      "https://open.tiktokapis.com/v2/post/publish/content/init/",
      {
        post_info: {
          title: "",
          description: caption,
          disable_comment: commentDisabled,
          privacy_level: privacyLevel,
          auto_add_music: true,
          brand_content_toggle: commercialContentThirdParty,
          brand_organic_toggle: commercialContentOwnBrand,
        },
        source_info: {
          source: "PULL_FROM_URL",
          photo_cover_index: 0,
          photo_images: media,
          // "https://api.jjmedia.appwrk.com/assets/files-1707305046291.png",
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
    return { success: true, data: res.data };
  } catch (err) {
    console.log(JSON.stringify(err.response.data));
    return { success: false, data: err.response.data };
  }
};

const verifyTiktokToken = async (req, res, next) => {
  const { id } = req.user;
  const { brandId, platform } = req.query;
  let creds = await getUserCreds(id, brandId, platform);
  const { access_token_expiration_time, refresh_token } = creds;
  const curr_time = new Date().getTime();

  if (curr_time >= access_token_expiration_time) {
    const response = await refreshToken(refresh_token);
    if (response.success) {
      const newCreds = response.data;
      await updateTiktokCreds(creds, newCreds, id, brandId, platform);
    } else {
      return res.status(400).JSON({ msg: "Failed to refresh token" });
    }
  }
  next();
};

const updateTiktokCreds = async (
  creds,
  NewCreds,
  userId,
  brandId,
  platform
) => {
  try {
    const { access_token, expires_in, refresh_token, refresh_expires_in } =
      NewCreds;
    creds.token = access_token;
    creds.tokenSecret = refresh_token;
    creds.access_token = access_token;
    creds.refresh_token = refresh_token;
    creds.expires_in = expires_in;
    creds.refresh_expires_in = refresh_expires_in;
    creds.access_token_expiration_time =
      new Date().getTime() + expires_in * 1000;
    creds.refresh_token_expiration_time =
      new Date().getTime() + refresh_expires_in * 1000;
    const encryptedCreds = encryptToken(creds);

    await updateUserCreds(
      encryptedCreds,
      userId,
      platform,
      1,
      brandId
    );
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};

const refreshToken = async (refreshToken) => {
  try {
    const res = await axios.post(
      "https://open.tiktokapis.com/v2/oauth/token/",
      {
        client_key: TIKTOK_CLIENT_ID,
        client_secret: TIKTOK_CLIENT_SECRET,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Cache-Control": "no-cache",
        },
      }
    );
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, data: err.response.data };
  }
};

module.exports = {
  TiktokSharePost,
  getCreatorInfo,
  verifyTiktokToken,
};
