import { ADMIN, AUTH } from "../constants/routes";
import { periodEnum } from "../helpers/enum";

const freeAccessPoints = [
  { title: "Can only create up to 2 accounts" },
  { title: "Can only create up to 5 custom categories" },
  { title: "Can create only 1 budget" },
  { title: "Can create up to 3 custom labels" },
  { title: "Cannot export data (e.g., as CSV or PDF).", isAccess: false },
  { title: "Access to basic analytics and summary reports" },
  { title: "Limited or no support for multiple currencies" },
  { title: "Cannot share accounts with other users", isAccess: false },
  { title: "Budgeting and Expense Tracking" },
  { title: "Cannot set up recurring transactions", isAccess: false },
  { title: "Limited access to pre-defined reports" },
  {
    title:
      "Limited or no notifications for budget overspending or bill reminders",
  },
];

const weeklyAccessPoints = [
  // { title: "Get a 3-Day Free Trial on Your First Weekly Subscription!" },
  { title: "Can create unlimited accounts" },
  { title: "Can create unlimited custom categories" },
  { title: "Can create multiple budgets" },
  { title: "Can create unlimited custom labels" },
  { title: "Can export transaction history and reports" },
  {
    title: "Can set up and manage recurring transactions (e.g., monthly bills)",
  },
  { title: "Ability to create and save custom reports" },
  { title: "Full access to customizable notifications and alerts" },
  {
    title:
      "Access to detailed analytics, including spending trends, forecast reports, and custom date range reports",
  },
  {
    title:
      "Full support for multiple currencies with automatic exchange rate updates",
  },
  {
    title:
      "Can share accounts with other users, allowing for collaborative budgeting and expense tracking.",
  },
];

const yearlyAccessPoints = [
  // { title: "Get a 7-Day Free Trial on Your First Yearly Subscription!" },
  { title: "Can create unlimited accounts" },
  { title: "Can create unlimited custom categories" },
  { title: "Can create multiple budgets" },
  { title: "Can create unlimited custom labels" },
  { title: "Can export transaction history and reports" },
  {
    title: "Can set up and manage recurring transactions (e.g., monthly bills)",
  },
  { title: "Ability to create and save custom reports" },
  { title: "Full access to customizable notifications and alerts" },
  {
    title:
      "Access to detailed analytics, including spending trends, forecast reports, and custom date range reports",
  },
  {
    title:
      "Full support for multiple currencies with automatic exchange rate updates",
  },
  {
    title:
      "Can share accounts with other users, allowing for collaborative budgeting and expense tracking.",
  },
];

const lifetimeAccessPoints = [
  { title: "No Plan Recurring" },
  { title: "Can create unlimited accounts" },
  { title: "Can create unlimited custom categories" },
  { title: "Can create multiple budgets" },
  { title: "Can create unlimited custom labels" },
  { title: "Can export transaction history and reports" },
  {
    title: "Can set up and manage recurring transactions (e.g., monthly bills)",
  },
  { title: "Ability to create and save custom reports" },
  { title: "Full access to customizable notifications and alerts" },
  {
    title:
      "Access to detailed analytics, including spending trends, forecast reports, and custom date range reports",
  },
  {
    title:
      "Full support for multiple currencies with automatic exchange rate updates",
  },
  {
    title:
      "Can share accounts with other users, allowing for collaborative budgeting and expense tracking.",
  },
];

const freePlanButtonContentLanding = "sign up now";
const freePlanButtonContentApp = "current plan";
const commonButtonContentLanding = "get started";
const weeklyButtonContentApp = "Get 3 Days Free trial";
const yearlyButtonContentApp = "Get 7 Days Free trial";
const lifetimeButtonContentApp = "Choose plan"
const upgradePlanButtonContent = "upgrade plan";
const upgradeYearlyPlanButtonContent = "upgrade & get 7 Days Free Trial";
const commonRedirectTo = ADMIN.SUBSCRIPTION.PATH;

export const subscriptionPlans = {
  landing: [
    {
      planType: "free",
      price: "0",
      timePeriod: "lifetime",
      accessedPoints: freeAccessPoints,
      buttonContent: freePlanButtonContentLanding,
      redirectTo: AUTH.SIGN_IN,
      mostPopular: false,
    },
    {
      planType: "basic",
      price: "4.99",
      timePeriod: "weekly",
      accessedPoints: weeklyAccessPoints,
      buttonContent: commonButtonContentLanding,
      mostPopular: false,
      periodEnum: periodEnum.WEEKLY,
      priceId: import.meta.env.VITE_WEEKLY_SUBS_PRICE_ID,
    },
    {
      planType: "standard",
      price: "29.99",
      timePeriod: "yearly",
      accessedPoints: yearlyAccessPoints,
      buttonContent: commonButtonContentLanding,
      mostPopular: true,
      periodEnum: periodEnum.YEARLY,
      priceId: import.meta.env.VITE_YEARLY_SUBS_PRICE_ID,
      upgradePlanButtonContent: upgradeYearlyPlanButtonContent,
    },
    {
      planType: "pro",
      price: "99.99",
      timePeriod: "lifetime",
      accessedPoints: lifetimeAccessPoints,
      buttonContent: commonButtonContentLanding,
      mostPopular: false,
      periodEnum: periodEnum.LIFETIME,
      priceId: import.meta.env.VITE_LIFETIME_SUBS_PRICE_ID,
      upgradePlanButtonContent: upgradePlanButtonContent,
    },
  ],
  app: [
    {
      planType: "free",
      price: "0",
      timePeriod: "lifetime",
      accessedPoints: freeAccessPoints,
      buttonContent: freePlanButtonContentApp,
      mostPopular: false,
    },
    {
      planType: "basic",
      price: "4.99",
      timePeriod: "weekly",
      accessedPoints: weeklyAccessPoints,
      buttonContent: weeklyButtonContentApp,
      mostPopular: false,
      periodEnum: periodEnum.WEEKLY,
      priceId: import.meta.env.VITE_WEEKLY_SUBS_PRICE_ID,
    },
    {
      planType: "standard",
      price: "29.99",
      timePeriod: "yearly",
      accessedPoints: yearlyAccessPoints,
      buttonContent: yearlyButtonContentApp,
      mostPopular: true,
      periodEnum: periodEnum.YEARLY,
      priceId: import.meta.env.VITE_YEARLY_SUBS_PRICE_ID,
      upgradePlanButtonContent: upgradeYearlyPlanButtonContent,
    },
    {
      planType: "pro",
      price: "99.99",
      timePeriod: "lifetime",
      accessedPoints: lifetimeAccessPoints,
      buttonContent: lifetimeButtonContentApp,
      mostPopular: false,
      periodEnum: periodEnum.LIFETIME,
      priceId: import.meta.env.VITE_LIFETIME_SUBS_PRICE_ID,
      upgradePlanButtonContent: upgradePlanButtonContent,
    },
  ],
};
