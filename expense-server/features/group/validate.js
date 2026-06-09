import Joi from "joi";
import { validateResponse } from "../../helper/apiResponse.js";
import { accountPermissionEnum } from "../../config/enum.js";
import { objectIdValidation } from "../../helper/common.js";

const options = {
  abortEarly: false,
};

class validate {
  static create = async (req, res, next) => {
    const validateSchema = Joi.object().keys({
      title: Joi.string().required(),
      icon: Joi.string().optional(),
    });
    const { error } = validateSchema.validate(req.body, options);
    if (error) return validateResponse(res, error);

    next();
  };
  static patch = async (req, res, next) => {
    const validateSchema = Joi.object().keys({
      title: Joi.string().optional(),
      icon: Joi.string().optional(),
    });
    const { error } = validateSchema.validate(req.body, options);
    if (error) return validateResponse(res, error);

    next();
  };

  static changePermission = async (req, res, next) => {
    const validateSchema = Joi.object({
      email: Joi.string().email().required(),
      accounts: Joi.array()
        .items(
          Joi.object({
            account: Joi.string().custom(objectIdValidation).required(),
            permission: Joi.string()
              .valid(...Object.values(accountPermissionEnum))
              .required(),
          })
        )
        .min(1)
        .required(),
    });

    const { error } = validateSchema.validate(req.body, options);

    if (error) return validateResponse(res, error);

    next();
  };

  static addToGroup = async (req, res, next) => {
    const validateSchema = Joi.object().keys({
      email: Joi.string().label("email").email().required(),
      accounts: Joi.array()
        .items(
          Joi.object({
            account: Joi.string().label("account").required(),
            permission: Joi.string()
              .label("permission")
              .required()
              .valid(...Object.values(accountPermissionEnum)),
          })
        )
        .required()
        .min(0)
        .label("accounts"),
    });

    const { error } = validateSchema.validate(req.body, options);
    if (error) return validateResponse(res, error);

    next();
  };
}

export default validate;
