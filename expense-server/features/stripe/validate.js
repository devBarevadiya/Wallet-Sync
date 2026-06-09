import Joi from "joi";
import { validateResponse } from "../../helper/apiResponse.js";
import moment from "moment";

const options = {
  abortEarly: false,
};

class validate {
  static updateSubscriptionPlan = async (req, res, next) => {
    const validateSchema = Joi.object({
      priceId: Joi.string().required(),
    });

    const { error } = validateSchema.validate(req.body, options);
    if (error) return validateResponse(res, error);

    next();
  };
  static createSession = async (req, res, next) => {
    const validateSchema = Joi.object({
      priceId: Joi.string().required(),
      subscriptionName: Joi.string().required(),
      paymentSuccessUrl: Joi.string().uri().required(),
      paymentCancelUrl: Joi.string().uri().required(),
    });

    const { error } = validateSchema.validate(req.body, options);
    if (error) return validateResponse(res, error);

    next();
  };

  static cancelSubscription = async (req, res, next) => {
    const validateSchema = Joi.object({
      cancelAtPeriodEnd: Joi.boolean().valid(true).optional(),
      cancelAt: Joi.number()
        .integer()
        .positive()
        .custom((value, helpers) => {
          const currentUnixTime = moment().unix();
          if (value <= currentUnixTime) {
            return helpers.error("any.invalid");
          }
          return value;
        })
        .messages({
          "any.invalid":
            "Timestamp must be a valid Unix timestamp and be after the current time",
        })
        .optional(),
    })
      .or("cancelAtPeriodEnd", "cancelAt")
      .messages({
        "object.missing": "Either cancelAtPeriodEnd or cancelAt is required",
      });

    const { error } = validateSchema.validate(req.body, options);
    if (error) return validateResponse(res, error);

    next();
  };
}

export default validate;
