import { authRoleEnum } from "../config/enum.js";
import { errorResponse } from "../helper/apiResponse.js";

export const errorObj = {
  details: [
    {
      path: "message",
      message: "You don't have permission to perform this action",
    },
  ],
};

export const checkAuthorization = ({
  permission,
  comparisonFn = ({ req }) => true,
}) => {
  return (req, res, next) => {
    try {
      const loginUserRole = req.user.role;

      const allowedRoles = rules[permission];

      const canAccess =
        allowedRoles?.includes(loginUserRole) && comparisonFn({ req });

      if (canAccess) {
        next();
      } else {
        return errorResponse({
          error: new Error("You don't have permission to access resource"),
          funName: "middleware.checkAuthorization",
          res,
          message: "You don't have permission to access resource",
          statusCode: 403,
        });
      }
    } catch (error) {
      console.log(`[ERROR] ${error}`);
      return errorResponse({
        error,
        funName: "middleware.checkAuthorization",
        res,
        message: "Internal server error",
        statusCode: 500,
      });
    }
  };
};

export const permissions = {
  // Promo code
  GENERATE_PROMO_CODE: "GENERATE_PROMO_CODE",
  GET_PROMO_CODE: "GET_PROMO_CODE",
  DELETE_PROMO_CODE: "DELETE_PROMO_CODE",

  // Setting
  GET_SETTING: "GET_SETTING",
  UPDATE_SETTING: "UPDATE_SETTING",

  // notification module
  SEND_CUSTOM_NOTIFICATION: "SEND_CUSTOM_NOTIFICATION",

  // User module
  CHANGE_PASSWORD: "CHANGE_PASSWORD",
  PATCH_USER_PROFILE: "PATCH_USER_PROFILE",
  PATCH_USER_ROLE: "PATCH_USER_ROLE",
  GET_ALL_USER: "GET_ALL_USER",
  GET_USER: "GET_USER",
  DELETE_USER: "DELETE_USER",

  // Account module
  POST_ACCOUNT: "POST_ACCOUNT",
  PATCH_ACCOUNT: "PATCH_ACCOUNT",
  GET_ACCOUNT: "GET_ACCOUNT",
  DELETE_ACCOUNT: "DELETE_ACCOUNT",

  // Template module
  POST_TEMPLATE: "POST_TEMPLATE",
  PATCH_TEMPLATE: "PATCH_TEMPLATE",
  GET_TEMPLATE: "GET_TEMPLATE",
  DELETE_TEMPLATE: "DELETE_TEMPLATE",

  // Planned module
  POST_PLANNED: "POST_PLANNED",
  PATCH_PLANNED: "PATCH_PLANNED",
  GET_PLANNED: "GET_PLANNED",
  DELETE_PLANNED: "DELETE_PLANNED",

  // Budget module
  POST_BUDGET: "POST_BUDGET",
  PATCH_BUDGET: "PATCH_BUDGET",
  GET_BUDGET: "GET_BUDGET",
  DELETE_BUDGET: "DELETE_BUDGET",

  // Transaction module
  POST_TRANSACTION: "POST_TRANSACTION",
  PATCH_TRANSACTION: "PATCH_TRANSACTION",
  GET_TRANSACTION: "GET_TRANSACTION",
  DELETE_TRANSACTION: "DELETE_TRANSACTION",
  DELETE_MANY_TRANSACTION: "DELETE_MANY_TRANSACTION",

  // Currency module
  POST_CURRENCY: "POST_CURRENCY",
  PATCH_CURRENCY: "PATCH_CURRENCY",
  GET_CURRENCY: "GET_CURRENCY",
  DELETE_CURRENCY: "DELETE_CURRENCY",

  // Label module
  POST_LABEL: "POST_LABEL",
  PATCH_LABEL: "PATCH_LABEL",
  GET_LABEL: "GET_LABEL",
  DELETE_LABEL: "DELETE_LABEL",

  // AccountType module
  POST_ACCOUNT_TYPE: "POST_ACCOUNT_TYPE",
  PATCH_ACCOUNT_TYPE: "PATCH_ACCOUNT_TYPE",
  GET_ACCOUNT_TYPE: "GET_ACCOUNT_TYPE",
  DELETE_ACCOUNT_TYPE: "DELETE_ACCOUNT_TYPE",

  // Category module
  POST_CATEGORY: "POST_CATEGORY",
  PATCH_CATEGORY: "PATCH_CATEGORY",
  GET_CATEGORY: "GET_CATEGORY",
  ARCHIVE_CATEGORY: "ARCHIVE_CATEGORY",

  // Blog module
  CREATE_BLOG: "CREATE_BLOG",
  UPDATE_BLOG: "UPDATE_BLOG",
  DELETE_BLOG: "DELETE_BLOG",
};

const rules = {
  // Promo code
  [permissions.GENERATE_PROMO_CODE]: [authRoleEnum.ADMIN],
  [permissions.GET_PROMO_CODE]: [authRoleEnum.ADMIN],
  [permissions.DELETE_PROMO_CODE]: [authRoleEnum.ADMIN],

  // Setting
  [permissions.GET_SETTING]: [authRoleEnum.ADMIN, authRoleEnum.USER],
  [permissions.UPDATE_SETTING]: [authRoleEnum.ADMIN],

  // Notification
  [permissions.SEND_CUSTOM_NOTIFICATION]: [authRoleEnum.ADMIN],

  // User
  [permissions.CHANGE_PASSWORD]: [authRoleEnum.ADMIN, authRoleEnum.USER],
  [permissions.PATCH_USER_PROFILE]: [authRoleEnum.ADMIN, authRoleEnum.USER],
  [permissions.PATCH_USER_ROLE]: [authRoleEnum.ADMIN],
  [permissions.GET_ALL_USER]: [authRoleEnum.ADMIN],
  [permissions.DELETE_USER]: [authRoleEnum.ADMIN],
  [permissions.GET_USER]: [authRoleEnum.ADMIN, authRoleEnum.USER],

  // Account
  [permissions.POST_ACCOUNT]: [authRoleEnum.ADMIN, authRoleEnum.USER],
  [permissions.PATCH_ACCOUNT]: [authRoleEnum.ADMIN, authRoleEnum.USER],
  [permissions.GET_ACCOUNT]: [authRoleEnum.ADMIN, authRoleEnum.USER],
  [permissions.DELETE_ACCOUNT]: [authRoleEnum.ADMIN, authRoleEnum.USER],

  // Currency
  [permissions.POST_CURRENCY]: [authRoleEnum.ADMIN],
  [permissions.PATCH_CURRENCY]: [authRoleEnum.ADMIN],
  [permissions.GET_CURRENCY]: [authRoleEnum.ADMIN, authRoleEnum.USER],
  [permissions.DELETE_CURRENCY]: [authRoleEnum.ADMIN],

  // Label
  [permissions.POST_LABEL]: [authRoleEnum.ADMIN, authRoleEnum.USER],
  [permissions.PATCH_LABEL]: [authRoleEnum.ADMIN, authRoleEnum.USER],
  [permissions.GET_LABEL]: [authRoleEnum.ADMIN, authRoleEnum.USER],
  [permissions.DELETE_LABEL]: [authRoleEnum.ADMIN, authRoleEnum.USER],

  // AccountType
  [permissions.POST_ACCOUNT_TYPE]: [authRoleEnum.ADMIN],
  [permissions.PATCH_ACCOUNT_TYPE]: [authRoleEnum.ADMIN],
  [permissions.GET_ACCOUNT_TYPE]: [authRoleEnum.ADMIN, authRoleEnum.USER],
  [permissions.DELETE_ACCOUNT_TYPE]: [authRoleEnum.ADMIN],

  // Category
  [permissions.POST_CATEGORY]: [authRoleEnum.ADMIN, authRoleEnum.USER],
  [permissions.PATCH_CATEGORY]: [authRoleEnum.ADMIN, authRoleEnum.USER],
  [permissions.GET_CATEGORY]: [authRoleEnum.ADMIN, authRoleEnum.USER],
  [permissions.ARCHIVE_CATEGORY]: [authRoleEnum.ADMIN, authRoleEnum.USER],

  // Template
  [permissions.POST_TEMPLATE]: [authRoleEnum.ADMIN, authRoleEnum.USER],
  [permissions.PATCH_TEMPLATE]: [authRoleEnum.ADMIN, authRoleEnum.USER],
  [permissions.GET_TEMPLATE]: [authRoleEnum.ADMIN, authRoleEnum.USER],
  [permissions.DELETE_TEMPLATE]: [authRoleEnum.ADMIN, authRoleEnum.USER],

  // Planned
  [permissions.POST_PLANNED]: [authRoleEnum.ADMIN, authRoleEnum.USER],
  [permissions.PATCH_PLANNED]: [authRoleEnum.ADMIN, authRoleEnum.USER],
  [permissions.GET_PLANNED]: [authRoleEnum.ADMIN, authRoleEnum.USER],
  [permissions.DELETE_PLANNED]: [authRoleEnum.ADMIN, authRoleEnum.USER],

  // Budger
  [permissions.POST_BUDGET]: [authRoleEnum.ADMIN, authRoleEnum.USER],
  [permissions.PATCH_BUDGET]: [authRoleEnum.ADMIN, authRoleEnum.USER],
  [permissions.GET_BUDGET]: [authRoleEnum.ADMIN, authRoleEnum.USER],
  [permissions.DELETE_BUDGET]: [authRoleEnum.ADMIN, authRoleEnum.USER],

  // Transaction
  [permissions.POST_TRANSACTION]: [authRoleEnum.ADMIN, authRoleEnum.USER],
  [permissions.PATCH_TRANSACTION]: [authRoleEnum.ADMIN, authRoleEnum.USER],
  [permissions.GET_TRANSACTION]: [authRoleEnum.ADMIN, authRoleEnum.USER],
  [permissions.DELETE_TRANSACTION]: [authRoleEnum.ADMIN, authRoleEnum.USER],
  [permissions.DELETE_MANY_TRANSACTION]: [
    authRoleEnum.ADMIN,
    authRoleEnum.USER,
  ],

  // Blog
  [permissions.CREATE_BLOG]: [authRoleEnum.ADMIN],
  [permissions.UPDATE_BLOG]: [authRoleEnum.ADMIN],
  [permissions.DELETE_BLOG]: [authRoleEnum.ADMIN],
};
