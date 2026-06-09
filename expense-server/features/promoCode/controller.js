import moment from "moment";
import { subscriptionTypeEnum } from "../../config/enum.js";
import { errorResponse, successResponse } from "../../helper/apiResponse.js";
import {
  generateUniquePromoCodes,
  paginationDetails,
  paginationFun,
} from "../../helper/common.js";
import PromoCodeModel from "./model.js";
import UserModel from "../user/model.js";

const select = "code validFrom validUntil trialDays tag";

class controller {
  static get = async (req, res) => {
    try {
      const { skip, limit } = paginationFun(req.query);

      // Aggregation pipeline to get paginated tags with grouped promo codes
      const result = await PromoCodeModel.aggregate([
        {
          $group: {
            _id: "$tag",
            data: { $push: "$$ROOT" }, // Collect all promo codes under each tag
            createdAt: { $min: "$createdAt" }, // Get the earliest createdAt for sorting
          },
        },
        { $sort: { createdAt: -1 } }, // Sort by earliest createdAt
        {
          $facet: {
            metadata: [{ $count: "totalItems" }], // Count total tags
            data: [{ $skip: skip }, { $limit: limit }], // Apply pagination
          },
        },
      ]);

      const totalItems = result[0]?.metadata[0]?.totalItems || 0;
      const formattedData = result[0]?.data.map((item) => ({
        tag: item._id,
        data: item.data,
      }));

      const pagination = paginationDetails({
        limit,
        page: req.query.page,
        totalItems,
      });

      return successResponse({
        res,
        statusCode: 200,
        message: "Promo codes fetched successfully",
        pagination,
        data: formattedData,
      });
    } catch (error) {
      return errorResponse({ res, error, funName: "Get promo code" });
    }
  };

  static deleteByIds = async (req, res) => {
    try {
      const { ids } = req.body;

      await PromoCodeModel.deleteMany({
        _id: { $in: ids },
      });

      return successResponse({
        res,
        statusCode: 200,
        message: "Promo codes deleted successfully",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "Delete promo code",
      });
    }
  };

  static create = async (req, res) => {
    try {
      const { count, validFrom, validUntil, trialDays, tag } = req.body;

      const recordsCount = await PromoCodeModel.countDocuments({ tag });

      if (recordsCount > 0) {
        errorResponse({
          res,
          statusCode: 400,
          message: "Tag is already in use",
        });
        return;
      }

      const promoCodes = await generateUniquePromoCodes(count);

      const formattedPromoCodes = promoCodes.map((code) => ({
        code,
        validFrom,
        validUntil,
        trialDays,
        tag,
      }));

      await PromoCodeModel.create(formattedPromoCodes);

      const data = await PromoCodeModel.find({
        code: { $in: promoCodes },
      }).select(select);

      return successResponse({
        res,
        statusCode: 201,
        data: data,
        message: "Promo code generated successfully",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "Create promo code",
      });
    }
  };

  static applyPromoCode = async (req, res) => {
    try {
      const user = req.user;
      const { code } = req.body;

      if (user.subscriptionType !== subscriptionTypeEnum.FREE) {
        errorResponse({
          res,
          statusCode: 400,
          message: "User has a premium subscription or an applied promo code",
        });
        return;
      }

      const promoCode = await PromoCodeModel.findOne({
        code,
        user: null,
      });

      if (
        // If promo code record not found
        !promoCode ||
        // If promo code expired
        moment().isAfter(moment(promoCode.validUntil))
      ) {
        errorResponse({
          res,
          statusCode: 400,
          message: "Promo code expired or invalid",
        });
        return;
      }

      promoCode.user = user._id;
      promoCode.appliedOn = moment().toDate();

      if (promoCode.trialDays !== -1) {
        promoCode.expiresOn = moment()
          .add(promoCode.trialDays, "days")
          .toDate();
      }

      await promoCode.save();

      await UserModel.findByIdAndUpdate(user._id, {
        subscriptionType: subscriptionTypeEnum.PROMO_CODE,
      });

      return successResponse({
        res,
        statusCode: 200,
        data: code,
        message: "Promo code applied successfully",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "Create promo code",
      });
    }
  };
}
export default controller;
