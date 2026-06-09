import { createSlice } from "@reduxjs/toolkit";
import {
  createTransactionThunk,
  deleteMultipleTransactionThunk,
  getTransactionReportThunk,
  getTransactionThunk,
  transactionFilterOptionsThunk,
  updateTransactionThunk,
} from "./thunk";

const initialState = {
  data: [],
  reportData: [],
  reportLoading: false,
  paginationData: {},
  searchValue: "",
  loading: false,
  message: "",
  error: null,
  filterOptions: [],
  editData: {},
  isDuplicate: false,
  templateData: {},
};

const slice = createSlice({
  name: "Transaction",
  initialState,
  reducers: {
    clearTransitionRecords: (state) => {
      state.data = [];
    },
    setSearchValueState: (state, action) => {
      state.searchValue = action.payload;
    },
    setStateEditData: (state, action) => {
      state.editData = action.payload;
    },
    setStateIsDuplicate: (state, action) => {
      state.isDuplicate = action.payload;
    },
    setStateTemplateData: (state, action) => {
      state.templateData = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getTransactionThunk.pending, (state) => {
      state.loading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(getTransactionThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.message = "";
      state.error = null;
      state.data = action.payload.data;
      state.paginationData = action.payload.pagination;
    });
    builder.addCase(getTransactionThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload.message;
      state.message = "";
    });

    // get report transaction

    builder.addCase(getTransactionReportThunk.pending, (state) => {
      state.reportLoading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(getTransactionReportThunk.fulfilled, (state, action) => {
      state.reportLoading = false;
      state.message = "";
      state.error = null;
      state.reportData = action.payload.data;
    });
    builder.addCase(getTransactionReportThunk.rejected, (state, action) => {
      state.reportLoading = false;
      state.error = action.payload.message;
      state.message = "";
    });

    // create transaction

    builder.addCase(createTransactionThunk.pending, (state) => {
      state.loading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(createTransactionThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.message = "";
      state.error = null;
      // state.data = [...state.data, action.payload.data];
    });
    builder.addCase(createTransactionThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload.message;
      state.message = "";
    });

    // update transaction

    builder.addCase(updateTransactionThunk.pending, (state) => {
      state.loading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(updateTransactionThunk.fulfilled, (state) => {
      state.loading = false;
      state.message = "";
      state.error = null;
    });
    builder.addCase(updateTransactionThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload.message;
      state.message = "";
    });

    // get filter options

    builder.addCase(transactionFilterOptionsThunk.pending, (state) => {
      state.loading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(
      transactionFilterOptionsThunk.fulfilled,
      (state, action) => {
        state.loading = false;
        state.message = "";
        state.error = null;
        state.filterOptions = action.payload.data;
      }
    );
    builder.addCase(transactionFilterOptionsThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload.message;
      state.message = "";
    });

    // delete multiple transaction

    builder.addCase(deleteMultipleTransactionThunk.pending, (state) => {
      state.loading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(
      deleteMultipleTransactionThunk.fulfilled,
      (state, action) => {
        state.loading = false;
        state.message = "";
        state.error = null;
        state.data = state.data?.map((item) => {
          return {
            ...item,
            transaction: item.transaction?.filter(
              (item) => !action.payload?.data?.includes(item._id)
            ),
          };
        });
      }
    );
    builder.addCase(
      deleteMultipleTransactionThunk.rejected,
      (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
        state.message = "";
      }
    );
  },
});

export const {
  clearTransitionRecords,
  setSearchValueState,
  setStateEditData,
  setStateIsDuplicate,
  setStateTemplateData,
} = slice.actions;
export default slice.reducer;
