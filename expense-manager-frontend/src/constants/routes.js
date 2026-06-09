import { APP_ROUTE } from "../helpers/enum";

const AUTH = {
  SIGN_IN: "/sign-in",
  SIGN_UP: "/sign-up",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "reset-password",
};

const OTHER_AUTH = {
  CURRENCY: "/currency",
  CHANGE_PASSWORD: "/change-password",
  INVITE: "/invite",
};

const ADMIN = {
  DASHBOARD: { PATH: APP_ROUTE + "/dashboard", ADMIN: false },
  ACCOUNTS: { PATH: APP_ROUTE + "/accounts", ADMIN: false },
  BLOG: { PATH: APP_ROUTE + "/blog", ADMIN: true },
  RECORDS: { PATH: APP_ROUTE + "/records", ADMIN: false },
  PLANNED_PAYMENT: { PATH: APP_ROUTE + "/planned-payment", ADMIN: false },
  BUDGET: { PATH: APP_ROUTE + "/budget", ADMIN: false },
  BUDGET_DETAILS: { PATH: APP_ROUTE + "/budget", ADMIN: false },
  SUBSCRIPTION: { PATH: APP_ROUTE + "/subscription", ADMIN: false },
  LABELS: { PATH: APP_ROUTE + "/labels", ADMIN: false },
  PAYEE: { PATH: APP_ROUTE + "/payee", ADMIN: false },
  PROMO_CODE: { PATH: APP_ROUTE + "/promo-code", ADMIN: true },
  GROUP_SHARING: {
    PATH: APP_ROUTE + "/group-sharing",
    ADMIN: false,
  },
  GROUP_DETAILS: {
    PATH: APP_ROUTE + "/group-sharing/details",
    ADMIN: false,
  },
  GROUP_USER: {
    PATH: APP_ROUTE + "/group-sharing/user",
    ADMIN: false,
  },
  SETTINGS: {
    ACCOUNTTYPE: { PATH: APP_ROUTE + "/settings/account-type", ADMIN: true },
    ACCOUNTS: { PATH: APP_ROUTE + "/settings/accounts", ADMIN: false },
    CATEGORIES: { PATH: APP_ROUTE + "/settings/categories", ADMIN: false },
    DASHBOARD: { PATH: APP_ROUTE + "/settings/dashboard", ADMIN: false },
    // LABELS: { PATH: APP_ROUTE + "/settings/labels", ADMIN: false },
    CURRENCIES: { PATH: APP_ROUTE + "/settings/currencies", ADMIN: false },
    TEMPLATES: { PATH: APP_ROUTE + "/settings/templates", ADMIN: false },
    // PAYEE: { PATH: APP_ROUTE + "/settings/payee", ADMIN: false },
    // GROUP_SHARING: {
    //   PATH: APP_ROUTE + "/settings/group-sharing",
    //   ADMIN: false,
    // },
    // GROUP_DETAILS: {
    //   PATH: APP_ROUTE + "/settings/group-sharing/details",
    //   ADMIN: false,
    // },
    // GROUP_USER: {
    //   PATH: APP_ROUTE + "/settings/group-sharing/user",
    //   ADMIN: false,
    // },
    GENERAL: { PATH: APP_ROUTE + "/settings/general", ADMIN: false },
    NOTIFICATIONS: {
      PATH: APP_ROUTE + "/settings/notifications",
      ADMIN: false,
    },
    DATA_AND_PRIVACY: {
      PATH: APP_ROUTE + "/settings/data-and-privacy",
      ADMIN: false,
    },
  },
};

const CLIENT = {
  HOME: "/",
  HOWITWORKS: {
    BUDGETS: "/budgets",
    EXPENSETRACKING: "/expense-tracking",
    PLANNEDPAYMENTS: "/planned-payments",
    CASHFLOWINSIGHTS: "/cashflow-insights",
    BANKSYNC: "/bank-sync",
  },
  RESOURCES: {
    BANKSYNC: "/bank-to-sync",
    CAREERS: "/resources-careers",
    ABOUTUS: "/about-us",
    SECURITY: "/resources-security",
  },
  BLOG: "/blog",
  PRICING: "/pricing",
  POLICY: {
    PRIVACY: "/privacy-policy",
    TERMSANDCONDITIONS: "/terms-conditions",
  },
};

const ON_BOARDING = "/on-boarding";

export { AUTH, OTHER_AUTH, ADMIN, CLIENT, ON_BOARDING };
