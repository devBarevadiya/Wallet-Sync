import { useSelector } from "react-redux";
import { authRoleEnum } from "../../helpers/enum";
import { ADMIN } from "../../constants/routes";
import { useEffect, useState } from "react";
import { getCategoryThunk } from "../../store/actions";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { setCategoriesOfHeadCategory } from "../../store/category/slice";
import CustomHelmet from "../../components/helmet/CustomHelmet";
import { setDocumentTitle } from "../../store/filters/slice";

export const SettingSideBarMenus = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((store) => store.Auth);
  const { data, categories } = useSelector((store) => store.Category);
  const { id } = useParams();
  useEffect(() => {
    if (!data?.length > 0) {
      dispatch(getCategoryThunk());
    }
  }, [dispatch]);

  useEffect(() => {
    if (id && categories.length === 0) {
      const headCategory = data.filter((ele) => ele?._id === id);
      if (headCategory.length > 0) {
        dispatch(
          setDocumentTitle(
            headCategory[0].title +
              " - Wallet Sync - Budget Planner and Expense Tracker"
          )
        );
        dispatch(setCategoriesOfHeadCategory(headCategory[0]?.categories));
      }
    }
  }, [id, categories, data, dispatch]);

  return [
    {
      id: "generalTitle",
      title: "general",
      navList: [
        {
          admin: ADMIN.SETTINGS.ACCOUNTS.ADMIN,
          path: ADMIN.SETTINGS.ACCOUNTS.PATH,
          id: "accounts",
          label: "accounts",
          icon: "ri-account-pin-box-line",
        },
        {
          admin: ADMIN.SETTINGS.ACCOUNTTYPE.ADMIN,
          path: ADMIN.SETTINGS.ACCOUNTTYPE.PATH,
          id: "account type",
          label: "account type",
          icon: "ri-list-check-2",
        },
        {
          id: "categories",
          label: "categories",
          icon: "ri-layout-grid-line",
          subItems: [
            ...data.map((ele) => {
              const id = ele?._id;
              const title = ele?.title;
              const type = ele?.type;
              const icon = ele?.icon;
              const categories = ele?.categories || [];
              return {
                admin: false,
                path: `${ADMIN.SETTINGS.CATEGORIES.PATH}/${id}`,
                parentId: "categories",
                id,
                label: title,
                categories,
                headData: { _id: id, icon, title, type },
              };
            }),
          ],
        },
        {
          admin: ADMIN.SETTINGS.DASHBOARD.ADMIN,
          path: ADMIN.SETTINGS.DASHBOARD.PATH,
          id: "dashboard",
          label: "dashboard",
          icon: "ri-speed-up-line",
        },
        // {
        //   admin: ADMIN.SETTINGS.TEMPLATES.ADMIN,
        //   path: ADMIN.SETTINGS.TEMPLATES.PATH,
        //   id: "templates",
        //   label: "templates",
        //   icon: "ri-news-line",
        // },
        // {
        //   admin: ADMIN.SETTINGS.LABELS.ADMIN,
        //   path: ADMIN.SETTINGS.LABELS.PATH,
        //   id: "labels",
        //   label: "labels",
        //   icon: "ri-price-tag-3-line",
        // },
        // {
        //   admin: ADMIN.SETTINGS.PAYEE.ADMIN,
        //   path: ADMIN.SETTINGS.PAYEE.PATH,
        //   id: "payee",
        //   label: "payee",
        //   icon: "ri-hand-coin-line",
        // },
        // {
        //   admin: ADMIN.SETTINGS.GROUP_SHARING.ADMIN,
        //   path: ADMIN.SETTINGS.GROUP_SHARING.PATH,
        //   id: "groupSharing",
        //   label: "group sharing",
        //   icon: "ri-node-tree",
        // },
      ],
    },
    {
      id: "account",
      title: "account",
      navList: [
        {
          admin: ADMIN.SETTINGS.GENERAL.ADMIN,
          path: ADMIN.SETTINGS.GENERAL.PATH,
          id: "general",
          label: "general",
          icon: "ri-settings-2-line",
        },
        {
          admin: ADMIN.SETTINGS.NOTIFICATIONS.ADMIN,
          path: ADMIN.SETTINGS.NOTIFICATIONS.PATH,
          id: "notifications",
          label: "notifications",
          icon: "ri-notification-line",
        },
        {
          admin: ADMIN.SETTINGS.DATA_AND_PRIVACY.ADMIN,
          path: ADMIN.SETTINGS.DATA_AND_PRIVACY.PATH,
          id: "data-and-privacy",
          label: "personal data & privacy",
          icon: "ri-folder-keyhole-line",
        },
      ],
    },
  ];
};
