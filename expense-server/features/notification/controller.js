import { emitter } from "../../config/emitter.js";
import { authRoleEnum } from "../../config/enum.js";
import { errorResponse, successResponse } from "../../helper/apiResponse.js";
import { paginationDetails, paginationFun } from "../../helper/common.js";
import UserModel from "../user/model.js";
import NotificationModel from "./model.js";

class controller {
  static sendCustomNotification = async (req, res) => {
    try {
      const { title, description, deviceTypes } = req.body;

      const users = await UserModel.find().select("deviceTokens");

      for (const user of users) {
        const filteredTokens = user.deviceTokens
          .filter((token) => deviceTypes.includes(token.deviceType))
          .map((token) => token.deviceToken);

        if (filteredTokens.length > 0) {
          emitter.emit("notification", {
            userId: user._id,
            tokens: filteredTokens,
            title: title,
            body: description,
          });
        }
      }

      return successResponse({
        res,
        statusCode: 200,
        data: req.body,
        message: "success",
      });
    } catch (error) {
      console.log(error);
      return errorResponse({
        res,
        error,
      });
    }
  };

  static getAllByPagination = async (req, res) => {
    try {
      const { skip, limit } = paginationFun(req.query);
      const user = req.user;

      const filter = {
        user: user._id,
      };

      const result = await NotificationModel.find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .populate({
          path: "user",
          select: "username email",
        })

        .lean();

      const count = await NotificationModel.countDocuments(filter);

      const pagination = paginationDetails({
        limit: limit,
        page: req.query.page,
        totalItems: count,
      });

      return successResponse({
        res,
        statusCode: 200,
        data: result,
        pagination: pagination,
        message: "success",
      });
    } catch (error) {
      console.log(error);
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

      await NotificationModel.deleteMany(filter);

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
