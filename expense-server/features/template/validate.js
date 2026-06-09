import Joi from "joi";
import { validateResponse } from "../../helper/apiResponse.js";
import { paymentTypeEnum, templateTypeEnum } from "../../config/enum.js";
import { objectIdValidation } from "../../helper/common.js";

const options = {
  abortEarly: false,
};

class validate {
  static create = async (req, res, next) => {
    const validateSchema = Joi.object().keys({
      title: Joi.string().required().label("title"),
      account: Joi.string().required().label("account"),
      category: Joi.string().label("category"),
      amount: Joi.number().label("amount"),
      type: Joi.string()
        .required()
        .label("type")
        .valid(...Object.values(templateTypeEnum)),
      currency: Joi.string().required().label("currency"),
      payWith: Joi.custom(objectIdValidation).optional(),
      labels: Joi.array().label("labels"),
      paymentType: Joi.string()
        .required()
        .label("paymentType")
        .valid(...Object.values(paymentTypeEnum)),
      note: Joi.string().label("note").allow(""),
    });
    const { error } = validateSchema.validate(req.body, options);
    if (error) return validateResponse(res, error);

    next();
  };

  static patch = async (req, res, next) => {
    const validateSchema = Joi.object().keys({
      title: Joi.string().empty().label("title"),
      account: Joi.string().empty().label("account"),
      category: Joi.string().label("category"),
      amount: Joi.number().label("amount"),
      type: Joi.string()
        .label("type")
        .valid(...Object.values(templateTypeEnum)),
      currency: Joi.string().empty().label("currency"),
      payWith: Joi.custom(objectIdValidation).optional().allow(null),
      labels: Joi.array().label("labels"),
      paymentType: Joi.string()
        .empty()
        .label("paymentType")
        .valid(...Object.values(paymentTypeEnum)),
      note: Joi.string().label("note").allow(""),
    });

    // console.log(req.body);
    const { error } = validateSchema.validate(req.body, options);
    if (error) return validateResponse(res, error);

    next();
  };
}

export default validate;
