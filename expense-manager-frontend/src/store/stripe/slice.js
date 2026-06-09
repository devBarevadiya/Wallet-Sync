import { createSlice } from "@reduxjs/toolkit";
import {
  cancelSubscriptionThunk,
  createStripeSessionThunk,
  getSubscriptionThunk,
  upgradeSubscriptionThunk,
} from "./thunk";

const initialState = {
  subscriptionDetails: {},
  loading: false,
  message: "",
  error: null,
};

const slice = createSlice({
  name: "Stripe",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // ===========================================
    //           get stripe session
    // ===========================================

    builder.addCase(createStripeSessionThunk.pending, (state) => {
      state.loading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(createStripeSessionThunk.fulfilled, (state) => {
      state.loading = false;
      state.message = "";
      state.error = null;
    });
    builder.addCase(createStripeSessionThunk.rejected, (state, action) => {
      state.loading = false;
      state.message = "";
      state.error = action.payload.message;
    });

    // ===========================================
    //         cancel stripe subscription
    // ===========================================

    builder.addCase(cancelSubscriptionThunk.pending, (state) => {
      state.loading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(cancelSubscriptionThunk.fulfilled, (state) => {
      state.loading = false;
      state.message = "";
      state.error = null;
    });
    builder.addCase(cancelSubscriptionThunk.rejected, (state, action) => {
      state.loading = false;
      state.message = "";
      state.error = action.payload.message;
    });

    // ===========================================
    //       get stripe subscription details
    // ===========================================

    builder.addCase(getSubscriptionThunk.pending, (state) => {
      state.loading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(getSubscriptionThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.message = "";
      state.error = null;
      state.subscriptionDetails = action.payload.data;
    });
    builder.addCase(getSubscriptionThunk.rejected, (state, action) => {
      state.loading = false;
      state.message = "";
      state.error = action.payload.message;
    });

    // ===========================================
    //       update stripe subscription details
    // ===========================================

    builder.addCase(upgradeSubscriptionThunk.pending, (state) => {
      state.loading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(upgradeSubscriptionThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.message = "";
      state.error = null;
      state.subscriptionDetails = action.payload.data;
    });
    builder.addCase(upgradeSubscriptionThunk.rejected, (state, action) => {
      state.loading = false;
      state.message = "";
      state.error = action.payload.message;
    });
  },
});

export default slice.reducer;
