const { default: axios } = require("axios");
const SocialMediaToken = require("../models/SocialMediaToken");
const { readFileSync, createReadStream } = require("fs");
const path = require("path");
const { encryptToken } = require("../middleware/encryptToken");
const {
  LinkedInPlatform,
  LinkedInPagePlatform,
} = require("../utils/CommonString");
const { stringify } = require("querystring");
const { response } = require("express");
const fs = require("fs");
const { exec } = require("child_process");

class LinkedInServices {
  async setMediaToken(data, userId, brandId, platform, isConnected = 1) {
    try {
      const { accessToken, refreshToken, vanityName, name = "" } = data;
      let credentials = {
        accessToken,
        refreshToken,
        vanityName,
      };
      const screenName = name;
      if (platform === LinkedInPlatform) {
        credentials.owner_id = data.id ?? "";
      } else {
        credentials.organization_id = data.id ?? "";
      }
      const encryptedCreds = encryptToken(credentials);
      const objData = {
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

  async getLinkedInCreds(userId, platform, brandId) {
    const condition = {
      userId,
      platform,
      brandId,
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

  async getLinkedInPages(data, accessToken) {
    const regex = /urn:li:organization:(\d+)/;
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

  async getOwner(platform, creds) {
    return platform === LinkedInPlatform
      ? `urn:li:person:${creds.id}`
      : `urn:li:organization:${creds.organization_id}`;
  }
  async shareText(data, creds, platform) {
    const { accessToken } = creds;
    const url = process.env.LINKEDIN_SHARE_URL;
    const requestBody = {
      author: await this.getOwner(platform, creds),
      commentary: data.caption ?? "",
      visibility: "PUBLIC",
      distribution: {
        feedDistribution: "MAIN_FEED",
        targetEntities: [],
        thirdPartyDistributionChannels: [],
      },
      lifecycleState: "PUBLISHED",
      isReshareDisabledByAuthor: false,
    };

    try {
      const response = await axios.post(url, requestBody, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Restli-Protocol-Version": "2.0.0",
          "LinkedIn-Version": "202308",
        },
      });
      if (response.status === 201) {
        return { status: true, data: response.headers["x-restli-id"] };
      }
    } catch (err) {
      console.log(err.response);
      return { status: false, data: err };
    }
  }
  async shareVideo(data, creds, platform) {
    const { accessToken } = creds;
    const VIDEO_URL =
      process.env.LINKEDIN_URL + "/videos?action=finalizeUpload";
    const owner = await this.getOwner(platform, creds);
    const file = data?.files[0];
    const fileSize = file.size;
    const fileName = file?.filename;
    const chunk = fileName.split(".").slice(0, 1).join() + "-part-";
    const filePath = path.join(__dirname, `../../assets`);
    const captions = data.caption;

    var register = await this.registerVideo(owner, accessToken, fileSize);

    if (!register?.status) {
      return { status: false, data: register.data };
    }

    const { value } = register.data;
    const { video, uploadInstructions } = value;

    const uploadResponse = await this.uploadVideo(
      uploadInstructions,
      fileName,
      filePath,
      accessToken,
      chunk
    );

    if (uploadResponse.status) {
      try {
        const requestBody = {
          finalizeUploadRequest: {
            video: video,
            uploadToken: "",
            uploadedPartIds: uploadResponse.data,
          },
        };
        const response = await axios.post(VIDEO_URL, requestBody, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "LinkedIn-Version": "202401",
            "X-Restli-Protocol-Version": "2.0.0",
          },
        });
        if (response.status === 200) {
          const content = {
            media: {
              id: video,
            },
          };
          const createPostResponse = await this.createPost(
            owner,
            captions,
            content,
            accessToken
          );
          if (createPostResponse.status === 201) {
            await this.removeChunks(filePath, chunk);
          }

          return response;
        }
      } catch (err) {
        return { status: false, data: err };
      }
    } else {
      return { status: false, data: uploadResponse.data };
    }
  }

  async shareImage(data, creds, platform) {
    const accessToken = creds.accessToken;
    const owner = await this.getOwner(platform, creds);

    const media = [];
    const caption = data?.caption ?? "";
    let content;

    for (const file of data.files) {
      const register = await this.registerImage(owner, accessToken);
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
    const response = await this.createPost(
      owner,
      caption,
      content,
      accessToken
    );

    return response;
  }

  async createPost(owner, caption = "", content, accessToken) {
    try {
      const SHARE_URL = process.env.LINKEDIN_SHARE_URL;
      const requestBody = {
        author: owner,
        commentary: caption,
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
            "Content-Type": "application/json",
            "LinkedIn-Version": "202401",
          },
        });
        return {
          success: true,
          status: response.status,
          data: response.headers["x-linkedin-id"],
        };
      } catch (err) {
        return { success: false, status: err.response.status, data: err };
      }
    } catch (err) {}
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

  async registerVideo(owner, accessToken, fileSize) {
    const URL = process.env.LINKEDIN_REGISTER_VIDEO_URL;
    const requestBody = {
      initializeUploadRequest: {
        owner: owner,
        fileSizeBytes: fileSize,
        uploadCaptions: false,
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
        return { status: true, data: response.data };
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
      console.log(err);
      return {
        status: false,
        data: err,
      };
    }
  }

  async removeChunks(filePath, chunk) {
    const promise = new Promise(function (resolve, reject) {
      exec(`rm -r ${filePath}/${chunk}*`, (err, stdout, stderr) => {
        if (err) {
          reject("removeTmpDir: promise rejected");
        } else {
          // console.log(`stdout: ${stdout}`);
          // console.log(`stderr: ${stderr}`);
          return resolve();
        }
      });
    });
    return promise;
  }

  async splitVideo(fileName, chunk, filePath) {
    const promise = new Promise(function (resolve, reject) {
      exec(
        `cd ${filePath} && split -b 4194303 ./${fileName} ${chunk}`,
        (err, stdout, stderr) => {
          if (err) {
            console.error(err);
            reject("splitVideo: promise rejected");
          } else {
            // console.log(`stdout: ${stdout}`);
            // console.log(`stderr: ${stderr}`);
            return resolve();
          }
        }
      );
    });
    return promise;
  }
  async getFilesArray(filePath, chunk) {
    var filesArray = [];
    const tmpPartPath = filePath;
    const regex = `/${chunk}/g`;
    const files = fs
      .readdirSync(tmpPartPath)
      .filter((elm) => elm.startsWith(chunk));
    files.forEach((file, index) => {
      filesArray.push(tmpPartPath + "/" + file);
    });
    return filesArray;
  }

  async uploadParts(files, parts, accessToken) {
    var axiosRequests = [];
    parts.forEach((part, index) => {
      const readFile = fs.readFileSync(files[index]);
      axiosRequests.push(
        axios({
          method: "put",
          url: part.uploadUrl,
          data: readFile,
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/octet-stream",
            "LinkedIn-Version": "202401",
            "X-Restli-Protocol-Version": "2.0.0",
          },
        })
      );
    });
    return axios.all(axiosRequests).then(
      axios.spread((...responses) => {
        var axiosReponses = [];
        responses.forEach((response) => {
          if (response.status === 200) {
            axiosReponses.push(response);
          } else {
            console.log(response);
          }
        });
        return axiosReponses;
      })
    );
  }

  async getEtags(responses) {
    const etags = [];
    responses.forEach((response) => {
      etags.push(response.headers.etag);
    });
    return etags;
  }
  async uploadVideo(uploadUrls, fileName, filePath, accessToken, chunk) {
    await this.splitVideo(fileName, chunk, filePath);
    const files = await this.getFilesArray(filePath, chunk);
    const uploadResponse = await this.uploadParts(
      files,
      uploadUrls,
      accessToken
    );
    const etags = await this.getEtags(uploadResponse);

    return { status: true, data: etags };
  }

  async uploadCaption(captionsUploadUrl, captionsFilePath, accessToken) {
    const metadata = {
      format: "SRT",
      formattedForEasyReader: true,
      largeText: true,
      source: "USER_PROVIDED",
      locale: {
        variant: "AMERICAN",
        country: "US",
        language: "EN",
      },
      transcriptType: "CLOSED_CAPTION",
    };

    const formData = new FormData();
    const filePath = await fs.promises.readFile(captionsFilePath);
    const blob = new Blob([filePath], { type: "text/plain" });
    formData.append("metadata", JSON.stringify(metadata));
    formData.append("file", blob);

    try {
      const response = await axios.post(captionsUploadUrl, formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "LinkedIn-Version": "202401",
          "Content-Type": "multipart/form-data",
        },
      });
      return { success: true, data: response.data };
    } catch (err) {
      console.log("uploadCaptionsError", JSON.stringify(err.response));
      return { success: false, data: "Error uploading captions" };
    }
  }
}

module.exports = LinkedInServices;
