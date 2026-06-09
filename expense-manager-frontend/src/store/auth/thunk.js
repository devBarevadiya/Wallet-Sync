import { createAsyncThunk } from "@reduxjs/toolkit";
import { toastError, toastSuccess } from "../../config/toastConfig";
import * as backendHelper from "../../helpers/backend_helper";
import { signInWithPopup } from "firebase/auth";
import { auth } from "../../firebase/config";

export const signInThunk = createAsyncThunk(
  "signInThunk",
  async (values, { rejectWithValue }) => {
    try {
      const { data } = await backendHelper.signIn(values);
      if (data?.data?.token) {
        localStorage.setItem("token", data?.data?.token);
      }
      toastSuccess(data?.message);
      return data.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message;
      if (errorMessage) {
        toastError(errorMessage);
      }
      // Reject with error response
      return rejectWithValue({
        status: error.response.status,
        message: errorMessage,
      });
    }
  }
);

export const signUpThunk = createAsyncThunk(
  "signUp",
  async (values, { rejectWithValue }) => {
    try {
      const { data } = await backendHelper.signUp(values);
      if (data?.data?.token) {
        localStorage.setItem("token", data?.data?.token);
      }
      toastSuccess(data.message);
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.message;
      if (errorMessage) {
        toastError(errorMessage);
      }
      // Reject with error response
      return rejectWithValue({
        status: error.response.status,
        message: errorMessage,
      });
    }
  }
);

export const forgotPasswordThunk = createAsyncThunk(
  "forgotPasswordThunk",
  async (values, { rejectWithValue }) => {
    try {
      const { data } = await backendHelper.forgotPassword(values);
      toastSuccess(
        "Password reset link successfully sent to your email address."
      );
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.message;
      if (errorMessage) {
        toastError(errorMessage);
      }
      // Reject with error response
      return rejectWithValue({
        status: error.response.status,
        message: errorMessage,
      });
    }
  }
);

export const resetPasswordThunk = createAsyncThunk(
  "resetPasswordThunk",
  async ({ token, values }, { rejectWithValue }) => {
    try {
      const { data } = await backendHelper.resetPassword({ token, values });
      toastSuccess(data.message);
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.message;
      if (errorMessage) {
        toastError(errorMessage);
      }
      // Reject with error response
      return rejectWithValue({
        status: error.response.status,
        message: errorMessage,
      });
    }
  }
);

export const changePasswordThunk = createAsyncThunk(
  "changePasswordThunk",
  async (values, { rejectWithValue }) => {
    try {
      const { data } = await backendHelper.changePassword(values);
      toastSuccess(data.message);
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.message;
      if (errorMessage) {
        toastError(errorMessage);
      }
      // Reject with error response
      return rejectWithValue({
        status: error.response.status,
        message: errorMessage,
      });
    }
  }
);

export const socialLoginThunk = createAsyncThunk(
  "socialLoginThunk",
  async ({ values, deepLinkToken = "" }, { rejectWithValue }) => {
    try {
      const { user } = await signInWithPopup(auth, values);
      const { data } = await backendHelper.socialLogin({
        token: user.accessToken,
        ...(deepLinkToken ? { deepLinkToken } : ""),
      });
      if (data?.data?.token) {
        localStorage.setItem("token", data?.data?.token);
      }
      toastSuccess(data.message);
      return data;
    } catch (error) {
      const errorMessage = error?.response?.data?.message;
      if (errorMessage) {
        toastError(errorMessage);
      }
      // Reject with error response
      return rejectWithValue({
        status: error.response.status,
        message: errorMessage,
      });
    }
  }
);

export const firebaseRegisterAdminThunk = createAsyncThunk(
  "firebaseRegisterAdminThunk",
  async ({ values, otherValues }, { rejectWithValue }) => {
    try {
      const { user } = await signInWithPopup(auth, values);
      const { data } = await backendHelper.socialRegister({
        token: user.accessToken,
        ...otherValues,
      });
      toastSuccess(data.message);
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.message;
      if (errorMessage) {
        toastError(errorMessage);
      }
      // Reject with error response
      return rejectWithValue({
        status: error.response.status,
        message: errorMessage,
      });
    }
  }
);

export const verifyTokenThunk = createAsyncThunk(
  "verifyTokenThunk",
  async ({ token }, { rejectWithValue }) => {
    try {
      const { data } = await backendHelper.verifyToken({ token });
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.message;
      if (errorMessage) {
        toastError(errorMessage);
      }
      // Reject with error response
      return rejectWithValue({
        status: error.response.status,
        message: errorMessage,
      });
    }
  }
);

export const deleteUserDataThunk = createAsyncThunk(
  "deleteUserDataThunk",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await backendHelper.deleteUserData();
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.message;
      if (errorMessage) {
        toastError(errorMessage);
      }
      // Reject with error response
      return rejectWithValue({
        status: error.response.status,
        message: errorMessage,
      });
    }
  }
);

export const deleteTransactionsThunk = createAsyncThunk(
  "deleteTransactionsThunk",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await backendHelper.deleteTransactions();
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.message;
      if (errorMessage) {
        toastError(errorMessage);
      }
      // Reject with error response
      return rejectWithValue({
        status: error.response.status,
        message: errorMessage,
      });
    }
  }
);

export const deleteTransactionsAppSettingsThunk = createAsyncThunk(
  "deleteTransactionsAppSettingsThunk",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await backendHelper.deleteTransactionsAppSettings();
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.message;
      if (errorMessage) {
        toastError(errorMessage);
      }
      // Reject with error response
      return rejectWithValue({
        status: error.response.status,
        message: errorMessage,
      });
    }
  }
);

export const changeBaseCurrencyThunk = createAsyncThunk(
  "changeBaseCurrencyThunk",
  async (values, { rejectWithValue }) => {
    try {
      const { data } = await backendHelper.changeBaseCurrency(values);
      // toastSuccess(data.message);
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.message;
      if (errorMessage) {
        toastError(errorMessage);
      }
      // Reject with error response
      return rejectWithValue({
        status: error.response.status,
        message: errorMessage,
      });
    }
  }
);

export const updateUserDetailsThunk = createAsyncThunk(
  "updateUserDetailsThunk",
  async ({ values, id }, { rejectWithValue }) => {
    try {
      const { data } = await backendHelper.updateUserProfile(values, id);
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.message;
      if (errorMessage) {
        toastError(errorMessage);
      }
      // Reject with error response
      return rejectWithValue({
        status: error.response.status,
        message: errorMessage,
      });
    }
  }
);

export const userNotificationThunk = createAsyncThunk(
  "userNotificationThunk",
  async (values, { rejectWithValue }) => {
    try {
      const { data } = await backendHelper.userNotification(values);
      toastSuccess(data.message);
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.message;
      if (errorMessage) {
        toastError(errorMessage);
      }
      // Reject with error response
      return rejectWithValue({
        status: error.response.status,
        message: errorMessage,
      });
    }
  }
);

export const userLogoutThunk = createAsyncThunk(
  "userLogoutThunk",
  async (values, { rejectWithValue }) => {
    try {
      const { data } = await backendHelper.userLogout(values);
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.message;
      if (errorMessage) {
        toastError(errorMessage);
      }
      // Reject with error response
      return rejectWithValue({
        status: error.response.status,
        message: errorMessage,
      });
    }
  }
);
