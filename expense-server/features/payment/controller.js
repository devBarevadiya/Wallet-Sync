import {
  accountPermissionEnum,
  paymentStatusEnum,
  paymentTypeEnum,
  scheduleTypeEnum,
} from "../../config/enum.js";
import {
  errorResponse,
  successResponse,
  validateResponse,
} from "../../helper/apiResponse.js";
import { paginationDetails, paginationFun } from "../../helper/common.js";

import { AuthErrorObj } from "../../middleware/verifyMiddleware.js";
import PlannedModel from "../planned/model.js";
import {
  cancelPaymentReminders,
  confirmPayment,
  generateSchedulePayments,
} from "./helper.js";
import PaymentModel from "./model.js";

const paymentPopulate = [
  {
    path: "account",
    select: "title",
  },
];

class controller {
  static get = async (req, res) => {
    try {
      const { plannedId } = req.params;

      const { skip, limit } = paginationFun(req.query);

      const existingPlanned = await PlannedModel.findById(plannedId).lean();

      if (!existingPlanned) {
        return errorResponse({
          res,
          statusCode: 404,
          message: "Planned payment not exist",
        });
      }

      const groupAccountIds = req.group.accounts
        .filter((item) => item.permission !== accountPermissionEnum.NO_ACCESS)
        .map((item) => String(item._id));

      if (!groupAccountIds.includes(String(existingPlanned.account._id))) {
        return validateResponse(res, AuthErrorObj, 403);
      }

      const filter = {
        planned: plannedId,
      };

      const result = await PaymentModel.find(filter)
        .skip(skip)
        .limit(limit)
        .populate(paymentPopulate)
        .sort({ paymentDate: -1 })
        .select("planned amount account paymentDate paidDate status")
        .lean();

      const count = await PaymentModel.countDocuments(filter);

      const pagination = paginationDetails({
        limit: limit,
        page: req.query.page,
        totalItems: count,
      });

      return successResponse({
        res,
        statusCode: 200,
        data: result,
        pagination: pagination,
        message: "Payment fetched successfully",
      });
    } catch (error) {
      console.log(error);
      return errorResponse({
        res,
        error,
        funName: "get payment",
      });
    }
  };

  static getDetails = async (req, res) => {
    try {
      const { id } = req.params;

      const existingPayment = await PaymentModel.findById(id).lean();

      if (!existingPayment) {
        return errorResponse({
          res,
          statusCode: 404,
          message: "Payment not exist",
        });
      }

      const groupAccountIds = req.group.accounts
        .filter((item) => item.permission !== accountPermissionEnum.NO_ACCESS)
        .map((item) => String(item._id));

      if (!groupAccountIds.includes(String(existingPayment.account._id))) {
        return validateResponse(res, AuthErrorObj, 403);
      }

      const payment = await PaymentModel.findById(id).lean();

      return successResponse({
        res,
        statusCode: 200,
        data: payment,
        message: "Payment fetched successfully",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "get payment details",
      });
    }
  };

  static patch = async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const existingPayment = await PaymentModel.findById(id)
        .populate("planned account")
        .lean();

      if (!existingPayment) {
        return errorResponse({
          res,
          statusCode: 404,
          message: "Payment not exist",
        });
      }

      const groupAccountIds = req.group.accounts
        .filter(
          (item) => item.permission === accountPermissionEnum.ADMIN_ACCESS
        )
        .map((item) => String(item._id));

      if (!groupAccountIds.includes(String(existingPayment.account._id))) {
        return validateResponse(res, AuthErrorObj, 403);
      }

      const scheduleType = existingPayment.planned.scheduleType;

      if (status && status === paymentStatusEnum.CONFIRMED) {
        await confirmPayment(existingPayment, paymentTypeEnum.MANUAL_CONFIRM);

        if (scheduleType === scheduleTypeEnum.REPEAT) {
          await generateSchedulePayments(existingPayment.planned);
        }
      }

      if (status && status !== paymentStatusEnum.PENDING) {
        cancelPaymentReminders(existingPayment._id);
      }

      if (
        status &&
        status === paymentStatusEnum.CANCELLED &&
        scheduleType === scheduleTypeEnum.REPEAT
      ) {
        await generateSchedulePayments(existingPayment.planned);
      }

      await PaymentModel.findByIdAndUpdate(id, req.body, {
        new: true,
      }).lean();

      return successResponse({
        res,
        statusCode: 200,
        data: {
          _id: id,
        },
        message: "Planned payment updated successfully",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "patch.Planned",
      });
    }
  };
}
export default controller;
