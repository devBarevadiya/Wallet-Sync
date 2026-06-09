import Joi from "joi";
import { validateResponse } from "../../helper/apiResponse.js";
import { objectIdValidation } from "../../helper/common.js";
import { deviceTypeEnum } from "../../config/enum.js";

const options = {
  abortEarly: false,
};

class validate {
  static sendCustomNotification = async (req, res, next) => {
    const validateSchema = Joi.object().keys({
      title: Joi.string().required(),
      description: Joi.string().required(),
      deviceTypes: Joi.array()
        .items(Joi.string().valid(...Object.values(deviceTypeEnum)))
        .min(1)
        .required(),
    });

    const { error } = validateSchema.validate(req.body, options);
    if (error) return validateResponse(res, error);

    next();
  };

  static getAllByPagination = async (req, res, next) => {
    const validateSchema = Joi.object().keys({
      page: Joi.number().optional(),
      limit: Joi.number().optional(),
    });
    const { error } = validateSchema.validate(req.query, options);
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
