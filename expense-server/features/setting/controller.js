import { errorResponse, successResponse } from "../../helper/apiResponse.js";
import SettingModel from "./model.js";

class controller {
  static get = async (req, res) => {
    try {
      const setting = await SettingModel.findOne();

      return successResponse({
        res,
        statusCode: 200,
        data: setting,
        message: "success",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "get setting",
      });
    }
  };

  static upsert = async (req, res) => {
    try {
      const setting = await SettingModel.findOneAndUpdate(
        {},
        {
          $set: req.body,
        },
        {
          new: true,
          upsert: true,
        }
      );

      return successResponse({
        res,
        statusCode: 200,
        data: setting,
        message: "success",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "patch setting",
      });
    }
  };
}
export default controller;
