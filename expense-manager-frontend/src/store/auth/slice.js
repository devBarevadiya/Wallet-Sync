import { createSlice } from "@reduxjs/toolkit";
import {
  changeBaseCurrencyThunk,
  changePasswordThunk,
  deleteTransactionsAppSettingsThunk,
  deleteTransactionsThunk,
  deleteUserDataThunk,
  forgotPasswordThunk,
  resetPasswordThunk,
  signInThunk,
  signUpThunk,
  socialLoginThunk,
  updateUserDetailsThunk,
  userLogoutThunk,
  userNotificationThunk,
  verifyTokenThunk,
} from "./thunk";
import { getToken } from "../../helpers/api_helper";

const initialState = {
  user: {},
  baseCurrency: {},
  token: getToken() || "",
  allowedNotifications: {},
  loading: false,
  error: null,
  message: "",
  socialLoading: false,
  dataLoading: true,
  notificationLoading: false,
  currencyLoading: false,
  notificationError: null,
  notificationMessage: "",
};

const slice = createSlice({
  name: "Auth",
  initialState,
  reducers: {
    clearToken: (store) => {
      store.token = "";
    },
    setAllowedNotification: (state, action) => {
      state.allowedNotifications = action.payload;
    },
    setSubscriptionName: (state, action) => {
      state.user.subscriptionName = action.payload;
    },
  },
  extraReducers: (builder) => {
    // =============================================
    //                  Login
    // =============================================

    builder.addCase(signInThunk.pending, (state) => {
      state.loading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(signInThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.message = "";
      state.error = null;
      state.token = action.payload.token;
      state.user = action.payload.data;
    });
    builder.addCase(signInThunk.rejected, (state, action) => {
      state.loading = false;
      state.message = "";
      state.error = action.payload.message;
    });

    // =============================================
    //                  Register
    // =============================================

    builder.addCase(signUpThunk.pending, (state) => {
      state.loading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(signUpThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.message = "";
      state.error = null;
      state.user = action.payload.data;
      state.token = action.payload.token;
    });
    builder.addCase(signUpThunk.rejected, (state, action) => {
      state.loading = false;
      state.message = "";
      state.error = action.payload.message;
    });

    // =============================================
    //              Forgot Password
    // =============================================

    builder.addCase(forgotPasswordThunk.pending, (state) => {
      state.loading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(forgotPasswordThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.message = "";
      state.error = null;
      state.user = action.payload.data;
    });
    builder.addCase(forgotPasswordThunk.rejected, (state, action) => {
      state.loading = false;
      state.message = "";
      state.error = action.payload.message;
    });

    // =============================================
    //              Reset Password
    // =============================================

    builder.addCase(resetPasswordThunk.pending, (state) => {
      state.loading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(resetPasswordThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.message = "";
      state.error = null;
      state.user = action.payload.data;
    });
    builder.addCase(resetPasswordThunk.rejected, (state, action) => {
      state.loading = false;
      state.message = "";
      state.error = action.payload.message;
    });

    // =============================================
    //              Change Password
    // =============================================

    builder.addCase(changePasswordThunk.pending, (state) => {
      state.loading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(changePasswordThunk.fulfilled, (state) => {
      state.loading = false;
      state.message = "";
      state.error = null;
    });
    builder.addCase(changePasswordThunk.rejected, (state, action) => {
      state.loading = false;
      state.message = "";
      state.error = action.payload.message;
    });

    // =============================================
    //               Social Login
    // =============================================

    builder.addCase(socialLoginThunk.pending, (state) => {
      state.socialLoading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(socialLoginThunk.fulfilled, (state, action) => {
      state.socialLoading = false;
      state.message = "";
      state.error = null;
      state.user = action.payload.data;
      state.token = action.payload.data.token;
    });
    builder.addCase(socialLoginThunk.rejected, (state, action) => {
      state.socialLoading = false;
      state.message = "";
      state.error = action?.payload?.message;
    });

    // =============================================
    //               Verify Token
    // =============================================

    builder.addCase(verifyTokenThunk.pending, (state) => {
      state.dataLoading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(verifyTokenThunk.fulfilled, (state, action) => {
      state.dataLoading = false;
      state.message = "";
      state.error = null;
      state.user = action.payload.data;
      // state.token = action.payload.token;
      const [updatedData] =
        action.payload.data?.currencies?.filter((item) => item.isBase) || {};

      if (updatedData && Object.keys(updatedData)?.length) {
        state.baseCurrency = updatedData?.currency;
      } else {
        state.baseCurrency =
          action.payload.data?.currencies?.[0]?.currency || {};
      }

      // ====================== notifications ======================

      state.allowedNotifications = {
        allowedNotifications: action.payload.data?.allowedNotifications || [],
        txnThresholdAmount: action.payload.data?.txnThresholdAmount || 0,
        notifyOnTxnAccounts: action.payload.data?.notifyOnTxnAccounts || [],
        notifyOnTxnLabels: action.payload.data?.notifyOnTxnLabels || [],
        notifyOnTxnHeadCategories:
          action.payload.data?.notifyOnTxnHeadCategories || [],
      };
    });
    builder.addCase(verifyTokenThunk.rejected, (state, action) => {
      state.dataLoading = false;
      state.message = "";
      state.error = action?.payload?.message;
    });

    // =============================================
    //            Delete All User data
    // =============================================

    builder.addCase(deleteUserDataThunk.pending, (state) => {
      state.dataLoading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(deleteUserDataThunk.fulfilled, (state) => {
      state.dataLoading = false;
      state.message = "";
      state.error = null;
    });
    builder.addCase(deleteUserDataThunk.rejected, (state, action) => {
      state.dataLoading = false;
      state.message = "";
      state.error = action?.payload?.message;
    });

    // =============================================
    //       Delete Transactions and Settings
    // =============================================

    builder.addCase(deleteTransactionsThunk.pending, (state) => {
      state.dataLoading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(deleteTransactionsThunk.fulfilled, (state) => {
      state.dataLoading = false;
      state.message = "";
      state.error = null;
    });
    builder.addCase(deleteTransactionsThunk.rejected, (state, action) => {
      state.dataLoading = false;
      state.message = "";
      state.error = action?.payload?.message;
    });

    // =============================================
    //          Delete All Transactions
    // =============================================

    builder.addCase(deleteTransactionsAppSettingsThunk.pending, (state) => {
      state.dataLoading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(deleteTransactionsAppSettingsThunk.fulfilled, (state) => {
      state.dataLoading = false;
      state.message = "";
      state.error = null;
    });
    builder.addCase(
      deleteTransactionsAppSettingsThunk.rejected,
      (state, action) => {
        state.dataLoading = false;
        state.message = "";
        state.error = action?.payload?.message;
      }
    );

    // =============================================
    //            Change base currency
    // =============================================

    builder.addCase(changeBaseCurrencyThunk.pending, (state) => {
      state.dataLoading = true;
      state.currencyLoading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(changeBaseCurrencyThunk.fulfilled, (state, action) => {
      state.dataLoading = false;
      state.currencyLoading = false;
      state.message = "";
      state.error = null;
      const [updatedData] =
        action.payload.data?.filter((item) => item.isBase) || {};
      state.baseCurrency = updatedData;
    });
    builder.addCase(changeBaseCurrencyThunk.rejected, (state, action) => {
      state.dataLoading = false;
      state.currencyLoading = false;
      state.message = "";
      state.error = action?.payload?.message;
    });

    // =============================================
    //            Update User Details
    // =============================================

    builder.addCase(updateUserDetailsThunk.pending, (state) => {
      state.loading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(updateUserDetailsThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.message = "";
      state.error = null;
      state.user = action.payload.data;
    });
    builder.addCase(updateUserDetailsThunk.rejected, (state, action) => {
      state.loading = false;
      state.message = "";
      state.error = action?.payload?.message;
    });

    // ===========================================
    //            User Notification
    // ===========================================

    builder.addCase(userNotificationThunk.pending, (state) => {
      state.notificationLoading = true;
      state.notificationMessage = "";
      state.notificationError = null;
    });
    builder.addCase(userNotificationThunk.fulfilled, (state) => {
      state.notificationLoading = false;
      state.notificationMessage = "";
      state.notificationError = null;
    });
    builder.addCase(userNotificationThunk.rejected, (state, action) => {
      state.notificationLoading = false;
      state.notificationMessage = "";
      state.notificationError = action?.payload?.message;
    });

    // ===========================================
    //              User Logout
    // ===========================================

    builder.addCase(userLogoutThunk.pending, (state) => {
      state.loading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(userLogoutThunk.fulfilled, (state) => {
      state.loading = false;
      state.message = "";
      state.error = null;
    });
    builder.addCase(userLogoutThunk.rejected, (state, action) => {
      state.loading = false;
      state.message = "";
      state.error = action?.payload?.message;
    });
  },
});

export const { clearToken, setAllowedNotification, setSubscriptionName } =
  slice.actions;
export default slice.reducer;
