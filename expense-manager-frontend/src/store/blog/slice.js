import { createSlice } from "@reduxjs/toolkit";
import {
  createBlogThunk,
  deleteBlogThunk,
  getBlogByPaginationThunk,
  getBlogDetailsThunk,
  getBlogThunk,
  updateBlogThunk,
} from "./thunk";

const initialState = {
  loading: false,
  dataLoading: false,
  data: [],
  paginationData: {},
  paginationLoading: false,
  singleData: {},
  message: "",
  error: null,
};

const slice = createSlice({
  name: "Blog",
  initialState,
  reducers: {
    clearBlogSingleData: (state) => {
      state.singleData = {};
    },
  },
  extraReducers: (builder) => {
    // =================================  Create blog ==================================

    builder.addCase(createBlogThunk.pending, (state) => {
      state.loading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(createBlogThunk.fulfilled, (state) => {
      state.loading = false;
      state.message = "";
      state.error = null;
    });
    builder.addCase(createBlogThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload.message;
      state.message = "";
    });

     // =================================  Update blog ==================================

    builder.addCase(updateBlogThunk.pending, (state) => {
      state.loading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(updateBlogThunk.fulfilled, (state) => {
      state.loading = false;
      state.message = "";
      state.error = null;
    });
    builder.addCase(updateBlogThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload.message;
      state.message = "";
    });

     // =================================  Get blog ==================================

    builder.addCase(getBlogThunk.pending, (state) => {
      state.dataLoading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(getBlogThunk.fulfilled, (state, action) => {
      state.dataLoading = false;
      state.message = "";
      state.error = null;
      state.data = action.payload.data;
      state.paginationData = action.payload.pagination;
    });
    builder.addCase(getBlogThunk.rejected, (state, action) => {
      state.dataLoading = false;
      state.error = action.payload.message;
      state.message = "";
    });

     // =================================  Get blog by pagination ==================================

    builder.addCase(getBlogByPaginationThunk.pending, (state) => {
      state.paginationLoading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(getBlogByPaginationThunk.fulfilled, (state, action) => {
      state.paginationLoading = false;
      state.message = "";
      state.error = null;
      state.data.push(...action.payload.data);
      state.paginationData = action.payload.pagination;
    });
    builder.addCase(getBlogByPaginationThunk.rejected, (state, action) => {
      state.paginationLoading = false;
      state.error = action.payload.message;
      state.message = "";
    });

     // =================================  Blog details blog ==================================

    builder.addCase(getBlogDetailsThunk.pending, (state) => {
      state.dataLoading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(getBlogDetailsThunk.fulfilled, (state, action) => {
      state.dataLoading = false;
      state.message = "";
      state.error = null;
      state.singleData = action.payload.data;
    });
    builder.addCase(getBlogDetailsThunk.rejected, (state, action) => {
      state.dataLoading = false;
      state.error = action.payload.message;
      state.message = "";
    });

     // =================================  Delete blog ==================================

    builder.addCase(deleteBlogThunk.pending, (state) => {
      state.loading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(deleteBlogThunk.fulfilled, (state) => {
      state.loading = false;
      state.message = "";
      state.error = null;
      // state.singleData = action.payload.data;
    });
    builder.addCase(deleteBlogThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload.message;
      state.message = "";
    });
  },
});

export const { clearBlogSingleData } = slice.actions;
export default slice.reducer;
