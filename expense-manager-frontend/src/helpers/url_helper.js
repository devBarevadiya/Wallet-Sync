const API = "/api";
const USER = "/user";
const CHART = "/chart";

export const AWS = API + "/aws/store";

export const AUTH_API = {
  LOGIN: API + USER + "/login",
  REGISTER: API + USER + "/register",
  FORGOT_PASSWORD: API + USER + "/forgotpassword",
  CHANGE_PASSWORD: API + USER + "/changepassword",
  RESET_PASSWORD: API + USER + "/resetpassword",
  SOCIAL_LOGIN: API + USER + "/login/firebase",
  SOCIAL_REGISTER: API + USER + "/register/firebase",
  VERIFY_TOKEN: API + USER + "/verifyToken",
  ALL_DATA: API + USER + "/all-data",
  TRANSACTIONS: API + USER + "/transactions",
  TRANSACTIONS_APP_SETTINGS: API + USER + "/transactions-app-settings",
  BASE_CURRENCY: API + USER + "/basecurrency",
  BASE: API + USER,
};

export const CURRENCY_API = {
  CURRENCY: API + "/currency",
  SET_CURRENCY: API + USER + "/setcurrency",
};

export const ACCOUNT_TYPE_API = {
  ACCOUNT_TYPE: API + "/accounttype",
};

export const ACCOUNT = {
  ACCOUNT: API + "/account",
};

export const LABEL = API + "/label";

export const TRANSACTION = {
  TRANSACTION: API + "/transaction",
  FILTER_OPTIONS: API + "/transaction" + "/filter-options",
};

export const DASHBOARD = {
  LAST_RECORD: API + CHART + "/lastrecord",
  SPENDING: API + CHART + "/spending",
  ANALYTICS: API + "/dashboard" + "/analytics",
};

export const CATEGORY = {
  CATEGORY: API + "/category",
  CATEGORY_HEAD: API + "/category/head",
};

export const BLOG = {
  BASE: API + "/blogs",
};

export const GROUP = {
  BASE: API + "/group",
  SWITCH: API + "/group/switch",
  REMOVE: API + "/group/remove",
  LEAVE: API + "/group/leave",
};

export const NOTIFICATION = {
  DEVICE_TOKEN: API + USER + "/device-tokens",
  CUSTOM: API + "/notifications/custom",
};

export const PAYEE = {
  BASE: API + "/payee",
};

export const STRIPE = {
  SESSION: API + "/stripe/session",
  SUBSCRIPTION: API + "/stripe/subscription",
  SUBSCRIPTION_PLAN: API + "/stripe/subscription-plan",
};

export const PLANNED = {
  BASE: API + "/planned",
};

export const PAYMENT = {
  BASE: API + "/payment",
  PAYEMNT_PLANNED: API + "/payment/planned",
};

export const BUDGET = {
  BASE: API + "/budget",
  GET_ALL: API + "/budget/get-all",
};

export const TEMPLATE = {
  BASE: API + "/template",
};

export const PROMO_CODE = {
  BASE: API + "/promo-code",
  APPLY: API + "/promo-code/apply",
  GENERATE: API + "/promo-code/generate",
};
