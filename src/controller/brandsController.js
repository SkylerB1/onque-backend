const { SuccessResponse, SuccessGetResponse, ErrorResponse, UpdateResponse, DeletedResponse } = require("../utils/apiResponse");
const BrandServices = require("../services/brandsSevices");
const brandServicesInterface = new BrandServices();
const methods = {};

/**
 *
 * @method POST
 * @param { Request } req
 * @param { Response } res
 * @returns Json response or Error response
 * @comment Create the brands.
 */
methods.createBrand = async (req, res) => {
  try {
    const user_id = req?.user?.id;
    const brand_name = req?.body?.data?.brand_name
    const result = await brandServicesInterface.createBrand(brand_name, user_id);

    if (result.success) {
      const response = {
        brand: result.body
      };
      return SuccessResponse(res, response);
    } else {
      res.json({
        success: result.success,
        error: result.error
      });
    }
  } catch (error) {
    return ErrorResponse(res, error);
  }
};

/**
 *
 * @method GET
 * @param { Request } req
 * @param { Response } res
 * @returns Json response or Error response
 * @comment Get all the user specific brand details.
 */
methods.getUserSpecificBrands = async (req, res) => {
  try {
    const user_id = req?.user?.id;
    const result = await brandServicesInterface.getUserSpecificBrands(req?.query, user_id);
    // const attributes = ["id", "userId", "platform", "screenName", "brandId"];
    // const data = await brandServicesInterface.getConnectedMedia(req?.query, user_id, attributes);
    // console.log(result)

    if (result.success) {
      const response = result.body;
      return SuccessGetResponse(res, response);
    } else {
      res.json({
        success: result.success,
        error: result.error
      });
    }
  } catch (error) {
    return ErrorResponse(res, error);
  }
};

/**
 *
 * @method GET
 * @param { Request } req
 * @param { Response } res
 * @returns Json response or Error response
 * @comment Get specific brand details by id for specific user.
 */
methods.getSpecificBrandById = async (req, res) => {
  try {
    const user_id = req?.user?.id;
    const brandId = req?.params?.id;
    const result = await brandServicesInterface.getSpecificBrandById(brandId, user_id);

    if (result.success) {
      const response = {
        data: result.body
      };
      return SuccessGetResponse(res, response);
    } else {
      res.json({
        success: result.success,
        error: result.error
      });
    }
  } catch (error) {
    return ErrorResponse(res, error);
  }
};

/**
 *
 * @method PUT
 * @param { Request } req
 * @param { Response } res
 * @returns Json response or Error response
 * @comment Update the brands.
 */
methods.updateBrand = async (req, res) => {
  try {
    const id = req?.params?.id;
    const result = await brandServicesInterface.updateBrand(req?.body, id);

    if (result.success) {
      const response = {
        data: result.body
      };
      return UpdateResponse(res, response);
    } else {
      res.json({
        success: result.success,
        error: result.error
      });
    }
  } catch (error) {
    return ErrorResponse(res, error);
  }
};

/**
 *
 * @method DELETE
 * @param { Request } req
 * @param { Response } res
 * @returns Json response or Error response
 * @comment Delete the brand.
 */
methods.deleteBrand = async (req, res) => {
  try {
    const id = req?.params?.id;
    const result = await brandServicesInterface.deleteBrand(id);

    if (result.success) {
      const response = {
        data: result.body
      };
      return DeletedResponse(res, response);
    } else {
      res.json({
        success: result.success,
        error: result.error
      });
    }
  } catch (error) {
    return ErrorResponse(res, error);
  }
};

module.exports = methods;