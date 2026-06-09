import { createAsyncThunk } from "@reduxjs/toolkit";
import { toastError, toastSuccess } from "../../config/toastConfig";
import {
  deleteAccount,
  getAccount,
  getAccountDetails,
  postAccount,
  updateAccount,
} from "../../helpers/backend_helper";

// get all accounts
export const getAccountThunk = createAsyncThunk(
  "getAccountThunk",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await getAccount();
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

// get account details
export const getAccountDetailsThunk = createAsyncThunk(
  "getAccountDetailsThunk",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await getAccountDetails(id);
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

// create account
export const postAccountThunk = createAsyncThunk(
  "postAccountThunk",
  async (values, { rejectWithValue }) => {
    try {
      const { data } = await postAccount(values);
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

// update account

export const updateAccountThunk = createAsyncThunk(
  "updateAccountThunk",
  async ({ values, id }, { rejectWithValue }) => {
    try {
      const { data } = await updateAccount(values, id);
      data.id = data.data._id;
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

// delete account

export const deleteAccountThunk = createAsyncThunk(
  "deleteAccountThunk",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await deleteAccount(id);
      data.id = id;
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
