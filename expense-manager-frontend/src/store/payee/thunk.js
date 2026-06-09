import { createAsyncThunk } from "@reduxjs/toolkit";
import { toastError, toastSuccess } from "../../config/toastConfig";
import {
  createPayee,
  deleteMultiplePayee,
  getAllPayee,
  updatePayee,
} from "../../helpers/backend_helper";

export const createPayeeThunk = createAsyncThunk(
  "createPayeeThunk",
  async ({ values }, { rejectWithValue }) => {
    try {
      const { data } = await createPayee(values);
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

export const getAllPayeeThunk = createAsyncThunk(
  "getAllPayeeThunk",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await getAllPayee();
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

export const updatePayeeThunk = createAsyncThunk(
  "updatePayeeThunk",
  async ({ id, values }, { rejectWithValue }) => {
    try {
      const { data } = await updatePayee(id, values);
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

export const deleteMultiplePayeeThunk = createAsyncThunk(
  "deleteMultiplePayeeThunk",
  async ({ ids }, { rejectWithValue }) => {
    try {
      const { data } = await deleteMultiplePayee({ ids });
      data.ids = ids;
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
