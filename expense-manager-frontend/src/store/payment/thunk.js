import { createAsyncThunk } from "@reduxjs/toolkit";
import { toastError, toastSuccess } from "../../config/toastConfig";
import {
  deletePayment,
  getAllPaymentPlanned,
  updatePayment,
} from "../../helpers/backend_helper";

export const getAllPaymentPlannedThunk = createAsyncThunk(
  "getAllPaymentPlannedThunk",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await getAllPaymentPlanned(id);
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

export const updatePaymentThunk = createAsyncThunk(
  "updatePaymentThunk",
  async ({ id, values }, { rejectWithValue }) => {
    try {
      const { data } = await updatePayment(id, values);
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

export const deletePaymentThunk = createAsyncThunk(
  "deletePaymentThunk",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await deletePayment(id);
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

export const paymentPlannedPaginationThunk = createAsyncThunk(
  "paymentPlannedPaginationThunk",
  async ({ id, page }, { rejectWithValue }) => {
    try {
      const { data } = await getAllPaymentPlanned(id, page);
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
