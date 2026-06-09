import mongoose from "mongoose";
import jwt from "jsonwebtoken";

import firebaseAdmin from "../../config/firebase.js";
import { CLIENT_URL, JWT_SECRET_KEY } from "../../config/env.js";

import { errorResponse, successResponse } from "../../helper/apiResponse.js";
import { bcryptPassword } from "../../helper/bcryptPassword.js";
import { paginationDetails, paginationFun } from "../../helper/common.js";
import { isExist } from "../../helper/isExist.js";
import { generateToken, verifyToken } from "../../helper/jwtToken.js";
import { sendMail } from "../../helper/nodeMailer.js";

import UserModel from "./model.js";
import CategoryModel from "../category/model.js";
import HeadCategoryModel from "../category/headCategoryModel.js";
import AccountModel from "../account/model.js";
import BudgetModel from "../budget/model.js";
import GroupModel from "../group/model.js";
import LabelModel from "../label/model.js";
import PlannedModel from "../planned/model.js";
import TemplateModel from "../template/model.js";
import TransactionModel from "../transaction/model.js";
import { emitter } from "../../config/emitter.js";
import ArchivedDataModel from "../archivedData/model.js";
import PaymentModel from "../payment/model.js";
import PayeeModel from "../payee/model.js";
import Notification from "../notification/model.js";
import BlogModel from "../blog/model.js";
import BalanceHistoryModel from "../balanceHistory/model.js";
import { createBalanceHistory } from "../balanceHistory/helper.js";

const cloneCategory = async (user) => {
  const headCategories = await HeadCategoryModel.find({ user: null })
    .select("title categories type icon color")
    .populate({
      path: "categories",
      select: "title color icon iconType",
    });

  await Promise.all(
    headCategories.map(async (headCategory) => {
      const { title, type, categories, icon, color } = headCategory;
      const { _id } = await HeadCategoryModel.create({
        title,
        type,
        user,
        icon,
        color,
      });

      const categoryDocs = categories.map((category) => ({
        title: category.title,
        color: category.color,
        icon: category.icon,
        nature: category.nature,
        iconType: category.iconType,
        user,
      }));

      const categoryResult = await CategoryModel.create(categoryDocs);
      const categoryIds = categoryResult.map((item) => item._id);

      await HeadCategoryModel.findByIdAndUpdate(_id, {
        $set: { categories: categoryIds },
      });
    })
  );
};

class controller {
  static addDeviceToken = async (req, res) => {
    try {
      const userId = req.user._id;
      const { deviceToken } = req.body;

      const user = await UserModel.findById(userId);

      const tokenExists = user.deviceTokens.some(
        (token) => token.deviceToken === deviceToken
      );

      if (!tokenExists) {
        user.deviceTokens.push(req.body);
        await user.save();
      }

      return successResponse({
        res,
        statusCode: 200,
        message: "Device token added successfully",
        data: {
          _id: userId,
        },
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "addDeviceToken",
      });
    }
  };

  static setAllowedNotification = async (req, res) => {
    try {
      const userId = req.user._id;

      await UserModel.findByIdAndUpdate(userId, {
        $set: req.body,
      });

      return successResponse({
        res,
        statusCode: 200,
        message: "Notification settings updated successfully",
        data: {
          _id: userId,
        },
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "setAllowedNotification",
      });
    }
  };

  static register = async (req, res) => {
    try {
      req.body.password = await bcryptPassword(req.body.password);

      const { email, password, username, deepLinkToken } = req.body;

      let user;
      if (deepLinkToken) {
        try {
          const payload = await verifyToken(deepLinkToken);

          // Add member to group
          const groupId = payload.groupId;
          const accounts = payload.accounts;

          if (email !== payload.email) {
            return errorResponse({
              res,
              statusCode: 400,
              message: "User email mismatch",
            });
          }

          user = await UserModel.create({
            email,
            password,
            username,
          });

          const group = await GroupModel.findById(groupId);

          const exists = group.members.some(
            (item) => String(item.user) === String(user._id)
          );

          await GroupModel.findByIdAndUpdate(
            groupId,
            !exists
              ? {
                  $push: {
                    members: {
                      user: user._id,
                      accounts: accounts,
                    },
                  },
                }
              : {},
            { new: true }
          );
        } catch (error) {
          return errorResponse({
            res,
            message: "Deep link token is invalid or expired",
            statusCode: 400,
          });
        }
      } else {
        // Create user
        user = await UserModel.create({
          email,
          password,
          username,
        });
      }

      // Send welcome email to user
      emitter.emit("email_notification_register", {
        email: email,
        username: username,
      });

      const result = await UserModel.findById(user._id)
        .populate()
        .select("-password");

      await cloneCategory(result._id);

      return successResponse({
        res,
        statusCode: 201,
        message: "User successfully registered",
        data: result,
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "register",
      });
    }
  };

  static registerFirebase = async (req, res) => {
    try {
      const { name, email, firebase } = await firebaseAdmin
        .auth()
        .verifyIdToken(req.body.token);

      const doc = await UserModel.create({
        username: name,
        authProvider: firebase.sign_in_provider,
        email,
        currencies: { currency: req.body.currency, isBase: true },
      });

      const result = await UserModel.findById(doc._id)
        .populate()
        .select("-password");

      await cloneCategory(result._id);

      return successResponse({
        res,
        statusCode: 201,
        message: "User successfully registered",
        data: result,
      });
    } catch (error) {
      if (error.message.includes("Firebase ID token has expired.")) {
        return errorResponse({
          res,
          error,
          message: "Firebase ID token has expired.",
          funName: "registerFirebase",
        });
      } else {
        return errorResponse({
          res,
          error,
          funName: "registerFirebase",
        });
      }
    }
  };

  static login = async (req, res) => {
    try {
      const token = await generateToken({
        userId: req.user._id,
      });

      return successResponse({
        res,
        statusCode: 200,
        message: "User Login successfully",
        data: {
          token,
          ...req.user,
        },
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "login",
      });
    }
  };

  static loginFirebase = async (req, res) => {
    try {
      const { token: providerToken, deepLinkToken } = req.body;
      const { name, email, firebase, uid } = await firebaseAdmin
        .auth()
        .verifyIdToken(providerToken);

      const existingUser = await UserModel.findOne({ email: email })
        .populate()
        .select("-password")
        .lean();

      if (!existingUser) {
        const user = await UserModel.create({
          username: name,
          authProvider: firebase.sign_in_provider,
          email,
          uid: uid,
        });

        await cloneCategory(user._id);

        // Send welcome email to user
        emitter.emit("email_notification_register", {
          email: user.email,
          username: user.username,
        });
      }

      const user = await UserModel.findOne({
        email: email,
      })
        .populate({
          path: "currencies.currency",
        })
        .select("-password")
        .lean();

      const token = await generateToken({
        userId: user._id,
      });

      if (deepLinkToken) {
        let payload;

        try {
          payload = await verifyToken(deepLinkToken);
        } catch (error) {
          console.log(error);
          return errorResponse({
            res,
            message: "Deep link token is invalid or expired",
            statusCode: 400,
          });
        }

        // Add member to group
        const groupId = payload.groupId;
        const accounts = payload.accounts;

        const group = await GroupModel.findById(groupId);

        const exists = group.members.some(
          (item) => String(item.user) === String(user._id)
        );

        await GroupModel.findByIdAndUpdate(
          groupId,
          !exists
            ? {
                $push: {
                  members: {
                    user: user._id,
                    accounts: accounts,
                  },
                },
              }
            : {},
          { new: true }
        );
      }

      return successResponse({
        res,
        statusCode: 200,
        message: "User Login successfully",
        data: {
          token,
          ...user,
        },
      });
    } catch (error) {
      if (error.message.includes("Firebase ID token has expired.")) {
        return errorResponse({
          res,
          error,
          message: "Firebase ID token has expired.",
          funName: "loginFirebase",
        });
      } else {
        return errorResponse({
          res,
          error,
          message: "Please register first then login.",
          funName: "loginFirebase",
        });
      }
    }
  };

  static logout = async (req, res) => {
    try {
      const { uid, _id } = req.user;
      const { deviceToken } = req.body;

      if (uid) {
        try {
          await firebaseAdmin.auth().revokeRefreshTokens(uid);
        } catch (error) {
          console.log(error.message);
        }
      }

      await UserModel.findByIdAndUpdate(_id, {
        $pull: {
          deviceTokens: { deviceToken: deviceToken },
        },
      });

      return successResponse({
        res,
        message: "Logout successfully",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        statusCode: 500,
        funName: "auth.logout",
      });
    }
  };

  static verifyToken = async (req, res) => {
    try {
      const result = req.user;

      return successResponse({
        res,
        statusCode: 200,
        data: result,
        message: "Token verified successfully.",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "auth.verifyToken",
      });
    }
  };

  static get = async (req, res) => {
    const { title, role } = req.query;
    try {
      const { skip, limit } = paginationFun(req.query);
      let filter = {};
      if (role) filter.role = role;
      if (title)
        filter.$or = [
          { username: { $regex: title, $options: "i" } },
          { email: { $regex: title, $options: "i" } },
        ];

      const result = await UserModel.find(filter)
        .populate()
        .select("-password")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      let count = 0;
      if (Object.values(filter)?.length !== 0) {
        count = await UserModel.countDocuments(filter);
      } else {
        count = await UserModel.estimatedDocumentCount();
      }

      const pagination = paginationDetails({
        limit: limit,
        page: req.query.page,
        totalItems: count,
      });

      return successResponse({
        res,
        statusCode: 200,
        data: result,
        message: "Document fetched successfully",
        pagination,
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "user.get",
      });
    }
  };

  static getDetails = async (req, res) => {
    try {
      const { id } = req.params;

      let result = (
        await UserModel.findById(id)
          .populate({
            path: "currencies.currency",
          })
          .select("-createdAt -updatedAt -password")
      ).toObject();

      result.currency = result.currencies.find((item) => item.isBase).currency;
      delete result.currencies;

      return successResponse({
        res,
        statusCode: 200,
        data: result,
        message: "Document fetched successfully",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "user.getDetails",
      });
    }
  };

  static setCurrency = async (req, res) => {
    try {
      const { currency } = req.body;

      const isExist = await UserModel.findOne({
        _id: req.user._id,
        "currencies.currency": currency,
        "currencies.isBase": false,
      });

      const updateQuery = isExist
        ? { $pull: { currencies: { currency } } }
        : { $push: { currencies: { currency } } };

      await UserModel.findByIdAndUpdate(req.user._id, updateQuery, {
        new: true,
      });

      return successResponse({
        res,
        statusCode: 200,
        message: "Currency set successfully",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "user.getDetails",
      });
    }
  };

  static getCurrency = async (req, res) => {
    try {
      const userId = req.user._id;

      const result = await UserModel.aggregate([
        { $match: { _id: userId } },
        {
          $unwind: "$currencies",
        },
        {
          $lookup: {
            from: "currencies",
            localField: "currencies.currency",
            foreignField: "_id",
            as: "currency",
          },
        },
        {
          $unwind: "$currency",
        },
        {
          $replaceRoot: {
            newRoot: {
              $mergeObjects: [
                {
                  _id: "$currency._id",
                  symbol: "$currency.symbol",
                  currency: "$currency.currency",
                  code: "$currency.code",
                },
                {
                  isBase: "$currencies.isBase",
                },
              ],
            },
          },
        },
      ]);
      return successResponse({
        res,
        statusCode: 200,
        data: result,
        message: "get Currency successfully",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "user.getCurrency",
      });
    }
  };

  static patch = async (req, res) => {
    const { id } = req.params;

    try {
      await isExist(res, id, UserModel);
      const result = (
        await UserModel.findByIdAndUpdate(
          id,
          {
            $set: req.body,
          },
          { new: true }
        )
      ).toObject();

      delete result.password;

      return successResponse({
        res,
        statusCode: 200,
        message: "Profile updated successfully",
        data: result,
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "user.patch",
      });
    }
  };

  static patchBaseCurrency = async (req, res) => {
    try {
      const reqUser = req.user;

      const { currency } = req.body;

      const user = await UserModel.findById(reqUser._id);

      const currencyIndex = user.currencies.findIndex(
        (c) => c.currency.toString() === currency
      );

      if (currencyIndex > -1) {
        user.currencies.forEach((c) => {
          c.isBase = false;
        });
        user.currencies[currencyIndex].isBase = true;
      } else {
        user.currencies.forEach((c) => {
          c.isBase = false;
        });
        user.currencies.push({
          currency: new mongoose.Types.ObjectId(currency),
          isBase: true,
        });
      }

      await user.save();

      const updatedUser = await UserModel.findById(reqUser._id)
        .select("currencies")
        .populate({ path: "currencies.currency" });

      let result = [];
      for (const element of updatedUser.currencies) {
        const { _id, symbol, currency, code } = element.currency;
        result.push({
          _id,
          symbol,
          currency,
          code,
          isBase: element.isBase,
        });
      }
      return successResponse({
        res,
        statusCode: 200,
        message: "Profile updated successfully",
        data: result,
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "user.patch",
      });
    }
  };

  static deleteAllData = async (req, res) => {
    try {
      const reqUser = req.user;

      const userId = reqUser._id;

      const archivedData = new ArchivedDataModel();

      // archive accounts
      const accounts = await AccountModel.find({
        user: userId,
      }).lean();

      archivedData.accounts = accounts;

      // archive budgets
      const budgets = await BudgetModel.find({
        createdBy: userId,
      }).lean();

      archivedData.budgets = budgets;

      // archive category
      const categories = await CategoryModel.find({
        user: userId,
      }).lean();

      archivedData.categories = categories;

      // archive  head category
      const headCategories = await HeadCategoryModel.find({
        user: userId,
      }).lean();

      archivedData.headCategories = headCategories;

      // archive group
      const groups = await GroupModel.find({
        createBy: userId,
      }).lean();

      archivedData.groups = groups;

      // archive label
      const labels = await LabelModel.find({
        user: userId,
      }).lean();

      archivedData.labels = labels;

      // archive planned
      const planned = await PlannedModel.find({
        user: userId,
      }).lean();

      archivedData.planned = planned;

      // archive payment
      if (planned.length > 0) {
        const payments = await PaymentModel.find({
          planned: planned.map((p) => String(p._id)),
        }).lean();

        archivedData.payments = payments;
      }

      // archive templates
      const templates = await TemplateModel.find({
        user: userId,
      }).lean();

      archivedData.templates = templates;

      // archive transactions
      const transactions = await TransactionModel.find({
        user: userId,
      }).lean();

      archivedData.transactions = transactions;

      // archive payees
      const payees = await PayeeModel.find({
        user: userId,
      }).lean();

      archivedData.payees = payees;

      // archive user
      const user = await UserModel.findById(userId).lean();
      archivedData.user = user;

      // save archived data
      await archivedData.save();

      //===============================//

      await BlogModel.deleteMany({
        user: userId,
      });

      await AccountModel.deleteMany({
        user: userId,
      });

      await BudgetModel.deleteMany({
        createdBy: userId,
      });

      await CategoryModel.deleteMany({
        user: userId,
      });

      await HeadCategoryModel.deleteMany({
        user: userId,
      });

      await GroupModel.deleteMany({
        createBy: userId,
      });

      await GroupModel.updateMany(
        { "members.user": userId },
        { $pull: { members: { user: userId } } }
      );

      await LabelModel.deleteMany({
        user: userId,
      });

      // delete planned payments
      if (planned.length > 0) {
        await PaymentModel.deleteMany({
          planned: planned.map((p) => String(p._id)),
        });
      }

      await PlannedModel.deleteMany({
        user: userId,
      });

      await TemplateModel.deleteMany({
        user: userId,
      });

      await TransactionModel.deleteMany({ user: userId });

      await PayeeModel.deleteMany({
        user: userId,
      });

      await UserModel.findByIdAndDelete(userId);

      return successResponse({
        message: "All data deleted successfully",
        res,
        statusCode: 200,
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "user.deleteAllData",
      });
    }
  };

  static deleteTransactions = async (req, res) => {
    try {
      const reqUser = req.user;

      const userId = reqUser._id;

      // Delete all budgets
      await BudgetModel.deleteMany({
        createdBy: userId,
      });

      // Delete all planned budget
      await PlannedModel.deleteMany({
        user: userId,
      });

      // Delete all transaction
      await TransactionModel.deleteMany({
        user: userId,
      });

      // Set balance to initialBalance
      await AccountModel.updateMany({ user: userId }, [
        {
          $set: { balance: "$initialBalance" },
        },
      ]);

      // Delete Balance histories
      const accountIdArray = await AccountModel.distinct("_id");

      await BalanceHistoryModel.deleteMany({
        account: { $in: accountIdArray },
      });

      // Create balance history for today
      await createBalanceHistory();

      return successResponse({
        message: "All transaction deleted successfully",
        res,
        statusCode: 200,
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "user.deleteAllTransaction",
      });
    }
  };

  static deleteTransactionsAndAppSettings = async (req, res) => {
    try {
      const reqUser = req.user;

      const userId = reqUser._id;

      await AccountModel.deleteMany({
        user: userId,
      });

      await BudgetModel.deleteMany({
        createdBy: userId,
      });

      await CategoryModel.deleteMany({
        user: userId,
      });

      await HeadCategoryModel.deleteMany({
        user: userId,
      });

      await cloneCategory(userId);

      await GroupModel.deleteMany({
        createBy: userId,
      });

      await LabelModel.deleteMany({
        user: userId,
      });

      await PlannedModel.deleteMany({
        user: userId,
      });

      await TemplateModel.deleteMany({
        user: userId,
      });

      await TransactionModel.deleteMany({
        user: userId,
      });

      await PayeeModel.deleteMany({
        user: userId,
      });

      await Notification.deleteMany({
        user: userId,
      });

      return successResponse({
        message: "All transaction and app setting deleted successfully",
        res,
        statusCode: 200,
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "user.deleteAllTransactionAndAppSetting",
      });
    }
  };

  static delete = async (req, res) => {
    const { id } = req.params;
    try {
      await isExist(res, id, UserModel);

      await UserModel.findByIdAndDelete(id);

      await HeadCategoryModel.deleteMany({ user: id });
      await CategoryModel.deleteMany({ user: id });

      return successResponse({
        res,
        statusCode: 200,
        data: id,
        message: "Document deleted successfully",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "user.delete",
      });
    }
  };

  static forgotPassword = async (req, res) => {
    try {
      const token = await generateToken({ userId: req.user._id });
      const link = `${CLIENT_URL}/reset-password/${token}`;

      await sendMail({
        to: req.user.email,
        subject: "Password Reset Request",
        dynamicData: {
          user: req.user.username || "User",
          email: req.user.email,
          link: link,
        },
        filename: "forgotpassword.html",
      });
      return successResponse({
        res,
        statusCode: 200,
        message: "Reset password mail successfully send to your email address",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "forgotPassword",
      });
    }
  };

  static forgotPasswordOtp = async (req, res) => {
    try {
      // const token = await generateToken({ userId: req.user._id });
      // const link = `${CLIENT_URL}/reset-password/${token}`;

      let otp = Math.floor(1000 + Math.random() * 9000);
      const expiryTime = new Date();
      expiryTime.setMinutes(expiryTime.getMinutes() + 2);

      await UserModel.findByIdAndUpdate(
        req.user._id,
        { $set: { otp, otpExpiration: expiryTime } },
        { new: true }
      );
      const message = `Your OTP will expire after 2 minutes.`;

      await sendMail({
        to: req.user.email,
        subject: "Password Reset Request",
        dynamicData: {
          user: req.user.username || "User",
          otp,
          message,
          email: req.user.email,
        },
        filename: "forgotpasswordotp.html",
      });
      return successResponse({
        res,
        statusCode: 200,
        message: "Reset password mail successfully send to your email address",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "forgotPassword",
      });
    }
  };

  /**
   * otp verification
   */
  static otpVerification = async (req, res) => {
    try {
      const { email, otp } = req.body;

      const user = await UserModel.findOne({ email });
      if (!user) {
        return errorResponse({
          res,
          message: "User not found.",
          statusCode: 404,
        });
      }

      if (user.otpExpiration < new Date()) {
        return errorResponse({
          res,
          statusCode: 400,
          message: "OTP has expired.",
        });
      }

      if (user.otp === Number(otp)) {
        const token = await generateToken({ userId: user._id });

        await UserModel.findByIdAndUpdate(user._id, {
          $set: {
            otp: null,
            otpExpiration: null,
          },
        });
        return successResponse({
          res,
          statusCode: 200,
          data: { token },
          message: "OTP verified successfully.",
        });
      } else {
        return errorResponse({
          res,
          statusCode: 400,
          error: Error("Invalid OTP."),
        });
      }
    } catch (error) {
      return errorResponse({ res, error, funName: "auth.otpVerification" });
    }
  };

  /**
   * resend otp
   */
  static resendOTP = async (req, res) => {
    try {
      const { email } = req.body;

      const user = await UserModel.findOne({ email });
      if (!user) {
        return errorResponse({
          res,
          error: Error("User not found."),
          statusCode: 404,
        });
      }

      const newOTP = Math.floor(1000 + Math.random() * 9000);
      const expiryTime = new Date();
      expiryTime.setMinutes(expiryTime.getMinutes() + 2);

      user.otp = newOTP;
      user.otpExpiration = expiryTime;
      const message = `Your OTP will expire after 2 minutes.`;

      await user.save();

      await sendMail({
        to: email,
        subject: "New OTP Verification Code:",
        dynamicData: {
          user: user.username || "User",
          otp: newOTP,
          message,
          email,
        },
        filename: "forgotpasswordotp.html",
      });

      return successResponse({
        res,
        statusCode: 200,
        message: "New OTP sent successfully.",
      });
    } catch (error) {
      return errorResponse({ res, error, funName: "auth.resendOTP" });
    }
  };

  static resetPassword = async (req, res) => {
    const { password } = req.body;
    try {
      const hashPassword = await bcryptPassword(password);
      await UserModel.findByIdAndUpdate(
        req.user._id,
        {
          $set: { password: hashPassword },
        },
        { new: true }
      );
      return successResponse({
        res,
        statusCode: 200,
        message: "Reset password successfully",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "resetPassword",
      });
    }
  };

  static changePassword = async (req, res) => {
    const { password } = req.body;
    try {
      const hashPassword = await bcryptPassword(password);
      await UserModel.findByIdAndUpdate(
        req.user._id,
        {
          $set: { password: hashPassword },
        },
        { new: true }
      );
      return successResponse({
        res,
        statusCode: 200,
        message: "Change password successfully",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "changePassword",
      });
    }
  };
}

// Commit
export default controller;
