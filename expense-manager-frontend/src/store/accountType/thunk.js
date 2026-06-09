import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  deleteAccountType,
  getAccountType,
  postAccountType,
  updateAccountType,
} from "../../helpers/backend_helper";
import { toastError, toastSuccess } from "../../config/toastConfig";

export const getAccountTypeThunk = createAsyncThunk(
  "getAccountTypeThunk",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await getAccountType();
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

export const postAccountTypeThunk = createAsyncThunk(
  "postAccountTypeThunk",
  async (values, { rejectWithValue }) => {
    try {
      const { data } = await postAccountType(values);
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

export const updateAccountTypeThunk = createAsyncThunk(
  "updateAccountTypeThunk",
  async ({ values, id }, { rejectWithValue }) => {
    try {
      const { data } = await updateAccountType(id, values);
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

export const deleteAccountTypeThunk = createAsyncThunk(
  "deleteAccountTypeThunk",
  async ({ id }, { rejectWithValue }) => {
    try {
      const { data } = await deleteAccountType(id);
      toastSuccess(data.message);
      data.id = id;
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
