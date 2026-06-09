import { createAsyncThunk } from "@reduxjs/toolkit";
import { toastError } from "../../config/toastConfig";
import { aws } from "../../helpers/backend_helper";

export const awsThunk = createAsyncThunk(
  "awsThunk",
  async (data, { rejectWithValue }) => {
    try {
      const response = await aws(data);
      return response.data;
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
