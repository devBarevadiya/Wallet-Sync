import { createSlice } from "@reduxjs/toolkit";
import { setDocThunk } from "./thunk";

const initialState = {
  currentStep: 0,
  goalData: [],
  financialData: [],
  loading: false,
  message: "",
  error: null,
};

const slice = createSlice({
  name: "OnBoarding",
  initialState,
  reducers: {
    setGoalData: (state, action) => {
      state.goalData = action.payload;
    },
    setFinancialData: (state, action) => {
      state.financialData = action.payload;
    },
    setCurrentStep: (state, action) => {
      state.currentStep = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(setDocThunk.pending, (state) => {
      state.loading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(setDocThunk.fulfilled, (state) => {
      state.loading = false;
      state.message = "";
      state.error = null;
    });
    builder.addCase(setDocThunk.rejected, (state) => {
      state.loading = false;
      state.message = "";
      state.error = null;
    });
  },
});

export const { setGoalData, setFinancialData, setCurrentStep } = slice.actions;
export default slice.reducer;
