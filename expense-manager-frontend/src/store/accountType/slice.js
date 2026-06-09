import { createSlice } from "@reduxjs/toolkit";
import {
  deleteAccountTypeThunk,
  getAccountTypeThunk,
  postAccountTypeThunk,
  updateAccountTypeThunk,
} from "./thunk";

const initialState = {
  data: [],
  editData: {},
  loading: false,
  error: null,
  message: "",
};

const slice = createSlice({
  name: "AccountType",
  initialState,
  reducers: {
    setEditData: (state, action) => {
      state.editData = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getAccountTypeThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.message = "";
    });
    builder.addCase(getAccountTypeThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;
      state.message = "";
      state.data = action.payload.data;
    });
    builder.addCase(getAccountTypeThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload.message;
      state.message = "";
    });

    // create account
    builder.addCase(postAccountTypeThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.message = "";
    });
    builder.addCase(postAccountTypeThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;
      state.message = "";
      state.data.push(action.payload.data);
    });
    builder.addCase(postAccountTypeThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload.message;
      state.message = "";
    });

    // update account
    builder.addCase(updateAccountTypeThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.message = "";
    });
    builder.addCase(updateAccountTypeThunk.fulfilled, (state) => {
      state.loading = false;
      state.error = null;
      state.message = "";
    });
    builder.addCase(updateAccountTypeThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload.message;
      state.message = "";
    });

    // delete account
    builder.addCase(deleteAccountTypeThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.message = "";
    });
    builder.addCase(deleteAccountTypeThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;
      state.message = "";
      state.data = state.data?.filter((item)=> item?._id !== action.payload.id)
    });
    builder.addCase(deleteAccountTypeThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload.message;
      state.message = "";
    });
  },
});

export const { setEditData } = slice.actions;
export default slice.reducer;
