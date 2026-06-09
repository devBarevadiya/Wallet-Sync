import {
  accountPermissionEnum,
  allowedNotificationsEnum,
  paymentTypeEnum,
  transactionStatusEnum,
  transactionTypeEnum,
} from "../../config/enum.js";
import {
  errorResponse,
  successResponse,
  validateResponse,
} from "../../helper/apiResponse.js";
import { isExist } from "../../helper/isExist.js";
import { AuthErrorObj } from "../../middleware/verifyMiddleware.js";
import AccountModel from "../account/model.js";
import TransactionModel from "./model.js";
import {
  monthFilter,
  paginationDetails,
  paginationFun,
} from "../../helper/common.js";

import moment from "moment/moment.js";
import HeadCategoryModel from "../category/headCategoryModel.js";
import CategoryModel from "../category/model.js";
import UserModel from "../user/model.js";
import LabelModel from "../label/model.js";
import { createTransaction, deleteTransaction } from "./helper.js";
import { emitter } from "../../config/emitter.js";
import GroupModel from "../group/model.js";
import PayeeModel from "../payee/model.js";
import {
  balanceHistoryTxnAmountUpdate,
  balanceHistoryTxnDateUpdate,
  balanceHistoryTxnTypeUpdate,
} from "../balanceHistory/helper.js";

export const populate = [
  {
    path: "account",
    select: "title currency accountType",
    populate: { path: "currency", select: "symbol currency code" },
  },
  {
    path: "to",
    select: "title currency",
    populate: { path: "currency", select: "symbol currency code" },
  },
  { path: "labels", select: "title color" },
  { path: "category", select: "title icon iconType color" },
  { path: "currency", select: "symbol currency code" },
  { path: "user", select: "username" },
  { path: "payee", select: "-user" },
];

class controller {
  static create = async (req, res) => {
    try {
      const user = req.user;
      const userId = String(user._id);

      const hasPermission = req.group.accounts.some(
        (item) =>
          String(item._id) === req.body.account &&
          (item.permission === accountPermissionEnum.ADMIN_ACCESS ||
            item.permission === accountPermissionEnum.TRACK_AND_READ)
      );

      if (!hasPermission) return validateResponse(res, AuthErrorObj);

      req.body.user = userId;

      const transaction = await createTransaction(req.body);

      return successResponse({
        res,
        statusCode: 201,
        data: transaction,
        message: "Transaction created successfully",
      });
    } catch (error) {
      console.log(error);
      return errorResponse({
        res,
        error,
        funName: "create.Transaction",
      });
    }
  };

  static get = async (req, res) => {
    try {
      const {
        fromDate,
        toDate,
        categories,
        headCategories,
        labels,
        currencies,
        recordTypes,
        minAmount,
        maxAmount,
        paymentTypes,
        recordStatuses,
        search,
        accounts,
        payee,
        pagination,
      } = req.query;

      const accountIds = [];

      const groupAccountIds = req.group.accounts
        .filter((item) => item.permission !== accountPermissionEnum.NO_ACCESS)
        .map((item) => String(item._id));

      // Push all valid Account ids from query for filter
      if (accounts) {
        for (const accountId of accounts) {
          if (groupAccountIds.includes(accountId)) {
            accountIds.push(accountId);
          }
        }
      } else {
        accountIds.push(...groupAccountIds);
      }

      const filter = {
        $and: [
          {
            $or: [
              { account: { $in: Array.from(new Set(accountIds)) } },
              { to: { $in: Array.from(new Set(accountIds)) } },
            ],
          },
        ],
      };

      // Date filter
      if (fromDate && toDate) {
        filter.date = {
          $gte: moment(fromDate, "YYYY-MM-DD").startOf("day").toDate(),
          $lte: moment(toDate, "YYYY-MM-DD").endOf("day").toDate(),
        };
      }

      // Categories filter
      if (categories) {
        filter.category = { $in: categories };
      }

      // Head categories filter
      if (headCategories) {
        filter.headCategory = { $in: headCategories };
      }

      // Labels category filter
      if (labels) {
        filter.labels = { $in: labels };
      }

      // Currencies filter
      if (currencies) {
        filter.currency = { $in: currencies };
      }

      // Record type filter
      if (recordTypes) {
        filter.type = { $in: recordTypes };
      }

      // Amount range filter
      if (minAmount) {
        filter.amount = { $gte: minAmount };
      }

      if (maxAmount) {
        filter.amount = { $lte: maxAmount };
      }

      if (minAmount && maxAmount) {
        filter.amount = { $gte: minAmount, $lte: maxAmount };
      }

      // Payment type filter
      if (paymentTypes) {
        filter.paymentType = { $in: paymentTypes };
      }

      // Record states filter
      if (recordStatuses) {
        filter.status = { $in: recordStatuses };
      }

      // Payee states filter
      if (payee) {
        filter.payee = { $in: payee };
      }

      // Search filter
      if (search) {
        const categoryObjectIds = await CategoryModel.distinct("_id", {
          title: new RegExp(search, "i"),
          user: String(req.group.createBy),
        }).lean();

        const categoryIds = categoryObjectIds.map((id) => String(id));

        filter.$and.push({
          $or: [
            { category: { $in: categoryIds } },
            { note: { $regex: search, $options: "i" } },
          ],
        });
      }

      let transactions;
      let paginationObj;

      if (pagination === "false") {
        transactions = await TransactionModel.find(filter)
          .sort({ date: -1 })
          .select("-createdAt -updatedAt")
          .populate(populate);
      } else {
        const { skip, limit } = paginationFun(req.query);

        transactions = await TransactionModel.find(filter)
          .sort({ date: -1 })
          .skip(skip)
          .limit(limit)
          .select("-createdAt -updatedAt")
          .populate(populate);

        const count = await TransactionModel.countDocuments(filter);

        paginationObj = paginationDetails({
          limit: limit,
          page: req.query.page,
          totalItems: count,
        });
      }

      const groupedTransactions = {};

      for (const transaction of transactions) {
        const formattedDate = moment(transaction.date).format("YYYY-MM-DD");

        if (!groupedTransactions[formattedDate]) {
          groupedTransactions[formattedDate] = [];
        }

        groupedTransactions[formattedDate].push(transaction);
      }

      const result = [];

      for (const date in groupedTransactions) {
        result.push({
          date: date,
          transaction: groupedTransactions[date],
        });
      }

      return successResponse({
        res,
        statusCode: 200,
        data: result,
        message: "Transaction fetched successfully",
        pagination: paginationObj,
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "get.Transaction",
      });
    }
  };

  static getFilterOptions = async (req, res) => {
    try {
      const groupAdmin = String(req.group.createBy);
      const userId = req.user?._id;

      const [accounts, headCategories, labels, user, payee] = await Promise.all(
        [
          AccountModel.find({ user: groupAdmin })
            .populate({
              path: "accountType",
              select: "title icon",
            })
            .select("_id title accountType")
            .lean(),

          HeadCategoryModel.find({ user: groupAdmin })
            .populate({
              path: "categories",
              select: "_id title icon",
            })
            .select("_id title icon category")
            .lean(),

          LabelModel.find({ user: groupAdmin }).select("title color").lean(),

          UserModel.findById(groupAdmin)
            .populate({
              path: "currencies.currency",
              select: "symbol currency code",
            })
            .select("currencies")
            .lean(),

          PayeeModel.find({ user: userId }).select("_id name").lean(),
        ]
      );

      // Account title
      const accountTitles = accounts.map((item) => ({
        _id: item._id,
        title: item.title,
        accountType: item.accountType,
      }));

      // Account types
      const typeAndAccountsObj = {};

      for (const account of accounts) {
        if (!typeAndAccountsObj[account.accountType.title]) {
          typeAndAccountsObj[account.accountType.title] = [account._id];
        } else {
          typeAndAccountsObj[account.accountType.title].push(account._id);
        }
      }

      const accountTypes = Object.entries(typeAndAccountsObj).map(
        ([title, accountIds]) => {
          return {
            title: title,
            accountIds: accountIds,
          };
        }
      );

      // Currencies
      const currencies = user.currencies.map((currency) => currency.currency);

      // Record types
      const recordTypes = Object.values(transactionTypeEnum);

      // Payment Types
      const paymentTypes = Object.values(paymentTypeEnum);

      // Record status types
      const recordStatusTypes = Object.values(transactionStatusEnum);

      return successResponse({
        res,
        statusCode: 200,
        message: "Filter options fetched successfully",
        data: {
          accountTitles,
          accountTypes,
          headCategories,
          labels,
          currencies,
          recordTypes,
          paymentTypes,
          recordStatusTypes,
          payee,
        },
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "get.getFilterOptions",
      });
    }
  };

  static getByHead = async (req, res) => {
    try {
      const { id } = req.params;
      const doc = await isExist(res, id, HeadCategoryModel);

      if (String(doc.user) !== String(req.group.createBy))
        return validateResponse(res, AuthErrorObj);

      const { skip, limit } = paginationFun(req.query);
      const { fromDate, toDate } = monthFilter(req.query);

      const accountIds = req.group.accounts
        .filter((item) => item.permission !== accountPermissionEnum.NO_ACCESS)
        .map((item) => item._id);

      let filter = {
        account: { $in: accountIds },
        date: { $gte: fromDate, $lt: toDate },
        category: { $in: doc.categories },
      };
      const transactions = await TransactionModel.find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ date: -1 })
        .select("-user -createdAt -updatedAt")
        .populate(populate);

      let count = await TransactionModel.countDocuments(filter);

      const pagination = paginationDetails({
        limit: limit,
        page: req.query.page,
        totalItems: count,
      });

      const result = [];

      transactions.forEach((element) => {
        const date = moment(element.date).format("YYYY-MM-DD");
        const findDate = result.find((item) => item.date === date);
        if (result.find((item) => item.date === date)) {
          findDate.transaction.push(element);
        } else {
          result.push({ date, transaction: [element] });
        }
      });

      return successResponse({
        res,
        statusCode: 200,
        data: result,
        message: "Transaction fetched successfully",
        pagination,
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "get.Transaction",
      });
    }
  };

  static getByCategory = async (req, res) => {
    try {
      const { id } = req.params;
      const doc = await isExist(res, id, CategoryModel);

      if (String(doc.user) !== String(req.group.createBy))
        return validateResponse(res, AuthErrorObj);

      const { skip, limit } = paginationFun(req.query);
      const { fromDate, toDate } = monthFilter(req.query);

      const accountIds = req.group.accounts
        .filter((item) => item.permission !== accountPermissionEnum.NO_ACCESS)
        .map((item) => item._id);

      let filter = {
        account: { $in: accountIds },
        date: { $gte: fromDate, $lt: toDate },
        category: id,
      };
      const transactions = await TransactionModel.find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ date: -1 })
        .select("-user -createdAt -updatedAt")
        .populate(populate);

      let count = await TransactionModel.countDocuments(filter);

      const pagination = paginationDetails({
        limit: limit,
        page: req.query.page,
        totalItems: count,
      });

      const result = [];

      transactions.forEach((element) => {
        const date = moment(element.date).format("YYYY-MM-DD");
        const findDate = result.find((item) => item.date === date);
        if (result.find((item) => item.date === date)) {
          findDate.transaction.push(element);
        } else {
          result.push({ date, transaction: [element] });
        }
      });

      return successResponse({
        res,
        statusCode: 200,
        data: result,
        message: "Transaction fetched successfully",
        pagination,
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "get.Transaction",
      });
    }
  };

  static getDetails = async (req, res) => {
    const { id } = req.params;
    try {
      const doc = await isExist(res, id, TransactionModel);

      const checkPermision = req.group.accounts.some(
        (item) =>
          String(item._id) === doc.account &&
          item.permission !== accountPermissionEnum.NO_ACCESS
      );

      if (String(doc.user) !== String(req.group.createBy) && !checkPermision)
        return validateResponse(res, AuthErrorObj);

      const result = await TransactionModel.findById(id)
        .select("-user")
        .populate(populate);

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
        funName: "get.Transaction",
      });
    }
  };

  static delete = async (req, res) => {
    const { id } = req.params;
    try {
      const transaction = await TransactionModel.findById(id)
        .populate(populate)
        .lean();

      if (!transaction) {
        errorResponse({
          res,
          statusCode: 404,
          message: "Transaction not found",
        });
        return;
      }

      const hasPermission = req.group.accounts.some(
        (item) =>
          String(item._id) === String(transaction.account._id) &&
          (item.permission === accountPermissionEnum.ADMIN_ACCESS ||
            item.permission === accountPermissionEnum.TRACK_AND_READ)
      );

      if (
        String(transaction.user._id) !== String(req.group.createBy) &&
        !hasPermission
      ) {
        return validateResponse(res, AuthErrorObj);
      }

      await deleteTransaction(id);

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
        funName: "delete.Transaction",
      });
    }
  };

  static deleteMany = async (req, res) => {
    try {
      const { ids } = req.body;

      for (const id of ids) {
        const transaction = await TransactionModel.findById(id)
          .populate(populate)
          .lean();

        if (!transaction) {
          continue;
        }

        const hasPermission = req.group.accounts.some(
          (item) =>
            String(item._id) === String(transaction.account._id) &&
            (item.permission === accountPermissionEnum.ADMIN_ACCESS ||
              item.permission === accountPermissionEnum.TRACK_AND_READ)
        );

        if (
          String(transaction.user._id) !== String(req.group.createBy) &&
          !hasPermission
        ) {
          return validateResponse(res, AuthErrorObj);
        }

        await deleteTransaction(id);
      }

      return successResponse({
        res,
        statusCode: 200,
        message: "Transactions deleted successfully",
        data: ids,
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "deleteMany transaction",
      });
    }
  };

  static patch = async (req, res) => {
    const { id } = req.params;
    try {
      const existingTransaction = await TransactionModel.findById(id).populate(
        populate
      );

      if (!existingTransaction) {
        return errorResponse({
          res,
          statusCode: 404,
          message: "Transaction not found",
        });
      }

      let hasPermission = false;

      for (const account of req.group.accounts) {
        if (
          String(existingTransaction.account._id) === String(account._id) &&
          account.permission === accountPermissionEnum.ADMIN_ACCESS
        ) {
          hasPermission = true;
        }
      }

      if (!hasPermission) {
        return validateResponse(res, AuthErrorObj);
      }

      if (req.body.to === "") req.body.to = null;

      await controller.managePreEntry(existingTransaction);

      const transaction = await TransactionModel.findByIdAndUpdate(
        id,
        {
          $set: req.body,
        },
        { new: true }
      ).populate(populate);

      await controller.manageNewEntry(transaction);

      // Update corresponding record
      if (transaction.fromTxn || transaction.toTxn) {
        await controller.managePreEntry(transaction);

        const toTxn = await TransactionModel.findByIdAndUpdate(
          transaction.fromTxn || transaction.toTxn,
          {
            $set: req.body,
          },
          { new: true }
        ).populate(populate);

        await controller.manageNewEntry(toTxn);
      }

      // Send notification to group admin
      if (transaction.type !== transactionTypeEnum.TRANSFER) {
        const group = await GroupModel.findOne({
          "members.user": transaction.user._id,
          "members.accounts.account": transaction.account._id,
        });

        if (group) {
          const groupAdminId = group.createBy._id;
          const admin = await UserModel.findById(groupAdminId)
            .select("allowedNotifications deviceTokens")
            .lean();

          if (
            admin.allowedNotifications?.includes(
              allowedNotificationsEnum.GROUP_ACTIVITY_REMINDER
            )
          ) {
            const deviceTokens = admin.deviceTokens?.map(
              (item) => item.deviceToken
            );
            emitter.emit("notification", {
              userId: String(admin._id),
              tokens: deviceTokens,
              title: "Group activity happened!",
              body: "Transaction updated in group",
            });
          }
        }
      }

      delete transaction.user;

      // Handle date change
      if (
        req.body?.date &&
        !moment(req.body.date).isSame(existingTransaction.date, "day")
      ) {
        const txnData = {
          newDate: req.body.date,
          oldDate: existingTransaction.date,
          amount: existingTransaction.amount,
          transactionId: existingTransaction._id,
          accountId: existingTransaction.account,
          toAccountId: existingTransaction.to,
          type: existingTransaction.type,
        };

        await balanceHistoryTxnDateUpdate(txnData);
      }

      // on amount update
      if (
        req?.body?.amount !== undefined &&
        req?.body?.amount !== null &&
        req?.body?.amount !== existingTransaction.amount
      ) {
        const transactionData = {
          newAmount: req.body.amount,
          oldAmount: existingTransaction.amount,
          categoryId: existingTransaction.category._id,
          headCategoryId: existingTransaction.headCategory._id,
          transactionId: existingTransaction._id,
          date: req?.body?.date || existingTransaction.date,
          accountId: existingTransaction.account,
          toAccountId: existingTransaction.to,
          type: existingTransaction.type,
          fromTxn: existingTransaction.fromTxn,
          toTxn: existingTransaction.toTxn,
        };

        emitter.emit("transaction_amount_update", transactionData);

        await balanceHistoryTxnAmountUpdate(transactionData);
      }

      // on type update
      if (req?.body?.type !== existingTransaction.type) {
        const updatedTxn = await TransactionModel.findById(id);

        const txnData = {
          date: updatedTxn.date,
          amount: updatedTxn.amount,
          transactionId: updatedTxn._id,
          accountId: updatedTxn.account,
          toAccountId: updatedTxn.to,
          prevType: existingTransaction.type,
          newType: updatedTxn.type,
          fromTxn: updatedTxn.fromTxn,
          toTxn: updatedTxn.toTxn,
        };

        await balanceHistoryTxnTypeUpdate(txnData);
      }

      // On account
      if (
        req.body?.account &&
        req.body.account !== String(existingTransaction.account._id)
      ) {
        emitter.emit("update:transaction:account", {
          accountId: req.body.account,
          transactionId: String(existingTransaction._id),
        });
      }

      successResponse({
        res,
        statusCode: 200,
        data: transaction,
        message: "Transaction updated successfully",
      });
    } catch (error) {
      errorResponse({
        res,
        error,
        funName: "patch.Transaction",
      });
    }
  };

  static async manageNewEntry(result) {
    const { type, amount, currency, to, account } = result;

    const updateAccountBalance = async (accountId, incAmount) => {
      const updatedAccount = await AccountModel.findByIdAndUpdate(
        accountId,
        { $inc: { balance: incAmount } },
        { new: true }
      ).lean();
    };

    if (type === transactionTypeEnum.TRANSFER) {
      if (account?._id) {
        const excAmount = amount;
        await updateAccountBalance(account._id, -excAmount);
      }

      if (to?._id) {
        const incAmount = amount;
        await updateAccountBalance(to._id, incAmount);
      }
    } else {
      const totalAmount = amount;

      const updateQuery = {
        $inc: {
          balance:
            type === transactionTypeEnum.EXPENSE ? -totalAmount : totalAmount,
        },
      };

      await AccountModel.findByIdAndUpdate(account._id, updateQuery, {
        new: true,
      }).lean();
    }
  }

  static async managePreEntry(result) {
    const { type, amount, to, account } = result;

    if (type === transactionTypeEnum.TRANSFER) {
      if (account?._id) {
        const excAmount = amount;

        const updatedAccount = await AccountModel.findByIdAndUpdate(
          account._id,
          { $inc: { balance: excAmount } },
          { new: true }
        ).lean();
      }

      if (to?._id) {
        const incAmount = amount;

        const updatedAccount = await AccountModel.findByIdAndUpdate(
          to?._id,
          { $inc: { balance: -incAmount } },
          { new: true }
        ).lean();
      }
    } else {
      let totalAmount = 0;

      if (type === transactionTypeEnum.INCOME) {
        totalAmount = -amount;
      } else if (type === transactionTypeEnum.EXPENSE) {
        totalAmount = amount;
      }

      const updatedAccount = await AccountModel.findByIdAndUpdate(
        account._id,
        { $inc: { balance: totalAmount } },
        { new: true }
      ).lean();
    }
  }
}
export default controller;
