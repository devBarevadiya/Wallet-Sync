import { createSlice } from "@reduxjs/toolkit";
import { awsThunk } from "./thunk";

const initialState = {
  imagePath: "",
  data: {},
  uploadLoading: false,
  message: "",
  error: null,
};

const slice = createSlice({
  name: "Aws",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(awsThunk.pending, (state) => {
      state.uploadLoading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(awsThunk.fulfilled, (state, action) => {
      state.uploadLoading = false;
      state.message = "";
      state.error = null;
      state.data = action.payload.data;
    });
    builder.addCase(awsThunk.rejected, (state, action) => {
      state.uploadLoading = false;
      state.error = action.payload.message;
      state.message = "";
    });
  },
});

export default slice.reducer;
