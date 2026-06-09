import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  createTemplate,
  deleteTemplate,
  editTemplate,
  getTemplate,
} from "../../helpers/backend_helper";
import { toastError, toastSuccess } from "../../config/toastConfig";

export const createTemplateThunk = createAsyncThunk(
  "createTemplateThunk",
  async (values, { rejectWithValue }) => {
    try {
      const { data } = await createTemplate(values);
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

export const getTemplateThunk = createAsyncThunk(
  "getTemplateThunk",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await getTemplate();
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

export const deleteTemplateThunk = createAsyncThunk(
  "deleteTemplateThunk",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await deleteTemplate(id);
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

export const editTemplateThunk = createAsyncThunk(
  "editTemplateThunk",
  async ({ id, values }, { rejectWithValue }) => {
    try {
      const { data } = await editTemplate(id, values);
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
