import Joi from "joi";
import { validateResponse } from "../../helper/apiResponse.js";
import {
  confirmationTypeEnum,
  everyTypeEnum,
  paymentTypeEnum,
  scheduleTypeEnum,
  templateTypeEnum,
  weekdaysEnums,
} from "../../config/enum.js";
import {
  dateValidation,
  isoDateValidation,
  objectIdValidation,
} from "../../helper/common.js";

const options = {
  abortEarly: false,
};

class validate {
  static get = async (req, res, next) => {
    const validateSchema = Joi.object().keys({
      page: Joi.number().optional(),
      limit: Joi.number().optional(),
      type: Joi.string().valid(...Object.values(templateTypeEnum)),
      everyType: Joi.array()
        .items(Joi.string().valid(...Object.values(everyTypeEnum)))
        .min(1)
        .optional(),
      scheduleType: Joi.string().valid(...Object.values(scheduleTypeEnum)),
      categories: Joi.array()
        .items(Joi.string().custom(objectIdValidation))
        .min(1)
        .optional(),

      sortBy: Joi.object({
        title: Joi.number().allow(1, -1),
        scheduleDate: Joi.number().allow(1, -1),
      }).optional(),
      query: Joi.string().optional(),
      accounts: Joi.array()
        .items(Joi.string().custom(objectIdValidation))
        .min(1)
        .optional(),
      currencies: Joi.array()
        .items(Joi.string().custom(objectIdValidation))
        .min(1)
        .optional(),
      labels: Joi.array()
        .items(Joi.string().custom(objectIdValidation))
        .min(1)
        .optional(),
    });
    const { error } = validateSchema.validate(req.body, options);
    if (error) return validateResponse(res, error);

    next();
  };
  static create = async (req, res, next) => {
    const validateSchema = Joi.object().keys({
      scheduleDate: Joi.date().iso().required(),
      type: Joi.string()
        .valid(...Object.values(templateTypeEnum))
        .required(),
      title: Joi.string().required(),
      account: Joi.string().custom(objectIdValidation).required(),
      category: Joi.string().custom(objectIdValidation).required(),
      confirmationType: Joi.string()
        .valid(...Object.values(confirmationTypeEnum))
        .required(),
      recipient: Joi.string().custom(objectIdValidation).optional(),
      paymentType: Joi.string()
        .valid(...Object.values(paymentTypeEnum))
        .required(),
      amount: Joi.number().required(),
      scheduleType: Joi.string()
        .valid(...Object.values(scheduleTypeEnum))
        .required(),

      labels: Joi.array()
        .items(Joi.string().custom(objectIdValidation))
        .min(1)
        .messages({
          "array.min": "At least one valid ID must be provided",
        })
        .optional(),
      note: Joi.string().optional(),
      every: Joi.number().optional(),
      everyType: Joi.string()
        .valid(...Object.values(everyTypeEnum))
        .optional(),
      stopDate: Joi.string().custom(dateValidation).optional(),
      maxRepetitions: Joi.number().optional(),
      weekday: Joi.string()
        .valid(...Object.keys(weekdaysEnums))
        .optional(),
    });
    const { error } = validateSchema.validate(req.body, options);
    if (error) return validateResponse(res, error);

    next();
  };

  static patch = async (req, res, next) => {
    const validateSchema = Joi.object().keys({
      scheduleDate: Joi.date().iso().optional(),
      type: Joi.string()
        .valid(...Object.values(templateTypeEnum))
        .optional(),
      title: Joi.string().optional(),
      account: Joi.string().custom(objectIdValidation).optional(),
      category: Joi.string().custom(objectIdValidation).optional(),
      confirmationType: Joi.string()
        .valid(...Object.values(confirmationTypeEnum))
        .optional(),
      recipient: Joi.string().custom(objectIdValidation).optional(),
      paymentType: Joi.string()
        .valid(...Object.values(paymentTypeEnum))
        .optional(),
      amount: Joi.number().optional(),
      scheduleType: Joi.string()
        .valid(...Object.values(scheduleTypeEnum))
        .optional(),
      labels: Joi.array()
        .items(Joi.string().custom(objectIdValidation))
        .min(0)
        .messages({
          "array.min": "At least one valid ID must be provided",
        })
        .optional(),
      note: Joi.string().allow("").optional(),
      every: Joi.number().optional(),
      everyType: Joi.string()
        .valid(...Object.values(everyTypeEnum))
        .optional(),
      stopDate: Joi.string().custom(dateValidation).allow(null).optional(),
      maxRepetitions: Joi.number().allow(null).optional(),
      weekday: Joi.string()
        .valid(...Object.keys(weekdaysEnums))
        .optional(),
    });
    const { error } = validateSchema.validate(req.body, options);
    if (error) return validateResponse(res, error);

    next();
  };
}

export default validate;
