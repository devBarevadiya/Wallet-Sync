import { useSelector } from "react-redux";
import { ADMIN } from "../../constants/routes";
import { authRoleEnum } from "../../helpers/enum";

export const SideBarMenus = () => {
  const { user } = useSelector((store) => store.Auth);
  return [
    {
      admin: ADMIN.DASHBOARD.ADMIN,
      path: ADMIN.DASHBOARD.PATH,
      id: "dashboard",
      label: "dashboard",
      icon: "ri-dashboard-2-line",
    },
    {
      admin: ADMIN.ACCOUNTS.ADMIN,
      path: ADMIN.ACCOUNTS.PATH,
      id: "accounts",
      label: "accounts",
      icon: "ri-account-pin-box-line",
    },
    {
      admin: ADMIN.RECORDS.ADMIN,
      path: ADMIN.RECORDS.PATH,
      id: "records",
      label: "records",
      icon: "ri-list-view",
    },
    {
      admin: ADMIN.PLANNED_PAYMENT.ADMIN,
      path: ADMIN.PLANNED_PAYMENT.PATH,
      id: "planned-payment",
      label: "planned payment",
      icon: "ri-calendar-todo-fill",
    },
    // {
    //   admin: ADMIN.BUDGET.ADMIN,
    //   path: ADMIN.BUDGET.PATH,
    //   id: "buddget",
    //   label: "budget",
    //   icon: "ri-money-rupee-circle-line",
    // },
    {
      admin: ADMIN.BLOG.ADMIN,
      path: ADMIN.BLOG.PATH,
      id: "blog",
      label: "blog",
      icon: "ri-edit-box-line",
    },

    {
      admin: ADMIN.LABELS.ADMIN,
      path: ADMIN.LABELS.PATH,
      id: "labels",
      label: "labels",
      icon: "ri-price-tag-3-line",
    },
    {
      admin: ADMIN.PAYEE.ADMIN,
      path: ADMIN.PAYEE.PATH,
      id: "payee",
      label: "payee",
      icon: "ri-hand-coin-line",
    },
    {
      admin: ADMIN.PROMO_CODE.ADMIN,
      path: ADMIN.PROMO_CODE.PATH,
      id: "promoCode",
      label: "promo code",
      icon: "ri-coupon-2-line",
    },
    // {
    //   admin: ADMIN.GROUP_SHARING.ADMIN,
    //   path: ADMIN.GROUP_SHARING.PATH,
    //   id: "groupSharing",
    //   label: "group sharing",
    //   icon: "ri-node-tree",
    // },
    {
      admin: ADMIN.SUBSCRIPTION.ADMIN,
      path: ADMIN.SUBSCRIPTION.PATH,
      id: "subscription",
      label: "subscription",
      icon: "ri-vip-crown-2-line",
    },
    // {
    //   admin: ADMIN.SETTINGS.ACCOUNTS.ADMIN,
    //   path: ADMIN.SETTINGS.ACCOUNTS.PATH,
    //   id: "settings",
    //   label: "settings",
    //   icon: "ri-settings-line",
    // },
  ].filter((ele) => {
    if (!ele.admin) return true;

    return user?.role === authRoleEnum.ADMIN;
  });
};
