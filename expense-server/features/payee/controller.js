import { authRoleEnum } from "../../config/enum.js";
import { errorResponse, successResponse } from "../../helper/apiResponse.js";
import PayeeModel from "./model.js";

class controller {
  static getAll = async (req, res) => {
    try {
      const user = req.user;

      const filter = {
        user: user._id,
      };

      const result = await PayeeModel.find(filter)
        .select("-user")
        .sort({ createdAt: -1 })
        .lean();

      return successResponse({
        res,
        statusCode: 200,
        data: result,
        message: "success",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
      });
    }
  };

  static create = async (req, res) => {
    try {
      const user = req.user;

      req.body.user = user._id;
      await PayeeModel.create(req.body);

      return successResponse({
        res,
        statusCode: 201,
        message: "success",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
      });
    }
  };

  static update = async (req, res) => {
    try {
      const user = req.user;
      const { payeeId } = req.params;

      const existPayee = await PayeeModel.findById(payeeId);

      if (!existPayee) {
        return successResponse({
          res,
          statusCode: 404,
          message: "Payee not found",
        });
      }

      await PayeeModel.updateOne(
        {
          user: user._id,
          _id: payeeId,
        },
        {
          $set: req.body,
        }
      );

      return successResponse({
        res,
        statusCode: 200,
        message: "success",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
      });
    }
  };

  static deleteMany = async (req, res) => {
    try {
      const user = req.user;
      const { ids } = req.body;

      const filter = {
        _id: { $in: ids },
      };

      if (user.role != authRoleEnum.ADMIN) {
        filter.user = user._id;
      }

      await PayeeModel.deleteMany(filter);

      return successResponse({
        res,
        statusCode: 200,
        message: "success",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
      });
    }
  };
}
export default controller;
