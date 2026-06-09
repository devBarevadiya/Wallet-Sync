import moment from "moment";
import {
  accountPermissionEnum,
  authRoleEnum,
  budgetRolloverUserResponse,
  budgetSpendLimitType,
  budgetStatusType,
  subscriptionTypeEnum,
} from "../../config/enum.js";
import { errorResponse, successResponse } from "../../helper/apiResponse.js";
import { paginationDetails, paginationFun } from "../../helper/common.js";
import HeadCategoryModel from "../category/headCategoryModel.js";
import GroupModel from "../group/model.js";
import { populate as transactionPopulate } from "../transaction/controller.js";
import BudgetModel from "./model.js";

export const budgetPopulate = [
  {
    path: "accounts",
    select: "title color accountType",
    populate: { path: "accountType", select: "title icon -_id" },
  },
  {
    path: "createdBy",
    select: "username email",
  },
  { path: "headCategories.headCategory", select: "title icon iconType color" },
  {
    path: "headCategories.categories.category",
    select: "title icon iconType color",
  },
];

export const budgetSelect = {
  notifications: 0,
  transactions: 0,
  "headCategories.notifications": 0,
  "headCategories.categories.notifications": 0,
};

class controller {
  static getTransactionsForBudget = async (req, res) => {
    try {
      const { budgetId } = req.params;

      const { categories, currencies, accounts, labels, fromDate, toDate } =
        req.body;

      const { skip, limit } = paginationFun(req.body);

      const budgetCount = await BudgetModel.countDocuments({ _id: budgetId });

      if (budgetCount < 1) {
        return errorResponse({
          res,
          message: "Budget not exist",
          statusCode: 404,
        });
      }

      const match = {};

      if (categories) {
        match.category = { $in: categories };
      }

      if (currencies) {
        match.currency = { $in: currencies };
      }

      if (accounts) {
        match.account = { $in: accounts };
      }
      if (labels) {
        match.labels = { $in: labels };
      }

      if (fromDate && toDate) {
        const from = moment(fromDate, "YYYY-MM-DD").startOf("day").toDate();
        const to = moment(toDate, "YYYY-MM-DD").endOf("day").toDate();
        match.createdAt = { $gte: from, $lte: to };
      }

      const budget = await BudgetModel.findById(budgetId, {
        maxAmount: 1,
        spendAmount: 1,
        remainingAmount: 1,
        transactions: 1,
      })
        .populate({
          path: "transactions",
          match: match,
          options: {
            skip: skip,
            limit: limit,
            sort: { createdAt: -1 },
          },
          populate: transactionPopulate,
        })
        .lean();

      const budgetTxn = await BudgetModel.findById(budgetId, {
        transactions: 1,
      }).populate({
        path: "transactions",
        match: match,
        select: "_id",
      });

      const grouped = budget.transactions.reduce((acc, transaction) => {
        const formattedDate = moment(transaction.createdAt).format(
          "DD-MM-YYYY"
        );
        if (!acc[formattedDate]) {
          acc[formattedDate] = [];
        }
        acc[formattedDate].push({ ...transaction });
        return acc;
      }, {});

      budget.transactions = Object.keys(grouped).map((date) => ({
        date: date,
        transactions: grouped[date],
      }));

      const pagination = paginationDetails({
        limit: limit,
        page: req.body.page,
        totalItems: budgetTxn.transactions.length,
      });

      return successResponse({
        res,
        statusCode: 200,
        data: budget,
        pagination: pagination,
        message: "success",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "budget >> patch rollover ",
      });
    }
  };

  static patchRollover = async (req, res) => {
    try {
      const { budgetId } = req.params;

      const { userResponse } = req.body;

      const budget = await BudgetModel.findById(budgetId).select(
        "-transactions -headCategories -accounts -notifications"
      );

      if (!budget) {
        return errorResponse({
          res,
          message: "Budget not exist",
          statusCode: 404,
        });
      }

      budget.rollover.userResponse = userResponse;

      if (
        budget.rollover.userResponse === budgetRolloverUserResponse.ACCEPTED &&
        budget.rollover.generatedAmount > 0
      ) {
        budget.rollover.acceptedAmount = budget.rollover.generatedAmount;
        budget.rollover.generatedAmount = 0;
        budget.maxAmount += budget.rollover.acceptedAmount;
        budget.remainingAmount = budget.maxAmount - budget.spendAmount;
      }

      await budget.save();

      return successResponse({
        res,
        statusCode: 200,
        message: "success",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "budget >> patch rollover ",
      });
    }
  };

  static addHeadCategory = async (req, res) => {
    try {
      const { budgetId } = req.params;

      const budget = await BudgetModel.findById(budgetId);

      if (!budget) {
        return errorResponse({
          res,
          statusCode: 404,
          message: "Budget not found",
        });
      }

      for (const item of req.body) {
        const headCategory = budget.headCategories.find(
          (hc) => String(hc.headCategory._id) === String(item.headCategory)
        );
        if (!headCategory) {
          budget.headCategories.push({
            headCategory: item.headCategory,
            maxAmount: item.maxAmount,
            remainingAmount: item.maxAmount,
            spendLimitType: item.spendLimitType,
          });
        }
      }

      await budget.save();

      return successResponse({
        res,
        statusCode: 201,
        message: "success",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "add head category to budget",
      });
    }
  };

  static addCategory = async (req, res) => {
    try {
      const { budgetId, headCategoryId } = req.params;

      const budget = await BudgetModel.findOne({
        _id: budgetId,
        "headCategories.headCategory": headCategoryId,
      });

      if (!budget) {
        return errorResponse({
          res,
          statusCode: 404,
          message: "Budget not found with head category",
        });
      }

      const headCategory = budget.headCategories.find(
        (hc) => String(hc.headCategory._id) === String(headCategoryId)
      );

      for (const item of req.body) {
        const category = headCategory.categories.find(
          (c) => String(c.category._id) === String(item.category)
        );

        if (!category) {
          headCategory.categories.push({
            category: item.category,
            maxAmount: item.maxAmount,
            remainingAmount: item.maxAmount,
            spendLimitType: item.spendLimitType,
          });
        }
      }

      await budget.save();

      return successResponse({
        res,
        statusCode: 201,
        message: "success",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "add head category to budget",
      });
    }
  };

  static create = async (req, res) => {
    try {
      const reqUser = req.user;
      const group = req.group;

      const { name } = req.body;

      const filter = {
        name: name,
        createdBy: reqUser._id,
      };

      const existingBudget = await BudgetModel.findOne(filter);

      if (existingBudget) {
        return errorResponse({
          res,
          statusCode: 400,
          message: "Title already in use",
        });
      }

      const subscriptionType = reqUser?.subscriptionType;

      // Check Limit to create budget
      if (
        subscriptionType !== subscriptionTypeEnum.PREMIUM &&
        subscriptionType !== subscriptionTypeEnum.PROMO_CODE &&
        reqUser.role !== authRoleEnum.ADMIN
      ) {
        const count = await BudgetModel.countDocuments({
          createdBy: reqUser._id,
        });

        if (count >= 1) {
          return errorResponse({
            res,
            statusCode: 403,
            message: "Free tier users are limited up to 1 budget",
          });
        }
      }

      req.body.createdBy = group._id ? group.createBy : reqUser._id;

      let headCategoryRecords = [];

      if (req.user.role === authRoleEnum.ADMIN) {
        headCategoryRecords = await HeadCategoryModel.find(
          {
            user: null,
          },
          { _id: 1, categories: 1 }
        ).lean();
      } else {
        headCategoryRecords = await HeadCategoryModel.find(
          {
            user: reqUser._id,
          },
          { _id: 1, categories: 1 }
        ).lean();
      }

      const bodyHeadCategories = req.body.headCategories;

      // set default value
      req.body.headCategories = headCategoryRecords.map((headCategory) => {
        return {
          headCategory: headCategory._id,
          maxAmount: 0,
          spendAmount: 0,
          remainingAmount: 0,
          spendLimitType: budgetSpendLimitType.NO_LIMIT,
          categories: headCategory.categories.map((categoryId) => {
            return {
              category: categoryId,
              maxAmount: 0,
              spendAmount: 0,
              remainingAmount: 0,
              spendLimitType: budgetSpendLimitType.NO_LIMIT,
            };
          }),
        };
      });

      const budget = new BudgetModel(req.body);

      budget.remainingAmount = budget.maxAmount - budget.spendAmount;

      await budget.save();

      await this.updateBudgetHeadCategory({
        budget: budget,
        headCategories: bodyHeadCategories,
      });

      return successResponse({
        res,
        statusCode: 201,
        data: {
          _id: budget._id,
        },
        message: "success",
      });
    } catch (error) {
      console.log(error);
      return errorResponse({
        res,
        error,
        funName: "create.Budget",
      });
    }
  };

  static get = async (req, res) => {
    try {
      const reqUser = req.user;
      const group = req.group;

      const { status, period, name } = req.body;

      const { skip, limit } = paginationFun(req.body);

      const filter = {};

      const inGroup = group._id;

      if (inGroup) {
        const filteredAccountIds = group.accounts
          .filter((item) => item.permission !== accountPermissionEnum.NO_ACCESS)
          .map((item) => String(item._id));

        filter.accounts = {
          $not: { $elemMatch: { $nin: filteredAccountIds } },
        };
      } else {
        filter.createdBy = reqUser._id;
      }

      if (period) {
        filter.period = period;
      }

      if (status && status === budgetStatusType.OPEN) {
        filter.status = budgetStatusType.OPEN;
      } else if (status && status === budgetStatusType.CLOSE) {
        filter.status = budgetStatusType.CLOSE;
        filter.nextBudget = null;
      } else {
        filter["$or"] = [
          { status: budgetStatusType.OPEN },
          { status: budgetStatusType.CLOSE, nextBudget: null },
        ];
      }

      if (name) {
        const regex = new RegExp(name, "i");
        filter.name = { $regex: regex };
      }

      const result = await BudgetModel.find(filter)
        .select(budgetSelect)
        .populate(budgetPopulate)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const count = await BudgetModel.countDocuments(filter);

      const pagination = paginationDetails({
        limit: limit,
        page: req.body.page,
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
      return errorResponse({
        res,
        error,
        funName: "get.Budget",
      });
    }
  };

  static getDetails = async (req, res) => {
    const { budgetId } = req.params;
    try {
      const budget = await BudgetModel.findById(budgetId)
        .populate(budgetPopulate)
        .lean();

      if (!budget) {
        return errorResponse({
          res,
          statusCode: 404,
          message: "Budget not found",
        });
      }

      return successResponse({
        res,
        statusCode: 200,
        data: budget,
        message: "success",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "get.Budget",
      });
    }
  };

  static patch = async (req, res) => {
    try {
      const reqUser = req.user;

      const { budgetId } = req.params;
      const { name, headCategories, status, maxAmount, accounts, period } =
        req.body;

      const existingBudget = await BudgetModel.findById(budgetId);

      if (!existingBudget) {
        return errorResponse({
          res,
          statusCode: 404,
          message: "Budget not exist",
        });
      }

      // Make sure new title is not already in use
      if (name && name !== existingBudget.name) {
        const exist = await BudgetModel.findOne({
          name: name,
          createdBy: reqUser._id,
        });

        if (exist) {
          return errorResponse({
            res,
            statusCode: 400,
            message: "Title already in use",
          });
        }
      }

      // Patch budget
      const budget = await BudgetModel.findById(budgetId);
      if (name) {
        budget.name = name;
      }
      if (status) {
        budget.status = status;
      }
      if (maxAmount) {
        budget.maxAmount = maxAmount;
        budget.remainingAmount = budget.maxAmount - budget.spendAmount;
      }

      if (accounts) {
        budget.accounts = accounts;
      }

      if (period) {
        budget.period = period;
      }

      await budget.save();

      // Patch head category
      if (headCategories) {
        await this.updateBudgetHeadCategory({
          budget: budget,
          headCategories: headCategories,
        });
      }

      return successResponse({
        res,
        statusCode: 200,
        data: {
          _id: budgetId,
        },
        message: "success",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "patch.Budget",
      });
    }
  };

  static delete = async (req, res) => {
    try {
      const { budgetId } = req.params;

      const budget = await BudgetModel.countDocuments({
        _id: budgetId,
      }).lean();

      if (!budget) {
        return errorResponse({
          res,
          statusCode: 404,
          message: "Not fount",
        });
      }

      // Get prev budgets
      let budgetIdsToDelete = [];
      let currentBudgetId = budgetId;

      while (currentBudgetId) {
        const budget = await BudgetModel.findById(currentBudgetId).select(
          "prevBudget"
        );

        if (!budget) break;

        budgetIdsToDelete.push(String(budget._id));
        currentBudgetId = budget.prevBudget;
      }

      // Delete budget and its prev budget
      await BudgetModel.deleteMany({ _id: { $in: budgetIdsToDelete } });

      return successResponse({
        res,
        data: {
          _id: budgetId,
        },
        message: "success",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "delete.Budget",
      });
    }
  };

  static findUsersByAccounts = async (accountIds) => {
    const groups = await GroupModel.find({}, "members");
    const userIds = [];

    groups.forEach((group) => {
      group.members.forEach((member) => {
        // Check if all required accounts exist
        const hasAllAccounts = accountIds.every((accountId) =>
          member.accounts.some(
            (account) =>
              String(account.account) === String(accountId) &&
              account.permission !== accountPermissionEnum.NO_ACCESS
          )
        );

        if (hasAllAccounts) {
          userIds.push(String(member.user));
        }
      });
    });

    return [...new Set(userIds)];
  };

  static updateBudgetHeadCategory = async ({ budget, headCategories }) => {
    budget.headCategories.forEach((hc) => {
      const headCategory = headCategories.find(
        (item) => String(item.headCategory) === String(hc.headCategory._id)
      );

      if (headCategory) {
        const categories = hc.categories.map((c) => {
          const category = headCategory.categories?.find(
            (item) => String(item.category) === String(c.category._id)
          );

          if (category) {
            c.spendLimitType = category.spendLimitType;

            if (c.spendLimitType === budgetSpendLimitType.NO_LIMIT) {
              c.maxAmount = 0;
              c.remainingAmount = 0;
            } else if (c.spendLimitType === budgetSpendLimitType.LIMIT) {
              c.maxAmount = category.maxAmount;
              c.remainingAmount = c.maxAmount - c.spendAmount;
            }
          }

          return c;
        });

        hc.spendLimitType = headCategory.spendLimitType;
        hc.categories = categories;

        if (hc.spendLimitType === budgetSpendLimitType.NO_LIMIT) {
          hc.maxAmount = 0;
          hc.remainingAmount = 0;
        } else if (hc.spendLimitType === budgetSpendLimitType.LIMIT) {
          hc.maxAmount = headCategory.maxAmount;
          hc.remainingAmount = hc.maxAmount - hc.spendAmount;
        }
      }

      return hc;
    });

    await budget.save();
  };
}
export default controller;
