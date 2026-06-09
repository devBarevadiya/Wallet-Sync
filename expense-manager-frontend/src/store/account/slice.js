import { createSlice } from "@reduxjs/toolkit";
import {
  deleteAccountThunk,
  getAccountDetailsThunk,
  getAccountThunk,
  postAccountThunk,
  updateAccountThunk,
} from "./thunk";
import { transactionTypeEnum } from "../../helpers/enum";

const initialState = {
  data: [],
  singleData: {},
  accessLimit: 2,
  loading: false,
  error: null,
  message: "",
};

const slice = createSlice({
  name: "Account",
  initialState,
  reducers: {
    clearSingleData: (state) => {
      state.singleData = {};
    },
    setAmountToAccount: (state, action) => {
      state.data = state.data.map((item) => {
        if (action.payload?.to && item?._id == action.payload?.to) {
          const newAmount = item?.balance + action.payload.amount;
          return { ...item, balance: newAmount };
        }
        if (item?._id == action.payload.id) {
          const newAmount =
            action.payload.type == transactionTypeEnum.INCOME
              ? item?.balance + action.payload.amount
              : item?.balance - action.payload.amount;
          return { ...item, balance: newAmount };
        }
        return item;
      });
    },
    updateAmountToAccount: (state, action) => {
      state.data = state.data.map((item) => {
        if (action.payload.to !== action.payload.preTo) {
          if (action.payload.preTo == item?._id) {
            return { ...item, balance: item?.balance - action.payload.amount };
          }
          if (action.payload.to == item?._id) {
            return { ...item, balance: item?.balance + action.payload.amount };
          }
        } else if (action.payload?.to && action.payload?.preTo === item?._id) {
          if (item?._id == action.payload?.to) {
            const updateWithPreviousAmount =
              action.payload.amount - action.payload.preAmount;
            const newAmount = item?.balance + updateWithPreviousAmount;
            return { ...item, balance: newAmount };
          }
        }
        if (action.payload.id !== action.payload.preId) {
          if (action.payload.preId == item?._id) {
            return { ...item, balance: item?.balance + action.payload.amount };
          }
          if (action.payload.id == item?._id) {
            return { ...item, balance: item?.balance - action.payload.amount };
          }
        } else if (action.payload.id == action.payload.preId) {
          if (item?._id == action.payload.id) {
            const updateWithPreviousAmount =
              action.payload.type == transactionTypeEnum.INCOME
                ? action.payload.amount - action.payload.preAmount
                : action.payload.preAmount - action.payload.amount;

            const newAmount = item.balance + updateWithPreviousAmount;
            return { ...item, balance: newAmount };
          }
        }
        return item;
      });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getAccountThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.message = "";
    });
    builder.addCase(getAccountThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;
      state.message = "";
      state.data = action.payload.data;
    });
    builder.addCase(getAccountThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload.message;
      state.message = "";
    });
    builder.addCase(getAccountDetailsThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.message = "";
    });
    builder.addCase(getAccountDetailsThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;
      state.message = "";
      state.singleData = action.payload.data;
    });
    builder.addCase(getAccountDetailsThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload.message;
      state.message = "";
    });

    // create account

    builder.addCase(postAccountThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.message = "";
    });
    builder.addCase(postAccountThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;
      state.message = "";
      state.data.push(action.payload.data);
    });
    builder.addCase(postAccountThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload.message;
      state.message = "";
    });

    // update account

    builder.addCase(updateAccountThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.message = "";
    });
    builder.addCase(updateAccountThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;
      state.message = "";
    });
    builder.addCase(updateAccountThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload.message;
      state.message = "";
    });

    // delete account

    builder.addCase(deleteAccountThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.message = "";
    });
    builder.addCase(deleteAccountThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;
      state.message = "";
      state.data = state.data.filter((item) => item?._id !== action.payload.id);
    });
    builder.addCase(deleteAccountThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload.message;
      state.message = "";
    });
  },
});

export const { clearSingleData, setAmountToAccount, updateAmountToAccount } =
  slice.actions;
export default slice.reducer;
