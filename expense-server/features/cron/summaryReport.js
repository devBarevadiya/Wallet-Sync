import moment from "moment";
import { agenda } from "../../config/agenda.js";
import {
  allowedNotificationsEnum,
  paymentStatusEnum,
  summaryReportFrequency,
  templateTypeEnum,
  transactionTypeEnum,
} from "../../config/enum.js";
import UserModel from "../user/model.js";
import { getTransactionsCSVtData } from "../transaction/helper.js";
import XLSX from "xlsx";
import { mailTransport } from "../../config/mailTransport.js";
import TransactionModel from "../transaction/model.js";
import PaymentModel from "../payment/model.js";
import mongoose from "mongoose";

import { emitter } from "../../config/emitter.js";

const prepareReportAndSendEmail = async ({
  userId,
  email,
  fromDate,
  toDate,
  summaryReportCycle,
}) => {
  const transactions = await getTransactionsCSVtData({
    userId: userId,
    fromDate: fromDate,
    toDate: toDate,
  });

  const worksheet = XLSX.utils.json_to_sheet(transactions);
  const csvData = XLSX.utils.sheet_to_csv(worksheet);

  await mailTransport.sendMail(
    {
      from: {
        name: "WalletSync Support",
        address: "support@walletsync.app",
      },
      to: email,
      subject: `Your ${String(summaryReportCycle).toLowerCase()} report`,
      attachments: [
        {
          filename: `transactions.csv`,
          content: csvData,
        },
      ],
    },

    async (err, info) => {
      if (err) {
        console.log("err: ", err.message);
        return err.message;
      } else {
        console.log(`mail successfully sent on ${info.accepted[0]}`);
        return info;
      }
    }
  );
};

const prepareReportAndSendEmailV2 = async ({
  userId,
  email,
  username,
  fromDate,
  toDate,
  fromNextDate,
  toNextDate,
  frequency,
}) => {
  try {
    const transactions = await TransactionModel.find({
      user: userId,
      date: {
        $gte: fromDate,
        $lte: toDate,
      },
    }).populate("headCategory");

    let totalIncome = 0;
    let totalExpense = 0;
    let totalTransfer = 0;

    for (const transaction of transactions) {
      const { type, amount } = transaction;

      if (type === transactionTypeEnum.INCOME) {
        totalIncome += amount;
      } else if (type === transactionTypeEnum.EXPENSE) {
        totalExpense += amount;
      } else if (type === transactionTypeEnum.TRANSFER) {
        totalTransfer += amount;
      }
    }

    // ===============================
    // Calculate top 3 spend category
    // ===============================
    const categorySpending = transactions.reduce((acc, transaction) => {
      const { headCategory, amount } = transaction;

      if (!headCategory || amount == null) return acc;

      if (!acc[headCategory]) {
        acc[headCategory.title] = 0;
      }

      acc[headCategory.title] += amount;

      return acc;
    }, {});

    const sortedCategories = Object.keys(categorySpending)
      .map((key) => ({
        title: key,
        totalSpend: categorySpending[key],
      }))
      .sort((a, b) => b.totalSpend - a.totalSpend);

    const top3Categories = sortedCategories.slice(0, 3);

    // ======================================
    // calculate recurring bill count
    // ======================================
    const payments = await PaymentModel.find({
      paymentDate: {
        $gte: fromNextDate,
        $lte: toNextDate,
      },
      status: paymentStatusEnum.PENDING,
    }).populate({
      path: "planned",
      match: { user: new mongoose.Types.ObjectId(userId) },
      select: "user",
    });

    const recurringBillsCount = payments.length;

    emitter.emit("email_notification_summary_report", {
      email: email,
      username: username,
      totalIncome: totalIncome,
      totalExpense: totalExpense,
      totalTransfer: totalTransfer,
      categories: top3Categories,
      recurringBillsCount: recurringBillsCount,
      frequency: frequency,
    });
  } catch (error) {
    console.log(error);
  }
};

agenda.define(allowedNotificationsEnum.SUMMARY_REPORT, async (job) => {
  const { summaryReportCycle } = job.attrs.data;

  let fromDate, toDate, fromNextDate, toNextDate;

  if (frequency === summaryReportFrequency.DAILY) {
    fromDate = moment().startOf("day").toDate();
    toDate = moment().endOf("day").toDate();
    fromNextDate = moment(fromDate).add(1, "day").toDate();
    toNextDate = moment(toDate).add(1, "day").toDate();
  } else if (frequency === summaryReportFrequency.WEEKLY) {
    fromDate = moment().startOf("week").toDate();
    toDate = moment().endOf("week").toDate();
    fromNextDate = moment(fromDate).add(1, "week").toDate();
    toNextDate = moment(toDate).add(1, "week").toDate();
  } else if (frequency === summaryReportFrequency.MONTHLY) {
    fromDate = moment().startOf("month").toDate();
    toDate = moment().endOf("month").toDate();
    fromNextDate = moment(fromDate).add(1, "month").toDate();
    toNextDate = moment(toDate).add(1, "month").toDate();
  } else if (frequency === summaryReportFrequency.YEARLY) {
    fromDate = moment().startOf("year").toDate();
    toDate = moment().endOf("year").toDate();
    fromNextDate = moment(fromDate).add(1, "year").toDate();
    toNextDate = moment(toDate).add(1, "year").toDate();
  }

  // ===================
  // Email notification
  // ===================
  try {
    if (summaryReportCycle !== summaryReportFrequency.DAILY) {
      const users = await UserModel.find({});

      const promises = users.map((user) =>
        prepareReportAndSendEmailV2({
          userId: user._id,
          email: user.email,
          username: user.username,
          fromDate,
          toDate,
          fromNextDate,
          toNextDate,
          frequency: String(summaryReportCycle).toLowerCase(),
        })
      );

      await Promise.allSettled(promises);
    }
  } catch (error) {
    console.log(error);
  }

  // ===================
  // Mobile notification
  // ===================
  const users = await UserModel.find({
    summaryReportCycle: summaryReportCycle,
    allowedNotifications: allowedNotificationsEnum.SUMMARY_REPORT,
  });

  const promises = users.map((user) =>
    prepareReportAndSendEmail({
      userId: user._id,
      email: user.email,
      fromDate,
      toDate,
      summaryReportCycle: summaryReportCycle,
    })
  );

  try {
    await Promise.all(promises);
    console.log("Summary report emails sent successfully for all users");
  } catch (error) {
    console.error("Error sending some emails:", error);
  }
});
