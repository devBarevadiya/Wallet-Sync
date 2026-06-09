import moment from "moment";
import { creditDebitEnum, transactionTypeEnum } from "../../config/enum.js";
import BalanceHistoryModel from "./model.js";
import { deleteTransaction } from "../transaction/helper.js";
import TransactionModel from "../transaction/model.js";
import AccountModel from "../account/model.js";

export const existHistoryBalance = async ({ accountId, date }) => {
  const start = moment(date).startOf("day").toDate();
  const end = moment(date).endOf("day").toDate();

  const record = await BalanceHistoryModel.findOne({
    account: accountId,
    createdAt: { $gte: start, $lte: end },
  });

  if (!record) {
    // Get latest record
    const records = await BalanceHistoryModel.find({
      account: accountId,
      createdAt: { $lt: start },
    })
      .sort({ createdAt: -1 })
      .limit(1);

    // Create new record
    await BalanceHistoryModel.create({
      account: accountId,
      balance: records[0]?.balance || 0,
      createdAt: start,
    });
  }
};

export const incrementHistoryBalance = async ({ accountId, amount, date }) => {
  try {
    const start = moment(date).startOf("day").toDate();
    const end = moment(date).endOf("day").toDate();

    const record = await BalanceHistoryModel.findOne({
      account: accountId,
      createdAt: { $gte: start, $lte: end },
    });

    if (!record) {
      // Get latest record
      const records = await BalanceHistoryModel.find({
        account: accountId,
        createdAt: { $lt: start },
      })
        .sort({ createdAt: -1 })
        .limit(1);

      // Create new record
      await BalanceHistoryModel.create({
        account: accountId,
        balance: records[0]?.balance ? records[0]?.balance + amount : amount,
        createdAt: start,
      });
    } else {
      record.balance += amount;
      record.createdAt = date;

      await record.save();
    }
  } catch (error) {
    console.error(error);
  }
};

export const balanceHistoryTxnDateUpdate = async (transaction) => {
  try {
    const { accountId, toAccountId, type, newDate, oldDate, amount } =
      transaction;

    const newDateStart = moment(newDate).startOf("day");
    const newDateEnd = moment(newDate).endOf("day");

    const oldDateStart = moment(oldDate).startOf("day");
    const oldDateEnd = moment(oldDate).endOf("day");

    if (type === transactionTypeEnum.INCOME) {
      if (moment(newDateStart).isBefore(moment(oldDateStart))) {
        await existHistoryBalance({
          accountId,
          date: newDateStart,
        });

        await BalanceHistoryModel.updateMany(
          {
            account: accountId,
            createdAt: { $gte: newDateStart, $lt: oldDateStart },
          },
          { $inc: { balance: amount } }
        );
      } else if (moment(newDateStart).isAfter(moment(oldDateStart))) {
        await existHistoryBalance({
          accountId,
          date: newDateStart,
        });

        await BalanceHistoryModel.updateMany(
          {
            account: accountId,
            createdAt: { $gte: oldDateStart, $lt: newDateStart },
          },
          { $inc: { balance: -amount } }
        );
      }
    } else if (transaction?.type === transactionTypeEnum.EXPENSE) {
      if (moment(newDateStart).isBefore(moment(oldDateStart))) {
        await existHistoryBalance({
          accountId,
          date: newDateStart,
        });

        await BalanceHistoryModel.updateMany(
          {
            account: accountId,
            createdAt: { $gte: newDateStart, $lt: oldDateStart },
          },
          { $inc: { balance: -amount } }
        );
      } else if (moment(newDateStart).isAfter(moment(oldDateStart))) {
        await existHistoryBalance({
          accountId,
          date: newDateStart,
        });

        await BalanceHistoryModel.updateMany(
          {
            account: accountId,
            createdAt: { $gte: oldDateStart, $lt: newDateStart },
          },
          { $inc: { balance: amount } }
        );
      }
    } else if (transaction?.type === transactionTypeEnum.TRANSFER) {
      if (moment(newDateStart).isBefore(moment(oldDateStart))) {
        // From account
        await BalanceHistoryModel.updateMany(
          {
            account: accountId,
            createdAt: { $gt: newDateEnd, $lt: oldDateStart },
          },
          { $inc: { balance: -amount } }
        );

        await incrementHistoryBalance({
          accountId,
          amount: -amount,
          date: newDateStart,
        });

        // To Account
        await BalanceHistoryModel.updateMany(
          {
            account: toAccountId,
            createdAt: { $gt: newDateEnd, $lt: oldDateStart },
          },
          { $inc: { balance: amount } }
        );

        await incrementHistoryBalance({
          accountId: toAccountId,
          amount: amount,
          date: newDateStart,
        });
      } else if (moment(newDateStart).isAfter(moment(oldDateStart))) {
        // From Account
        await BalanceHistoryModel.updateMany(
          {
            account: accountId,
            createdAt: { $gte: oldDateStart, $lt: newDateStart },
          },
          { $inc: { balance: amount } }
        );

        await incrementHistoryBalance({
          accountId,
          amount: amount,
          date: newDateStart,
        });

        // To Account
        await BalanceHistoryModel.updateMany(
          {
            account: toAccountId,
            createdAt: { $gte: oldDateStart, $lt: newDateStart },
          },
          { $inc: { balance: -amount } }
        );

        await incrementHistoryBalance({
          accountId: toAccountId,
          amount: -amount,
          date: newDateStart,
        });
      }
    }
  } catch (error) {
    console.error(error);
  }
};

export const balanceHistoryTxnAmountUpdate = async (transaction) => {
  try {
    const { date, newAmount, oldAmount, accountId, toAccountId } = transaction;

    const amountDiff = oldAmount - newAmount;

    const dateStart = moment(date).startOf("day").toDate();

    if (transaction?.type === transactionTypeEnum.INCOME) {
      await BalanceHistoryModel.updateMany(
        {
          account: transaction.accountId,
          createdAt: { $gte: dateStart },
        },
        { $inc: { balance: -amountDiff } }
      );
    } else if (transaction?.type === transactionTypeEnum.EXPENSE) {
      await BalanceHistoryModel.updateMany(
        {
          account: transaction.accountId,
          createdAt: { $gte: dateStart },
        },
        { $inc: { balance: amountDiff } }
      );
    } else if (transaction?.type === transactionTypeEnum.TRANSFER) {
      await BalanceHistoryModel.updateMany(
        {
          account: toAccountId,
          createdAt: { $gte: dateStart },
        },
        { $inc: { balance: -amountDiff } }
      );

      await BalanceHistoryModel.updateMany(
        {
          account: accountId,
          createdAt: { $gte: dateStart },
        },
        { $inc: { balance: amountDiff } }
      );
    }
  } catch (error) {
    console.error(error);
  }
};

export const balanceHistoryTxnTypeUpdate = async (data) => {
  const {
    date,
    amount,
    transactionId,
    accountId,
    toAccountId,
    prevType,
    newType,
    fromTxn,
    toTxn,
  } = data;
  try {
    const dateStart = moment(date).startOf("day").toDate();

    if (
      prevType === transactionTypeEnum.EXPENSE &&
      newType === transactionTypeEnum.INCOME
    ) {
      await BalanceHistoryModel.updateMany(
        {
          account: accountId,
          createdAt: { $gte: dateStart },
        },
        { $inc: { balance: amount * 2 } }
      );
    } else if (
      prevType === transactionTypeEnum.INCOME &&
      newType === transactionTypeEnum.EXPENSE
    ) {
      await BalanceHistoryModel.updateMany(
        {
          account: accountId,
          createdAt: { $gte: dateStart },
        },
        { $inc: { balance: -amount * 2 } }
      );
    } else if (
      prevType === transactionTypeEnum.TRANSFER &&
      newType === transactionTypeEnum.INCOME
    ) {
      if (toTxn) {
        await deleteTransaction(toTxn, transactionTypeEnum.TRANSFER);

        await AccountModel.updateOne(
          { _id: accountId },
          {
            $inc: { balance: amount },
          }
        );

        await BalanceHistoryModel.updateMany(
          {
            account: accountId,
            createdAt: { $gte: dateStart },
          },
          { $inc: { balance: amount } }
        );
      } else if (fromTxn) {
        await deleteTransaction(fromTxn, transactionTypeEnum.TRANSFER);

        await AccountModel.updateOne(
          { _id: toAccountId },
          {
            $inc: { balance: amount },
          }
        );

        await BalanceHistoryModel.updateMany(
          {
            account: toAccountId,
            createdAt: { $gte: dateStart },
          },
          { $inc: { balance: amount } }
        );
      }

      await TransactionModel.updateOne(
        {
          _id: transactionId,
        },
        {
          toTxn: null,
          fromTxn: null,
        }
      );
    } else if (
      prevType === transactionTypeEnum.TRANSFER &&
      newType === transactionTypeEnum.EXPENSE
    ) {
      if (toTxn) {
        await deleteTransaction(toTxn, transactionTypeEnum.TRANSFER);

        await AccountModel.updateOne(
          { _id: accountId },
          {
            $inc: { balance: -amount },
          }
        );

        await BalanceHistoryModel.updateMany(
          {
            account: accountId,
            createdAt: { $gte: dateStart },
          },
          { $inc: { balance: -amount } }
        );
      } else if (fromTxn) {
        await deleteTransaction(fromTxn, transactionTypeEnum.TRANSFER);

        await AccountModel.updateOne(
          { _id: toAccountId },
          {
            $inc: { balance: -amount },
          }
        );

        await BalanceHistoryModel.updateMany(
          {
            account: toAccountId,
            createdAt: { $gte: dateStart },
          },
          { $inc: { balance: -amount } }
        );
      }

      await TransactionModel.updateOne(
        {
          _id: transactionId,
        },
        {
          toTxn: null,
          fromTxn: null,
        }
      );
    } else if (
      prevType === transactionTypeEnum.INCOME &&
      newType === transactionTypeEnum.TRANSFER
    ) {
      const fromTxn = await TransactionModel.findById(transactionId);

      const toTxn = await TransactionModel.create({
        user: String(fromTxn.user),
        type: transactionTypeEnum.TRANSFER,
        currency: fromTxn.currency,
        amount: amount,
        account: accountId,
        to: toAccountId,
        category: fromTxn.category,
        headCategory: fromTxn.headCategory,
        paymentType: fromTxn.paymentType,
        status: fromTxn.status,
        date: fromTxn.date,
        creditDebit: creditDebitEnum.CREDIT,
        note: fromTxn.note,
        labels: fromTxn.labels,
        payee: fromTxn?.payee ? fromTxn.payee : null,
        fromTxn: fromTxn._id,
      });

      fromTxn.creditDebit = creditDebitEnum.DEBIT;
      fromTxn.toTxn = toTxn._id;
      await fromTxn.save();

      await BalanceHistoryModel.updateMany(
        {
          account: accountId,
          createdAt: { $gte: dateStart },
        },
        { $inc: { balance: -amount * 2 } }
      );

      await BalanceHistoryModel.updateMany(
        {
          account: toAccountId,
          createdAt: { $gte: dateStart },
        },
        { $inc: { balance: amount } }
      );
    } else if (
      prevType === transactionTypeEnum.EXPENSE &&
      newType === transactionTypeEnum.TRANSFER
    ) {
      const fromTxn = await TransactionModel.findById(transactionId);

      const toTxn = await TransactionModel.create({
        user: String(fromTxn.user),
        type: transactionTypeEnum.TRANSFER,
        currency: fromTxn.currency,
        amount: amount,
        account: accountId,
        to: toAccountId,
        category: fromTxn.category,
        headCategory: fromTxn.headCategory,
        paymentType: fromTxn.paymentType,
        status: fromTxn.status,
        date: fromTxn.date,
        creditDebit: creditDebitEnum.CREDIT,
        note: fromTxn.note,
        labels: fromTxn.labels,
        payee: fromTxn?.payee ? fromTxn.payee : null,
        fromTxn: fromTxn._id,
      });

      fromTxn.creditDebit = creditDebitEnum.DEBIT;
      fromTxn.toTxn = toTxn._id;
      await fromTxn.save();

      await existHistoryBalance({
        accountId: toAccountId,
        date: dateStart,
      });

      await BalanceHistoryModel.updateMany(
        {
          account: toAccountId,
          createdAt: { $gte: dateStart },
        },
        { $inc: { balance: amount } }
      );
    }
  } catch (error) {
    console.error(error);
  }
};

export const createBalanceHistory = async () => {
  console.log("[INFO] CRON START >> Create balance history for all account");

  const accounts = await AccountModel.find({}).select("_id balance").lean();

  for (const account of accounts) {
    try {
      const start = moment().startOf("day").toDate();
      const end = moment().endOf("day").toDate();

      const existingRecord = await BalanceHistoryModel.findOne({
        account: account._id,
        createdAt: { $gte: start, $lte: end },
      });

      if (!existingRecord) {
        await BalanceHistoryModel.create({
          account: account._id,
          balance: account.balance,
          createdAt: start,
        });
      }
    } catch (error) {
      console.error(error);
    }
  }

  console.log(
    "[INFO] CRON COMPLETE >> Create balance history for all account complete"
  );
};
