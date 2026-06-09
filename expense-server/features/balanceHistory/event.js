import moment from "moment";
import { emitter } from "../../config/emitter.js";
import { transactionTypeEnum } from "../../config/enum.js";
import { incrementHistoryBalance } from "./helper.js";
import BalanceHistoryModel from "./model.js";

emitter.on("transaction", async (transaction) => {
  try {
    const end = moment(transaction.date).endOf("day").toDate();

    if (transaction?.type === transactionTypeEnum.INCOME) {
      await incrementHistoryBalance({
        accountId: transaction.account,
        amount: transaction.amount,
        date: transaction.date,
      });

      if (!moment(transaction.date).isSame(moment(), "day")) {
        await BalanceHistoryModel.updateMany(
          {
            account: transaction.account,
            createdAt: { $gt: end },
          },
          { $inc: { balance: transaction.amount } }
        );
      }
    } else if (transaction?.type === transactionTypeEnum.EXPENSE) {
      await incrementHistoryBalance({
        accountId: transaction.account,
        amount: -transaction.amount,
        date: transaction.date,
      });

      if (!moment(transaction.date).isSame(moment(), "day")) {
        await BalanceHistoryModel.updateMany(
          {
            account: transaction.account,
            createdAt: { $gt: end },
          },
          { $inc: { balance: -transaction.amount } }
        );
      }
    } else if (transaction?.type === transactionTypeEnum.TRANSFER) {
      await incrementHistoryBalance({
        accountId: transaction.account,
        amount: -transaction.amount,
        date: transaction.date,
      });

      if (!moment(transaction.date).isSame(moment(), "day")) {
        await BalanceHistoryModel.updateMany(
          {
            account: transaction.account,
            createdAt: { $gt: end },
          },
          { $inc: { balance: -transaction.amount } }
        );
      }
      await incrementHistoryBalance({
        accountId: transaction.to,
        amount: transaction.amount,
        date: transaction.date,
      });

      if (!moment(transaction.date).isSame(moment(), "day")) {
        await BalanceHistoryModel.updateMany(
          {
            account: transaction.to,
            createdAt: { $gt: end },
          },
          { $inc: { balance: transaction.amount } }
        );
      }
    }
  } catch (error) {
    console.error(error);
  }
});
