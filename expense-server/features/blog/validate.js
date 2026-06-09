import Joi from "joi";
import { validateResponse } from "../../helper/apiResponse.js";

const options = {
  abortEarly: false,
};

class validate {
  static create = async (req, res, next) => {
    const validateSchema = Joi.object().keys({
      title: Joi.string().required(),
      description: Joi.string().required(),
      image: Joi.string().required(),
      html: Joi.string().allow("").required(),
    });
    const { error } = validateSchema.validate(req.body, options);
    if (error) return validateResponse(res, error);

    next();
  };

  static update = async (req, res, next) => {
    const validateSchema = Joi.object().keys({
      title: Joi.string().optional(),
      description: Joi.string().optional(),
      image: Joi.string().optional(),
      html: Joi.string().optional(),
    });
    const { error } = validateSchema.validate(req.body, options);
    if (error) return validateResponse(res, error);

    next();
  };
}

export default validate;
