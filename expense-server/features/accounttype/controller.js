import { errorResponse, successResponse } from "../../helper/apiResponse.js";
import { isExist } from "../../helper/isExist.js";
import AccountTypeModel from "./model.js";

class controller {
  static create = async (req, res) => {
    try {
      const result = await AccountTypeModel.create(req.body);
      return successResponse({
        res,
        statusCode: 201,
        data: result,
        message: "AccountType created successfully",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "create.AccountType",
      });
    }
  };
  static get = async (req, res) => {
    try {
      const result = await AccountTypeModel.find();

      return successResponse({
        res,
        statusCode: 200,
        data: result,
        message: "AccountType fetched successfully",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "get.AccountType",
      });
    }
  };
  static delete = async (req, res) => {
    const { id } = req.params;
    try {
      await isExist(res, id, AccountTypeModel);
      await AccountTypeModel.findByIdAndDelete(id);

      return successResponse({
        res,
        statusCode: 200,
        message: "Documents deleted successfully",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "delete.AccountType",
      });
    }
  };
  static patch = async (req, res) => {
    const { id } = req.params;
    try {
      await isExist(res, id, AccountTypeModel);
      const result = await AccountTypeModel.findByIdAndUpdate(
        id,
        {
          $set: req.body,
        },
        { new: true }
      );
      return successResponse({
        res,
        statusCode: 200,
        data: result,
        message: "AccountType updated successfully",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "patch.AccountType",
      });
    }
  };
}
export default controller;
