import { createAsyncThunk } from "@reduxjs/toolkit";
import { toastError, toastSuccess } from "../../config/toastConfig";
import {
  cancelSubscription,
  createStripeSession,
  getSubscription,
  upgradeSubscription,
} from "../../helpers/backend_helper";

export const createStripeSessionThunk = createAsyncThunk(
  "createStripeSessionThunk",
  async (values, { rejectWithValue }) => {
    try {
      const { data } = await createStripeSession(values);
      toastSuccess(data.message);
      return data;
    } catch (error) {
      let errorMessage = "";
      if (error.response.status !== 403) {
        errorMessage = error.response?.data?.message;
      }
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

export const getSubscriptionThunk = createAsyncThunk(
  "getSubscriptionThunk",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await getSubscription(id);
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

export const cancelSubscriptionThunk = createAsyncThunk(
  "cancelSubscriptionThunk",
  async (values, { rejectWithValue }) => {
    try {
      const { data } = await cancelSubscription(values);
      toastSuccess("Subscription cancellation request accepted successfully");
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

export const upgradeSubscriptionThunk = createAsyncThunk(
  "upgradeSubscriptionThunk",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await upgradeSubscription({ priceId: id });
      toastSuccess(data.message);
      return data;
    } catch (error) {
      let errorMessage = "";
      if (error.response.status !== 403) {
        errorMessage = error.response?.data?.message;
      }
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
