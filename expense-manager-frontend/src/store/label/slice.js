import { createSlice } from "@reduxjs/toolkit";
import {
  createLabelThunk,
  deleteLabelThunk,
  getLabelThunk,
  updateLabelThunk,
} from "./thunk";

const initialState = {
  data: [],
  accessLimit: 3,
  loading: false,
  actionLoading: false,
  message: "",
  error: null,
  hasFetchedLabels: false,
};

const slice = createSlice({
  name: "Label",
  initialState,
  reducers: {
    resetFetchedLabels: (state) => {
      state.hasFetchedLabels = false;
    },
    resetLabel: (state) => {
      state.data = [];
    },
  },
  extraReducers: (builder) => {
    // ==========================================
    //              get label
    // ==========================================

    builder.addCase(getLabelThunk.pending, (state) => {
      state.loading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(getLabelThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.message = "";
      state.error = null;
      state.data = action.payload.data;
      state.hasFetchedLabels = true;
    });
    builder.addCase(getLabelThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload.message;
      state.message = "";
    });

    // ==========================================
    //              create label
    // ==========================================

    builder.addCase(createLabelThunk.pending, (state) => {
      state.actionLoading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(createLabelThunk.fulfilled, (state, action) => {
      state.actionLoading = false;
      state.message = "";
      state.error = null;
      state.data.push(action.payload.data);
      state.hasFetchedLabels = false;
    });
    builder.addCase(createLabelThunk.rejected, (state, action) => {
      state.actionLoading = false;
      state.error = action.payload.message;
      state.message = "";
    });

    // ==========================================
    //              edit label
    // ==========================================

    builder.addCase(updateLabelThunk.pending, (state) => {
      state.actionLoading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(updateLabelThunk.fulfilled, (state, action) => {
      state.actionLoading = false;
      state.message = "";
      state.error = null;
      state.data = state.data?.map((item) => {
        if (action.payload.id == item._id) {
          return action.payload.data;
        }
        return item;
      });
    });
    builder.addCase(updateLabelThunk.rejected, (state, action) => {
      state.actionLoading = false;
      state.error = action.payload.message;
      state.message = "";
    });

    // ==========================================
    //              delete label
    // ==========================================

    builder.addCase(deleteLabelThunk.pending, (state) => {
      state.actionLoading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(deleteLabelThunk.fulfilled, (state, action) => {
      state.actionLoading = false;
      state.message = "";
      state.error = null;
      state.data = state.data?.filter((item) => {
        return item._id !== action.payload.data;
      });
    });
    builder.addCase(deleteLabelThunk.rejected, (state, action) => {
      state.actionLoading = false;
      state.error = action.payload.message;
      state.message = "";
    });
  },
});

export const { resetFetchedLabels, resetLabel } = slice.actions;
export default slice.reducer;
