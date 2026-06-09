import Joi from "joi";
import { validateResponse } from "../../helper/apiResponse.js";
import { objectIdValidation } from "../../helper/common.js";

const options = {
  abortEarly: false,
};

class validate {
  static create = async (req, res, next) => {
    const validateSchema = Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().optional(),
      mobile: Joi.number().optional(),
      business: Joi.string().optional(),
    });
    const { error } = validateSchema.validate(req.body, options);
    if (error) return validateResponse(res, error);

    next();
  };

  static update = async (req, res, next) => {
    const validateSchema = Joi.object({
      name: Joi.string().optional(),
      email: Joi.string().email().allow(null).optional(),
      mobile: Joi.number().allow(null).optional(),
      business: Joi.string().allow(null).optional(),
    });
    const { error } = validateSchema.validate(req.body, options);
    if (error) return validateResponse(res, error);

    next();
  };

  static deleteMany = async (req, res, next) => {
    const validateSchema = Joi.object({
      ids: Joi.array().items(Joi.custom(objectIdValidation)).min(1),
    });
    const { error } = validateSchema.validate(req.body, options);
    if (error) return validateResponse(res, error);

    next();
  };
}

export default validate;
