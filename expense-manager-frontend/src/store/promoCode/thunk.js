import { createAsyncThunk } from "@reduxjs/toolkit";
import { toastError, toastSuccess } from "../../config/toastConfig";
import {
  applyPromoCode,
  deletePromoCode,
  generatePromoCode,
  getPromoCode,
} from "../../helpers/backend_helper";

export const applyPromoCodeThunk = createAsyncThunk(
  "applyPromoCodeThunk",
  async (values, { rejectWithValue }) => {
    try {
      const { data } = await applyPromoCode(values);
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

export const generatePromoCodeThunk = createAsyncThunk(
  "generatePromoCodeThunk",
  async (values, { rejectWithValue }) => {
    try {
      const { data } = await generatePromoCode(values);
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

export const getPromoCodeThunk = createAsyncThunk(
  "getPromoCodeThunk",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await getPromoCode({ limit: 12 });
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

export const getPromoCodePaginationThunk = createAsyncThunk(
  "getPromoCodePaginationThunk",
  async ({ page }, { rejectWithValue }) => {
    try {
      const { data } = await getPromoCode({ page, limit: 12 });
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

export const deletePromoCodeThunk = createAsyncThunk(
  "deletePromoCodeThunk",
  async (values, { rejectWithValue }) => {
    try {
      const { data } = await deletePromoCode(values);
      data.ids = values;
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
