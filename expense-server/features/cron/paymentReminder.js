import moment from "moment";
import { agenda } from "../../config/agenda.js";
import { emitter } from "../../config/emitter.js";
import {
  allowedNotificationsEnum,
  paymentStatusEnum,
} from "../../config/enum.js";
import UserModel from "../user/model.js";
import PaymentModel from "../payment/model.js";

agenda.define(allowedNotificationsEnum.RECURRING_BILL_REMINDER, async (job) => {
  const { userId, title, body } = job.attrs.data;

  const user = await UserModel.findById(userId).select(
    "deviceTokens allowedNotifications"
  );

  const deviceTokens = user.deviceTokens.map((item) => item.deviceToken);
  const allowedNotifications = user.allowedNotifications;

  if (
    allowedNotifications.includes(
      allowedNotificationsEnum.RECURRING_BILL_REMINDER
    )
  ) {
    emitter.emit("notification", {
      userId: String(user._id),
      tokens: deviceTokens,
      title: title,
      body: body,
    });
  }
});

agenda.define("dailyCron", async () => {
  try {
    const now = moment();

    const populate = {
      path: "planned",
      select: "title user",
      populate: {
        path: "user",
        select: "email username",
      },
    };

    const oneDayAfterPayments = await PaymentModel.find({
      status: paymentStatusEnum.PENDING,
      paymentDate: {
        $gte: now.clone().add(1, "days").startOf("day"),
        $lte: now.clone().add(1, "days").endOf("day"),
      },
    })
      .populate(populate)
      .lean();

    const threeDayAfterPayments = await PaymentModel.find({
      status: paymentStatusEnum.PENDING,
      paymentDate: {
        $gte: now.clone().add(3, "days").startOf("day"),
        $lte: now.clone().add(3, "days").endOf("day"),
      },
    })
      .populate(populate)
      .lean();

    const payments = oneDayAfterPayments.concat(threeDayAfterPayments);

    console.log(payments);
    for (const payment of payments) {
      const planned = payment.planned;
      const user = planned?.user;

      emitter.emit("email_notification_payment_reminder", {
        email: user.email,
        username: user.username,
        paymentName: planned.title,
        amount: payment.amount,
        dueDate: moment(paymentDate).format("DD-MM-YYYY"),
      });
    }
  } catch (error) {
    console.log(error);
  }
});
