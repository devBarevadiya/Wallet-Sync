import { createAsyncThunk } from "@reduxjs/toolkit";
import { customNotification, deviceToken } from "../../helpers/backend_helper";

export const deviceTokenThunk = createAsyncThunk(
  "deviceTokenThunk",
  async (values, { rejectWithValue }) => {
    try {
      const { data } = await deviceToken(values);
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.message;
      // Reject with error response
      return rejectWithValue({
        status: error.response.status,
        message: errorMessage,
      });
    }
  }
);

export const customNotificationThunk = createAsyncThunk(
  "customNotificationThunk",
  async (values, { rejectWithValue }) => {
    try {
      const { data } = await customNotification(values);
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.message;
      // Reject with error response
      return rejectWithValue({
        status: error.response.status,
        message: errorMessage,
      });
    }
  }
);
