import { createSlice } from "@reduxjs/toolkit";
import {
  createPlannedThunk,
  deletePlannedThunk,
  getPlannedByFiltersThunk,
  getPlannedThunk,
  updatePlannedThunk,
} from "./thunk";

const initialState = {
  data: [],
  loading: false,
  error: "",
  message: "",
  actionLoading: false,
  pagination: {},
  filterOptions: {},
  accessLimit: 2,
};

const slice = createSlice({
  name: "Planned",
  initialState,
  reducers: {
    setFilterOption: (state, action) => {
      const filter = { ...state.filterOptions, ...action.payload };
      state.filterOptions = Object.fromEntries(
        Object.entries(filter)?.filter(([, value]) => {
          return !(Array.isArray(value) && value?.length == 0) && value !== "";
        })
      );
    },
    removeOptionByKey: (state, action) => {
      delete state.filterOptions?.[action.payload];
    },
    clearFilterOption: (state) => {
      state.filterOptions = {};
    },
  },
  extraReducers: (builder) => {
    // create planned
    builder.addCase(createPlannedThunk.pending, (state) => {
      state.actionLoading = true;
      state.error = null;
      state.message = null;
    });
    builder.addCase(createPlannedThunk.fulfilled, (state) => {
      state.actionLoading = false;
      state.error = null;
      state.message = null;
    });
    builder.addCase(createPlannedThunk.rejected, (state, action) => {
      state.actionLoading = false;
      state.error = action.payload.message;
      state.message = null;
    });

    // get planned
    builder.addCase(getPlannedThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.message = null;
    });
    builder.addCase(getPlannedThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;
      state.message = null;
      state.data = action.payload.data;
      state.pagination = action.payload.pagination;
    });
    builder.addCase(getPlannedThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload.message;
      state.message = null;
    });

    // get planned by filter
    builder.addCase(getPlannedByFiltersThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.message = null;
    });
    builder.addCase(getPlannedByFiltersThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;
      state.message = null;
      state.data = action.payload.data;
      state.pagination = action.payload.pagination;
    });
    builder.addCase(getPlannedByFiltersThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload.message;
      state.message = null;
    });

    // update planned
    builder.addCase(updatePlannedThunk.pending, (state) => {
      state.actionLoading = true;
      state.error = null;
      state.message = null;
    });
    builder.addCase(updatePlannedThunk.fulfilled, (state) => {
      state.actionLoading = false;
      state.error = null;
      state.message = null;
    });
    builder.addCase(updatePlannedThunk.rejected, (state, action) => {
      state.actionLoading = false;
      state.error = action.payload.message;
      state.message = null;
    });

    // delete planned
    builder.addCase(deletePlannedThunk.pending, (state) => {
      state.actionLoading = true;
      state.error = null;
      state.message = null;
    });
    builder.addCase(deletePlannedThunk.fulfilled, (state) => {
      state.actionLoading = false;
      state.error = null;
      state.message = null;
    });
    builder.addCase(deletePlannedThunk.rejected, (state, action) => {
      state.actionLoading = false;
      state.error = action.payload.message;
      state.message = null;
    });
  },
});

export const { setFilterOption, removeOptionByKey, clearFilterOption } =
  slice.actions;
export default slice.reducer;
