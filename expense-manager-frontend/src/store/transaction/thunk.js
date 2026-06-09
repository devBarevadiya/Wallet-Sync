import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  createTransaction,
  deleteMultipleTransactions,
  getTransaction,
  getTransactionFilterOptions,
  updateTransaction,
} from "../../helpers/backend_helper";
import { toastError, toastSuccess } from "../../config/toastConfig";

export const getTransactionThunk = createAsyncThunk(
  "getTransactionThunk",
  async (values, { rejectWithValue }) => {
    try {
      const { data } = await getTransaction(values);
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

export const getTransactionReportThunk = createAsyncThunk(
  "getTransactionReportThunk",
  async (values, { rejectWithValue }) => {
    try {
      const { data } = await getTransaction(values);
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

export const createTransactionThunk = createAsyncThunk(
  "createTransactionThunk",
  async (values, { rejectWithValue }) => {
    try {
      const { data } = await createTransaction(values);
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

export const updateTransactionThunk = createAsyncThunk(
  "updateTransactionThunk",
  async ({ id, values }, { rejectWithValue }) => {
    try {
      const { data } = await updateTransaction(id, values);
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

export const transactionFilterOptionsThunk = createAsyncThunk(
  "",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await getTransactionFilterOptions();
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

export const deleteMultipleTransactionThunk = createAsyncThunk(
  "deleteMultipleTransactionThunk",
  async (values, { rejectWithValue }) => {
    try {
      const { data } = await deleteMultipleTransactions(values);
      data.ids = values.ids;
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
