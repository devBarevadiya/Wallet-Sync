import moment from "moment";
import { emitter } from "../../config/emitter.js";
import {
  allowedNotificationsEnum,
  creditDebitEnum,
  transactionTypeEnum,
} from "../../config/enum.js";

import HeadCategoryModel from "../category/headCategoryModel.js";
import GroupModel from "../group/model.js";
import UserModel from "../user/model.js";
import controller, { populate } from "./controller.js";
import TransactionModel from "./model.js";
import AccountModel from "../account/model.js";
import { balanceHistoryTxnAmountUpdate } from "../balanceHistory/helper.js";

export const transactionPopulate = [
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
  {
    path: "user",
    select: "-password",
  },
];

export const createTransaction = async (data) => {
  const headCategory = await HeadCategoryModel.findOne({
    categories: data.category,
  }).lean();

  data.headCategory = headCategory?._id;
  data.date = data?.date || moment().toDate();

  if (data.type === transactionTypeEnum.TRANSFER) {
    data.creditDebit = creditDebitEnum.DEBIT;
  }

  // Create record for debited amount user
  const newTransaction = await TransactionModel.create(data);

  // Create record for credited amount user
  if (newTransaction.type === transactionTypeEnum.TRANSFER) {
    const toAccount = await AccountModel.findById(data.to);

    if (!toAccount) throw new Error("Transaction AccountTo user not found");

    const toTxn = await TransactionModel.create({
      user: String(toAccount.user),
      type: data.type,
      currency: data.currency,
      amount: data.amount,
      account: data.account,
      to: data.to,
      category: data.category,
      headCategory: data.headCategory,
      paymentType: data.paymentType,
      status: data.status,
      date: data.date,
      creditDebit: creditDebitEnum.CREDIT,
      note: data.note,
      labels: data.labels,
      payee: data?.payee ? data.payee : null,
      fromTxn: newTransaction._id,
    });

    newTransaction.toTxn = toTxn._id;
    await newTransaction.save();
  }

  const transaction = await TransactionModel.findById(newTransaction._id)
    .populate(transactionPopulate)
    .lean();

  await controller.manageNewEntry(transaction);

  // Emit transaction record
  emitter.emit("transaction", { ...data, _id: newTransaction._id });

  const user = transaction.user;

  const deviceTokens = user.deviceTokens?.map((item) => item.deviceToken);

  const notifyOnTxnAccounts = user.notifyOnTxnAccounts?.map((item) =>
    String(item._id)
  );

  const notifyOnTxnLabels = user.notifyOnTxnLabels?.map((item) =>
    String(item._id)
  );
  const notifyOnTxnHeadCategories = user.notifyOnTxnHeadCategories?.map(
    (item) => String(item._id)
  );

  if (transaction.type === transactionTypeEnum.INCOME) {
    emitter.emit("notification", {
      userId: String(user._id),
      tokens: deviceTokens,
      title: `${transaction.category.title} Income`,
      body: `You received ₹${transaction.amount} in ${transaction.category.title}`,
    });
  }

  if (transaction.type === transactionTypeEnum.EXPENSE) {
    emitter.emit("notification", {
      userId: String(user._id),
      tokens: deviceTokens,
      title: `${transaction.category.title} Expense`,
      body: `You spent ₹${transaction.amount} on ${transaction.category.title}`,
    });
  }

  if (transaction.type === transactionTypeEnum.TRANSFER) {
    emitter.emit("notification", {
      userId: String(user._id),
      tokens: deviceTokens,
      title: `${transaction.category.title} Transfer`,
      body: `You transferred ₹${transaction.amount} from ${transaction.account.title} to ${transaction.to.title}`,
    });
  }

  if (
    transaction.type === transactionTypeEnum.EXPENSE ||
    transaction.type === transactionTypeEnum.TRANSFER
  ) {
    // ============================================
    // TXN_THRESHOLD_EXCEED_REMINDER notification
    // ============================================
    if (
      user?.allowedNotifications?.includes(
        allowedNotificationsEnum.TXN_THRESHOLD_EXCEED_REMINDER
      ) &&
      user?.txnThresholdAmount &&
      transaction.amount > user.txnThresholdAmount
    ) {
      emitter.emit("notification", {
        userId: String(user._id),
        tokens: deviceTokens,
        title: "Transaction Threshold Exceeded!",
        body: `A recent transaction has exceeded your set threshold amount ${user.txnThresholdAmount}`,
      });
    }

    // ============================================
    // TXN_ACCOUNT_REMINDER notification
    // ============================================
    if (
      transaction.user?.allowedNotifications?.includes(
        allowedNotificationsEnum.TXN_THRESHOLD_EXCEED_REMINDER
      ) &&
      notifyOnTxnAccounts?.includes(data.account)
    ) {
      emitter.emit("notification", {
        userId: String(user._id),
        tokens: deviceTokens,
        title: "New transaction with your account",
        body: `Transaction with your Account`,
      });
    }

    // ============================================
    // TXN_LABEL_REMINDER notification
    // ============================================
    if (
      transaction.user?.allowedNotifications?.includes(
        allowedNotificationsEnum.TXN_LABEL_REMINDER
      ) &&
      transaction.labels?.some((item) =>
        notifyOnTxnLabels?.includes(String(item._id))
      )
    ) {
      emitter.emit("notification", {
        userId: String(user._id),
        tokens: deviceTokens,
        title: "New transaction with your label",
        body: `Transaction with your label`,
      });
    }

    // ============================================
    // TXN_HEAD_CATEGORY_REMINDER notification
    // ============================================

    if (
      transaction.user?.allowedNotifications?.includes(
        allowedNotificationsEnum.TXN_HEAD_CATEGORY_REMINDER
      ) &&
      notifyOnTxnHeadCategories?.includes(
        String(transaction?.headCategory?._id)
      )
    ) {
      emitter.emit("notification", {
        userId: String(user._id),
        tokens: deviceTokens,
        title: "New transaction with your head category",
        body: `Transaction with your head category`,
      });
    }
  }

  // =========================================
  // Send group activity notification to admin
  // =========================================
  const group = await GroupModel.findOne({
    "members.user": user._id,
    "members.accounts.account": transaction.account._id,
  });

  if (group) {
    const groupAdminId = group.createBy._id;
    const admin = await UserModel.findById(groupAdminId)
      .select("allowedNotifications deviceTokens")
      .lean();
    const adminDeviceTokens = admin.deviceTokens?.map(
      (item) => item.deviceToken
    );

    if (
      admin?.allowedNotifications?.includes(
        allowedNotificationsEnum.GROUP_ACTIVITY_REMINDER
      ) &&
      String(user._id) !== String(groupAdminId)
    ) {
      if (transaction.type === transactionTypeEnum.INCOME) {
        emitter.emit("notification", {
          userId: String(groupAdminId),
          tokens: adminDeviceTokens,
          title: `${transaction.category.title} Income`,
          body: `${user.username} received ₹${transaction.amount} in ${transaction.category.title}`,
        });
      }

      if (transaction.type === transactionTypeEnum.EXPENSE) {
        emitter.emit("notification", {
          userId: String(groupAdminId),
          tokens: adminDeviceTokens,
          title: `${transaction.category.title} Expense`,
          body: `${user.username} spent ₹${transaction.amount} on ${transaction.category.title}`,
        });
      }

      if (transaction.type === transactionTypeEnum.TRANSFER) {
        emitter.emit("notification", {
          userId: String(groupAdminId),
          tokens: adminDeviceTokens,
          title: `${transaction.category.title} Transfer`,
          body: `${user.username} transferred ₹${transaction.amount} from ${transaction.account.title} to ${transaction.to.title}`,
        });
      }
    }
  }

  return transaction;
};

export const getTransactionsCSVtData = async ({ userId, fromDate, toDate }) => {
  const filter = {
    user: userId,
    createdAt: {
      $gte: fromDate,
      $lte: toDate,
    },
  };

  const transactions = await TransactionModel.find(filter)
    .populate([
      {
        path: "account",
        select: "title",
      },
      {
        path: "category",
        select: "title",
      },
      {
        path: "currency",
        select: "code",
      },
      {
        path: "labels",
        select: "title",
      },
      {
        path: "payee",
      },
    ])
    .lean();

  const formattedTransactions = transactions.map((item) => {
    const labels = [];

    for (const label of item.labels) {
      if (label.title) {
        formattedLabel.push(label.title);
      }
    }

    return {
      Account: item.account?.title || "",
      Category: item.category?.title || "",
      Currency: item.currency?.code || "",
      Amount: item.amount || "",
      Type: item.type || "",
      "Payment Type": item.paymentType || "",
      Note: item.note || "",
      Date: moment(item.date).format("YYYY-MM-DD HH:mm:ss") || "",
      "Warranty in month": item.warranty || "",
      Transfer: item.type === transactionTypeEnum.TRANSFER ? "Yes" : "No",
      Payee: item?.payee?.name || "",
      Labels: labels.join(", "),
    };
  });

  return formattedTransactions;
};

export const deleteTransaction = async (id, transactionType = null) => {
  const transaction = await TransactionModel.findById(id)
    .populate(populate)
    .lean();

  await controller.managePreEntry(transaction);

  await TransactionModel.findByIdAndDelete(id);

  if (transaction.type === transactionTypeEnum.TRANSFER) {
    await TransactionModel.deleteOne({
      _id: transaction?.toTxn || transaction?.fromTxn,
    });
  }

  const transactionData = {
    newAmount: 0,
    oldAmount: transaction.amount,
    categoryId: transaction.category._id,
    headCategoryId: transaction.headCategory._id,
    transactionId: transaction._id,
    date: transaction.date,
    accountId: transaction.account,
    toAccountId: transaction.to,
    type: transactionType || transaction.type,
  };

  emitter.emit("transaction_amount_update", transactionData);

  await balanceHistoryTxnAmountUpdate(transactionData);

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
          body: "Remove transaction from group",
        });
      }
    }
  }
};
