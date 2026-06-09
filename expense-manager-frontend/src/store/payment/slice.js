import { createSlice } from "@reduxjs/toolkit";
import {
  deletePaymentThunk,
  getAllPaymentPlannedThunk,
  paymentPlannedPaginationThunk,
  updatePaymentThunk,
} from "./thunk";

const initialState = {
  data: [],
  singledata: {},
  pagination: {},
  loading: false,
  error: "",
  message: "",
  actionLoading: false,
};

const slice = createSlice({
  name: "Payment",
  initialState,
  extraReducers: (builder) => {
    // get payment planned

    builder.addCase(getAllPaymentPlannedThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.message = "";
    });
    builder.addCase(getAllPaymentPlannedThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;
      state.message = "";
      state.data = action.payload.data;
      state.pagination = action.payload.pagination;
    });
    builder.addCase(getAllPaymentPlannedThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = null;
      state.message = action.payload.message;
    });

    // update payment planned

    builder.addCase(updatePaymentThunk.pending, (state) => {
      state.actionLoading = true;
      state.error = null;
      state.message = "";
    });
    builder.addCase(updatePaymentThunk.fulfilled, (state) => {
      state.actionLoading = false;
      state.error = null;
      state.message = "";
    });
    builder.addCase(updatePaymentThunk.rejected, (state, action) => {
      state.actionLoading = false;
      state.error = null;
      state.message = action.payload.message;
    });

    // delete payment planned

    builder.addCase(deletePaymentThunk.pending, (state) => {
      state.actionLoading = true;
      state.error = null;
      state.message = "";
    });
    builder.addCase(deletePaymentThunk.fulfilled, (state) => {
      state.actionLoading = false;
      state.error = null;
      state.message = "";
    });
    builder.addCase(deletePaymentThunk.rejected, (state, action) => {
      state.actionLoading = false;
      state.error = null;
      state.message = action.payload.message;
    });

    // get payment planned by pagination

    builder.addCase(paymentPlannedPaginationThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.message = "";
    });
    builder.addCase(
      paymentPlannedPaginationThunk.fulfilled,
      (state, action) => {
        state.loading = false;
        state.error = null;
        state.message = "";
        state.data = [...state.data, ...action.payload.data];
        state.pagination = action.payload.pagination;
      }
    );
    builder.addCase(paymentPlannedPaginationThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = null;
      state.message = action.payload.message;
    });
  },
});

export default slice.reducer;
