import Joi from "joi";
import { validateResponse } from "../../helper/apiResponse.js";

const options = {
  abortEarly: false,
};

class validate {
  static create = async (req, res, next) => {
    const validateSchema = Joi.object().keys({
      symbol: Joi.string().required().label("symbol"),
      currency: Joi.string().required().label("currency"),
      code: Joi.string().required().label("code"),
    });
    const { error } = validateSchema.validate(req.body, options);
    if (error) return validateResponse(res, error);

    next();
  };

  static patch = async (req, res, next) => {
    const validateSchema = Joi.object().keys({
      symbol: Joi.string().empty().label("symbol"),
      currency: Joi.string().empty().label("currency"),
      code: Joi.string().empty().label("code"),
    });
    const { error } = validateSchema.validate(req.body, options);
    if (error) return validateResponse(res, error);

    next();
  };
}

export default validate;
