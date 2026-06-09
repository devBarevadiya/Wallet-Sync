import {
  authRoleEnum,
  currency,
  groupAccessEnum,
  subscriptionTypeEnum,
  timePeriods,
} from "./enum";
import { store } from "../store/store";
import { clearToken } from "../store/auth/slice";
import moment from "moment";
import {
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  isSameMonth,
  isSameYear,
  isThisMonth,
  isThisWeek,
  isThisYear,
  isToday,
  startOfMonth,
  startOfYear,
  subDays,
  subMonths,
  subYears,
} from "date-fns";
import { setChartOrder, setDefaultTimePeriod } from "../store/dashboard/slice";
import { debounce } from "lodash";
import { toastError } from "../config/toastConfig";
import { userLogoutThunk } from "../store/actions";
import { fetchRemoteConfig } from "../firebase/config";

export const currencyHandler = (price = 0, symbol = true) => {
  const checkNumber = Number(price) || 0;
  if (symbol) {
    return currency + checkNumber.toLocaleString("en-IN");
  } else {
    return checkNumber.toLocaleString("en-IN");
  }
};

export const debouncedToastError = debounce(
  (message) => {
    toastError(message);
  },
  3000,
  { leading: true, trailing: false }
);

export const logout = async () => {
  const deviceToken = localStorage.getItem("deviceToken") || "";
  if (deviceToken) {
    await store.dispatch(userLogoutThunk({ deviceToken }));
    // localStorage.removeItem("deviceToken");
  }
  store.dispatch({ type: "RESET_STORE" });
  store.dispatch(clearToken());
  // localStorage.removeItem("token");
  // localStorage.removeItem("chartOrder");
  localStorage.clear();
};

export const clearLocalData = () => {
  store.dispatch(setChartOrder([]));
  localStorage.removeItem("defaultTimePeriod");
  localStorage.removeItem("fromAcc");
  store.dispatch(setDefaultTimePeriod(timePeriods.THIS_MONTH));
};

export const formatDate = (date, format) => {
  return moment(date).format(format);
};

export const formatTime = (time, format) => {
  return moment(time, "HH:mm:ss").format(format);
};

export const timeDifference = ({ fromDate = moment(), toDate = moment() }) => {
  const now = moment(fromDate);
  const scheduleDate = moment(toDate);

  // Calculate the difference in human-readable format
  const differenceInDays = scheduleDate.diff(now, "days");
  const differenceInMonths = scheduleDate.diff(now, "months");
  const differenceInYears = scheduleDate.diff(now, "years");

  let differenceMessage = "";

  if (differenceInYears > 0) {
    differenceMessage = `in ${differenceInYears} year${
      differenceInYears > 1 ? "s" : ""
    }`;
  } else if (differenceInMonths > 0) {
    differenceMessage = `in ${differenceInMonths} month${
      differenceInMonths > 1 ? "s" : ""
    }`;
  } else if (differenceInDays > 0) {
    differenceMessage = `in ${differenceInDays} day${
      differenceInDays > 1 ? "s" : ""
    }`;
  } else {
    differenceMessage = "Today";
  }

  return differenceMessage;
};

export const getDateRange = (daysBack = 30) => {
  const toDate = new Date();

  const fromDate = new Date();
  fromDate.setDate(toDate.getDate() - daysBack);

  return {
    fromDate: fromDate.toISOString().split("T")[0],
    toDate: toDate.toISOString().split("T")[0],
  };
};

export const getDateFormateRange = (value) => {
  if (value === timePeriods.THIS_MONTH) {
    return {
      fromDate: startOfMonth(new Date()),
      toDate: new Date(), // Up to today's date in the current month
    };
  }
  if (value === timePeriods.THIS_YEAR) {
    return {
      fromDate: startOfYear(new Date()),
      toDate: new Date(),
    };
  }
  if (value === timePeriods.LAST_MONTH) {
    return {
      fromDate: startOfMonth(subMonths(new Date(), 1)), // Start of last month
      toDate: endOfMonth(subMonths(new Date(), 1)), // End of last month
    };
  }
  if (value === timePeriods.LAST_YEAR) {
    return {
      fromDate: startOfYear(subYears(new Date(), 1)), // Start of last year
      toDate: endOfYear(subYears(new Date(), 1)), // End of last year
    };
  }

  return {
    fromDate: "",
    toDate: "",
  };
};

export const handleShowBackdrop = () => {
  document.body.classList.add("overflow-hidden");
};

export const handleCloseBackdrop = () => {
  document.body.classList.remove("overflow-hidden");
};

export const formateAmount = ({ price = 0, currencyCode = "USD" }) => {
  const formatter = Intl.NumberFormat("en", {
    currency: currencyCode,
    style: "currency",
  });
  // return formatter.format(price);
  return Intl.NumberFormat().format(price);
};

export const getDateDaysAgo = (daysAgo) => {
  const date = subDays(new Date(), daysAgo);
  return date;
};

// ===============================================
//            user action permission
// ===============================================

export const isTransactionAction = ({ id = "" } = {}) => {
  const [accountData] =
    store
      .getState()
      .Group.singleUserGroupData?.member?.accounts?.filter(
        (item) => item?.account == id
      ) || [];
  return accountData?.permission == groupAccessEnum.ADMIN_ACCESS ||
    accountData?.permission == groupAccessEnum.TRACK_AND_READ ||
    !accountData
    ? true
    : false;
};

// ==============================================
//        dashboard date aggregation
// ==============================================

export const aggregateDates = (data) => {
  if (!data?.length) return [];
  const dataLength = data.length;

  // If data length is less than 15, return the original data
  if (dataLength < 15) return data;

  let result = [];
  let lastAddedDate = null; // Keep track of the last added date to avoid duplicates
  const lastDate = data[data?.length - 1]?.date;

  data.reduce((acc, curr) => {
    const currDate = curr.date;
    const formattedWeek = format(endOfWeek(currDate), "yyyy-MM-dd");
    const formattedMonth = format(endOfMonth(currDate), "yyyy-MM-dd");
    const formattedYear = format(endOfYear(currDate), "yyyy-MM-dd");

    // Aggregation rules

    // =======================================
    //            weekly aggregation
    // =======================================

    if (dataLength >= 15 && dataLength <= 28) {
      if (isThisWeek(currDate, { weekStartsOn: 1 })) {
        if (lastDate == currDate) {
          result.push({ date: currDate, ...curr });
        }
      } else {
        if (formattedWeek == currDate) {
          result.push({ date: formattedWeek, ...curr });
        }
      }
    }

    // =======================================
    //            weekly aggregation
    // =======================================
    else if (dataLength >= 28 && dataLength <= 365) {
      if (isThisMonth(currDate, { weekStartsOn: 1 })) {
        if (lastDate == currDate) {
          result.push({ date: currDate, ...curr });
        }
      } else {
        if (formattedMonth == currDate) {
          result.push({ date: formattedWeek, ...curr });
        }
      }
    }

    // =======================================
    //            weekly aggregation
    // =======================================
    else if (dataLength >= 365) {
      if (isThisYear(currDate, { weekStartsOn: 1 })) {
        if (lastDate == currDate) {
          result.push({ date: currDate, ...curr });
        }
      } else {
        if (formattedYear == currDate) {
          result.push({ date: formattedWeek, ...curr });
        }
      }
    }
  }, []);

  return result;
};

// Function to capitalize the first letter of the string
export const capitalizeFirstLetter = (str) => {
  if (!str) return str;
  const removeUnderscore = str?.split("_").join(" ");
  return (
    removeUnderscore.charAt(0).toUpperCase() +
    removeUnderscore.slice(1).toLowerCase()
  );
};

export const handleNumericInput = (e) => {
  let sanitizedValue = e.target.value.replace(/[^0-9.]/g, ""); // Remove any non-numeric characters
  if (sanitizedValue.length > 12) {
    sanitizedValue = sanitizedValue.slice(0, 12);
  }
  e.target.value = sanitizedValue;
};

export const isPremium = () => {
  const user = store?.getState()?.Auth?.user;
  return (
    user?.subscriptionType == subscriptionTypeEnum.PREMIUM ||
    user?.subscriptionType == subscriptionTypeEnum.PROMO_CODE ||
    user?.role == authRoleEnum.ADMIN
  );
};

export const isNotPremium = () => {
  const premiumType = store?.getState()?.Auth?.user?.subscriptionType;
  const user = store?.getState()?.Auth?.user;
  return (
    premiumType !== subscriptionTypeEnum.PREMIUM &&
    premiumType !== subscriptionTypeEnum.PROMO_CODE &&
    user?.role !== authRoleEnum.ADMIN
  );
};

export const isShowPromoCode = async () => {
  return await fetchRemoteConfig();
};

let cachedDataString = "";
let cachedCount = 0;

export const countCustomCategory = () => {
  const data = store.getState().Category?.data;
  const user = store?.getState()?.Auth?.user;
  const userID = user?._id;

  const currentDataString = JSON.stringify(data);

  if (cachedDataString === currentDataString) {
    return cachedCount;
  }

  const count = data?.reduce((acc, curr) => {
    let categoryCount = curr?.isCustom && curr?.user == userID ? 1 : 0;
    let subCategoryCount =
      curr?.categories?.filter((sub) => sub?.isCustom && sub?.user == userID)
        ?.length || 0;
    return acc + categoryCount + subCategoryCount;
  }, 0);

  cachedDataString = currentDataString;
  cachedCount = count;

  return count;
};
