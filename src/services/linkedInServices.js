const { default: axios } = require("axios");
const SocialMediaToken = require("../models/SocialMediaToken");
const { readFileSync } = require("fs");
const path = require("path");
const { encryptToken, decryptToken } = require("../middleware/encryptToken");
const {
  LinkedInPlatform,
  LinkedInPagePlatform,
} = require("../utils/CommonString");
const { stringify } = require("querystring");
const { response } = require("express");

class LinkedInServices {
  async setMediaToken(data, userId, platform) {
    try {
      let credentials;
      let screenName;
      if (platform === LinkedInPlatform) {
        screenName = data.name;
        credentials = {
          owner_id: data.id ?? "",
          access_token: data?.access_token ?? "",
          expires_in: data.expires_in ?? "",
          refresh_token: data?.refresh_token ?? "",
          refresh_token_expires_in: data.refresh_token_expires_in ?? "",
          vanity_name: data.vanityName ?? "",
        };
      } else {
        screenName = data.name ?? "";
        credentials = {
          localized_name: data.name ?? "",
          organization_id: data.id ?? "",
          access_token: data?.access_token ?? "",
          expires_in: data.expires_in ?? "",
          refresh_token: data?.refresh_token ?? "",
          refresh_token_expires_in: data.refresh_token_expires_in ?? "",
          vanity_name: data.vanityName ?? "",
        };
      }
      const encryptedCreds = encryptToken(credentials);
      const objData = {
        userId: userId,
        credentials: encryptedCreds,
        screenName: screenName,
        platform: platform,
      };
      const where = {
        userId: userId,
        platform: platform,
      };
      const IsToken = await SocialMediaToken.findOne({
        where: where,
      });

      if (IsToken) {
        return {
          status: true,
          data: await SocialMediaToken.update(objData, {
            where: where,
            returning: true,
          }),
        };
      } else {
        return {
          status: true,
          data: await SocialMediaToken.create(objData, { returning: true }),
        };
      }
    } catch (err) {
      return { status: false, data: err };
    }
  }

  async getLinkedInToken(userId) {
    const condition = {
      userId: userId,
      platform: LinkedInPlatform,
    };

    const data = await SocialMediaToken.findOne({
      where: condition,
    });

    return data;
  }

  async getLinkedInCreds(userId, platform) {
    const condition = {
      userId: userId,
      platform: platform,
    };
    const data = await SocialMediaToken.findOne({
      where: condition,
    });

    return data;
  }
  async getLinkedInPageToken(userId) {
    const condition = {
      userId: userId,
      platform: LinkedInPagePlatform,
    };

    const data = await SocialMediaToken.findOne({
      where: condition,
    });

    return data;
  }

  async getLinkedInPages(data, access_token) {
    const regex = /urn:li:organization:(\d+)/;
    const accessToken = access_token;
    const pages = [];
    try {
      for (const item of data) {
        const org = item.organization;
        const match = org.match(regex);
        const organizationId = match[1];

        const response = await axios.get(
          `https://api.linkedin.com/rest/organizations/${organizationId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "LinkedIn-Version": "202308",
              "X-Restli-Protocol-Version": "2.0.0",
            },
          }
        );
        pages.push(response.data);
      }

      return { success: true, data: pages, status: 200 };
    } catch (err) {
      console.log(err);
      return {
        success: false,
        data: err.response.data,
        status: err.response.status,
      };
    }
  }

  async getLinkedInPageIds(accessToken) {
    try {
      const response = await axios.get(
        "https://api.linkedin.com/v2/organizationAcls?q=roleAssignee",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "LinkedIn-Version": "202308",
            "X-Restli-Protocol-Version": "2.0.0",
          },
        }
      );
      return { success: true, data: response.data, status: 200 };
    } catch (err) {
      return {
        success: false,
        data: err.response.data,
        status: err.response.status,
      };
    }
  }

  async getAccessToken(code) {
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
    const redirectUri = process.env.LINKEDIN_REDIRECT_URI;
    try {
      const accessTokenResponse = await axios.post(
        "https://www.linkedin.com/oauth/v2/accessToken",
        stringify({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
      return { success: true, data: accessTokenResponse.data };
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
  async shareText(data, token) {
    const url = process.env.LINKEDIN_SHARE_URL;
    const requestBody = {
      author: "urn:li:person:tcOHKMvv_5",
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: {
            text: data.caption ?? "",
          },
          shareMediaCategory: "NONE",
        },
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
      },
    };

    try {
      const response = await axios.post(url, requestBody, {
        headers: {
          Authorization: `Bearer ${token?.accessToken}`,
          "X-Restli-Protocol-Version": "2.0.0",
        },
      });
      if (response.status === 201) {
        return { status: true, data: response.data };
      }
    } catch (err) {
      return { status: false, data: err };
    }
  }
  async shareVideo(data, creds) {
    const accessToken = creds.accessToken;
    const VIDEO_URL =
      process.env.LINKEDIN_URL + "/videos?action=finalizeUpload";
    const owner = `urn:li:person:${creds.owner_id}`;
    const file = data?.files[0];
    const fileSize = file.size;
    const isCaption = data.caption !== "" ? true : false;

    var register = await this.registerVideo(
      owner,
      accessToken,
      fileSize,
      isCaption
    );

    if (!register?.status) {
      return { status: false, data: register.data };
    }

    const uploadUrl = register.value.uploadInstructions[0].uploadUrl;
    const videoId = register.value.video;

    const video = readFileSync(
      path.join(__dirname, `../../assets/${file?.filename}`)
    );

    const uploadResponse = await this.uploadVideo(
      uploadUrl,
      video,
      accessToken
    );

    if (uploadResponse.status) {
      try {
        const requestBody = {
          finalizeUploadRequest: {
            video: videoId,
            uploadToken: "",
            uploadedPartIds: [uploadResponse.data],
          },
        };
        const response = await axios.post(VIDEO_URL, requestBody, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "LinkedIn-Version": "202308",
            "X-Restli-Protocol-Version": "2.0.0",
          },
        });
        console.log(response);
        return { status: true, data: response.data };
      } catch (err) {
        console.log(err);
        return { status: false, data: err };
      }
    } else {
      return { status: false, data: uploadResponse.data };
    }
  }

  async shareImage(data, creds, platform) {
    const SHARE_URL = process.env.LINKEDIN_SHARE_URL;
    const accessToken = creds.access_token;
    const owner =
      platform === LinkedInPlatform
        ? `urn:li:person:${creds.owner_id}`
        : `urn:li:organization:${creds.organization_id}`;

    const media = [];
    let content;

    for (const file of data.files) {
      const register = await this.registerImage(owner, accessToken);
      console.log(register);
      if (!register?.status) {
        return { status: false, data: register.data };
      }
      const { uploadUrl, image } = register?.data.value;

      const data = readFileSync(
        path.join(__dirname, `../../assets/${file?.filename}`)
      );
      const response = await this.uploadImage(
        uploadUrl,
        data,
        file.mimetype,
        accessToken
      );
      if (response.status) {
        media.push({
          altText: "Alt",
          id: image,
        });
      }
    }
    if (media.length > 1) {
      content = {
        multiImage: {
          images: media,
        },
      };
    } else {
      content = {
        media: media[0],
      };
    }
    const requestBody = {
      author: owner,
      commentary: data?.caption,
      visibility: "PUBLIC",
      distribution: {
        feedDistribution: "MAIN_FEED",
        targetEntities: [],
        thirdPartyDistributionChannels: [],
      },
      content: content,
      lifecycleState: "PUBLISHED",
      isReshareDisabledByAuthor: false,
    };

    try {
      const response = await axios.post(SHARE_URL, requestBody, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "LinkedIn-Version": "202308",
        },
      });
      return { status: true, data: response.headers["x-linkedin-id"] };
    } catch (err) {
      return { status: false, data: err };
    }
  }

  async registerImage(owner, accessToken) {
    const URL = process.env.LINKEDIN_REGISTER_IMAGE_URL;
    const requestBody = {
      initializeUploadRequest: {
        owner: owner,
      },
    };

    try {
      const response = await axios.post(URL, requestBody, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "LinkedIn-Version": "202308",
          "X-Restli-Protocol-Version": "2.0.0",
        },
      });
      if (response.status === 200) {
        return { status: true, data: response.data };
      }
    } catch (err) {
      console.log(err);
      return { status: false, data: err };
    }
  }

  async registerVideo(owner, accessToken, fileSize, isCaption) {
    const URL = process.env.LINKEDIN_REGISTER_VIDEO_URL;
    const requestBody = {
      initializeUploadRequest: {
        owner: owner,
        fileSizeBytes: fileSize,
        uploadCaptions: isCaption,
        uploadThumbnail: false,
      },
    };

    try {
      const response = await axios.post(URL, requestBody, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "LinkedIn-Version": "202308",
          "X-Restli-Protocol-Version": "2.0.0",
        },
      });
      if (response.status === 200) {
        return response.data;
      }
    } catch (err) {
      return { status: false, data: err };
    }
  }

  async uploadImage(uploadUrl, file, mimetype, accessToken) {
    try {
      const response = await axios.post(uploadUrl, file, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "LinkedIn-Version": "202308",
          "Content-Type": mimetype,
        },
      });
      return { status: true, data: response };
    } catch (err) {
      console.log(err)
      return {
        status: false,
        data: err,
      };
    }
  }
  async uploadVideo(uploadUrl, video, accessToken) {
    try {
      const response = await axios.post(uploadUrl, video, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "LinkedIn-Version": "202308",
          "Content-Type": "application/octet-stream",
        },
      });
      return { status: true, data: response.headers.etag };
    } catch (err) {
      return {
        status: false,
        data: err,
      };
    }
  }
}

module.exports = LinkedInServices;
