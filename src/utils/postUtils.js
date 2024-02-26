const Posts = require("../models/Posts");
const moment = require("moment");
const { LinkedInSharePost } = require("./linkedin/LinkedInUtils");
const { Op } = require("sequelize");
const { FacebookSharePost } = require("./facebook/FacebookUtils");
const { InstagramSharePost } = require("./instagram/InstagramUtils");
const SocialMediaToken = require("../models/SocialMediaToken");
const { TwitterSharePost } = require("./twitter/TwitterUtils");
const { YoutubeShareVideo } = require("./youtube/YoutubeUtils");
const { GBusinessSharePost } = require("./google-business/GoogleBusinessUtil");
const UserService = require("../services/userServices");
const userInterface = new UserService();
const BrandServices = require("../services/brandsSevices");
const { TiktokSharePost } = require("./tiktok/TikTokUtils");
const brandServicesInterface = new BrandServices();

const schedulePosts = async () => {
  const posts = await getAllPendingPosts();
  for (let post of posts) {
    try {
      const { userId, brandId } = post;
      const postData = {
        providers: post.platform,
        caption: post.text,
        files: post.files,
      };
      const response = await publishPosts(postData, userId, brandId);

      await Posts.update(
        {
          platform: response.data,
          status: response.success ? "Published" : "Error",
        },
        {
          where: {
            id: post.id,
          },
        }
      );
    } catch (err) {
      console.log(err);
    }
  }
};

const createPost = async (userId, brandId, data, status) => {
  const { caption, files, providers, scheduledDate } = data;
  const isPublished = status?.some((item) => item.status === "Published");
  const publishStatus = status
    ? isPublished
      ? "Published"
      : "Error"
    : "Pending";

  const postData = {
    userId: userId,
    brandId: brandId,
    text: caption,
    files: files?.map((item) => {
      return {
        filename: item.filename,
        mimetype: item.mimetype,
        size: item.size,
      };
    }),
    platform:
      status ??
      providers.map((item) => {
        return {
          platform: item.platform,
          mediaType: item.mediaType,
          additionalPresets: item.additionalPresets,
          status: "Pending",
        };
      }),
    status: publishStatus,
    scheduledDate: scheduledDate,
  };
  try {
    const post = await Posts.create(postData, { returning: true });
    return { success: true, data: post };
  } catch (err) {
    return { success: false, data: err };
  }
};

const publishPosts = async (data, userId, brandId) => {
  const { providers, caption, files } = data;
  const result = [];

  for (item of providers) {
    try {
      const shareData = {
        caption: caption,
        files: files,
        additionalPresets: item.additionalPresets,
      };
      const platform = item.platform;
      const mediaType = item.mediaType;
      if (platform.includes("LinkedIn")) {
        const response = await LinkedInSharePost(
          shareData,
          platform,
          userId,
          brandId
        );
        result.push({
          status: response.success ? "Published" : "Error",
          message: response.data,
          platform: platform,
        });
      } else if (platform.includes("Facebook")) {
        const response = await FacebookSharePost(
          shareData,
          platform,
          mediaType,
          userId,
          brandId
        );
        result.push({
          status: response.success ? "Published" : "Error",
          message: response.data,
          platform: platform,
        });
      } else if (platform.includes("Instagram")) {
        const response = await InstagramSharePost(
          shareData,
          platform,
          mediaType,
          userId,
          brandId
        );
        result.push({
          status: response.success ? "Published" : "Error",
          message: response.data,
          platform: platform,
        });
      } else if (platform.includes("Twitter")) {
        const response = await TwitterSharePost(
          shareData,
          platform,
          userId,
          brandId
        );
        result.push({
          status: response.success ? "Published" : "Error",
          message: response.data,
          platform: platform,
        });
      } else if (platform.includes("YouTube")) {
        const response = await YoutubeShareVideo(
          shareData,
          platform,
          userId,
          brandId
        );
        result.push({
          status: response.success ? "Published" : "Error",
          message: response.data,
          platform: platform,
        });
      } else if (platform.includes("Google_Business")) {
        const response = await GBusinessSharePost(
          shareData,
          mediaType,
          userId,
          brandId
        );
        result.push({
          status: response.success ? "Published" : "Error",
          message: response.data,
          platform: platform,
        });
      } else if (platform.includes("TikTok")) {
        const response = await TiktokSharePost(
          shareData,
          mediaType,
          userId,
          brandId,
          platform
        );
        result.push({
          status: response.success ? "Published" : "Error",
          message: response.data,
          platform: platform,
        });
      } else {
        return { success: false, data: "No platform configured" };
      }
      // if (platform.includes("google_business")) {
      //   const response = await googleBusinessPost(shareData, platform, userId);
      //   console.log(response);
      //   result.push({
      //     status: response.success ? "Published" : "Error",
      //     message: response.data,
      //     platform: platform,
      //   });
      // }
    } catch (err) {
      return { success: false, data: err };
    }
  }
  return { success: true, data: result };
};

const getOngoingPosts = async () => {
  try {
    const response = await Posts.findAll({
      where: {
        status: "Ongoing",
      },
    });

    return response;
  } catch (err) {
    console.log(err);
    return [];
  }
};

const getAllPendingPosts = async () => {
  const currentDate = moment.utc();
  try {
    const response = await Posts.findAll({
      where: {
        status: "Pending",
        scheduledDate: {
          [Op.lte]: currentDate,
        },
      },
    });
    for (let post of response) {
      await Posts.update(
        {
          status: "Ongoing",
        },
        {
          where: {
            id: post.id,
          },
        }
      );
    }
    return response;
  } catch (err) {
    console.log(err);
  }
};

const saveConnection = async (
  encryptedCreds,
  userId,
  brandId,
  username,
  platform,
  isConnected = 1
) => {
  try {
    const data = {
      userId: userId,
      credentials: encryptedCreds,
      screenName: username,
      platform: platform,
      isConnected: isConnected,
      brandId: brandId,
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
        success: true,
        data: await SocialMediaToken.update(data, {
          where: where,
          returning: true,
        }),
      };
    } else {
      return {
        success: true,
        data: await SocialMediaToken.create(data, { returning: true }),
      };
    }
  } catch (err) {
    return { success: false, data: err };
  }
};

module.exports = {
  schedulePosts,
  createPost,
  publishPosts,
  getOngoingPosts,
  saveConnection,
};
