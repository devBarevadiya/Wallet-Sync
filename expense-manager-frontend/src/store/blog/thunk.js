import { createAsyncThunk } from "@reduxjs/toolkit";
import { toastError, toastSuccess } from "../../config/toastConfig";
import {
  checkTitleAvailable,
  createBlog,
  deleteBlog,
  getBlog,
  getBlogDetails,
  updateBlog,
} from "../../helpers/backend_helper";

export const createBlogThunk = createAsyncThunk(
  "createBlogThunk",
  async (data, { rejectWithValue }) => {
    try {
      const response = await createBlog(data);
      toastSuccess(response.data.message);
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

export const deleteBlogThunk = createAsyncThunk(
  "deleteBlogThunk",
  async (id, { rejectWithValue }) => {
    try {
      const response = await deleteBlog(id);
      toastSuccess(response.data.message);
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

export const checkTitleAvailableThunk = createAsyncThunk(
  "checkTitleAvailableThunk",
  async (title, { rejectWithValue }) => {
    try {
      const response = await checkTitleAvailable(title);
      // toastSuccess(response.data.message);
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

export const getBlogThunk = createAsyncThunk(
  "getBlogThunk",
  async (query, { rejectWithValue }) => {
    try {
      const response = await getBlog(query);
      // toastSuccess(response.data.message);
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

export const getBlogByPaginationThunk = createAsyncThunk(
  "getBlogByPaginationThunk",
  async ({ page }, { rejectWithValue }) => {
    try {
      const response = await getBlog({ page });
      // toastSuccess(response.data.message);
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

export const getBlogDetailsThunk = createAsyncThunk(
  "getBlogDetailsThunk",
  async (slug, { rejectWithValue }) => {
    try {
      const response = await getBlogDetails(slug);
      // toastSuccess(response.data.message);
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

export const updateBlogThunk = createAsyncThunk(
  "updateBlogThunk",
  async ({ slug, data }, { rejectWithValue }) => {
    try {
      const response = await updateBlog(slug, data);
      toastSuccess(response.data.message);
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
