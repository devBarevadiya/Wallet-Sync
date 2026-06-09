import Joi from "joi";
import { validateResponse } from "../../helper/apiResponse.js";

const options = {
  abortEarly: false,
};

class validate {
  static create = async (req, res, next) => {
    const validateSchema = Joi.object().keys({
      title: Joi.string().required().label("title"),
      balance: Joi.number().required().label("balance"),
      currency: Joi.string().required().label("currency"),
      accountType: Joi.string().required().label("Account Type"),
      accountNumber: Joi.string().allow("").label("Account Number"),

      color: Joi.string()
        .required()
        .regex(/^#[0-9A-Fa-f]+$/)
        .label("color"),
    });
    const { error } = validateSchema.validate(req.body, options);
    if (error) return validateResponse(res, error);

    next();
  };

  static patch = async (req, res, next) => {
    const validateSchema = Joi.object().keys({
      title: Joi.string().empty().label("title"),
      balance: Joi.number().empty().label("balance"),
      accountType: Joi.string().empty().label("Account Type"),
      currency: Joi.string().empty().label("currency"),
      accountNumber: Joi.string().empty().label("Account Number"),
      isArchive: Joi.boolean().empty().label("isArchive"),
      color: Joi.string()
        .empty()
        .regex(/^#[0-9A-Fa-f]+$/)
        .label("color"),
    });
    const { error } = validateSchema.validate(req.body, options);
    if (error) return validateResponse(res, error);

    next();
  };
}

export default validate;
