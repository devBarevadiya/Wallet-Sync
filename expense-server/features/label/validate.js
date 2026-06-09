import Joi from "joi";
import { validateResponse } from "../../helper/apiResponse.js";

const options = {
  abortEarly: false,
};

class validate {
  static create = async (req, res, next) => {
    const validateSchema = Joi.object().keys({
      title: Joi.string().required().label("title"),
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
