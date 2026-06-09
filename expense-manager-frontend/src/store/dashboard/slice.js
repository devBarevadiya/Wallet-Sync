import { createSlice } from "@reduxjs/toolkit";
import {
  analyticsThunk,
  lastRecordThunk,
  singleAnalyticsThunk,
  spendingThunk,
} from "./thunk";
import { analyticsTypeEnum, timePeriods } from "../../helpers/enum";

const getChartOrder = JSON.parse(localStorage.getItem("chartOrder"));
const defaultChartOrder = [
  {
    enum: analyticsTypeEnum.BALANCE_TREND,
    isShow: true,
    title: "balance trend",
  },
  {
    enum: analyticsTypeEnum.SPENDING,
    isShow: true,
    title: "expense structure",
  },
  {
    enum: analyticsTypeEnum.LAST_RECORD,
    isShow: true,
    title: "last record",
  },
  {
    enum: analyticsTypeEnum.COSTLY_EXPENSES,
    isShow: true,
    title: "top expenses",
  },
  {
    enum: analyticsTypeEnum.CURRENCY,
    isShow: true,
    title: "balance by currencies",
  },

  {
    enum: analyticsTypeEnum.CASH_FLOW,
    isShow: true,
    title: "cash flow",
  },
  {
    enum: analyticsTypeEnum.PLANNED,
    isShow: true,
    title: "planned payment",
  },
  {
    enum: analyticsTypeEnum.BUDGET,
    isShow: true,
    title: "budget",
  },
];
const defaultTimePeriod =
  localStorage.getItem("defaultTimePeriod") || timePeriods.THIS_MONTH;

const initialState = {
  data: {},
  defaultTimePeriod,
  lastRecord: [],
  spending: [],
  chartData: {
    [analyticsTypeEnum.SPENDING]: {
      include: true,
      parameters: {},
    },
    [analyticsTypeEnum.BALANCE_TREND]: {
      include: true,
      parameters: {},
    },
    [analyticsTypeEnum.LAST_RECORD]: {
      include: true,
      parameters: {},
    },
    [analyticsTypeEnum.CASH_FLOW]: {
      include: true,
      parameters: {},
    },
    [analyticsTypeEnum.CASH_FLOW_TABLE]: {
      include: true,
    },
    [analyticsTypeEnum.CURRENCY]: {
      include: true,
    },
    [analyticsTypeEnum.BUDGET]: {
      include: true,
      // parameters: {},
    },
    [analyticsTypeEnum.PLANNED]: {
      include: true,
      // parameters: {},
    },
    [analyticsTypeEnum.REPORT]: {
      include: false,
    },
    [analyticsTypeEnum.TOTAL_BALANCE]: {
      include: false,
    },
    [analyticsTypeEnum.COSTLY_EXPENSES]: {
      include: true,
      parameters: {},
    },
  },
  chartOrder: getChartOrder || defaultChartOrder,
  loading: false,
  message: "",
  error: null,

  // single chart
  singleChartLoading: false,
  singleChartMessage: "",
  singleChartError: null,
};

const slice = createSlice({
  name: "Dashboard",
  initialState,
  reducers: {
    setFilterDate: (state, action) => {
      // Keep the existing structure for `accounts` (array) and update only the objects
      const updatedChartData = Object.fromEntries(
        Object.entries(state.chartData).map(([key, value]) => {
          // If it's an object and has a `parameters` property, update the parameters
          if (
            typeof value === "object" &&
            value !== null &&
            "parameters" in value
          ) {
            return [
              key,
              {
                ...value,
                parameters: action.payload,
              },
            ];
          }
          // Otherwise, keep the original value (e.g., `accounts` array)
          return [key, value];
        })
      );

      // Update the state with the modified `chartData`
      state.chartData = {
        ...state.chartData,
        ...updatedChartData,
      };
    },

    setFilterAccount: (state, action) => {
      const stateAccount = state.chartData?.accounts || [];
      let accounts = [...stateAccount];
      if (accounts?.includes(action.payload)) {
        accounts = accounts.filter((account) => account !== action.payload);
      } else {
        accounts.push(action.payload);
      }

      if (accounts?.length > 0) {
        state.chartData.accounts = accounts;
      } else {
        delete state.chartData?.accounts;
      }
    },
    setFilterMultipleAccounts: (state, action) => {
      if (action.payload?.length > 0) {
        state.chartData.accounts = action.payload;
      } else {
        delete state.chartData?.accounts;
      }
    },
    clearDashboardData: (state) => {
      state.data = {};
    },
    setChartOrder: (state, action) => {
      if (action.payload?.length) {
        localStorage.setItem("chartOrder", JSON.stringify(action.payload));
        state.chartOrder = action.payload;
      } else {
        localStorage.removeItem("chartOrder");
        state.chartOrder = defaultChartOrder;
      }
    },
    setDefaultTimePeriod: (state, action) => {
      state.defaultTimePeriod = action.payload;
    },
    setChartOrderHide: (state, action) => {
      const newData = state.chartOrder.map((item) => {
        if (item.enum == action.payload) {
          return { ...item, isShow: false };
        }
        return { ...item };
      });
      localStorage.setItem("chartOrder", JSON.stringify(newData));
      state.chartOrder = newData;
    },
  },
  extraReducers: (builder) => {
    // last record

    builder.addCase(lastRecordThunk.pending, (state) => {
      state.loading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(lastRecordThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.message = "";
      state.error = null;
      state.lastRecord = action.payload.data;
    });
    builder.addCase(lastRecordThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload.message;
      state.message = "";
    });

    // spending

    builder.addCase(spendingThunk.pending, (state) => {
      state.loading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(spendingThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.message = "";
      state.error = null;
      state.spending = action.payload.data;
    });
    builder.addCase(spendingThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload.message;
      state.message = "";
    });

    // analysts

    builder.addCase(analyticsThunk.pending, (state) => {
      state.loading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(analyticsThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.message = "";
      state.error = null;
      state.data = action.payload.data;
    });
    builder.addCase(analyticsThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload.message;
      state.message = "";
    });

    // single analytics

    builder.addCase(singleAnalyticsThunk.pending, (state) => {
      state.singleChartLoading = true;
      state.singleChartMessage = "";
      state.singleChartError = null;
    });
    builder.addCase(singleAnalyticsThunk.fulfilled, (state, action) => {
      state.singleChartLoading = false;
      state.singleChartMessage = "";
      state.singleChartError = null;
      const enumValue = Object.keys(action.payload.data)[0];
      state.chartData[enumValue].parameters =
        action.payload.values[enumValue]?.parameters;
      state.data[enumValue] = action.payload.data[enumValue];
    });
    builder.addCase(singleAnalyticsThunk.rejected, (state, action) => {
      state.singleChartLoading = false;
      state.singleChartError = action.payload.message;
      state.singleChartMessage = "";
    });
  },
});

export const {
  clearDashboardData,
  setFilterDate,
  setFilterAccount,
  setFilterMultipleAccounts,
  setChartOrder,
  setDefaultTimePeriod,
  setChartOrderHide,
} = slice.actions;
export default slice.reducer;
