import Joi from "joi";
import { dateValidation, objectIdValidation } from "../../helper/common.js";
import { validateResponse } from "../../helper/apiResponse.js";
import { budgetPeriodEnum } from "../../config/enum.js";

class validate {
  static get = async (req, res, next) => {
    const validateSchema = Joi.object({
      accounts: Joi.array()
        .items(Joi.string().custom(objectIdValidation))
        .min(1)
        .messages({
          "array.min": "At least one valid ID must be provided",
        })
        .optional(),
      LAST_RECORD: Joi.object({
        include: Joi.boolean().required(),
        parameters: Joi.object({
          fromDate: Joi.string().custom(dateValidation).optional(),
          toDate: Joi.string().custom(dateValidation).optional(),
          labels: Joi.array()
            .items(Joi.string().trim().min(1))
            .min(1)
            .optional(),
        }).optional(),
      }).optional(),
      SPENDING: Joi.object({
        include: Joi.boolean().required(),
        parameters: Joi.object({
          fromDate: Joi.string().custom(dateValidation).optional(),
          toDate: Joi.string().custom(dateValidation).optional(),
          labels: Joi.array()
            .items(Joi.string().trim().min(1))
            .min(1)
            .optional(),
        }).optional(),
      }).optional(),

      CURRENCY: Joi.object({
        include: Joi.boolean().required(),
      }).optional(),

      TOTAL_BALANCE: Joi.object({
        include: Joi.boolean().required(),
      }).optional(),

      BALANCE_TREND: Joi.object({
        include: Joi.boolean().required(),
        parameters: Joi.object({
          fromDate: Joi.string().custom(dateValidation).optional(),
          toDate: Joi.string().custom(dateValidation).optional(),
        }).optional(),
      }).optional(),

      CASH_FLOW: Joi.object({
        include: Joi.boolean().required(),
        parameters: Joi.object({
          fromDate: Joi.string().custom(dateValidation).optional(),
          toDate: Joi.string().custom(dateValidation).optional(),
        }).optional(),
      }).optional(),

      CASH_FLOW_TABLE: Joi.object({
        include: Joi.boolean().required(),
        parameters: Joi.object({
          fromDate: Joi.string().custom(dateValidation).optional(),
          toDate: Joi.string().custom(dateValidation).optional(),
        }).optional(),
      }).optional(),
      REPORT: Joi.object({
        include: Joi.boolean().required(),
        parameters: Joi.object({
          fromDate: Joi.string().custom(dateValidation).optional(),
          toDate: Joi.string().custom(dateValidation).optional(),
          labels: Joi.array()
            .items(Joi.string().trim().min(1))
            .min(1)
            .optional(),
        }).optional(),
      }).optional(),

      REPORT_DETAILS: Joi.object({
        include: Joi.boolean().required(),
        parameters: Joi.object({
          headCategoryId: Joi.string().custom(objectIdValidation).required(),
          fromDate: Joi.string().custom(dateValidation).optional(),
          toDate: Joi.string().custom(dateValidation).optional(),
          labels: Joi.array()
            .items(Joi.string().trim().min(1))
            .min(1)
            .optional(),
        }).required(),
      }).optional(),

      BUDGET: Joi.object({
        include: Joi.boolean().required(),
        parameters: Joi.object({
          fromDate: Joi.string().custom(dateValidation).optional(),
          toDate: Joi.string().custom(dateValidation).optional(),
          period: Joi.string()
            .valid(...Object.values(budgetPeriodEnum))
            .optional(),
        }).optional(),
      }).optional(),
      PLANNED: Joi.object({
        include: Joi.boolean().required(),
        parameters: Joi.object({
          fromDate: Joi.string().custom(dateValidation).optional(),
          toDate: Joi.string().custom(dateValidation).optional(),
        }).optional(),
      }).optional(),
      COSTLY_EXPENSES: Joi.object({
        include: Joi.boolean().required(),
        parameters: Joi.object({
          fromDate: Joi.string().custom(dateValidation).optional(),
          toDate: Joi.string().custom(dateValidation).optional(),
          labels: Joi.array()
            .items(Joi.string().trim().min(1))
            .min(1)
            .optional(),
        }).optional(),
      }).optional(),
    });

    const { error } = validateSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) return validateResponse(res, error);

    next();
  };
}

export default validate;
