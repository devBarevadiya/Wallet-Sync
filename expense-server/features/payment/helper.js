import moment from "moment";
import PaymentModel from "./model.js";
import {
  allowedNotificationsEnum,
  paymentStatusEnum,
  paymentTypeEnum,
  transactionStatusEnum,
} from "../../config/enum.js";
import { agenda } from "../../config/agenda.js";
import { generateNextPaymentDate } from "../planned/helper.js";
import PlannedModel from "../planned/model.js";
import AccountModel from "../account/model.js";
import { createTransaction } from "../transaction/helper.js";

const schedulePaymentReminders = async ({
  paymentId,
  paymentDate,
  amount,
  userId,
}) => {
  const oneDayBefore = moment(paymentDate).subtract(1, "day").toDate();
  const oneHourBefore = moment(paymentDate).subtract(1, "hour").toDate();
  const thirtyMinutesAfter = moment(paymentDate).add(30, "minutes").toDate();
  const nextDayAfter = moment(paymentDate).add(1, "day").toDate();

  await agenda.schedule(
    oneDayBefore,
    allowedNotificationsEnum.RECURRING_BILL_REMINDER,
    {
      paymentId: String(paymentId),
      userId: userId,
      title: "Reminder: Your bill is due tomorrow!",
      body: `Your payment of ${amount} is due tomorrow.`,
    }
  );

  await agenda.schedule(
    oneHourBefore,
    allowedNotificationsEnum.RECURRING_BILL_REMINDER,
    {
      paymentId: String(paymentId),
      userId: userId,
      title: "Reminder: Your bill is due in 1 hour!",
      body: `Your payment of ${amount} is due in 1 hour.`,
    }
  );

  await agenda.schedule(
    paymentDate,
    allowedNotificationsEnum.RECURRING_BILL_REMINDER,
    {
      paymentId: String(paymentId),
      userId: userId,
      title: "Reminder: Your bill is due today!",
      body: `Your payment of ${amount} is due today.`,
    }
  );

  await agenda.schedule(
    thirtyMinutesAfter,
    allowedNotificationsEnum.RECURRING_BILL_REMINDER,
    {
      paymentId: String(paymentId),
      userId: userId,
      title: "Reminder: Your bill was due 30 minutes ago!",
      body: `Your payment of ${amount} was due 30 minutes ago. Please make the payment as soon as possible.`,
    }
  );

  await agenda.schedule(
    nextDayAfter,
    allowedNotificationsEnum.RECURRING_BILL_REMINDER,
    {
      paymentId: String(paymentId),
      userId: userId,
      title: "Reminder: Your bill was due yesterday!",
      body: `Your payment of ${amount} was due yesterday. Please make the payment immediately.`,
    }
  );
};

export const cancelPaymentReminders = async (paymentId) => {
  await agenda.cancel({ "data.paymentId": String(paymentId) });
};

export const createPayment = async ({
  plannedId,
  amount,
  account,
  paymentDate,
}) => {
  const createdPayment = await PaymentModel.create({
    planned: plannedId,
    amount: amount,
    account: account,
    paymentDate: paymentDate,
  });

  const payment = await PaymentModel.findById(createdPayment._id)
    .populate({
      path: "account",
      select: "user",
    })
    .lean();

  schedulePaymentReminders({
    amount: payment.amount,
    paymentDate: payment.paymentDate,
    paymentId: payment._id,
    userId: payment.account.user,
  });

  return payment;
};

export const generateSchedulePayments = async (planned) => {
  const nextPaymentDate = generateNextPaymentDate({
    scheduleDate: planned.scheduleDate,
    every: planned.every,
    everyType: planned.everyType,
    weekday: planned.weekday,
  });

  const nextDate = moment(nextPaymentDate);

  let allowToCreatePayment = true;
  let markAsInactive = false;

  // Handle stop date
  if (planned.stopDate) {
    const stopDate = moment(planned.stopDate);

    // Create payment record till stop date
    if (nextDate.isAfter(stopDate)) {
      allowToCreatePayment = false;
    }

    // Mark as inactive where planned payment already stopped
    if (moment(planned.scheduleDate).isAfter(stopDate)) {
      markAsInactive = true;
    }
  }

  // Handle repetitions count
  if (planned.maxRepetitions !== null) {
    // Stop to create payment record if limit reached
    if (planned.repetitionsCount >= planned.maxRepetitions) {
      allowToCreatePayment = false;
      markAsInactive = true;
    }
  }

  if (markAsInactive) {
    await PlannedModel.updateOne(
      { _id: planned._id },
      {
        isActive: false,
      }
    );
  }

  if (allowToCreatePayment) {
    const existingPayment = await PaymentModel.findOne({
      planned: planned._id,
      paymentDate: nextPaymentDate,
    });

    if (!existingPayment) {
      await createPayment({
        plannedId: planned._id,
        amount: planned.amount,
        account: planned.account,
        paymentDate: nextPaymentDate,
      });

      await PlannedModel.updateOne(
        { _id: planned._id },
        {
          scheduleDate: nextPaymentDate,
          $inc: {
            repetitionsCount: 1,
          },
        }
      );
    }
  }
};

export const confirmPayment = async (
  payment,
  paymentType = paymentTypeEnum.AUTO_CONFIRM
) => {
  const account = await AccountModel.findById(payment.account).lean();

  const transaction = {
    category: payment.planned.category,
    user: payment.planned.user,
    amount: payment.amount,
    account: payment.account,
    type: payment.planned.type,
    currency: account.currency,
    paymentType: paymentType,
    status: transactionStatusEnum.CLEARED,
    labels: payment.planned.labels,
    note: payment.planned.note,
    payee: payment.planned.recipient,
  };

  await createTransaction(transaction);

  await PaymentModel.updateOne(
    { _id: payment._id },
    {
      status: paymentStatusEnum.CONFIRMED,
      paidDate: moment().toDate(),
    }
  );
};
