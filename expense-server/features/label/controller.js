import { authRoleEnum, subscriptionTypeEnum } from "../../config/enum.js";
import {
  errorResponse,
  successResponse,
  validateResponse,
} from "../../helper/apiResponse.js";
import { isExist } from "../../helper/isExist.js";
import { AuthErrorObj } from "../../middleware/verifyMiddleware.js";
import LabelModel from "./model.js";

class controller {
  static create = async (req, res) => {
    try {
      const user = req.user;
      const subscriptionType = user?.subscriptionType;

      // Check for create custom label limit
      if (
        subscriptionType !== subscriptionTypeEnum.PREMIUM &&
        subscriptionType !== subscriptionTypeEnum.PROMO_CODE &&
        user.role !== authRoleEnum.ADMIN
      ) {
        const count = await LabelModel.countDocuments({
          user: user._id,
        });

        if (count >= 3) {
          return errorResponse({
            res,
            statusCode: 403,
            message: "Free tier users are limited up to 3 custom label",
          });
        }
      }

      req.body.user = req.group.createBy;
      const result = (await LabelModel.create(req.body)).toObject();

      delete result.user;
      return successResponse({
        res,
        statusCode: 201,
        data: result,
        message: "Label created successfully",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "create.Label",
      });
    }
  };

  static get = async (req, res) => {
    try {
      const { search } = req.query;

      let filter = { user: req.group.createBy };
      if (search) filter.title = search;

      const result = await LabelModel.find(filter)
        .select("-user")
        .sort({ createdAt: -1 });

      return successResponse({
        res,
        statusCode: 200,
        data: result,
        message: "Label fetched successfully",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "get.Label",
      });
    }
  };

  static delete = async (req, res) => {
    const { id } = req.params;
    try {
      const doc = await isExist(res, id, LabelModel);

      if (String(doc.user) !== String(req.group.createBy))
        return validateResponse(res, AuthErrorObj);

      await LabelModel.findByIdAndDelete(id);

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
        funName: "delete.Label",
      });
    }
  };

  static patch = async (req, res) => {
    const { id } = req.params;
    try {
      const doc = await isExist(res, id, LabelModel);

      if (String(doc.user) !== String(req.group.createBy))
        return validateResponse(res, AuthErrorObj);

      const result = (
        await LabelModel.findByIdAndUpdate(
          id,
          {
            $set: req.body,
          },
          { new: true }
        )
      ).toObject();

      delete result.user;
      return successResponse({
        res,
        statusCode: 200,
        data: result,
        message: "Label updated successfully",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "patch.Label",
      });
    }
  };
}
export default controller;
