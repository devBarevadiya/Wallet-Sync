import { createAsyncThunk } from "@reduxjs/toolkit";
import { toastError, toastSuccess } from "../../config/toastConfig";
import {
  addNewHeadCatgory,
  addNewSubCatgory,
  createBudget,
  deleteBudget,
  getBudget,
  getBudgetDetails,
  getBudgetTransaction,
  rolloverStatus,
  updateBudget,
} from "../../helpers/backend_helper";

export const createBugetThunk = createAsyncThunk(
  "createBugetThunk",
  async (values, { rejectWithValue }) => {
    try {
      const { data } = await createBudget(values);
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

export const getBudgetThunk = createAsyncThunk(
  "getBudgetThunk",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await getBudget({ limit: 11 });
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

export const getBudgetByPaginationThunk = createAsyncThunk(
  "getBudgetByPaginationThunk",
  async ({ page }, { rejectWithValue }) => {
    try {
      const { data } = await getBudget({ limit: 11, page });
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

export const deleteBudgetThunk = createAsyncThunk(
  "deleteBudgetThunk",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await deleteBudget(id);
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

export const updateBudgetThunk = createAsyncThunk(
  "updateBudgetThunk",
  async ({ id, values }, { rejectWithValue }) => {
    try {
      const { data } = await updateBudget(id, values);
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

export const budgetDetailsThunk = createAsyncThunk(
  "budgetDetailsThunk",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await getBudgetDetails(id);
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

export const budgetTransactionsThunk = createAsyncThunk(
  "budgetTransactionsThunk",
  async ({ id, values = {} }, { rejectWithValue }) => {
    try {
      const { data } = await getBudgetTransaction(id, values);
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

export const budgetTransactionsPaginationThunk = createAsyncThunk(
  "budgetTransactionsPaginationThunk",
  async ({ id, page = 1, values = {} }, { rejectWithValue }) => {
    try {
      const { data } = await getBudgetTransaction(id, { page, ...values });
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

export const addNewHeadCatgoryThunk = createAsyncThunk(
  "addNewHeadCatgoryThunk",
  async ({ id, value }, { rejectWithValue }) => {
    try {
      const { data } = await addNewHeadCatgory(id, value);
      toastSuccess(data?.message);
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

export const addNewSubCatgoryThunk = createAsyncThunk(
  "addNewSubCatgoryThunk",
  async ({ headId, id, value }, { rejectWithValue }) => {
    try {
      const { data } = await addNewSubCatgory(headId, id, value);
      toastSuccess(data?.message);
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

export const rolloverStatusThunk = createAsyncThunk(
  "rolloverStatusThunk",
  async ({ id, values }, { rejectWithValue }) => {
    try {
      const { data } = await rolloverStatus(id, values);
      toastSuccess(data?.message);
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
