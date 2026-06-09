import { createSlice } from "@reduxjs/toolkit";
import {
  addNewHeadCatgoryThunk,
  addNewSubCatgoryThunk,
  budgetDetailsThunk,
  budgetTransactionsPaginationThunk,
  budgetTransactionsThunk,
  createBugetThunk,
  deleteBudgetThunk,
  getBudgetByPaginationThunk,
  getBudgetThunk,
  rolloverStatusThunk,
  updateBudgetThunk,
} from "./thunk";

const initialState = {
  data: [],
  values: {},
  categoryData: [],
  selectedHeadCategory: {},
  selectedSubCategory: {},
  showSubCategories: {},
  loading: false,
  error: null,
  messsage: "",
  pagination: {},
  detailsData: {},
  transactionData: {},
  transactionPagination: {},
  tPaginationLoading: false,
  actionLoading: false,
  actionError: null,
  actionMessage: "",
  filterData: {},
  headCategoryAmounts: {},
  subCategoryAmounts: {},
  paginationLoading: false,
  accessLimit: 1,
};

const slice = createSlice({
  name: "Budget",
  initialState,
  reducers: {
    addCategory: (state, action) => {
      const filterData = state.categoryData?.filter(
        (item) => item?._id == action.payload?._id
      );
      if (filterData?.length) {
        const data = state.categoryData?.map((item) => {
          if (action.payload?._id == item?._id) {
            return action.payload;
          } else {
            return item;
          }
        });
        state.categoryData = data;
      } else {
        state.categoryData?.push(action.payload);
      }
    },

    addUpdateHeadCategory: (state, action) => {
      const { headCategoryId, data } = action.payload;
      const existing = state?.categoryData?.find(
        (item) => item?.headCategory == headCategoryId
      );
      state.selectedHeadCategory = data;
      if (existing) {
        Object.assign(existing, data);
      } else {
        state.categoryData.push(data);
      }
    },

    setSelectHeadCategory: (state, action) => {
      state.selectedHeadCategory = action.payload;
    },

    setSelectedSubCategory: (state, action) => {
      state.selectedSubCategory = action.payload;
    },

    setAmountToHeadCategory: (state, action) => {
      const { headCategoryId, maxAmount } = action.payload;
      const existing = state.categoryData?.find(
        (ele) => ele?.headCategory == headCategoryId
      );
      if (existing) {
        Object.assign(existing, { maxAmount });
      }
    },

    setSubCategory: (state, action) => {
      const { headCategoryId, subCategoryId, data } = action.payload;
      // const existHead = state.categoryData?.find(
      //   (ele) => ele?.headCategory === headCategoryId
      // );
      // state.selectedSubCategory = data;
      // if (existHead) {
      //   const existSub = existHead?.categories?.find(
      //     (sub) => sub.category === subCategoryId
      //   );
      //   if (existSub) {
      //     Object.assign(existSub, data);
      //   } else {
      //     existHead.categories.push(data);
      //   }
      // }
      const updatedCategoryData = state.categoryData?.map((category) => {
        if (category.headCategory === headCategoryId) {
          // Find the subcategory (immutable update)
          const updatedCategories = category.categories?.map((sub) => {
            if (sub.category === subCategoryId) {
              // If the subcategory exists, update it with the new data (immutably)
              return { ...sub, ...data };
            }
            return sub;
          });

          // If subcategory doesn't exist, add the new subcategory
          if (
            !updatedCategories?.some((sub) => sub.category === subCategoryId)
          ) {
            updatedCategories.push(data);
          }

          return { ...category, categories: updatedCategories };
        }
        return category;
      });

      // Update the state with the new category data
      state.categoryData = updatedCategoryData;

      // Optionally set the selected subcategory
      state.selectedSubCategory = data;
    },

    setValue: (state, action) => {
      state.values = action.payload;
    },

    updateStatus: (state, action) => {
      const { id, status } = action.payload;
      const existing = state.data.find((item) => item._id === id);
      if (existing) {
        existing.status = status;
      }
    },

    clearCategoryData: (state) => {
      state.categoryData = [];
    },

    setShowSubCategories: (state, action) => {
      state.showSubCategories = action.payload;
    },

    setFilterData: (state, action) => {
      const filters = { ...state.filterData, ...action.payload };
      state.filterData = Object.fromEntries(
        Object.entries(filters)?.filter(([_, value]) => {
          return !(Array.isArray(value) && value?.length == 0) && value !== "";
        })
      );
      // state.filterData = action.payload;
    },

    setHeadCategoryAmounts: (state, action) => {
      state.headCategoryAmounts = action.payload;
    },

    setSubCategoryAmounts: (state, action) => {
      state.subCategoryAmounts = action.payload;
    },
  },
  extraReducers: (builder) => {
    // create budget

    builder.addCase(createBugetThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.message = "";
    });
    builder.addCase(createBugetThunk.fulfilled, (state) => {
      state.loading = false;
      state.error = null;
      state.message = "";
    });
    builder.addCase(createBugetThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload.message;
      state.message = "";
    });

    // get budget

    builder.addCase(getBudgetThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.message = "";
    });
    builder.addCase(getBudgetThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;
      state.message = "";
      state.data = action.payload.data;
      state.pagination = action.payload.pagination;
    });
    builder.addCase(getBudgetThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload.message;
      state.message = "";
    });

    // get budget by pagination

    builder.addCase(getBudgetByPaginationThunk.pending, (state) => {
      state.paginationLoading = true;
      state.error = null;
      state.message = "";
    });
    builder.addCase(getBudgetByPaginationThunk.fulfilled, (state, action) => {
      state.paginationLoading = false;
      state.error = null;
      state.message = "";
      state.data.push(...action.payload.data);
      state.pagination = action.payload.pagination;
    });
    builder.addCase(getBudgetByPaginationThunk.rejected, (state, action) => {
      state.paginationLoading = false;
      state.error = action.payload.message;
      state.message = "";
    });

    // delete budget

    builder.addCase(deleteBudgetThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.message = "";
    });
    builder.addCase(deleteBudgetThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;
      state.message = action.payload.message;
      state.data = state.data.filter((item) => item._id !== action.payload.id);
    });
    builder.addCase(deleteBudgetThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // update budget

    builder.addCase(updateBudgetThunk.pending, (state) => {
      state.actionLoading = true;
      state.actionError = null;
      state.actionMessage = "";
    });
    builder.addCase(updateBudgetThunk.fulfilled, (state, action) => {
      state.actionLoading = false;
      state.actionError = null;
      state.actionMessage = action.payload.message;
    });
    builder.addCase(updateBudgetThunk.rejected, (state, action) => {
      state.actionLoading = false;
      state.actionError = action.payload;
      state.actionMessage = "";
    });

    // details

    builder.addCase(budgetDetailsThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.message = "";
    });
    builder.addCase(budgetDetailsThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;
      state.message = "";
      state.detailsData = action.payload.data;
    });
    builder.addCase(budgetDetailsThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload.message;
      state.message = "";
    });

    // transaction

    builder.addCase(budgetTransactionsThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.message = "";
    });
    builder.addCase(budgetTransactionsThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;
      state.message = "";
      state.transactionData = action.payload.data;
      state.transactionPagination = action.payload.pagination;
    });
    builder.addCase(budgetTransactionsThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload.message;
      state.message = "";
    });

    // transaction pagination

    builder.addCase(budgetTransactionsPaginationThunk.pending, (state) => {
      state.tPaginationLoading = true;
      state.error = null;
      state.message = "";
    });
    builder.addCase(
      budgetTransactionsPaginationThunk.fulfilled,
      (state, action) => {
        state.tPaginationLoading = false;
        state.error = null;
        state.message = "";
        state.transactionData = {
          ...state.transactionData,
          transactions: [
            ...state.transactionData.transactions,
            ...action.payload.data.transactions,
          ],
        };
        state.transactionPagination = action.payload.pagination;
      }
    );
    builder.addCase(
      budgetTransactionsPaginationThunk.rejected,
      (state, action) => {
        state.tPaginationLoading = false;
        state.error = action.payload.message;
        state.message = "";
      }
    );

    // add new head category

    builder.addCase(addNewHeadCatgoryThunk.pending, (state) => {
      state.actionLoading = true;
      state.error = null;
      state.message = "";
    });
    builder.addCase(addNewHeadCatgoryThunk.fulfilled, (state) => {
      state.actionLoading = false;
      state.error = null;
      state.message = "";
    });
    builder.addCase(addNewHeadCatgoryThunk.rejected, (state, action) => {
      state.actionLoading = false;
      state.error = action.payload.message;
      state.message = "";
    });

    // add new sub category

    builder.addCase(addNewSubCatgoryThunk.pending, (state) => {
      state.actionLoading = true;
      state.error = null;
      state.message = "";
    });
    builder.addCase(addNewSubCatgoryThunk.fulfilled, (state) => {
      state.actionLoading = false;
      state.error = null;
      state.message = "";
    });
    builder.addCase(addNewSubCatgoryThunk.rejected, (state, action) => {
      state.actionLoading = false;
      state.error = action.payload.message;
      state.message = "";
    });

    // rollover

    builder.addCase(rolloverStatusThunk.pending, (state) => {
      state.actionLoading = true;
      state.error = null;
      state.message = "";
    });
    builder.addCase(rolloverStatusThunk.fulfilled, (state) => {
      state.actionLoading = false;
      state.error = null;
      state.message = "";
    });
    builder.addCase(rolloverStatusThunk.rejected, (state, action) => {
      state.actionLoading = false;
      state.error = action.payload.message;
      state.message = "";
    });
  },
});

export const {
  addCategory,
  setValue,
  addUpdateHeadCategory,
  setSelectHeadCategory,
  setSelectedSubCategory,
  setAmountToHeadCategory,
  setSubCategory,
  updateStatus,
  clearCategoryData,
  setShowSubCategories,
  setFilterData,
  setHeadCategoryAmounts,
  setSubCategoryAmounts,
} = slice.actions;
export default slice.reducer;
