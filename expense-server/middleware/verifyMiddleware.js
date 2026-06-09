import mongoose from "mongoose";
import GroupModel from "../features/group/model.js";
import UserModel from "../features/user/model.js";
import { errorResponse, validateResponse } from "../helper/apiResponse.js";

import { verifyToken } from "../helper/jwtToken.js";
import AccountModel from "../features/account/model.js";
import { accountPermissionEnum } from "../config/enum.js";

export const AuthErrorObj = {
  details: [
    {
      path: "message",
      message: "Authorization credential ware not found or invalid",
    },
  ],
};

const getActiveGroup = async (userId) => {
  const activeGroup = await GroupModel.findOne({
    members: {
      $elemMatch: {
        user: userId,
        isActive: true,
      },
    },
  });

  let result;

  if (!activeGroup) {
    // Not in group
    const userAccounts = await AccountModel.find({ user: userId }).select(
      "_id"
    );

    result = {
      createBy: userId,
      accounts: userAccounts.map((account) => {
        return {
          _id: account._id,
          permission: accountPermissionEnum.ADMIN_ACCESS,
        };
      }),
      members: [],
    };
  } else {
    // In group
    const accounts = [];

    const member = activeGroup.members.find(
      (member) =>
        member.user.toString() === userId.toString() && member.isActive
    );

    if (member) {
      member.accounts.forEach((account) => {
        accounts.push({
          _id: account.account._id,
          permission: account.permission,
        });
      });
    }

    result = {
      _id: activeGroup._id,
      createBy: activeGroup.createBy,
      accounts,
      members: activeGroup.members,
    };
  }

  return result;
};

export const verifyUser = async (req, res, next) => {
  try {
    const { authorization } = req.headers;

    const token =
      authorization && authorization.startsWith("Bearer ")
        ? authorization.split(" ")[1]
        : null;

    if (!token) {
      return errorResponse({
        res,
        statusCode: 403,
        message: "Token is required",
      });
    }

    let userId;

    try {
      const payload = await verifyToken(token);
      userId = payload.userId;
    } catch (error) {
      return errorResponse({
        res,
        statusCode: 401,
        message: "Invalid token or token has expired",
      });
    }

    let user = await UserModel.findById(userId)
      .populate({
        path: "currencies.currency",
      })
      .select("-createdAt -updatedAt")
      .populate()
      .lean();

    if (!user) return validateResponse(res, AuthErrorObj, 403);

    user.currency =
      user.currencies.find((item) => item?.isBase)?.currency ?? null;

    // delete user.currencies;

    req.user = user;
    req.group = await getActiveGroup(req.user._id);

    next();
  } catch (error) {
    return errorResponse({ res, error });
  }
};
