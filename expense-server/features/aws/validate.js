import Joi from "joi";
import { validateResponse } from "../../helper/apiResponse.js";

class validate {
  static create = (req, res, next) => {
    const validateSchema = Joi.object().keys({
      dirName: Joi.string().label("dirName").required(),
      contentType: Joi.string().label("contentType").required(),
    });

    const { error } = validateSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) return validateResponse(res, error);

    next();
  };
  static store = (req, res, next) => {
    const validateSchema = Joi.object().keys({
      dirName: Joi.string().label("dirName").required(),
      file: Joi.string().label("file"),
    });

    const { error } = validateSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) return validateResponse(res, error);

    next();
  };
}

export default validate;
