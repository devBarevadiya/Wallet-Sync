import { createSlice } from "@reduxjs/toolkit";
import { customNotificationThunk, deviceTokenThunk } from "./thunk";

const initialState = {
  initialOptions: "",
  notificationStatus: "",
  data: [],
  loading: false,
  message: "",
  error: null,
};

const slice = createSlice({
  name: "Notification",
  initialState,
  reducers: {
    setNotificationStatus: (state, action) => {
      state.notificationStatus = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(deviceTokenThunk.pending, (state) => {
      state.loading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(deviceTokenThunk.fulfilled, (state) => {
      state.loading = false;
      state.message = "";
      state.error = null;
    });
    builder.addCase(deviceTokenThunk.rejected, (state) => {
      state.loading = false;
      state.message = "";
      state.error = null;
    });

    // custom notification

    builder.addCase(customNotificationThunk.pending, (state) => {
      state.loading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(customNotificationThunk.fulfilled, (state) => {
      state.loading = false;
      state.message = "";
      state.error = null;
    });
    builder.addCase(customNotificationThunk.rejected, (state) => {
      state.loading = false;
      state.message = "";
      state.error = null;
    });
  },
});

export const { setNotificationStatus } = slice.actions;
export default slice.reducer;
