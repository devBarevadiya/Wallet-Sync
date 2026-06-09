export const authRoleEnum = {
  ADMIN: "ADMIN",
  USER: "USER",
};
export const authProviderEnum = {
  FACEBOOK: "facebook.com",
  GOOGLE: "google.com",
  APPLE: "apple.com",
  LOCAL: "LOCAL",
};
export const categoryNatureEnum = {
  NONE: "NONE",
  MUST: "MUST",
  NEED: "NEED",
  WANT: "WANT",
};
export const categoryIconTypeEnum = {
  ICON: "ICON",
  EMOJI: "EMOJI",
};
export const accountPermissionEnum = {
  ADMIN_ACCESS: "ADMIN_ACCESS",
  TRACK_AND_READ: "TRACK_AND_READ",
  READONLY: "READONLY",
  NO_ACCESS: "NO_ACCESS",
};
export const categoryTypeEnum = {
  EXPENSE: "EXPENSE",
  INCOME: "INCOME",
};
export const templateTypeEnum = {
  EXPENSE: "EXPENSE",
  INCOME: "INCOME",
};
export const budgetPeriodEnum = {
  WEEKLY: "WEEKLY",
  MONTHLY: "MONTHLY",
  YEARLY: "YEARLY",
  ONE_TIME: "ONE_TIME",
};
export const transactionTypeEnum = {
  EXPENSE: "EXPENSE",
  INCOME: "INCOME",
  TRANSFER: "TRANSFER",
};
export const transactionStatusEnum = {
  RECONCILED: "RECONCILED",
  CLEARED: "CLEARED",
  UNCLEARED: "UNCLEARED",
};
export const confirmationTypeEnum = {
  MANUAL: "MANUAL",
  AUTOMATICALLY: "AUTOMATICALLY",
};
export const paymentTypeEnum = {
  CASH: "CASH",
  DEBIT_CARD: "DEBIT_CARD",
  CREDIT_CARD: "CREDIT_CARD",
  BANK_TRANSFER: "BANK_TRANSFER",
  MOBILE_PAYMENT: "MOBILE_PAYMENT",
  WEB_TRANSFER: "WEB_TRANSFER",
  AUTO_CONFIRM: "AUTO_CONFIRM",
  MANUAL_CONFIRM: "MANUAL_CONFIRM",
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

export const scheduleTypeEnum = {
  ONE_TIME: "ONE_TIME",
  REPEAT: "REPEAT",
};

export const everyTypeEnum = {
  DAY: "DAY",
  WEEK_DAY: "WEEK_DAY",
  MONTH: "MONTH",
  YEAR: "YEAR",
  NULL: null,
};

export const weekdaysEnums = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
  NULL: null,
};

export const paymentStatusEnum = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  CANCELLED: "CANCELLED",
};

export const deviceTypeEnum = {
  IOS: "IOS",
  ANDROID: "ANDROID",
  WEB: "WEB",
};

export const allowedNotificationsEnum = {
  BUDGET_REMINDER: "BUDGET_REMINDER",
  RECURRING_BILL_REMINDER: "RECURRING_BILL_REMINDER",
  TXN_THRESHOLD_EXCEED_REMINDER: "TXN_THRESHOLD_EXCEED_REMINDER",
  TXN_ACCOUNT_REMINDER: "TXN_ACCOUNT_REMINDER",
  TXN_LABEL_REMINDER: "TXN_LABEL_REMINDER",
  TXN_HEAD_CATEGORY_REMINDER: "TXN_HEAD_CATEGORY_REMINDER",
  TXN_INACTIVITY_REMINDER: "TXN_INACTIVITY_REMINDER",
  GROUP_ACTIVITY_REMINDER: "GROUP_ACTIVITY_REMINDER",
  SUMMARY_REPORT: "SUMMARY_REPORT",
};

export const summaryReportFrequency = {
  DAILY: "DAILY",
  WEEKLY: "WEEKLY",
  MONTHLY: "MONTHLY",
  YEARLY: "YEARLY",
};

export const subscriptionTypeEnum = {
  FREE: "FREE",
  PREMIUM: "PREMIUM",
  PROMO_CODE: "PROMO_CODE",
};

export const revenueCatEventType = {
  INITIAL_PURCHASE: "INITIAL_PURCHASE",
  RENEWAL: "RENEWAL",
  CANCELLATION: "CANCELLATION",
  EXPIRATION: "EXPIRATION",
};

export const paymentPlatformEnum = {
  STRIPE: "STRIPE",
  APPLE_PAY: "APPLE_PAY",
  GOOGLE_PAY: "GOOGLE_PAY",
  APP_STORE: "APP_STORE",
  PLAY_STORE: "PLAY_STORE",
};

export const creditDebitEnum = {
  CREDIT: "CREDIT",
  DEBIT: "DEBIT",
};

export const subscriptionPlanEnum = {
  WEEKLY: "WEEKLY",
  YEARLY: "YEARLY",
  LIFETIME: "LIFETIME",
};

export const priceIdToPlan = {
  // local
  price_1QAQvrSGFEaV66mEEkmt7LJv: subscriptionPlanEnum.WEEKLY,
  price_1QDhqxSGFEaV66mEqHgeTPjE: subscriptionPlanEnum.YEARLY,
  price_1QDhrVSGFEaV66mEGYmKwZCy: subscriptionPlanEnum.LIFETIME,

  // live
  price_1QDn6nSGFEaV66mEPVIMubU8: subscriptionPlanEnum.WEEKLY,
  price_1QDmq4SGFEaV66mE3t1QXYqc: subscriptionPlanEnum.YEARLY,
  price_1QDmXySGFEaV66mEZg8Q5qxf: subscriptionPlanEnum.LIFETIME,
};

export const budgetRolloverUserResponse = {
  ACCEPTED: "ACCEPTED",
  DECLINED: "DECLINED",
  PENDING: "PENDING",
};

export const budgetSpendLimitType = {
  LIMIT: "LIMIT",
  NO_LIMIT: "NO_LIMIT",
  NONE: "NONE",
};

export const budgetStatusType = {
  OPEN: "OPEN",
  CLOSE: "CLOSE",
  EXPIRED: "EXPIRED",
};

export const budgetNotificationThresholdPercentageEnum = {
  P80: "P80",
  P100: "P100",
};
