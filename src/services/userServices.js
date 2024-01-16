const db = require("../models/index");
const Users = require("../models/Users");
const SocialMediaToken = require("../models/SocialMediaToken");
const Posts = require("../models/Posts");
const MediaFile = require("../models/mediaFile");
const { Op } = require("sequelize");
const { decryptToken } = require("../middleware/encryptToken");

class UserService {
  async checkEmail(email) {
    // backend query
    return Users.findOne({
      where: {
        email: email,
      },
    });
  }

  async createUser(data) {
    // backend query
    const userData = await Users.create(data);
    return userData;
  }

  async updatePassword(data) {
    const objData = {
      password: data.password,
    };
    const updatePassword = await Users.findOne({
      where: { email: data.email },
    });
    if (updatePassword) {
      const result = await Users.update(objData, {
        where: {
          email: data.email,
        },
      });
      return {
        success: true,
        body: result,
        message: "Password reset succesfully",
      };
    } else {
      return { success: false, error: "Email doesn't exist" };
    }
  }

  async getUserConnections(userId, brandId, attributes) {
    return await SocialMediaToken.findAll({
      attributes: attributes,
      where: {
        userId: userId,
        brandId: brandId,
        isConnected: 1,
      },
    });
  }

  async updateUserId(data) {
    // backend query
    const userId = data.userId;
  }

  async setMediaToken(data) {
    if (data.screenName != "") {
      const where = { screenName: data.screenName };
      const updateSocialToke = await SocialMediaToken.findOne({ where: where });
      if (updateSocialToke) {
        return SocialMediaToken.create(data);
      }
    } else {
      // post_id = data.id;
    }
  }

  async getUserId(data) {
    const accessSecret = data.accessSecret;
    if (accessSecret) {
      let where = { accessSecret: accessSecret };
      const data = await SocialMediaToken.findAll({ where: where });
      return data;
    }
  }

  async storePostData(data) {
    try {
      if (data.post_id) {
        try {
          const where = { id: data.post_id };
          const post = await Posts.findOne({ where: where });
          const response = await Posts.update(data, { where: where });
          return { status: true, data: response };
        } catch (err) {
          return { status: false, data: err };
        }
      } else {
        try {
          const response = await Posts.create(data);
          return { status: true, data: response };
        } catch (err) {
          return { status: false, data: err };
        }
      }
    } catch (err) {
      return { status: false, data: err };
    }
  }

  async getPostData(userId) {
    const deleted = "0";
    if (deleted) {
      let where = { deleted: deleted, userId: userId };
      return Posts.findAll({ where: where });
    }
  }

  async uploadMediaFile(data) {
    return MediaFile.create(data);
  }

  async getSpecificPostData(id) {
    let where = { id };
    return await Posts.findOne({ where: where });
  }

  async updateSpecificPostData(id) {
    const data = {
      deleted: "1",
      deletedOn: new Date(),
    };
    return Posts.update(data, {
      where: {
        id: id,
      },
    });
  }

  async logout(id) {
    let where = { id };
    return await SocialMediaToken.destroy({ where: where })
  }

  async scheduleData() {
    const currentDate = new Date(); // Get the current date and time
    const status = "pending";
    const deleted = "0";

    const result = await Posts.findAll({
      where: {
        scheduledDate: {
          [Op.lte]: currentDate, // Use less than or equal operator
        },
        status: status,
        deleted: deleted,
      },
    });

    return result;
  }

  async getAccessToken(screenName) {
    let where = { screenName: screenName };
    return await SocialMediaToken.findOne({ where: where });
  }

  async getTokenByIdPlatform(userId, platform) {
    const userPlatform = await SocialMediaToken.findOne({
      where: {
        userId: userId,
        platform: platform,
        isConnected: 1,
      },
    });
    return decryptToken(userPlatform.credentials);
  }
}

module.exports = UserService;
