import {
  accountPermissionEnum,
  authRoleEnum,
  subscriptionTypeEnum,
} from "../../config/enum.js";

import {
  errorResponse,
  successResponse,
  validateResponse,
} from "../../helper/apiResponse.js";
import { isExist } from "../../helper/isExist.js";
import { AuthErrorObj } from "../../middleware/verifyMiddleware.js";
import { incrementHistoryBalance } from "../balanceHistory/helper.js";
import BalanceHistoryModel from "../balanceHistory/model.js";
import BudgetModel from "../budget/model.js";
import GroupModel from "../group/model.js";
import SettingModel from "../setting/model.js";
import { deleteTransaction } from "../transaction/helper.js";
import TransactionModel from "../transaction/model.js";
import AccountModel from "./model.js";
import moment from "moment";

class controller {
  static create = async (req, res) => {
    try {
      const user = req.user;
      const group = req.group;

      const subscriptionType = user?.subscriptionType;

      // Check account limit
      if (
        subscriptionType !== subscriptionTypeEnum.PREMIUM &&
        subscriptionType !== subscriptionTypeEnum.PROMO_CODE &&
        user.role !== authRoleEnum.ADMIN
      ) {
        const count = await AccountModel.countDocuments({
          user: user._id,
        });

        const setting = await SettingModel.findOne().lean();

        const createAccountLimit = setting?.createAccountLimit || 3;

        if (count >= createAccountLimit) {
          return errorResponse({
            res,
            statusCode: 403,
            message: "Account creation limit exceeded",
          });
        }
      }

      const count = await AccountModel.countDocuments({
        title: { $regex: new RegExp(`^${req.body.title}$`, "i") },
        user: user._id,
      });

      if (count > 0) {
        return errorResponse({
          res,
          statusCode: 400,
          message: "Account title is already in use",
        });
      }

      req.body.user = user._id;
      req.body.initialBalance = req.body.balance;
      const account = await AccountModel.create(req.body);

      delete account.user;

      if (group._id) {
        const existingGroup = await GroupModel.findById(group._id);

        existingGroup.members.forEach((member) => {
          const permission =
            String(member.user._id) === String(group.createBy._id)
              ? accountPermissionEnum.ADMIN_ACCESS
              : accountPermissionEnum.NO_ACCESS;

          member.accounts.push({
            account: account._id,
            permission: permission,
          });
        });

        await existingGroup.save();
      }

      await incrementHistoryBalance({
        accountId: account._id,
        amount: account.balance,
        date: moment().toDate(),
      });

      return successResponse({
        res,
        statusCode: 201,
        data: account,
        message: "Account created successfully",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "create.Account",
      });
    }
  };

  static get = async (req, res) => {
    try {
      const group = req.group;

      const accountIds = group.accounts
        .filter(
          (account) => account.permission !== accountPermissionEnum.NO_ACCESS
        )
        .map((account) => String(account._id));

      const result = await AccountModel.find({
        _id: { $in: accountIds },
      })
        .select("-user")
        .populate([
          { path: "currency", select: "symbol currency code" },
          { path: "accountType", select: "icon title" },
        ])
        .sort({ createdAt: -1 });

      return successResponse({
        res,
        statusCode: 200,
        data: result,
        message: "Account fetched successfully",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "get.Account",
      });
    }
  };

  static getDetails = async (req, res) => {
    const { id } = req.params;
    try {
      const doc = await isExist(res, id, AccountModel);

      const checkAccount = req.group.accounts.some(
        (item) =>
          String(item._id) === id &&
          item.permission !== accountPermissionEnum.NO_ACCESS
      );

      if (String(doc.user) !== String(req.user._id) && !checkAccount)
        return validateResponse(res, AuthErrorObj);

      const result = await AccountModel.findById(id)
        .select("-user")
        .populate([
          { path: "currency", select: "symbol currency code" },
          { path: "accountType", select: "icon title" },
        ]);

      return successResponse({
        res,
        statusCode: 200,
        data: result,
        message: "Account fetched successfully",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "get.Account",
      });
    }
  };

  static delete = async (req, res) => {
    const { id } = req.params;
    try {
      const account = await AccountModel.findById(id);

      if (!account) {
        errorResponse({
          res,
          statusCode: 404,
          message: "Account Not found",
        });

        return;
      }

      const checkPermision = req.group.accounts.some(
        (item) =>
          String(item._id) === id &&
          item.permission === accountPermissionEnum.ADMIN_ACCESS
      );

      if (String(account.user) !== String(req.user._id) && !checkPermision)
        return validateResponse(res, AuthErrorObj);

      // Delete all related transactions
      const transactionIdArray = await TransactionModel.distinct("_id", {
        $or: [{ account: id }, { to: id }],
      });

      for (const transactionId of transactionIdArray) {
        await deleteTransaction(transactionId);
      }

      // Delete all related accounts from budget
      await BudgetModel.updateMany(
        {
          accounts: id,
        },
        {
          $pull: { accounts: id },
        }
      );

      // Delete account
      await AccountModel.findByIdAndDelete(id);

      await GroupModel.updateMany(
        { "members.accounts.account": id },
        { $pull: { "members.$[elem].accounts": { account: id } } },
        { new: true, arrayFilters: [{ "elem.accounts.account": id }] }
      );

      return successResponse({
        res,
        statusCode: 200,
        message: "Documents deleted successfully",
        data: id,
      });
    } catch (error) {
      console.log(error);
      return errorResponse({
        res,
        error,
        funName: "delete.Account",
      });
    }
  };

  static patch = async (req, res) => {
    try {
      const { id } = req.params;
      const { balance } = req.body;

      const existingAccount = await AccountModel.findById(id).lean();

      if (!existingAccount) {
        return errorResponse({
          res,
          statusCode: 404,
          message: "Account not exist",
        });
      }

      const hasPermission = req.group.accounts.some(
        (item) =>
          String(item._id) === id &&
          item.permission === accountPermissionEnum.ADMIN_ACCESS
      );

      if (
        String(existingAccount.user) !== String(req.user._id) &&
        !hasPermission
      )
        return validateResponse(res, AuthErrorObj);

      const account = await AccountModel.findByIdAndUpdate(
        id,
        {
          $set: req.body,
        },
        { new: true }
      )
        .select("-user")
        .lean();

      if (balance) {
        const today = moment().startOf("day").toDate();
        const historyRecord = await BalanceHistoryModel.findOne({
          account: account._id,
          createdAt: { $gte: today },
        });

        if (historyRecord) {
          historyRecord.balance = balance;
          await historyRecord.save();
        } else {
          await BalanceHistoryModel.create({
            account: account._id,
            balance,
          });
        }
      }
      return successResponse({
        res,
        statusCode: 200,
        data: account,
        message: "Account updated successfully",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "patch.Account",
      });
    }
  };
}
export default controller;
