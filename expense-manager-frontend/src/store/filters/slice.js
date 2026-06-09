import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isSidebarCanvas: false,
  documentTitle: "",
  isSettingsSidbarCanvas: false,
  isSubscriptionScreen: false,
};

const slice = createSlice({
  name: "Filters",
  initialState,
  reducers: {
    setIsSidebarCanvas: (state, action) => {
      state.isSidebarCanvas = action.payload;
    },
    setDocumentTitle: (state, action) => {
      state.documentTitle = action.payload;
    },
    setIsSettingsSidbarCanvas: (state, action) => {
      state.isSettingsSidbarCanvas = action.payload;
    },
    setIsSubScriptionScreen: (state, action) => {
      state.isSubscriptionScreen = action.payload;
    },
  },
});

export const {
  setIsSidebarCanvas,
  setDocumentTitle,
  setIsSettingsSidbarCanvas,
  setIsSubScriptionScreen,
} = slice.actions;
export default slice.reducer;
