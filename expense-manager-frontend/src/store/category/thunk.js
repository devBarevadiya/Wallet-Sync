import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  createCategory,
  createHead,
  getCategory,
  updateCategory,
  updateHead,
} from "../../helpers/backend_helper";
import { toastError, toastSuccess } from "../../config/toastConfig";

export const getCategoryThunk = createAsyncThunk(
  "getCategoryThunk",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await getCategory();
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

export const createCategoryThunk = createAsyncThunk(
  "createCategoryThunk",
  async ({ id, values }, { rejectWithValue }) => {
    try {
      const { data } = await createCategory(values, id);
      toastSuccess(data.message);
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

export const updateCategoryThunk = createAsyncThunk(
  "updateCategoryThunk",
  async ({ values, id, headId }, { rejectWithValue }) => {
    try {
      const { data } = await updateCategory(values, id);
      toastSuccess(data.message);
      data.id = id;
      data.headId = headId;
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

export const createHeadThunk = createAsyncThunk(
  "createHeadThunk",
  async (values, { rejectWithValue }) => {
    try {
      const { data } = await createHead(values);
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

export const updateHeadThunk = createAsyncThunk(
  "updateHeadThunk",
  async ({ id, values }, { rejectWithValue }) => {
    try {
      const { data } = await updateHead(values, id);
      toastSuccess(data.message);
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
