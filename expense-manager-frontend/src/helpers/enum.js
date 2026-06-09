import { startOfMonth } from "date-fns";

export const APP_ROUTE = "/app";

export const authRoleEnum = {
  ADMIN: "ADMIN",
  USER: "USER",
};

export const categoryNatureEnum = {
  NONE: "none",
  MUST: "must",
  NEED: "need",
  WANT: "want",
};

export const categoryIconTypeEnum = {
  ICON: "icon",
  EMOJI: "emoji",
};

export const categoryTypeEnum = {
  EXPENSE: "expense",
  INCOME: "income",
};

export const currency = `₹`;
export const currencyEnum = "INR";

export const accountType = "accountType";
export const addAccount = "addAccount";
export const editAccount = "editAccount";

export const filterStartDate = startOfMonth(new Date());
export const filterEndDate = new Date();

export const tableLoaderDataLength = 10;

export const timePeriods = {
  THIS_MONTH: "THIS_MONTH",
  THIS_YEAR: "THIS_YEAR",
  LAST_MONTH: "LAST_MONTH",
  LAST_YEAR: "LAST_YEAR",
};

export const groupAccessEnum = {
  ADMIN_ACCESS: "ADMIN_ACCESS",
  TRACK_AND_READ: "TRACK_AND_READ",
  READONLY: "READONLY",
  NO_ACCESS: "NO_ACCESS",
};

export const subscriptionTypeEnum = {
  FREE: "FREE",
  PREMIUM: "PREMIUM",
  PROMO_CODE: "PROMO_CODE",
};

export const transactionTypeEnum = {
  INCOME: "INCOME",
  EXPENSE: "EXPENSE",
  TRANSFER: "TRANSFER",
};

export const periodEnum = {
  WEEKLY: "WEEKLY",
  MONTHLY: "MONTHLY",
  YEARLY: "YEARLY",
  LIFETIME: "LIFETIME",
  ONE_TIME: "ONE_TIME",
};

export const notificationEnum = {
  BUDGET_REMINDER: "BUDGET_REMINDER",
  RECURRING_BILL_REMINDER: "RECURRING_BILL_REMINDER",
  TXN_THRESHOLD_EXCEED_REMINDER: "TXN_THRESHOLD_EXCEED_REMINDER",
  TXN_ACCOUNT_REMINDER: "TXN_ACCOUNT_REMINDER",
  TXN_LABEL_REMINDER: "TXN_LABEL_REMINDER",
  TXN_CATEGORY_REMINDER: "TXN_CATEGORY_REMINDER",
  TXN_HEAD_CATEGORY_REMINDER: "TXN_HEAD_CATEGORY_REMINDER",
  GROUP_ACTIVITY_REMINDER: "GROUP_ACTIVITY_REMINDER",
};

export const confirmationTypeEnum = {
  MANUAL: "MANUAL",
  AUTOMATICALLY: "AUTOMATICALLY",
};

export const scheduleTypeEnum = {
  REPEAT: "REPEAT",
  ONE_TIME: "ONE_TIME",
};

export const everyTypeEnum = {
  DAY: "DAY",
  WEEK_DAY: "WEEK_DAY",
  MONTH: "MONTH",
  YEAR: "YEAR",
};

export const paymentTypeEnum = {
  CASH: "CASH",
  DEBIT_CARD: "DEBIT_CARD",
  CREDIT_CARD: "CREDIT_CARD",
  BANK_TRANFER: "BANK_TRANFER",
  MOBILE_PATMENT: "MOBILE_PATMENT",
  WEB_TRANSFER: "WEB_TRANSFER",
  AUTO_CONFIRM: "AUTO_CONFIRM",
  MANUAL_CONFIRM: "MANUAL_CONFIRM",
};

export const paymentStatusEnum = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  CANCELLED: "CANCELLED",
};

export const creditDebitEnum = {
  CREDIT: "CREDIT",
  DEBIT: "DEBIT",
};

export const budgetLimitTypeEnum = {
  LIMIT: "LIMIT",
  NO_LIMIT: "NO_LIMIT",
  NONE: "NONE",
};

export const budgetStatusType = {
  OPEN: "OPEN",
  CLOSE: "CLOSE",
  EXPIRED: "EXPIRED",
};

export const budgetRolloverUserResponse = {
  ACCEPTED: "ACCEPTED",
  DECLINED: "DECLINED",
  PENDING: "PENDING",
};

export const analyticsTypeEnum = {
  LAST_RECORD: "LAST_RECORD",
  SPENDING: "SPENDING",
  CURRENCY: "CURRENCY",
  TOTAL_BALANCE: "TOTAL_BALANCE",
  BALANCE_TREND: "BALANCE_TREND",
  CASH_FLOW: "CASH_FLOW",
  CASH_FLOW_TABLE: "CASH_FLOW_TABLE",
  REPORT: "REPORT",
  REPORT_DETAILS: "REPORT_DETAILS",
  BUDGET: "BUDGET",
  PLANNED: "PLANNED",
  COSTLY_EXPENSES: "COSTLY_EXPENSES",
};

export const deviceTypeEnum = {
  IOS: "IOS",
  ANDROID: "ANDROID",
  WEB: "WEB",
};

export const plannedPaymentEnum = {
  SCHEDULE_TYPE: "scheduleType",
  EVERY_TYPE: "everyType",
  ACCOUNTS: "accounts",
  CURRENCIES: "currencies",
  LABELS: "labels",
  CATEGORIES: "categories",
  SORT_BY: "sortBy",
};

export const eventEnum = {
  LOGIN: "web_login",
  GOOGLE_LOGIN: "web_google_login",
  APPLE_LOGIN: "web_apple_login",

  SIGNUP_INIT: "web_signup_initiated",
  SIGNUP_COMPLETED: "web_signup_completed",

  ONBOARDING_START: "web_onboarding_started",
  ONBOARDING_COMPLETED: "web_onboarding_completed",

  ACCOUNT_INIT: "web_account_initialized",
  ACCOUNT_CREATED: "web_account_created",
  ACCOUNT_CANCELLED: "web_account_cancelled",

  TRANSACTION_INIT: "web_transaction_initialized",
  TRANSACTION_CREATED: "web_transaction_created",
  TRANSACTION_CANCELLED: "web_transaction_cancelled",

  BUDGET_INIT: "web_budget_initialized",
  BUDGET_CREATED: "web_budget_created",
  BUDGET_CANCELLED: "web_budget_cancelled",

  PLAN_VIEWED: "web_plan_viewed",
  PLAN_SELECTED: "web_plan_selected",
  PAYMENT_INITIATED: "web_payment_initiated",
  PAYMENT_SUCCESSFUL: "web_payment_successful",
};
