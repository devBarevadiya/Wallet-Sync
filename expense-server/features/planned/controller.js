import moment from "moment";
import {
  accountPermissionEnum,
  authRoleEnum,
  paymentStatusEnum,
  scheduleTypeEnum,
  subscriptionTypeEnum,
} from "../../config/enum.js";
import {
  errorResponse,
  successResponse,
  validateResponse,
} from "../../helper/apiResponse.js";

import { AuthErrorObj } from "../../middleware/verifyMiddleware.js";
import PaymentModel from "../payment/model.js";
import { paginationDetails, paginationFun } from "../../helper/common.js";
import { createPayment } from "../payment/helper.js";
import CategoryModel from "../category/model.js";
import AccountModel from "../account/model.js";
import PlannedModel from "./model.js";

export const plannedPopulate = [
  {
    path: "account",
    populate: [
      { path: "accountType", select: "title icon" },
      { path: "currency", select: "symbol currency code" },
    ],

    select: "title color accountType currency",
  },
  { path: "category", select: "title icon iconType color" },
  { path: "labels", select: "title color" },
  { path: "recipient", select: "-user" },
];

class controller {
  static create = async (req, res) => {
    try {
      const user = req.user;
      const subscriptionType = user?.subscriptionType;

      // Check for create planned payment limit
      if (
        subscriptionType !== subscriptionTypeEnum.PREMIUM &&
        subscriptionType !== subscriptionTypeEnum.PROMO_CODE &&
        user.role !== authRoleEnum.ADMIN
      ) {
        const count = await PlannedModel.countDocuments({
          user: user._id,
        });

        if (count >= 2) {
          return errorResponse({
            res,
            statusCode: 403,
            message: "Free tier users are limited up to 2 planned payment",
          });
        }
      }

      const userId = req.user._id;

      const hasPermission = req.group.accounts.some(
        (account) =>
          String(account._id) === req.body.account &&
          (account.permission === accountPermissionEnum.ADMIN_ACCESS ||
            account.permission === accountPermissionEnum.TRACK_AND_READ)
      );

      if (!hasPermission) return validateResponse(res, AuthErrorObj);

      const { scheduleType, scheduleDate } = req.body;

      req.body = {
        ...req.body,
        user: userId,
        isActive: scheduleType === scheduleTypeEnum.ONE_TIME ? false : true,
        scheduleDate: moment(scheduleDate).toDate(),
      };

      const planned = await PlannedModel.create(req.body);

      await createPayment({
        plannedId: planned._id,
        amount: planned.amount,
        account: planned.account,
        paymentDate: planned.scheduleDate,
      });

      await PlannedModel.updateOne(
        { _id: planned._id },
        {
          $inc: {
            repetitionsCount: 1,
          },
        }
      );

      return successResponse({
        res,
        statusCode: 201,
        data: {
          _id: planned._id,
        },
        message: "Planned payment created successfully",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "create.Planned",
      });
    }
  };

  static get = async (req, res) => {
    try {
      const {
        page,
        type,
        everyType,
        scheduleType,
        categories,
        query,
        accounts,
        currencies,
        labels,
      } = req.body;

      const sortBy = req.body.sortBy
        ? { ...req.body.sortBy }
        : { createdAt: -1 };

      const groupAccountIds = req.group.accounts
        .filter((item) => item.permission !== accountPermissionEnum.NO_ACCESS)
        .map((item) => String(item._id));

      const filter = {
        account: {
          $in: groupAccountIds,
        },
      };

      if (accounts) {
        filter.account.$in = accounts;
      }

      if (type) {
        filter.type = type;
      }

      if (everyType) {
        filter.everyType = { $in: everyType };
      }

      if (scheduleType) {
        filter.scheduleType = scheduleType;
      }

      if (categories) {
        filter.category = { $in: categories };
      }

      if (query) {
        const regex = new RegExp(query, "i");
        filter.$or = [
          { title: { $regex: regex } },
          {
            category: await CategoryModel.find({
              title: { $regex: regex },
            }).select("_id"),
          },
        ];
      }

      if (currencies) {
        const accountIds = await AccountModel.distinct("_id", {
          _id: filter.account,
          currency: { $in: currencies },
        });

        filter.account.$in = accountIds;
      }

      if (labels) {
        filter.labels = { $in: labels };
      }

      // sort by
      if (sortBy) {
        const { title, scheduleDate } = sortBy;

        if (title) {
          sortBy.title = parseInt(title, 10);
        }

        if (scheduleDate) {
          sortBy.scheduleDate = parseInt(scheduleDate, 10);
        }
      }

      const { skip, limit } = paginationFun(req.body);

      const result = await PlannedModel.find(filter)
        .select("-user")
        .populate(plannedPopulate)
        .limit(limit)
        .skip(skip)
        .collation({ locale: "en", strength: 2 })
        .sort(sortBy)
        .lean();

      const plannedWithDueDates = await Promise.all(
        result.map(async (planned) => {
          const nextPayment = await PaymentModel.findOne({
            planned: planned._id,

            status: paymentStatusEnum.PENDING,
          })
            .sort({ paymentDate: 1 })
            .lean();

          if (nextPayment) {
            return {
              ...planned,
              nextPaymentDate: nextPayment.paymentDate,
            };
          } else {
            return {
              ...planned,
              nextPaymentDate: null,
            };
          }
        })
      );

      const count = await PlannedModel.countDocuments(filter);

      const pagination = paginationDetails({
        limit: limit,
        page: page,
        totalItems: count,
      });

      return successResponse({
        res,
        statusCode: 200,
        data: plannedWithDueDates,
        pagination: pagination,
        message: "Planned payment fetched successfully",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "get.Planned",
      });
    }
  };

  static getDetails = async (req, res) => {
    try {
      const { id } = req.params;

      const existingPlanned = await PlannedModel.findById(id).lean();

      if (!existingPlanned) {
        return errorResponse({
          res,
          statusCode: 404,
          message: "Planned payment not exist",
        });
      }

      const groupAccountIds = req.group.accounts
        .filter((item) => item.permission !== accountPermissionEnum.NO_ACCESS)
        .map((item) => String(item._id));

      if (!groupAccountIds.includes(String(existingPlanned.account._id))) {
        return validateResponse(res, AuthErrorObj, 403);
      }

      const result = await PlannedModel.findById(id)
        .select("-user")
        .populate(plannedPopulate)
        .lean();

      return successResponse({
        res,
        statusCode: 200,
        data: result,
        message: "Planned payment fetched successfully",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "get.Planned",
      });
    }
  };

  static delete = async (req, res) => {
    try {
      const { id } = req.params;

      const existingPlanned = await PlannedModel.findById(id).lean();

      if (!existingPlanned) {
        return errorResponse({
          res,
          statusCode: 404,
          message: "Planned payment not exist",
        });
      }

      const groupAccountIds = req.group.accounts
        .filter(
          (item) => item.permission === accountPermissionEnum.ADMIN_ACCESS
        )
        .map((item) => String(item._id));

      if (!groupAccountIds.includes(String(existingPlanned.account._id))) {
        return validateResponse(res, AuthErrorObj, 403);
      }
      await PlannedModel.findByIdAndDelete(id);

      return successResponse({
        res,
        statusCode: 200,
        message: "Planned payment deleted successfully",
        data: {
          _id: id,
        },
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "delete.Planned",
      });
    }
  };

  static patch = async (req, res) => {
    try {
      const { id } = req.params;
      const { scheduleDate, ...otherUpdates } = req.body;

      const existingPlanned = await PlannedModel.findById(id).lean();

      if (!existingPlanned) {
        return errorResponse({
          res,
          statusCode: 404,
          message: "Planned payment not exist",
        });
      }

      const groupAccountIds = req.group.accounts
        .filter(
          (item) => item.permission === accountPermissionEnum.ADMIN_ACCESS
        )
        .map((item) => String(item._id));

      if (!groupAccountIds.includes(String(existingPlanned.account._id))) {
        return validateResponse(res, AuthErrorObj, 403);
      }

      if (
        scheduleDate &&
        moment(scheduleDate).isAfter(existingPlanned.scheduleDate)
      ) {
        otherUpdates.scheduleDate = scheduleDate;
      }

      await PlannedModel.findByIdAndUpdate(id, otherUpdates, {
        new: true,
      }).lean();

      return successResponse({
        res,
        statusCode: 200,
        data: {
          _id: id,
        },
        message: "Planned payment updated successfully",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "patch.Planned",
      });
    }
  };
}
export default controller;
