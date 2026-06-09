import { createSlice } from "@reduxjs/toolkit";
import {
  getCurrencyByCountryThunk,
  getCurrencyThunk,
  setCurrencyThunk,
} from "./thunk";

const initialState = {
  data: [],
  flatData: [],
  error: null,
  countryCurrency: {},
  message: "",
  loading: false,
};

const slice = createSlice({
  name: "Currency",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getCurrencyThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.message = "";
    });
    builder.addCase(getCurrencyThunk.fulfilled, (state, action) => {
      const data = action.payload.data;
      state.loading = false;
      state.error = null;
      state.message = "";
      state.data = action.payload.data;
      if (!state.flatData?.length > 0) {
        data.map((ele) => {
          return ele?.items?.map((item) => {
            state.flatData.push(item);
          });
        });
      }
    });
    builder.addCase(getCurrencyThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload.message;
      state.message = "";
    });
    // set currency
    builder.addCase(setCurrencyThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.message = "";
    });
    builder.addCase(setCurrencyThunk.fulfilled, (state) => {
      state.loading = false;
      state.error = null;
      state.message = "";
    });
    builder.addCase(setCurrencyThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload.message;
      state.message = "";
    });
    // get currency by country
    builder.addCase(getCurrencyByCountryThunk.pending, (state) => {
      state.loading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(getCurrencyByCountryThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.message = "";
      state.error = null;
    });
    builder.addCase(getCurrencyByCountryThunk.rejected, (state) => {
      state.loading = false;
      state.message = "";
      state.error = null;
    });
  },
});

export default slice.reducer;
