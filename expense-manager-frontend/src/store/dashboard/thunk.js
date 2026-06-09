import { createAsyncThunk } from "@reduxjs/toolkit";
import { analysts, lastRecord, spending } from "../../helpers/backend_helper";
import { toastError } from "../../config/toastConfig";

export const lastRecordThunk = createAsyncThunk(
  "lastRecordThunk",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await lastRecord();
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

export const spendingThunk = createAsyncThunk(
  "spendingThunk",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await spending();
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

export const analyticsThunk = createAsyncThunk(
  "analystsThunk",
  async (values = {}, { rejectWithValue }) => {
    try {
      const { data } = await analysts(values);
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

export const singleAnalyticsThunk = createAsyncThunk(
  "singleAnalyticsThunk",
  async (values, { rejectWithValue }) => {
    try {
      const { data } = await analysts(values);
      data.values = values;
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
