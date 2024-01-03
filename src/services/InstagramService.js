const { default: axios } = require("axios");
const { isUploadSuccessful, buildAPIURL } = require("../utils/instagram");

class InstagramService {
  async shareReel(data, userId, accessToken) {
    const caption = data.caption ?? "";
    const file = data?.files[0];
    const fileSize = file.size;
    const fileUrl = process.env.FILE_URL + file?.filename;
    // const fileUrl =
    //   "https://api.jjmedia.appwrk.com/assets/files-1702884599131.mp4";

    const uploadVideoUri = buildAPIURL(
      `${userId}/media`,
      {
        media_type: "REELS",
        video_url: fileUrl,
        caption: caption,
      },
      accessToken
    );
    try {
      const uploadResponse = await axios.post(uploadVideoUri);
      const containerId = uploadResponse.data.id;

      try {
        const publishResponse = await this.publishMedia(
          containerId,
          userId,
          accessToken
        );
        return publishResponse;
      } catch (err) {
        return { success: false, data: err.response.data };
      }
    } catch (err) {
      return { success: false, data: err.response.data };
    }
  }

  async shareStory(data, userId, accessToken) {
    const { files } = data;
    let publishMedia = [];
    for (let file of files) {
      const filename = file.filename;
      const file_url = `https://api.jjmedia.appwrk.com/assets/${filename}`;
      const mimeType = file.mimetype;
      const isImage = mimeType.includes("image");
      let media;

      if (isImage) {
        // const file_url =
        //   "https://api.jjmedia.appwrk.com/assets/files-1702553497734.jpg";
        media = {
          image_url: file_url,
        };
      } else {
        // const file_url =
        //   "https://api.jjmedia.appwrk.com/assets/files-1702629834358.mp4";
        media = {
          video_url: file_url,
        };
      }

      const postMediaUri = buildAPIURL(
        `${userId}/media`,
        {
          media_type: "STORIES",
          ...media,
        },
        accessToken
      );

      try {
        const postMediaResponse = await axios.post(postMediaUri);
        const containerId = postMediaResponse.data.id;
        const publishMediaResponse = await this.publishMedia(
          containerId,
          userId,
          accessToken
        );
        publishMedia.push({ error: false, data: postMediaResponse.data });
      } catch (err) {
        publishMedia.push({
          error: true,
          data: err.response.data,
        });
        console.log(err.response.data);
      }
    }

    return { success: true, data: publishMedia };
  }

  async sharePost(data, userId, accessToken) {
    const { files, caption } = data;
    let response;
    if (files.length === 1) {
      const filename = files[0].filename;
      const mimeType = files[0].mimetype;
      const file_url = `https://api.jjmedia.appwrk.com/assets/${filename}`;
      let media;
      if (mimeType.includes("image")) {
        // const file_url =
        //   "https://api.jjmedia.appwrk.com/assets/files-1702553497734.jpg";
        media = {
          image_url: file_url,
        };
      } else {
        // const file_url =
        //   "https://api.jjmedia.appwrk.com/assets/files-1702629834358.mp4";
        media = {
          video_url: file_url,
        };
      }

      const postMediaUri = buildAPIURL(
        `${userId}/media`,
        {
          caption: caption,
          ...media,
        },
        accessToken
      );

      try {
        const postResponse = await axios.post(postMediaUri);
        if (postResponse.status === 200) {
          const { id } = postResponse.data;

          response = await this.publishMedia(id, userId, accessToken);
        }
      } catch (err) {
        console.log(err);
      }
    } else {
      response = await this.carouselPost(files, userId, caption, accessToken);
    }

    return response;
  }

  async publishMedia(creationId, userId, accessToken) {
    const checkStatusUri = buildAPIURL(
      `${creationId}`,
      {
        fields: "status_code",
      },
      accessToken
    );

    const isUploaded = await isUploadSuccessful(0, checkStatusUri);

    if (isUploaded) {
      try {
        const publishVideoUri = buildAPIURL(
          `${userId}/media_publish`,
          {
            creation_id: creationId,
          },
          accessToken
        );

        const publishResponse = await axios.post(publishVideoUri);

        const publishedMediaId = publishResponse.data.id;

        const permaLinkUri = buildAPIURL(
          `${publishedMediaId}`,
          {
            fields: "permalink",
          },
          accessToken
        );
        const permalinkResponse = await axios.get(permaLinkUri);
        const permalink = permalinkResponse.data.permalink;

        return {
          success: true,
          status: 200,
          data: { link: permalink, id: publishedMediaId },
        };
      } catch (err) {
        return {
          success: false,
          status: err.response.status,
          data: err.response.data,
        };
      }
    } else {
      return { success: false, status: 400, data: "Reel Upload Failed" };
    }
  }

  async carouselPost(files, userId, caption, accessToken) {
    let containerId = [];
    for (let file of files) {
      let postMediaUri;
      const filename = file.filename;
      const file_url = `https://api.jjmedia.appwrk.com/assets/${filename}`;
      const mimeType = file.mimetype;
      const isImage = mimeType.includes("image");
      // let file_url;
      if (isImage) {
        // file_url =
        //   "https://api.jjmedia.appwrk.com/assets/files-1702553497734.jpg";
        postMediaUri = buildAPIURL(
          `${userId}/media`,
          {
            is_carousel_item: true,
            image_url: file_url,
          },
          accessToken
        );
      } else {
        // file_url =
        //   "https://api.jjmedia.appwrk.com/assets/files-1702629834358.mp4";
        postMediaUri = buildAPIURL(
          `${userId}/media`,
          {
            is_carousel_item: true,
            media_type: "VIDEO",
            video_url: file_url,
          },
          accessToken
        );
      }

      const response = await axios.post(postMediaUri);
      if (response.status === 200) {
        const { id } = response.data;
        containerId.push(id);
      } 
    }


    const statusChecks = containerId.map(async (id) => {
      const checkStatusUri = buildAPIURL(
        `${id}`,
        {
          fields: "status,status_code",
        },
        accessToken
      );
      return await isUploadSuccessful(0, checkStatusUri);
    });
    const statuses = await Promise.all(statusChecks);

    const allFinished = statuses.every((status) => status);

    if (allFinished) {
      try {
        const createCrouselUri = buildAPIURL(
          `${userId}/media`,
          {
            caption: caption,
            media_type: "CAROUSEL",
            children: containerId,
          },
          accessToken
        );
        const response = await axios.post(createCrouselUri);
        if (response.status === 200) {
          const { id } = response.data;
          const result = await this.publishMedia(id, userId, accessToken);
          return result;
        } else {
          return response;
        }
      } catch (err) {
        console.log(err);
        return {
          status: err.response.status,
          success: false,
          data: err.response.data,
        };
      }
    }
  }
}

module.exports = InstagramService;
