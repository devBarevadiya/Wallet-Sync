import {
  accountPermissionEnum,
  analyticsTypeEnum,
  authRoleEnum,
  transactionTypeEnum,
} from "../../config/enum.js";
import {
  errorResponse,
  successResponse,
  validateResponse,
} from "../../helper/apiResponse.js";

import { monthFilter } from "../../helper/common.js";

import moment from "moment/moment.js";
import TransactionModel from "../transaction/model.js";
import AccountModel from "../account/model.js";
import HeadCategoryModel from "../category/headCategoryModel.js";
import { isExist } from "../../helper/isExist.js";
import {
  analyzeBalanceTrend,
  analyzeCashFlow,
  analyzeCashFlowTable,
  analyzeCurrency,
  analyzeLastRecords,
  analyzeReport,
  analyzeReportDetails,
  analyzeSpending,
  analyzeTotalBalance,
} from "../dashboard/helper.js";
import { AuthErrorObj } from "../../middleware/verifyMiddleware.js";

const transactionPopulate = [
  {
    path: "account",
    select: "title currency",
    populate: { path: "currency", select: "symbol currency code" },
  },
  {
    path: "to",
    select: "title currency",
    populate: { path: "currency", select: "symbol currency code" },
  },
  { path: "labels", select: "title color" },
  { path: "category", select: "title icon iconType color" },
  { path: "headCategory", select: "title type" },
  { path: "currency", select: "symbol currency code" },
];

class controller {
  static getAnalytics = async (req, res) => {
    try {
      const {
        accounts,
        LAST_RECORD,
        SPENDING,
        CURRENCY,
        TOTAL_BALANCE,
        BALANCE_TREND,
        CASH_FLOW,
        CASH_FLOW_TABLE,
        REPORT,
        REPORT_DETAILS,
      } = req.body;
      const accountIds = [];

      const groupAccountIds = req.group.accounts
        .filter((item) => item.permission !== accountPermissionEnum.NO_ACCESS)
        .map((item) => String(item._id));

      if (accounts?.length > 0) {
        for (const accountId of groupAccountIds) {
          if (accounts.includes(accountId)) {
            accountIds.push(accountId);
          }
        }
      } else {
        accountIds.push(...groupAccountIds);
      }

      const chartNames = [];
      const promises = [];
      const responseData = {};

      if (LAST_RECORD?.include) {
        chartNames.push(analyticsTypeEnum.LAST_RECORD);
        promises.push(
          analyzeLastRecords({
            accountIds,
            transactionPopulate,
          })
        );
      }

      if (SPENDING?.include) {
        const { fromDate, toDate } = SPENDING.parameters;
        chartNames.push(analyticsTypeEnum.SPENDING);
        promises.push(
          analyzeSpending({
            accountIds,
            fromDate,
            toDate,
          })
        );
      }

      if (CURRENCY?.include) {
        chartNames.push(analyticsTypeEnum.CURRENCY);
        promises.push(
          analyzeCurrency({
            accountIds,
          })
        );
      }

      if (TOTAL_BALANCE?.include) {
        chartNames.push(analyticsTypeEnum.TOTAL_BALANCE);
        promises.push(
          analyzeTotalBalance({
            accountIds,
          })
        );
      }

      if (BALANCE_TREND?.include) {
        const { fromDate, toDate } = BALANCE_TREND.parameters;
        chartNames.push(analyticsTypeEnum.BALANCE_TREND);
        promises.push(
          analyzeBalanceTrend({
            accountIds,
            fromDate,
            toDate,
          })
        );
      }

      if (CASH_FLOW?.include) {
        const { fromDate, toDate } = CASH_FLOW.parameters;
        chartNames.push(analyticsTypeEnum.CASH_FLOW);
        promises.push(
          analyzeCashFlow({
            accountIds,
            fromDate,
            toDate,
          })
        );
      }

      if (CASH_FLOW_TABLE?.include) {
        const { fromDate, toDate } = CASH_FLOW_TABLE.parameters;
        chartNames.push(analyticsTypeEnum.CASH_FLOW_TABLE);
        promises.push(
          analyzeCashFlowTable({
            accountIds,
            fromDate,
            toDate,
          })
        );
      }

      if (REPORT?.include) {
        const { fromDate, toDate } = REPORT.parameters;
        chartNames.push(analyticsTypeEnum.REPORT);
        promises.push(
          analyzeReport({
            group: req.group,
            accountIds,
            fromDate,
            toDate,
          })
        );
      }

      if (REPORT_DETAILS?.include) {
        const { fromDate, toDate, headCategoryId } = REPORT_DETAILS.parameters;

        const doc = await isExist(res, headCategoryId, HeadCategoryModel);

        if (
          req.user.role !== authRoleEnum.ADMIN &&
          String(doc.user) !== String(req.user._id)
        ) {
          return validateResponse(res, AuthErrorObj);
        }

        chartNames.push(analyticsTypeEnum.REPORT_DETAILS);
        promises.push(
          analyzeReportDetails({
            headCategoryId,
            fromDate,
            toDate,
          })
        );
      }

      const results = await Promise.all(promises);

      for (let i = 0; i < chartNames.length; i++) {
        responseData[chartNames[i]] = results[i];
      }

      return successResponse({
        res,
        statusCode: 200,
        data: responseData,
        message: "Analytics fetched successfully",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "getAnalytics",
      });
    }
  };

  static getLastRecord = async (req, res) => {
    try {
      const accountIds = req.group.accounts
        .filter((item) => item.permission !== accountPermissionEnum.NO_ACCESS)
        .map((item) => item._id);

      let filter = {
        account: { $in: accountIds },
      };
      const result = await TransactionModel.find(filter)
        .limit(3)
        .sort({ date: -1 })
        .select("-user -createdAt -updatedAt")
        .populate(transactionPopulate);

      return successResponse({
        res,
        statusCode: 200,
        data: result,
        message: "Transaction fetched successfully",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "get.getLastRecord",
      });
    }
  };

  static getSpending = async (req, res) => {
    try {
      const { fromDate, toDate } = monthFilter(req.query);

      const accountIds = req.group.accounts
        .filter((item) => item.permission !== accountPermissionEnum.NO_ACCESS)
        .map((item) => item._id);

      let filter = {
        account: { $in: accountIds },
        type: transactionTypeEnum.EXPENSE,
        date: { $gte: fromDate, $lt: toDate },
      };

      const result = await TransactionModel.find(filter)
        .select("category amount")
        .populate([
          { path: "category", select: "title color" },
          { path: "currency", select: "code" },
        ]);

      const data = [];
      for (const element of result) {
        const { amount, category } = element;
        const totalAmount = amount;

        let findData = data.find((item) => item._id === category._id);

        if (!findData) {
          data.push({
            _id: category._id,
            title: category.title,
            color: category.color,
            amount: totalAmount,
          });
        } else {
          findData.amount += totalAmount;
        }
      }

      return successResponse({
        res,
        statusCode: 200,
        data: data,
        message: "Transaction fetched successfully",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "get.getSpending",
      });
    }
  };

  static getCurrency = async (req, res) => {
    try {
      const accountIds = req.group.accounts
        .filter((item) => item.permission !== accountPermissionEnum.NO_ACCESS)
        .map((item) => item._id);

      const result = await AccountModel.aggregate([
        {
          $match: { _id: { $in: accountIds } },
        },
        {
          $lookup: {
            from: "currencies",
            localField: "currency",
            foreignField: "_id",
            as: "currency",
          },
        },
        {
          $unwind: "$currency",
        },
        {
          $group: {
            _id: "$currency.code",
            balance: { $sum: "$balance" },
          },
        },
        {
          $project: {
            _id: 0,
            currency: "$_id",
            balance: 1,
          },
        },
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
        funName: "get.getCurrency",
      });
    }
  };

  static getBalance = async (req, res) => {
    try {
      const accountIds = req.group.accounts
        .filter((item) => item.permission !== accountPermissionEnum.NO_ACCESS)
        .map((item) => item._id);
      const result = await AccountModel.aggregate([
        {
          $match: { _id: { $in: accountIds } },
        },
        {
          $lookup: {
            from: "currencies",
            localField: "currency",
            foreignField: "_id",
            as: "currencyData",
          },
        },
        {
          $unwind: "$currencyData",
        },
        {
          $group: {
            _id: "$currencyData.code",
            totalBalance: { $sum: "$balance" },
          },
        },
        {
          $project: {
            _id: 0,
            currency: "$_id",
            totalBalance: 1,
          },
        },
      ]);

      // Calculating total balance in the user's currency

      const totalBalanceInUserCurrency = result.reduce(
        (total, { totalBalance, currency }) => total + totalBalance,
        0
      );

      return successResponse({
        res,
        statusCode: 200,
        data: totalBalanceInUserCurrency,
        message: "Balance fetched successfully",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "getBalance.Account",
      });
    }
  };

  static getBalanceTrend = async (req, res) => {
    try {
      const { fromDate, toDate } = monthFilter(req.query);

      const accountIds = req.group.accounts
        .filter((item) => item.permission !== accountPermissionEnum.NO_ACCESS)
        .map((item) => item._id);

      const transactions = await TransactionModel.aggregate([
        {
          $match: {
            account: { $in: accountIds },
            date: { $gte: new Date(fromDate), $lt: new Date(toDate) },
          },
        },

        {
          $lookup: {
            from: "currencies",
            localField: "currency",
            foreignField: "_id",
            as: "currency",
          },
        },
        {
          $unwind: "$currency",
        },
        {
          $project: {
            _id: 0,
            amount: 1,
            date: 1,
            type: 1,
            account: 1,
            to: 1,
            currency: "$currency.code",
          },
        },
      ]);

      const result = [];

      for (const element of transactions) {
        const { account, to, type, date, amount, currency } = element;
        const formattedDate = moment(date).format("DD MMM YYYY");

        const totalAmount = amount;

        const findDateIndex = result.findIndex(
          (item) => item.date === formattedDate
        );

        let balanceChange = 0;

        if (type === transactionTypeEnum.EXPENSE) {
          balanceChange = -totalAmount;
        } else if (type === transactionTypeEnum.INCOME) {
          balanceChange = totalAmount;
        } else if (type === transactionTypeEnum.TRANSFER && !(account && to)) {
          balanceChange = !account && to ? totalAmount : -totalAmount;
        }

        if (findDateIndex !== -1) {
          result[findDateIndex].balance += balanceChange;
        } else {
          const lastRecord = result[result.length - 1];
          const balance = lastRecord ? lastRecord.balance : 0;
          result.push({
            date: formattedDate,
            balance: balance + balanceChange,
          });
        }
      }

      return successResponse({
        res,
        statusCode: 200,
        data: result,
        message: "Transaction fetched successfully",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "get.getBalanceTrend",
      });
    }
  };

  static getCashFlow = async (req, res) => {
    try {
      const { fromDate, toDate } = monthFilter(req.query);
      const accountIds = req.group.accounts
        .filter((item) => item.permission !== accountPermissionEnum.NO_ACCESS)
        .map((item) => item._id);

      let filter = {
        account: { $in: accountIds },
        $or: [
          { type: transactionTypeEnum.INCOME },
          { type: transactionTypeEnum.EXPENSE },
        ],
        date: { $gte: fromDate, $lt: toDate },
      };

      const result = await TransactionModel.find(filter)
        .select("-_id amount type")
        .populate([{ path: "currency", select: "code -_id" }]);

      let income = 0;
      let expense = 0;
      for (const element of result) {
        const { amount, currency } = element;
        if (element.type === transactionTypeEnum.INCOME) {
          income += amount;
        } else {
          expense += amount;
        }
      }

      return successResponse({
        res,
        statusCode: 200,
        data: {
          balance: income - expense,
          income,
          expense,
        },
        message: "Account fetched successfully",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "get.getCashFlow",
      });
    }
  };

  static getCashFlowTable = async (req, res) => {
    try {
      const { fromDate, toDate } = monthFilter(req.query);

      const accountIds = req.group.accounts
        .filter((item) => item.permission !== accountPermissionEnum.NO_ACCESS)
        .map((item) => item._id);
      let filter = {
        account: { $in: accountIds },
        $or: [
          { type: transactionTypeEnum.INCOME },
          { type: transactionTypeEnum.EXPENSE },
        ],
        date: { $gte: fromDate, $lt: toDate },
      };

      const transactions = await TransactionModel.find(filter)
        .select("-_id amount type")
        .populate([{ path: "currency", select: "code -_id" }]);

      const result = {
        INCOME: { count: 0, amount: 0 },
        EXPENSE: { count: 0, amount: 0 },
      };

      for (const element of transactions) {
        const { type, currency, amount } = element;

        result[type].amount += amount;
        result[type].count++;
      }

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
        funName: "get.getCashFlowTable",
      });
    }
  };

  static getReport = async (req, res) => {
    try {
      const { fromDate, toDate } = monthFilter(req.query);

      const category = await HeadCategoryModel.find({
        user: req.group.createBy,
      }).select("categories title type");

      const accountIds = req.group.accounts
        .filter((item) => item.permission !== accountPermissionEnum.NO_ACCESS)
        .map((item) => item._id);

      const transactions = await TransactionModel.find({
        account: { $in: accountIds },
        date: { $gte: new Date(fromDate), $lt: new Date(toDate) },
      })
        .select("amount currency category -_id")
        .populate({ path: "currency", select: "code -_id" });

      const result = {
        INCOME: { total: 0, category: [] },
        EXPENSE: { total: 0, category: [] },
      };

      for (const element of category) {
        let totalAmount = 0;
        const { categories } = element;

        for (const categoryElem of categories) {
          const findTransaction = transactions.filter(
            (item) => String(item.category) === String(categoryElem)
          );
          for (const transactionElement of findTransaction) {
            const amount = transactionElement.amount;
            totalAmount += amount;
          }
        }

        result[element.type].total += totalAmount;
        result[element.type].category.push({
          amount: totalAmount,
          title: element.title,
          _id: element._id,
        });
      }

      result.total = result.INCOME.total - result.EXPENSE.total;
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
        funName: "get.getReport",
      });
    }
  };

  static getReportDetails = async (req, res) => {
    try {
      const { id } = req.params;

      const doc = await isExist(res, id, HeadCategoryModel);

      if (
        req.user.role !== authRoleEnum.ADMIN &&
        String(doc.user) !== String(req.user._id)
      )
        return validateResponse(res, AuthErrorObj);

      const { fromDate, toDate } = monthFilter(req.query);

      const { categories, title } = await HeadCategoryModel.findById(id)
        .select("categories -_id title")
        .populate({ path: "categories", select: "title" });

      const transactions = await TransactionModel.find({
        date: { $gte: new Date(fromDate), $lt: new Date(toDate) },
        category: { $in: categories.map((item) => item._id) },
      })
        .select("amount currency category -_id")
        .populate([
          { path: "currency", select: "code -_id" },
          { path: "category", select: "title" },
        ]);

      const result = { title, category: [] };

      for (const element of categories) {
        const findTransactions = transactions.filter(
          (item) => String(item.category._id) === String(element._id)
        );
        let totalAmount = 0;
        for (const subElement of findTransactions) {
          const { currency, amount } = subElement;
          totalAmount += amount;
        }

        result.category.push({
          _id: element._id,
          title: element.title,
          amount: totalAmount,
        });
      }

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
        funName: "get.getReportDetails",
      });
    }
  };
}
export default controller;
