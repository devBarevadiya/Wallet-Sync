import Joi from "joi";

import { errorResponse, validateResponse } from "../../helper/apiResponse.js";
import { comparePasswords } from "../../helper/bcryptPassword.js";
import { verifyToken } from "../../helper/jwtToken.js";
import { AuthErrorObj } from "../../middleware/verifyMiddleware.js";
import UserModel from "./model.js";
import {
  authRoleEnum,
  deviceTypeEnum,
  allowedNotificationsEnum,
  authProviderEnum,
} from "../../config/enum.js";
import { objectIdValidation } from "../../helper/common.js";

const options = {
  abortEarly: false,
};

class validate {
  static addDeviceToken = async (req, res, next) => {
    const validateSchema = Joi.object({
      deviceToken: Joi.string().required(),
      deviceType: Joi.string()
        .valid(...Object.values(deviceTypeEnum))
        .required(),
    });

    const { error } = validateSchema.validate(req.body, options);
    if (error) return validateResponse(res, error);

    next();
  };
  static logout = async (req, res, next) => {
    const validateSchema = Joi.object({
      deviceToken: Joi.string().optional(),
    });

    const { error } = validateSchema.validate(req.body, options);
    if (error) return validateResponse(res, error);

    next();
  };

  static setAllowedNotification = async (req, res, next) => {
    const validateSchema = Joi.object({
      allowedNotifications: Joi.array()
        .items(Joi.string().valid(...Object.values(allowedNotificationsEnum)))
        .optional(),
      txnThresholdAmount: Joi.number().optional(),
      notifyOnTxnAccounts: Joi.array().items(
        Joi.string().custom(objectIdValidation)
      ),
      notifyOnTxnLabels: Joi.array().items(
        Joi.string().custom(objectIdValidation)
      ),
      notifyOnTxnHeadCategories: Joi.array().items(
        Joi.string().custom(objectIdValidation)
      ),
    });

    const { error } = validateSchema.validate(req.body, options);
    if (error) return validateResponse(res, error);

    next();
  };

  static register = async (req, res, next) => {
    const validateSchema = Joi.object().keys({
      email: Joi.string().required().label("email").email(),
      password: Joi.string().required().label("password"),
      username: Joi.string().required(),
      deepLinkToken: Joi.string().optional(),
    });

    const { error } = validateSchema.validate(req.body, options);
    if (error) return validateResponse(res, error);

    let userCtn = await UserModel.countDocuments({ email: req.body.email });

    if (userCtn > 0)
      return errorResponse({ res, message: "User already exists" });

    next();
  };

  static registerFirebase = async (req, res, next) => {
    const validateSchema = Joi.object().keys({
      token: Joi.string().required().label("token"),
      currency: Joi.string().required().label("currency"),
    });
    const { error } = validateSchema.validate(req.body, options);
    if (error) return validateResponse(res, error);

    next();
  };

  static loginFirebase = async (req, res, next) => {
    const validateSchema = Joi.object().keys({
      token: Joi.string().required().label("token"),
      deepLinkToken: Joi.string().optional(),
    });
    const { error } = validateSchema.validate(req.body, options);
    if (error) return validateResponse(res, error);

    next();
  };

  static login = async (req, res, next) => {
    const validateSchema = Joi.object().keys({
      email: Joi.string().required().label("email"),
      password: Joi.string().required().label("password"),
    });

    const { error } = validateSchema.validate(req.body, options);
    if (error) return validateResponse(res, error);

    const { email, password } = req.body;

    let user = await UserModel.findOne({ email })
      .populate({
        path: "currencies.currency",
      })
      .select("-createdAt -updatedAt");

    if (!user)
      return errorResponse({ res, message: "invalid user credentials" });

    if (!user.password)
      return errorResponse({
        res,
        message: "You have to login with social media",
      });

    const verifyPassword = await comparePasswords(password, user.password);

    if (!verifyPassword)
      return errorResponse({ res, message: "invalid user credentials" });

    user = user.toObject();

    delete user.password;

    req.user = user;
    next();
  };

  static setCurrency = async (req, res, next) => {
    const validateSchema = Joi.object().keys({
      currency: Joi.string().required().label("currency"),
    });
    const { error } = validateSchema.validate(req.body, options);
    if (error) return validateResponse(res, error);

    next();
  };

  static patch = async (req, res, next) => {
    const validateSchema = Joi.object().keys({
      username: Joi.string().empty().label("username"),
      avatar: Joi.string().allow("").label("avatar"),
    });
    const { error } = validateSchema.validate(req.body, options);
    if (error) return validateResponse(res, error);

    next();
  };

  static patchBaseCurrency = async (req, res, next) => {
    const validateSchema = Joi.object().keys({
      currency: Joi.string().required().label("currency"),
    });
    const { error } = validateSchema.validate(req.body, options);
    if (error) return validateResponse(res, error);

    next();
  };

  static patchRole = async (req, res, next) => {
    const validateSchema = Joi.object().keys({
      role: Joi.string()
        .required()
        .label("role")
        .valid(...Object.values(authRoleEnum)),
    });
    const { error } = validateSchema.validate(req.body, options);
    if (error) return validateResponse(res, error);

    next();
  };

  static forgotPassword = async (req, res, next) => {
    const validateSchema = Joi.object().keys({
      email: Joi.string().required().label("email"),
    });
    const { error } = validateSchema.validate(req.body, options);
    if (error) return validateResponse(res, error);

    let user = await UserModel.findOne({ email: req.body.email });

    if (!user)
      return errorResponse({
        res,
        message: "user with this email dose not exist",
      });

    req.user = user;

    next();
  };

  static otpVerification = async (req, res, next) => {
    const validateSchema = Joi.object().keys({
      otp: Joi.number().integer().required().label("otp"),
      email: Joi.string().email().required().label("email"),
    });
    const { error } = validateSchema.validate(req.body, options);
    if (error) return validateResponse(res, error);

    next();
  };

  static resetPassword = async (req, res, next) => {
    const validateSchema = Joi.object().keys({
      password: Joi.string().required().label("password"),
      confirm_password: Joi.string()
        .valid(Joi.ref("password"))
        .required()
        .messages({
          "any.only": "Confirm Password does not match Password",
          "any.required": "Confirm Password is a required field",
        }),
    });
    const { error } = validateSchema.validate(req.body, options);
    if (error) return validateResponse(res, error);

    const { token } = req.params;

    let userId;

    try {
      const payload = await verifyToken(token);
      userId = payload.userId;
    } catch (error) {
      return errorResponse({
        res,
        statusCode: 401,
        message: "Invalid token or token has expired",
      });
    }

    const user = await UserModel.findById(userId);
    req.user = user;

    next();
  };

  static changePassword = async (req, res, next) => {
    const validateSchema = Joi.object().keys({
      old_password: Joi.string().required().label("Old Password").messages({
        "string.base": "Old Password should be a type of string",
        "string.empty": "Old Password cannot be an empty field",
        "any.required": "Old Password is a required field",
      }),
      password: Joi.string()
        .required()
        .label("Password")
        .invalid(Joi.ref("old_password"))
        .messages({
          "string.base": "Password should be a type of string",
          "string.empty": "Password cannot be an empty field",
          "any.required": "Password is a required field",
          "any.invalid": "New Password cannot be the same as the Old Password",
        }),
      confirm_password: Joi.string()
        .valid(Joi.ref("password"))
        .required()
        .messages({
          "any.only": "Confirm Password does not match Password",
          "any.required": "Confirm Password is a required field",
        }),
    });
    const { error } = validateSchema.validate(req.body, options);

    if (error) return validateResponse(res, error);

    const user = await UserModel.findById(req.user._id)
      .select("password authProvider")
      .lean();

    const authProviderName = String(user.authProvider).toLowerCase();

    if (user.authProvider !== authProviderEnum.LOCAL) {
      return errorResponse({
        res,
        statusCode: 400,
        message: `Password change is not allowed for users logged in via ${authProviderName}. Please change your password via ${authProviderName}'s account settings`,
      });
    }

    const verifyPassword = await comparePasswords(
      req.body.old_password,
      user.password
    );

    if (!verifyPassword) {
      return errorResponse({ res, message: "old password is incorrect" });
    }

    next();
  };
}

export default validate;
