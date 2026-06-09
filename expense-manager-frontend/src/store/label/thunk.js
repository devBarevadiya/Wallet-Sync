import { createAsyncThunk } from "@reduxjs/toolkit";
import { toastError, toastSuccess } from "../../config/toastConfig";
import {
  createLabel,
  deleteLabel,
  getLabel,
  updateLabel,
} from "../../helpers/backend_helper";

export const getLabelThunk = createAsyncThunk(
  "gteLabelThunk",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await getLabel();
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

export const createLabelThunk = createAsyncThunk(
  "createLabelThunk",
  async (values, { rejectWithValue }) => {
    try {
      const { data } = await createLabel(values);
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

export const updateLabelThunk = createAsyncThunk(
  "editLabelThunk",
  async ({ values, id }, { rejectWithValue }) => {
    try {
      const { data } = await updateLabel(values, id);
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

export const deleteLabelThunk = createAsyncThunk(
  "deleteLabelThunk",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await deleteLabel(id);
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
