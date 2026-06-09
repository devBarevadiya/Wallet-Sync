import moment from "moment";

import { agenda } from "../../config/agenda.js";
import {
  allowedNotificationsEnum,
  transactionTypeEnum,
} from "../../config/enum.js";
import TransactionModel from "../transaction/model.js";
import UserModel from "../user/model.js";
import { emitter } from "../../config/emitter.js";

agenda.define(allowedNotificationsEnum.TXN_INACTIVITY_REMINDER, async () => {
  const startOfDay = moment().startOf("day").toDate();
  const endOfDay = moment().endOf("day").toDate();

  const users = await UserModel.find()
    .select("deviceTokens allowedNotifications email username")
    .lean();

  for (const user of users) {
    const deviceTokens = user?.deviceTokens?.map((item) => item.deviceToken);
    const allowedNotifications = user?.allowedNotifications;

    if (
      allowedNotifications?.includes(
        allowedNotificationsEnum.TXN_INACTIVITY_REMINDER
      )
    ) {
      const transactionCount = await TransactionModel.countDocuments({
        user: user._id,
        type: {
          $in: [transactionTypeEnum.INCOME, transactionTypeEnum.EXPENSE],
        },
        date: { $gte: startOfDay, $lte: endOfDay },
      });

      if (transactionCount === 0) {
        emitter.emit("notification", {
          tokens: deviceTokens,
          userId: String(user._id),
          title: "Inactivity Reminder",
          body: "You haven't added any expense or income records for a day.",
        });
      }
    }
  }
});

agenda.define("weeklyCron", async () => {
  const fromDate = moment().startOf("week").toDate();
  const toDate = moment().endOf("week").toDate();

  const users = await UserModel.find().select("email username").lean();

  for (const user of users) {
    const transactionCount = await TransactionModel.countDocuments({
      user: user._id,
      type: {
        $in: [transactionTypeEnum.INCOME, transactionTypeEnum.EXPENSE],
      },
      date: { $gte: fromDate, $lte: toDate },
    });

    if (transactionCount === 0) {
      emitter.emit("email_notification_inactive_user", {
        email: user.email,
        username: user.username,
      });
    }
  }
});
