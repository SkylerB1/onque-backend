const { default: axios } = require("axios");
const SocialMediaToken = require("../models/SocialMediaToken");
const { readFileSync } = require("fs");
const path = require("path");
const { encryptToken, decryptToken } = require("../middleware/encryptToken");
const { stringify } = require("querystring");
const { response } = require("express");
const { storeCreds } = require("../utils/SocialMediaUtil");
const { InstagramPlatform } = require("../utils/CommonString");
const {
  facebookReelUpload,
  getReelUploadStatus,
} = require("../utils/facebook/FacebookUtilFunctions");
const { buildAPIURL, isReelUploadSuccessful } = require("../utils/instagram");
const Users = require("../models/Users");
const UserService = require("../services/userServices");
const userInterface = new UserService();
const BrandServices = require("../services/brandsSevices");
const brandServicesInterface = new BrandServices();

class FacebookService {
  async saveLoginFacebookDetails(creds) {
    const existingUser = await Users.findOne({
      where: {
        email: creds?.email,
      },
    });

    const nameArray = creds.name.split(" ");
    if (existingUser) {
      return existingUser;
    } else {
      const data = await userInterface.createUser({
        firstName: nameArray[0] || "",
        lastName: nameArray.slice(1).join(" ") || "",
        email: creds.email,
        password: "",
      });
      const user_id = data.id;
      const brand_name = "Empty Brand";
      await brandServicesInterface.createBrand(brand_name, user_id);
      return data;
    }
  }

  async setConnection(
    brandId,
    data,
    userId,
    platform,
    isConnected = 1,
    screenName
  ) {
    try {
      const encryptedCreds = encryptToken(data);
      const storeData = {
        userId: userId,
        brandId: brandId,
        credentials: encryptedCreds,
        screenName: screenName,
        platform: platform,
        isConnected: isConnected,
      };
      const where = {
        userId: userId,
        platform: platform,
        screenName: screenName,
      };
      return await storeCreds(storeData, where);
    } catch (err) {
      return { success: false, data: err };
    }
  }

  async connectPage(userId, page) {
    const { id, name } = page;
    const data = {
      isConnected: 1,
    };
    const condition = {
      userId: userId,
      screenName: name,
    };

    try {
      const response = await SocialMediaToken.update(data, {
        where: condition,
        returning: true,
      });

      const accounts = await SocialMediaToken.findAll({
        where: {
          userId: userId,
          platform: InstagramPlatform,
        },
      });
      if (accounts.length > 0) {
        for (let account of accounts) {
          const creds = decryptToken(account.credentials);
          const { pageId } = creds;

          if (pageId === id) {
            const updateCondition = {
              id: account.id,
            };
            const result = await this.connectInstagram(data, updateCondition);
          }
        }
      }

      return { success: true, data: response };
    } catch (err) {
      return { success: false, data: err };
    }
  }

  async connectInstagram(data, condition) {
    try {
      const response = await SocialMediaToken.update(data, {
        where: condition,
      });

      return { success: true, data: response };
    } catch (err) {
      return { success: false, data: err };
    }
  }

  async shareReel(data, pageId, accessToken) {
    const file = data?.files[0];
    const fileSize = file.size;
    const caption = data.caption ?? "";
    const initializeUri = buildAPIURL(`${pageId}/video_reels`);

    const initializeData = {
      upload_phase: "start",
      access_token: accessToken,
    };

    const response = await axios.post(initializeUri, initializeData, {
      headers: {
        "Content-Type": "application/json ",
      },
    });

    if (response.status === 200) {
      const { video_id, upload_url } = response.data;
      const filePath = path.join(__dirname, `../../assets/${file?.filename}`);
      const data = readFileSync(filePath);

      const reelUploadResponse = await axios.post(upload_url, data, {
        headers: {
          Authorization: `OAuth ${accessToken}`,
          "Content-Type": "application/octet-stream",
          offset: 0,
          file_size: fileSize,
        },
      });
      if (reelUploadResponse.status === 200) {
        const publishReelUri = buildAPIURL(`${pageId}/video_reels`, {
          access_token: accessToken,
          video_id: video_id,
          upload_phase: "finish",
          video_state: "PUBLISHED",
          description: caption,
        });

        try {
          const finalResponse = await axios.post(publishReelUri);
          if (finalResponse.status === 200) {
            const checkStatusUri = buildAPIURL(
              `${video_id}`,
              {
                fields: "status",
              },
              accessToken
            );

            const reelStatusResponse = await isReelUploadSuccessful(
              0,
              checkStatusUri
            );

            return reelStatusResponse;
          }
        } catch (err) {
          return {
            success: false,
            data: err.response.data,
          };
        }
      } else {
        return { success: false, data: reelUploadResponse.data };
      }
    } else {
      return { success: false, data: response.data };
    }
  }

  async shareVideo(data, pageId, accessToken) {
    const file = data?.files[0];
    const caption = data?.caption ?? "";
    const file_url = process.env.FILE_URL + file?.filename;
    // const file_url =
    //   "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
    // const file_url =
    //   "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";
    const videoUploadUri = buildAPIURL(`${pageId}/videos`);

    try {
      const formdata = new FormData();
      formdata.append("access_token", accessToken);
      formdata.append("file_url", file_url);
      formdata.append("title", caption);
      const response = await axios.post(videoUploadUri, formdata, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return { status: true, data: response.data };
    } catch (err) {
      console.log(JSON.stringify(err.response.data));
      return { status: false, data: err.response.data };
    }
  }

  async sharePost(data, pageId, accessToken, isPhoto) {
    const sharePhotoUri = buildAPIURL(`${pageId}/photos`, {
      access_token: accessToken,
    });
    const feedUri = buildAPIURL(`${pageId}/feed`, {
      access_token: accessToken,
    });

    const SHARE_DATA = {
      message: data.caption ?? "",
    };

    if (isPhoto && data.files?.length > 0) {
      const files = data?.files;
      if (files.length > 1) {
        let attached_media = [];
        for (let file of files) {
          const unPublishedData = {
            published: false,
            // url: process.env.FILE_URL + file.filename,
            url: "https://fastly.picsum.photos/id/237/200/300.jpg?hmac=TmmQSbShHz9CdQm0NkEjx1Dyh_Y984R9LpNrpvH2D_U",
          };
          const response = await this.upload(sharePhotoUri, unPublishedData);
          if (response.status === 200) {
            attached_media.push({
              media_fbid: response.data.id,
            });
          }
        }

        if (attached_media.length > 0) {
          const publishData = {
            message: data.caption,
            attached_media: attached_media,
            access_token: accessToken,
          };
          const response = await this.upload(feedUri, publishData);
          if (response.status === 200) {
            return { success: true, data: response.data };
          } else {
            return { success: false, data: response.data };
          }
        }
      } else if (files.length === 1) {
        // const file_url = process.env.FILE_URL + files[0]?.filename;
        const file_url =
          "https://fastly.picsum.photos/id/237/200/300.jpg?hmac=TmmQSbShHz9CdQm0NkEjx1Dyh_Y984R9LpNrpvH2D_U";
        SHARE_DATA.url = file_url;

        return await this.upload(sharePhotoUri, SHARE_DATA);
      } else {
        return { success: false, data: "No Media File" };
      }
    } else {
      const response = await this.upload(feedUri, SHARE_DATA);

      if (response.status === 200) {
        return { success: true, data: response.data };
      } else {
        return { success: false, data: response.data };
      }
    }
  }

  async upload(url, data) {
    try {
      const response = await axios.post(url, data);
      return { status: response.status, success: true, data: response.data };
    } catch (err) {
      console.log(JSON.stringify(err.response.data));
      return {
        status: err.response.status,
        success: false,
        data: err.response.data,
      };
    }
  }

  async getInstagramAccount(pageId, accessToken) {
    try {
      const ACCOUNT_URL =
        process.env.FACEBOOK_URL +
        `/${pageId}?fields=instagram_business_account&access_token=${accessToken}`;

      const account = await axios.get(ACCOUNT_URL);
      const isInstaAccount = account.data.instagram_business_account ?? null;

      if (account.status === 200 && isInstaAccount) {
        const PROFILE_URL =
          process.env.FACEBOOK_URL +
          `/${isInstaAccount.id}?fields=id,username,profile_picture_url&access_token=${accessToken}`;

        const profile = await axios.get(PROFILE_URL);

        if (profile.status === 200) {
          return { success: true, data: profile.data };
        } else {
          return { success: false, data: profile.data };
        }
      } else {
        return { success: false, data: isInstaAccount };
      }
    } catch (err) {
      console.log(err);
      return { success: true, data: err.response.data };
    }
  }

  async collectAllPages(url, data = { data: [], paging: {} }) {
    try {
      const res = await axios.get(url);
      const next = res.data?.paging?.next ?? null;
      const nextResponse = {
        data: [...data.data, ...res.data.data],
        paging: { ...res.data.paging },
      };
      if (next) {
        return this.collectAllPages(next, nextResponse);
      }
      return nextResponse;
    } catch (err) {
      console.log("err?", err);
      return [];
    }
  }

  async getFacebookPages(userId, access_token) {
    const PAGES_URL = `https://graph.facebook.com/v18.0/${userId}/accounts?access_token=${access_token}`;
    const pages = [];
    try {
      const response = await this.collectAllPages(PAGES_URL);
      const { data } = response;

      for (let page of data) {
        const PAGE_DATA_URL = `https://graph.facebook.com/${page.id}?fields=picture&access_token=${page.access_token}`;
        const response = await axios.get(PAGE_DATA_URL);
        const profile = response.data.picture.data.url;
        pages.push({ ...page, profile });
      }

      return {
        success: true,
        data: pages,
        status: 200,
      };
    } catch (err) {
      return {
        success: false,
        data: err.response.data,
        status: err.response.status,
      };
    }
  }

  async refreshAccessToken(refreshToken) {
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
    try {
      const response = await axios.post(
        "https://www.linkedin.com/oauth/v2/accessToken",
        stringify({
          grant_type: "refresh_token",
          refresh_token: refreshToken,
          client_id: clientId,
          client_secret: clientSecret,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
      return { success: true, data: response.data };
    } catch (err) {
      return {
        success: false,
        data: err.response.data,
        status: err.response.status,
      };
    }
  }

  async getProfile(accessToken) {
    try {
      const response = await axios.get("https://api.linkedin.com/v2/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, data: err };
    }
  }
}

module.exports = FacebookService;
