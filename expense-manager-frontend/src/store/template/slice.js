import { createSlice } from "@reduxjs/toolkit";
import {
  createTemplateThunk,
  deleteTemplateThunk,
  editTemplateThunk,
  getTemplateThunk,
} from "./thunk";

const initialState = {
  data: [],
  loading: false,
  error: null,
  message: "",
};

const slice = createSlice({
  name: "Template",
  initialState,
  extraReducers: (builder) => {
    // create template

    builder.addCase(createTemplateThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.message = "";
    });
    builder.addCase(createTemplateThunk.fulfilled, (state) => {
      state.loading = false;
      state.error = null;
      state.message = "";
    });
    builder.addCase(createTemplateThunk.rejected, (state) => {
      state.loading = false;
      state.error = null;
      state.message = "";
    });

    // get template

    builder.addCase(getTemplateThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.message = "";
    });
    builder.addCase(getTemplateThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;
      state.message = "";
      state.data = action.payload.data;
    });
    builder.addCase(getTemplateThunk.rejected, (state) => {
      state.loading = false;
      state.error = null;
      state.message = "";
    });

    // delete trnsaction

    builder.addCase(deleteTemplateThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.message = "";
    });
    builder.addCase(deleteTemplateThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;
      state.message = "";
      state.data = state.data?.filter(
        (item) => item?._id !== action.payload.id
      );
    });
    builder.addCase(deleteTemplateThunk.rejected, (state) => {
      state.loading = false;
      state.error = null;
      state.message = "";
    });

    // edit template

    builder.addCase(editTemplateThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.message = "";
    });
    builder.addCase(editTemplateThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;
      state.message = "";
      state.data = state.data?.map((item) =>
        item?._id == action.payload.id ? action.payload.data : item
      );
    });
    builder.addCase(editTemplateThunk.rejected, (state) => {
      state.loading = false;
      state.error = null;
      state.message = "";
    });
  },
});

export default slice.reducer;
