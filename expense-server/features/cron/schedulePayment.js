import cron from "node-cron";
import PlannedModel from "../planned/model.js";
import {
  confirmationTypeEnum,
  paymentStatusEnum,
  scheduleTypeEnum,
} from "../../config/enum.js";
import moment from "moment";
import PaymentModel from "../payment/model.js";
import { confirmPayment, generateSchedulePayments } from "../payment/helper.js";

const handleSchedulePlanned = async () => {
  const startOfDay = moment().startOf("day").toDate();
  const endOfDay = moment().endOf("day").toDate();

  const filter = {
    isActive: true,
    scheduleType: scheduleTypeEnum.REPEAT,
    scheduleDate: {
      $gte: startOfDay,
      $lt: endOfDay,
    },
  };

  const plannedRecords = await PlannedModel.find(filter).lean();

  const promises = [];

  for (const planned of plannedRecords) {
    promises.push(generateSchedulePayments(planned));
  }

  await Promise.all(promises);
};

const handleAutoConfirm = async () => {
  const startOfDay = moment().subtract(1, "days").startOf("day").toDate();
  const endOfDay = moment().subtract(1, "days").endOf("day").toDate();

  const filter = { confirmationType: confirmationTypeEnum.AUTOMATICALLY };
  const plannedIds = await PlannedModel.distinct("_id", filter);

  const payments = await PaymentModel.find({
    planned: { $in: plannedIds },
    paymentDate: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
    status: paymentStatusEnum.PENDING,
  }).populate({
    path: "planned",
  });

  for (const payment of payments) {
    await confirmPayment(payment);
  }
};

cron.schedule(
  "0 0 * * *",
  () => {
    handleSchedulePlanned();
    handleAutoConfirm();
  },
  {
    scheduled: true,
    timezone: "Asia/Kolkata",
  }
);
