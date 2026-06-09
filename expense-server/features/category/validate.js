import Joi from "joi";
import { validateResponse } from "../../helper/apiResponse.js";
import {
  categoryIconTypeEnum,
  categoryNatureEnum,
  categoryTypeEnum,
} from "../../config/enum.js";

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
      icon: Joi.string().required().label("icon"),
      iconType: Joi.string()
        .required()
        .label("iconType")
        .valid(...Object.values(categoryIconTypeEnum)),
      nature: Joi.string()
        .required()
        .label("nature")
        .valid(...Object.values(categoryNatureEnum)),
      isDraft: Joi.boolean().label("isDraft"),
      isSaving: Joi.boolean().label("isSaving"),
    });
    const { error } = validateSchema.validate(req.body, options);
    if (error) return validateResponse(res, error);

    next();
  };

  static createHead = async (req, res, next) => {
    const validateSchema = Joi.object().keys({
      title: Joi.string().required(),
      icon: Joi.string().required(),
      color: Joi.string().optional(),
      type: Joi.string()
        .required()
        .valid(...Object.values(categoryTypeEnum)),
      nature: Joi.string()
        .required()
        .valid(...Object.values(categoryNatureEnum))
        .optional(),
      iconType: Joi.string()
        .required()
        .valid(...Object.values(categoryIconTypeEnum))
        .optional(),
    });
    const { error } = validateSchema.validate(req.body, options);
    if (error) return validateResponse(res, error);

    next();
  };

  static patchHead = async (req, res, next) => {
    const validateSchema = Joi.object().keys({
      title: Joi.string().empty(),
      icon: Joi.string().empty(),
      color: Joi.string().empty().optional(),
      type: Joi.string()
        .empty()
        .label("type")
        .valid(...Object.values(categoryTypeEnum)),
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
      icon: Joi.string().empty().label("icon"),
      nature: Joi.string()
        .empty()
        .label("nature")
        .valid(...Object.values(categoryNatureEnum)),
      iconType: Joi.string()
        .empty()
        .label("iconType")
        .valid(...Object.values(categoryIconTypeEnum)),
      isSaving: Joi.boolean().label("isSaving"),
    });
    const { error } = validateSchema.validate(req.body, options);
    if (error) return validateResponse(res, error);

    next();
  };
}

export default validate;
