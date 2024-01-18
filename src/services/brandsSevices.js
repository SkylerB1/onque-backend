const BrandsModel = require("../models/brands");
const socialTokens = require("../models/SocialMediaToken");
const UsersModel = require("../models/Users");

class BrandServices {
  /**
   *
   * @param { Object } data
   * @param { Integer } user_id
   * @returns {Promise<{success: boolean, error: *}|{success: boolean, body: *}>}
   * @comment Create the brands.
   */
  async createBrand(brand_name, user_id) {
    try {
      const brandObj = {
        user_id: user_id,
        brand_name: brand_name !== "" ? brand_name : "Empty Client"
      };
      const result = await BrandsModel.create(brandObj);
      return { success: true, body: result };
    } catch (error) {
      return { success: false, error: error };
    }
  };

  /**
   * 
   * @param { Object } params
   * @param { Integer } user_id
   * @returns {Promise<{success: boolean, error: *}|{success: boolean, body: *}>}
   * @comment Get all the user specific brand details.
   */
  async getUserSpecificBrands(params, user_id) {
    try {
      let query = {
        where: { user_id },
        attributes: { exclude: ["createdAt", "updatedAt"] },
        include: [{ model: socialTokens, as: "socialTokens", attributes: ["id", "userId", "platform", "screenName", "brandId"] }]
      };

      const result = await BrandsModel.findAndCountAll(query);
      return { success: true, body: result };
    } catch (error) {
      return { success: false, error: error };
    }
  };

  async getConnectedMedia(params, user_id, attributes) {
    return await SocialMediaToken.findAll({
      attributes: attributes,
      where: {
        userId: user_id,
        isConnected: 1,
      },
    });
  }

  /**
   * 
   * @param { Integer } id
   * @param { Integer } user_id
   * @returns {Promise<{success: boolean, error: *}|{success: boolean, body: *}>}
   * @comment Get specific brand details by id for specific user.
   */
  async getSpecificBrandById(id, user_id) {
    try {
      let query = {
        where: { id, user_id }
      };

      const result = await BrandsModel.findOne(query);
      return { success: true, body: result };
    } catch (error) {
      return { success: false, error: error };
    }
  };

  /**
   * 
   * @param { Object } data
   * @param { Integer } id
   * @returns {Promise<{success: boolean, error: *}|{success: boolean, body: *}>}
   * @comment Update the brands.
   */
  async updateBrand(data, id) {
    try {
      const brandObj = {
        brand_name: data.brand_name,
        brand_file: data.brand_file
      };

      const result = await BrandsModel.update(brandObj, { where: { id } });

      return { success: true, body: result };
    } catch (error) {
      return { success: false, error: error };
    }
  };

  /**
   * 
   * @param {Integer} id 
   * @param {Integer} user_id 
   */
  async updateActiveBrand(id, user_id) {
    try {

    } catch (error) {

    }
  }

  /**
   *
   * @param { Integer } id
   * @returns {Promise<{success: boolean, error: *}|{success: boolean, body: *}>}
   * @comment Delete the brand.
   */
  async deleteBrand(id) {
    try {
      const result = await BrandsModel.destroy({ where: { id } });

      return { success: true, body: result };
    } catch (error) {
      return { success: false, error: error };
    }
  }

  async getSelectedBrand(user_id) {
    try {
      const result = await BrandsModel.findOne({
        where: {
          user_id: user_id,
        },
      });

      return { result };
    } catch (error) {
      return { success: false, error: error };
    }
  }

  async getBrand(user_id) {
    try {
      const result = await BrandsModel.findAll({
        where: {
          user_id: user_id,
        },
      });

      const brandsData = result.map(brand => brand.dataValues);

      return { success: true, body: brandsData };
    } catch (error) {
      return { success: false, error: error };
    }
  }
};

module.exports = BrandServices;