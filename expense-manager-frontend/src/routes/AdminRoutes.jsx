import { ADMIN } from "../constants/routes";
import Accounts from "../pages/admin/accounts";
import Balance from "../pages/admin/accounts/Balance";
import Blog from "../pages/admin/blog";
import Editor from "../pages/admin/blog/Editor";
import Dashboard from "../pages/admin/dashboard";
import Records from "../pages/admin/records";
import AccountRecords from "../pages/admin/accounts/AccountRecords";
import AccountsSetting from "../pages/admin/settings/Accounts";
import CategoriesSetting from "../pages/admin/settings/Categories";
import DashboardSetting from "../pages/admin/settings/Dashboard";
import GroupDetailsSetting from "../pages/admin/group/GroupDetails";
import GeneralSetting from "../pages/admin/settings/General";
import DataNPrivacySetting from "../pages/admin/settings/DataNPrivacy";
import AccountType from "../pages/admin/settings/AccountType";
import GroupUserDetails from "../pages/admin/group/GroupUserDetails";
import Payee from "../pages/admin/payee";
import Subscription from "../pages/admin/subscription";
import Notifications from "../pages/admin/settings/Notifications";
import PlannedPayment from "../pages/admin/plannedPayment";
import Budget from "../pages/admin/budget";
import BudgetDetails from "../pages/admin/budget/details";
import Templates from "../pages/admin/settings/Templates";
import Labels from "../pages/admin/labels";
import GroupSharing from "../pages/admin/group";
import PromoCode from "../pages/admin/promoCode";

export const CREATE = "/create";
export const UPDATE = "/update";
export const BALANCE = "/balance";
export const RECORDS = "/records";
export const AdminRoutes = () => {
  const SLUG = "/:slug";
  const ID = "/:id";
  return [
    {
      admin: ADMIN.DASHBOARD.ADMIN,
      path: ADMIN.DASHBOARD.PATH,
      component: <Dashboard />,
    },
    {
      admin: ADMIN.BLOG.ADMIN,
      path: ADMIN.BLOG.PATH,
      component: <Blog />,
    },
    {
      admin: ADMIN.BLOG.ADMIN,
      path: ADMIN.BLOG.PATH + CREATE,
      component: <Editor />,
    },
    {
      admin: ADMIN.BLOG.ADMIN,
      path: ADMIN.BLOG.PATH + UPDATE + SLUG,
      component: <Editor />,
    },
    {
      admin: ADMIN.ACCOUNTS.ADMIN,
      path: ADMIN.ACCOUNTS.PATH,
      component: <Accounts />,
    },
    {
      admin: ADMIN.ACCOUNTS.ADMIN,
      path: ADMIN.ACCOUNTS.PATH + ID + BALANCE,
      component: <Balance />,
    },
    {
      admin: ADMIN.ACCOUNTS.ADMIN,
      path: ADMIN.ACCOUNTS.PATH + ID + RECORDS,
      component: <AccountRecords />,
    },
    {
      admin: ADMIN.RECORDS.ADMIN,
      path: ADMIN.RECORDS.PATH,
      component: <Records />,
    },
    {
      admin: ADMIN.PLANNED_PAYMENT.ADMIN,
      path: ADMIN.PLANNED_PAYMENT.PATH,
      component: <PlannedPayment />,
    },
    {
      admin: ADMIN.BUDGET.ADMIN,
      path: ADMIN.BUDGET.PATH,
      component: <Budget />,
    },
    {
      admin: ADMIN.LABELS.ADMIN,
      path: ADMIN.LABELS.PATH,
      component: <Labels />,
    },
    {
      admin: ADMIN.PAYEE.ADMIN,
      path: ADMIN.PAYEE.PATH,
      component: <Payee />,
    },
    {
      admin: ADMIN.PROMO_CODE.ADMIN,
      path: ADMIN.PROMO_CODE.PATH,
      component: <PromoCode />,
    },
    {
      admin: ADMIN.GROUP_SHARING.ADMIN,
      path: ADMIN.GROUP_SHARING.PATH,
      component: <GroupSharing />,
    },
    {
      admin: ADMIN.GROUP_DETAILS.ADMIN,
      path: ADMIN.GROUP_DETAILS.PATH + ID,
      component: <GroupDetailsSetting />,
    },
    {
      admin: ADMIN.GROUP_USER.ADMIN,
      path: ADMIN.GROUP_USER.PATH + ID,
      component: <GroupUserDetails />,
    },
    {
      admin: ADMIN.BUDGET_DETAILS.ADMIN,
      path: ADMIN.BUDGET_DETAILS.PATH + ID,
      component: <BudgetDetails />,
    },
    {
      admin: ADMIN.SUBSCRIPTION.ADMIN,
      path: ADMIN.SUBSCRIPTION.PATH,
      component: <Subscription />,
    },

    // ===============================================
    //              Settings Components
    // ===============================================

    {
      admin: ADMIN.SETTINGS.ACCOUNTTYPE.ADMIN,
      path: ADMIN.SETTINGS.ACCOUNTTYPE.PATH,
      component: <AccountType />,
    },
    {
      admin: ADMIN.SETTINGS.ACCOUNTS.ADMIN,
      path: ADMIN.SETTINGS.ACCOUNTS.PATH,
      component: <AccountsSetting />,
    },
    {
      admin: ADMIN.SETTINGS.CATEGORIES.ADMIN,
      path: ADMIN.SETTINGS.CATEGORIES.PATH + ID,
      component: <CategoriesSetting />,
    },
    {
      admin: ADMIN.SETTINGS.DASHBOARD.ADMIN,
      path: ADMIN.SETTINGS.DASHBOARD.PATH,
      component: <DashboardSetting />,
    },
    {
      admin: ADMIN.SETTINGS.GENERAL.ADMIN,
      path: ADMIN.SETTINGS.GENERAL.PATH,
      component: <GeneralSetting />,
    },
    {
      admin: ADMIN.SETTINGS.NOTIFICATIONS.ADMIN,
      path: ADMIN.SETTINGS.NOTIFICATIONS.PATH,
      component: <Notifications />,
    },
    {
      admin: ADMIN.SETTINGS.DATA_AND_PRIVACY.ADMIN,
      path: ADMIN.SETTINGS.DATA_AND_PRIVACY.PATH,
      component: <DataNPrivacySetting />,
    },
    {
      admin: ADMIN.SETTINGS.TEMPLATES.ADMIN,
      path: ADMIN.SETTINGS.TEMPLATES.PATH,
      component: <Templates />,
    },
  ];
};
