import { createAsyncThunk } from "@reduxjs/toolkit";
import { getCurrency, setCurrency } from "../../helpers/backend_helper";
import { toastError, toastSuccess } from "../../config/toastConfig";
import axios from "axios";

export const getCurrencyThunk = createAsyncThunk(
  "getCurrencyThunk",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await getCurrency();
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

export const setCurrencyThunk = createAsyncThunk(
  "setCurrencyThunk",
  async (values, { rejectWithValue }) => {
    try {
      const { data } = await setCurrency(values);
      toastSuccess(data?.message);
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

export const getCurrencyByCountryThunk = createAsyncThunk(
  "getCurrencyByCountryThunk",
  async () => {
    try {
      const { data } = await axios.get("https://freeipapi.com/api/json");
      return data;
    } catch (error) {
      return "USD";
    }
  }
);
