import { createSlice } from "@reduxjs/toolkit";
import {
  createPayeeThunk,
  deleteMultiplePayeeThunk,
  getAllPayeeThunk,
  updatePayeeThunk,
} from "./thunk";

const initialState = {
  data: [],
  loading: false,
  message: "",
  error: null,
  hasFetchedPayee: false,
};

const slice = createSlice({
  name: "Payee",
  initialState,
  reducers: {
    resetPayee: (state) => {
      state.data = [];
    },
  },
  extraReducers: (builder) => {
    // ===========================================
    //               create payee
    // ===========================================

    builder.addCase(createPayeeThunk.pending, (state) => {
      state.loading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(createPayeeThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.message = "";
      state.error = null;
      state.data = [...state.data, action.payload.data];
    });
    builder.addCase(createPayeeThunk.rejected, (state, action) => {
      state.loading = false;
      state.message = "";
      state.error = action.payload.message;
    });

    // ==========================================
    //              get all payee
    // ==========================================

    builder.addCase(getAllPayeeThunk.pending, (state) => {
      state.loading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(getAllPayeeThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.message = "";
      state.error = null;
      state.data = action.payload.data;
      state.hasFetchedPayee = true;
    });
    builder.addCase(getAllPayeeThunk.rejected, (state, action) => {
      state.loading = false;
      state.message = "";
      state.error = action.payload.message;
    });

    // ==========================================
    //              update payee
    // ==========================================

    builder.addCase(updatePayeeThunk.pending, (state) => {
      state.loading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(updatePayeeThunk.fulfilled, (state) => {
      state.loading = false;
      state.message = "";
      state.error = null;
      state.hasFetchedPayee = false;
    });
    builder.addCase(updatePayeeThunk.rejected, (state, action) => {
      state.loading = false;
      state.message = "";
      state.error = action.payload.message;
    });

    // ==========================================
    //          delete multiple payee
    // ==========================================

    builder.addCase(deleteMultiplePayeeThunk.pending, (state) => {
      state.loading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(deleteMultiplePayeeThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.message = "";
      state.error = null;
      state.data = state.data?.filter(
        (item) => !action.payload.ids?.includes(item?._id)
      );
    });
    builder.addCase(deleteMultiplePayeeThunk.rejected, (state, action) => {
      state.loading = false;
      state.message = "";
      state.error = action.payload.message;
    });
  },
});

export const { resetPayee } = slice.actions;
export default slice.reducer;
