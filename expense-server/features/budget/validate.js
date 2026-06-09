import Joi from "joi";
import { validateResponse } from "../../helper/apiResponse.js";
import {
  budgetRolloverUserResponse,
  budgetSpendLimitType,
  budgetStatusType,
  budgetPeriodEnum,
} from "../../config/enum.js";
import { dateValidation, objectIdValidation } from "../../helper/common.js";

const options = {
  abortEarly: false,
};

const categorySchema = Joi.object({
  category: Joi.custom(objectIdValidation).required(),
  maxAmount: Joi.number().required(),
  spendLimitType: Joi.string()
    .required()
    .valid(...Object.values(budgetSpendLimitType)),
});

const headCategorySchema = Joi.object({
  headCategory: Joi.custom(objectIdValidation).required(),
  maxAmount: Joi.number().required(),
  spendLimitType: Joi.string()
    .required()
    .valid(...Object.values(budgetSpendLimitType)),
  categories: Joi.array().items(categorySchema).optional(),
});

class validate {
  static getTransactionsForBudget = async (req, res, next) => {
    const validateSchema = Joi.object({
      page: Joi.number().optional(),
      limit: Joi.number().optional(),
      categories: Joi.array()
        .items(Joi.custom(objectIdValidation))
        .min(1)
        .optional(),
      currencies: Joi.array()
        .items(Joi.custom(objectIdValidation))
        .min(1)
        .optional(),
      accounts: Joi.array()
        .items(Joi.custom(objectIdValidation))
        .min(1)
        .optional(),
      labels: Joi.array()
        .items(Joi.custom(objectIdValidation))
        .min(1)
        .optional(),
      fromDate: Joi.string().custom(dateValidation),
      toDate: Joi.string().custom(dateValidation),
    });

    const { error } = validateSchema.validate(req.body, options);

    if (error) return validateResponse(res, error);

    next();
  };

  static patchRollover = async (req, res, next) => {
    const validateSchema = Joi.object({
      userResponse: Joi.string()
        .required()
        .valid(...Object.values(budgetRolloverUserResponse)),
    });

    const { error } = validateSchema.validate(req.body, options);

    if (error) return validateResponse(res, error);

    next();
  };

  static addHeadCategory = async (req, res, next) => {
    const validateSchema = Joi.array().items({
      headCategory: Joi.custom(objectIdValidation).required(),
      maxAmount: Joi.number().required(),
      spendLimitType: Joi.string()
        .required()
        .valid(...Object.values(budgetSpendLimitType)),
    });

    const { error } = validateSchema.validate(req.body, options);

    if (error) return validateResponse(res, error);

    next();
  };

  static addCategory = async (req, res, next) => {
    const validateSchema = Joi.array().items({
      category: Joi.custom(objectIdValidation).required(),
      maxAmount: Joi.number().required(),
      spendLimitType: Joi.string()
        .required()
        .valid(...Object.values(budgetSpendLimitType)),
    });

    const { error } = validateSchema.validate(req.body, options);

    if (error) return validateResponse(res, error);

    next();
  };

  static create = async (req, res, next) => {
    const validateSchema = Joi.object().keys({
      name: Joi.string().required(),
      period: Joi.string()
        .required()
        .valid(...Object.values(budgetPeriodEnum)),
      maxAmount: Joi.number().required().positive(),
      headCategories: Joi.array().items(headCategorySchema).min(1).required(),
      accounts: Joi.array()
        .items(Joi.custom(objectIdValidation))
        .min(1)
        .required(),
    });

    const { error } = validateSchema.validate(req.body, options);

    if (error) return validateResponse(res, error);

    next();
  };

  static get = async (req, res, next) => {
    const validateSchema = Joi.object().keys({
      page: Joi.number().optional(),
      limit: Joi.number().optional(),
      status: Joi.string()
        .valid(...Object.values(budgetStatusType).concat("ALL"))
        .optional(),
      period: Joi.string()
        .valid(...Object.values(budgetPeriodEnum))
        .optional(),
      name: Joi.string().optional(),
    });

    const { error } = validateSchema.validate(req.body, options);

    if (error) return validateResponse(res, error);

    next();
  };

  static patch = async (req, res, next) => {
    const validateSchema = Joi.object().keys({
      name: Joi.string().optional(),
      status: Joi.string()
        .valid(...Object.values(budgetStatusType))
        .optional(),
      period: Joi.string()
        .valid(...Object.values(budgetPeriodEnum))
        .optional(),
      maxAmount: Joi.number().optional(),
      headCategories: Joi.array().items(headCategorySchema).min(1).optional(),
      accounts: Joi.array()
        .items(Joi.string().custom(objectIdValidation))
        .min(1)
        .optional(),
    });

    const { error } = validateSchema.validate(req.body, options);

    if (error) return validateResponse(res, error);

    next();
  };
}

export default validate;
