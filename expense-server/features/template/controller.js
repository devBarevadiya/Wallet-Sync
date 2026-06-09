import {
  errorResponse,
  successResponse,
  validateResponse,
} from "../../helper/apiResponse.js";
import { isExist } from "../../helper/isExist.js";
import { AuthErrorObj } from "../../middleware/verifyMiddleware.js";
import TemplateModel from "./model.js";

const populate = [
  {
    path: "account",
    select: "title color accountType",
    populate: { path: "accountType", select: "title icon -_id" },
  },
  { path: "category", select: "title icon iconType color" },
  { path: "labels", select: "title color" },
  { path: "currency", select: "symbol currency code" },
  { path: "payWith", select: "-user" },
];

class controller {
  static create = async (req, res) => {
    try {
      req.body.user = req.group.createBy;
      const result = (await TemplateModel.create(req.body)).toObject();

      delete result.user;
      return successResponse({
        res,
        statusCode: 201,
        data: result,
        message: "Template created successfully",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "create.Template",
      });
    }
  };

  static get = async (req, res) => {
    try {
      const result = await TemplateModel.find({ user: req.group.createBy })
        .select("-user")
        .populate(populate)
        .sort({ createdAt: -1 });

      return successResponse({
        res,
        statusCode: 200,
        data: result,
        message: "Template fetched successfully",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "get.Template",
      });
    }
  };

  static getDetails = async (req, res) => {
    const { id } = req.params;
    try {
      const doc = await isExist(res, id, TemplateModel);

      if (String(doc.user) !== String(req.group.createBy))
        return validateResponse(res, AuthErrorObj);

      const result = await TemplateModel.findById(id)
        .select("-user")
        .populate(populate);

      return successResponse({
        res,
        statusCode: 200,
        data: result,
        message: "Template fetched successfully",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "get.Template",
      });
    }
  };

  static delete = async (req, res) => {
    const { id } = req.params;
    try {
      const doc = await isExist(res, id, TemplateModel);

      if (String(doc.user) !== String(req.group.createBy))
        return validateResponse(res, AuthErrorObj);

      await TemplateModel.findByIdAndDelete(id);

      return successResponse({
        res,
        statusCode: 200,
        message: "Documents deleted successfully",
        data: id,
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "delete.Template",
      });
    }
  };

  static patch = async (req, res) => {
    const { id } = req.params;
    try {
      const template = await TemplateModel.findById(id);

      if (!template) {
        return errorResponse({
          statusCode: 404,
          message: "Template not found",
        });
      }

      console.log(req.body);

      const result = await TemplateModel.findByIdAndUpdate(
        id,
        {
          $set: req.body,
        },
        { new: true }
      )
        .populate(populate)
        .select("-user");

      return successResponse({
        res,
        statusCode: 200,
        data: result,
        message: "Template updated successfully",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "patch.Template",
      });
    }
  };
}
export default controller;
