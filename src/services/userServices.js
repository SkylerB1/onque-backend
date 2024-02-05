const db = require("../models/index");
const Users = require("../models/Users");
const SocialMediaToken = require("../models/SocialMediaToken");
const Posts = require("../models/Posts");
const MediaFile = require("../models/mediaFile");
const { Op } = require("sequelize");
const { decryptToken } = require("../middleware/encryptToken");
const BrandsModel = require("../models/brands");

class UserService {
  /**
   *
   * @param {String} email
   * @returns
   * @comment Check the emaile present in the Db or not
   */
  async checkEmail(email) {
    return Users.findOne({
      where: {
        email: email,
      },
    });
  }

  /**
   *
   * @param {Object} data
   * @returns JSON Response and JSON Error
   * @comment Create the user
   */
  async createUser(data) {
    const userData = await Users.create(data);
    return userData;
  }

  /**
   *
   * @param {Object} data
   * @returns JSON Response and JSON Error
   * @comment For the reset Password
   */
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

  async userData(userId) {
    return Users.findOne({
      where: {
        id: userId,
      },
    });
  }

  /**
   *
   * @param {Integer} userId
   * @param {Integer} brandId
   * @param {Object} attributes
   * @returns JSON Response and JSON Error
   * @comment For geeting the Connected Social media
   */
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

  /**
   *
   * @param {Object} data
   */
  async updateUserId(data) {
    // backend query
    const userId = data.userId;
  }

  /**
   *
   * @param {Object} data
   * @returns JSON Response and JSON Error
   * @comment for Getting the Social media token
   */
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

  /**
   *
   * @param {Object} data
   * @returns JSON Response and JSON Error
   * @comment For getting the User id
   */
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

  async getPostData(userId, brandId) {
    const deleted = "0";
    if (deleted) {
      let where = { deleted: deleted, userId: userId, brandId: brandId };
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
    return await SocialMediaToken.destroy({ where: where });
  }

  async deleteClient(id) {
    let where = { id };
    return await BrandsModel.destroy({ where: where });
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

  /**
   *
   * @param {Integer} userId
   * @param {Integer} brandId
   * @param {*} platform
   * @returns
   */
  async getTokenByIdPlatform(userId, platform, isConnected = 1, brandId) {
    const userPlatform = await SocialMediaToken.findOne({
      where: {
        userId: userId,
        brandId: brandId,
        platform: platform,
        isConnected: isConnected,
      },
    });
    if (userPlatform?.credentials) {
      return decryptToken(userPlatform.credentials);
    } else {
      return null;
    }
  }

  async findUserByName(name) {
    return await Users.findOne({
      where: {
        firstName: name
      }
    });
  }
}

module.exports = UserService;
