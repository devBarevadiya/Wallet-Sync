import Joi from "joi";
import { validateResponse } from "../../helper/apiResponse.js";
import {
  confirmationTypeEnum,
  everyTypeEnum,
  paymentStatusEnum,
  paymentTypeEnum,
  scheduleTypeEnum,
  templateTypeEnum,
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
    });
    const { error } = validateSchema.validate(req.query, options);
    if (error) return validateResponse(res, error);

    next();
  };
  static patch = async (req, res, next) => {
    const validateSchema = Joi.object().keys({
      amount: Joi.number().optional(),
      paymentDate: Joi.string().custom(dateValidation).optional(),
      account: Joi.string().custom(objectIdValidation).optional(),
      status: Joi.string()
        .valid(...Object.values(paymentStatusEnum))
        .optional(),
    });
    const { error } = validateSchema.validate(req.body, options);
    if (error) return validateResponse(res, error);

    next();
  };
}

export default validate;
