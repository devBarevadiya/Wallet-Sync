import Joi from "joi";
import { validateResponse } from "../../helper/apiResponse.js";
import {
  paymentTypeEnum,
  transactionStatusEnum,
  transactionTypeEnum,
} from "../../config/enum.js";
import { dateValidation, objectIdValidation } from "../../helper/common.js";

const options = {
  abortEarly: false,
};

class validate {
  static get = async (req, res, next) => {
    const validateSchema = Joi.object().keys({
      page: Joi.number().optional(),
      limit: Joi.number().optional(),
      accounts: Joi.array()
        .items(Joi.string().custom(objectIdValidation))
        .min(1)
        .messages({
          "array.min": "At least one valid ID must be provided",
        })
        .optional(),
      fromDate: Joi.string()
        .custom(dateValidation)
        .label("fromDate")
        .optional(),
      toDate: Joi.string().custom(dateValidation).label("toDate").optional(),
      categories: Joi.array()
        .items(Joi.string().custom(objectIdValidation))
        .min(1)
        .messages({
          "array.min": "At least one valid ID must be provided",
        })
        .optional(),
      headCategories: Joi.array()
        .items(Joi.string().custom(objectIdValidation))
        .min(1)
        .messages({
          "array.min": "At least one valid ID must be provided",
        })
        .optional(),
      labels: Joi.array()
        .items(Joi.string().custom(objectIdValidation))
        .min(1)
        .messages({
          "array.min": "At least one valid ID must be provided",
        })
        .optional(),
      currencies: Joi.array()
        .items(Joi.string().custom(objectIdValidation))
        .min(1)
        .messages({
          "array.min": "At least one valid ID must be provided",
        })
        .optional(),
      recordTypes: Joi.array()
        .items(Joi.string().valid(...Object.values(transactionTypeEnum)))
        .min(1)
        .label("recordTypes")
        .messages({
          "array.min": "At least one valid ID must be provided",
        })
        .optional(),
      minAmount: Joi.number().label("minAmount").optional(),
      maxAmount: Joi.number().label("maxAmount").optional(),
      paymentTypes: Joi.array()
        .items(Joi.string().valid(...Object.values(paymentTypeEnum)))
        .min(1)
        .label("paymentTypes")
        .messages({
          "array.min": "At least one valid ID must be provided",
        })
        .optional(),
      recordStatuses: Joi.array()
        .items(Joi.string().valid(...Object.values(transactionStatusEnum)))
        .min(1)
        .label("recordStatuses")
        .messages({
          "array.min": "At least one valid ID must be provided",
        })
        .optional(),
      search: Joi.string().label("search").optional(),
      pagination: Joi.string().optional().valid("false"),
      payee: Joi.array()
        .items(Joi.string().custom(objectIdValidation))
        .min(1)
        .messages({
          "array.min": "At least one valid ID must be provided",
        })
        .optional(),
    });

    const { error } = validateSchema.validate(req.query, options);
    if (error) return validateResponse(res, error);

    next();
  };

  static create = async (req, res, next) => {
    const validateSchema = Joi.object().keys({
      type: Joi.string()
        .required()
        .label("type")
        .valid(...Object.values(transactionTypeEnum)),
      currency: Joi.string().required().label("currency"),
      amount: Joi.number().label("amount"),
      account: Joi.string().label("account").allow(""),
      to: Joi.string().label("to").allow(""),
      category: Joi.string().label("category").required(),
      date: Joi.string().label("date"),
      labels: Joi.array().label("labels"),
      note: Joi.string().label("note").allow(""),
      payee: Joi.custom(objectIdValidation).optional(),
      warranty: Joi.string().label("warranty").allow(""),
      paymentType: Joi.string()
        .allow("")
        .label("paymentType")
        .valid(...Object.values(paymentTypeEnum)),
      status: Joi.string()
        .required()
        .label("status")
        .valid(...Object.values(transactionStatusEnum)),
      location: Joi.string().label("location").allow(""),
      photo: Joi.string().label("photo").allow(""),
    });

    const { error, value } = validateSchema.validate(req.body, options);
    if (error) return validateResponse(res, error);

    req.body = value;

    next();
  };

  static patch = async (req, res, next) => {
    const validateSchema = Joi.object().keys({
      type: Joi.string()
        .empty()
        .label("type")
        .valid(...Object.values(transactionTypeEnum)),
      currency: Joi.string().empty().label("currency"),
      amount: Joi.number().label("amount"),
      account: Joi.string().allow("").label("account"),
      to: Joi.string().optional(),
      category: Joi.string().label("category"),
      date: Joi.string().empty().label("date"),
      labels: Joi.array().label("labels"),
      note: Joi.string().label("note").allow(""),
      payee: Joi.custom(objectIdValidation).allow(null).optional(),
      warranty: Joi.string().label("warranty").allow(""),
      paymentType: Joi.string()
        .empty()
        .label("paymentType")
        .valid(...Object.values(paymentTypeEnum)),
      status: Joi.string()
        .empty()
        .label("status")
        .valid(...Object.values(transactionStatusEnum)),
      location: Joi.string().label("location").allow("").optional(),
      photo: Joi.string().label("photo").allow("").optional(),
    });
    const { error } = validateSchema.validate(req.body, options);
    if (error) return validateResponse(res, error);

    next();
  };

  static deleteMany = async (req, res, next) => {
    const validateSchema = Joi.object().keys({
      ids: Joi.array()
        .items(Joi.string().custom(objectIdValidation))
        .min(1)
        .required(),
    });
    const { error } = validateSchema.validate(req.body, options);
    if (error) return validateResponse(res, error);

    next();
  };
}

export default validate;
