import { createAsyncThunk } from "@reduxjs/toolkit";
import { toastError, toastSuccess } from "../../config/toastConfig";
import {
  createPlanned,
  deletePlanned,
  getPlanned,
  getPlannedByFilter,
  updatePlanned,
} from "../../helpers/backend_helper";

export const createPlannedThunk = createAsyncThunk(
  "createPlannedThunk",
  async (values, { rejectWithValue }) => {
    try {
      const { data } = await createPlanned(values);
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

export const getPlannedThunk = createAsyncThunk(
  "getPlannedThunk",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await getPlanned();
      //   toastSuccess(data.message);
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

export const getPlannedByFiltersThunk = createAsyncThunk(
  "getPlannedByFiltersThunk",
  async (values, { rejectWithValue }) => {
    try {
      const { data } = await getPlannedByFilter(values);
      //   toastSuccess(data.message);
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

export const updatePlannedThunk = createAsyncThunk(
  "updatePlannedThunk",
  async ({ id, values }, { rejectWithValue }) => {
    try {
      const { data } = await updatePlanned(id, values);
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

export const deletePlannedThunk = createAsyncThunk(
  "deletePlannedThunk",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await deletePlanned(id);
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
