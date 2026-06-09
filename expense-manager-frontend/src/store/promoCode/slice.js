import { createSlice } from "@reduxjs/toolkit";
import {
  applyPromoCodeThunk,
  deletePromoCodeThunk,
  generatePromoCodeThunk,
  getPromoCodePaginationThunk,
  getPromoCodeThunk,
} from "./thunk";

const initialState = {
  data: [],
  pagination: {},
  loading: false,
  paginationLoading: false,
  error: null,
  message: "",
  showCodes: [],
};

const slice = createSlice({
  name: "PromoCode",
  initialState,
  reducers: {
    setShowCodes: (state, action) => {
      state.showCodes = action.payload;
    },
  },
  extraReducers: (builder) => {
    // apply promo code
    builder.addCase(applyPromoCodeThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.message = "";
    });
    builder.addCase(applyPromoCodeThunk.fulfilled, (state) => {
      state.loading = false;
      state.error = null;
      state.message = "";
    });
    builder.addCase(applyPromoCodeThunk.rejected, (state) => {
      state.loading = false;
      state.error = null;
      state.message = "";
    });

    // generate promo code
    builder.addCase(generatePromoCodeThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.message = "";
    });
    builder.addCase(generatePromoCodeThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;
      state.message = "";
      state.data.push(action.payload.data);
    });
    builder.addCase(generatePromoCodeThunk.rejected, (state) => {
      state.loading = false;
      state.error = null;
      state.message = "";
    });

    // generate promo code
    builder.addCase(getPromoCodeThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.message = "";
    });
    builder.addCase(getPromoCodeThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;
      state.message = "";
      state.data = action.payload.data;
      state.pagination = action.payload.pagination;
    });
    builder.addCase(getPromoCodeThunk.rejected, (state) => {
      state.loading = false;
      state.error = null;
      state.message = "";
    });

    // generate promo code
    builder.addCase(deletePromoCodeThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.message = "";
    });
    builder.addCase(deletePromoCodeThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;
      state.message = "";
      state.showCodes = state?.showCodes?.filter(
        (item) => !action.payload.ids.ids?.includes(item?._id)
      );
    });
    builder.addCase(deletePromoCodeThunk.rejected, (state) => {
      state.loading = false;
      state.error = null;
      state.message = "";
    });

    // generate promo code
    builder.addCase(getPromoCodePaginationThunk.pending, (state) => {
      state.paginationLoading = true;
      state.error = null;
      state.message = "";
    });
    builder.addCase(getPromoCodePaginationThunk.fulfilled, (state, action) => {
      state.paginationLoading = false;
      state.error = null;
      state.message = "";
      state.data.push(...action.payload.data);
      state.pagination = action.payload.pagination;
    });
    builder.addCase(getPromoCodePaginationThunk.rejected, (state) => {
      state.paginationLoading = false;
      state.error = null;
      state.message = "";
    });
  },
});

export const { setShowCodes } = slice.actions;
export default slice.reducer;
