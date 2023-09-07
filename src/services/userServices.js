const db = require("../models/index");
const Users = require("../models/Users");
const SocialMediaToken = require("../models/SocialMediaToken");
const PostData = require("../models/PostData");
const MediaFile = require("../models/mediaFile");
const { Op } = require("sequelize");

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
    return Users.create(data);
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

  async logInUser() {
    // backend query
  }

  async setMediaToken(data) {
    if (data.screenName != "") {
      const where = { screenName: data.screenName };
      const objData = {
        accessToken: data.accessToken,
        accessSecret: data.accessSecret,
      };
      const updateSocialToke = await SocialMediaToken.findOne({ where: where });
      if (updateSocialToke) {
        return SocialMediaToken.update(objData, { where: where });
      } else {
        return SocialMediaToken.create(data);
      }
    } else {
      // post_id = data.id;
    }
  }

  async storePostData(data, post_id) {
    // backend query
    /****  if post id exist then update or create */
    let createRequired = 1;

    if (post_id != "") {
      let where = { id: post_id };
      let getPostData = await PostData.findOne({ where: where });
      if (getPostData) {
        createRequired = 0;
        return PostData.update(data, { where: where });
      }
    } else {
      // post_id = data.id;
    }

    if (createRequired) {
      return PostData.create(data);
    }
  }

  async getPostData() {
    let deleted = "0";
    if (deleted) {
      let where = { deleted: deleted };
      return PostData.findAll({ where: where });
    }
  }

  async uploadMediaFile(data) {
    return MediaFile.create(data);
  }

  async getSpecificPostData(id) {
    let where = { id };
    return await PostData.findOne({ where: where });
  }

  async updateSpecificPostData(id) {
    const data = {
      deleted: "1",
      deletedOn: new Date(),
    };
    return PostData.update(data, {
      where: {
        id: id,
      },
    });
  }

  async scheduleData() {
    const currentDate = new Date(); // Get the current date and time
    const status = "pending";
    const deleted = "0";

    const result = await PostData.findAll({
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
}

module.exports = UserService;
