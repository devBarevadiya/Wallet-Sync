import Joi from "joi";
import { validateResponse } from "../../helper/apiResponse.js";

const options = {
  abortEarly: false,
};

class validate {
  static create = async (req, res, next) => {
    const validateSchema = Joi.object().keys({
      count: Joi.number().min(1).required(),
      tag: Joi.string().trim().min(1).required(),
      validFrom: Joi.date().required(),
      validUntil: Joi.date().required(),
      trialDays: Joi.number().min(0).required().allow(-1),
    });
    const { error } = validateSchema.validate(req.body, options);
    if (error) return validateResponse(res, error);

    next();
  };

  static delete = async (req, res, next) => {
    const validateSchema = Joi.object().keys({
      ids: Joi.array()
        .items(Joi.string().trim().min(1).required())
        .min(1)
        .required(),
    });

    const { error } = validateSchema.validate(req.body, options);
    if (error) return validateResponse(res, error);

    next();
  };
  static applyPromoCode = async (req, res, next) => {
    const validateSchema = Joi.object().keys({
      code: Joi.string().trim().min(1).required(),
    });

    const { error } = validateSchema.validate(req.body, options);
    if (error) return validateResponse(res, error);

    next();
  };
}

export default validate;
