const Posts = require("../models/Posts");
const moment = require("moment");
const UserController = require("../controller/userController");
const { LinkedInSharePost } = require("./linkedin/LinkedInUtils");
const { Op } = require("sequelize");

const schedulePosts = async () => {
  const posts = await getAllPendingPosts();
  // console.log("SchedulePost>>", posts);
  // console.log(moment.utc());
  for (let post of posts) {
    try {
      const postData = {
        providers: post.platform,
        caption: post.text,
        files: post.files,
      };
      const response = await publishPosts(postData, post.userId);

      console.log("Response???", response);
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

const createPost = async (userId, data, status) => {
  console.log("PostStatus>>", status);
  const { caption, files, providers, scheduledDate } = data;
  const postData = {
    userId: userId,
    text: caption,
    files: files.map((item) => {
      return { filename: item.filename, mimetype: item.mimetype };
    }),
    platform:
      status ??
      providers.map((item) => {
        return {
          platform: item.platform,
          status: "Pending",
        };
      }),
    status: status ? "Published" : "Pending",
    scheduledDate: scheduledDate,
  };
  console.log(postData);
  try {
    const post = await Posts.create(postData, { returning: true });
    return { success: true, data: post };
  } catch (err) {
    return { success: false, data: err };
  }
};

const publishPosts = async (data, userId) => {
  const { providers, caption, files } = data;
  const result = [];

  for (item of providers) {
    try {
      const shareData = { caption: caption, files: files };
      const platform = item.platform;
      if (platform.includes("LinkedIn")) {
        const response = await LinkedInSharePost(shareData, platform, userId);
        console.log(response);
        result.push({
          status: response.success ? "Published" : "Error",
          message: response.data,
          platform: platform,
        });
      }
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

module.exports = { schedulePosts, createPost, publishPosts, getOngoingPosts };
