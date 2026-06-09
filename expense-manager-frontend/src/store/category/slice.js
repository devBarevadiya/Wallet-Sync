import { createSlice } from "@reduxjs/toolkit";
import {
  createCategoryThunk,
  createHeadThunk,
  getCategoryThunk,
  updateCategoryThunk,
  updateHeadThunk,
} from "./thunk";

const initialState = {
  data: [],
  mostUsed: [],
  categories: [],
  selectedCategory: {},
  selectedSubCategory: {},
  totalCounts: 0,
  accessLimits: 95,
  accessLimit: 5,
  loading: false,
  message: "",
  error: null,
};

const slice = createSlice({
  name: "Category",
  initialState,
  reducers: {
    resetCategory: (state) => {
      state.data = [];
    },
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    setSelectedSubCategory: (state, action) => {
      state.selectedSubCategory = action.payload;
    },
    setCategoriesOfHeadCategory: (state, action) => {
      state.categories = action.payload || [];
    },
    countTotalCategory: (state, action) => {
      let counts = action.payload.data.length;
      action.payload.data.map((ele) => {
        counts += ele.categories.length;
      });
      state.totalCounts = counts;
    },
    setMostUsedCategory: (state, action) => {
      const isInclude = state.mostUsed?.some(
        (item) => item?._id == action?.payload?._id
      );
      if (isInclude) {
        // Update existing item
        state.mostUsed = state.mostUsed.map((item) => {
          if (item?._id === action?.payload?._id) {
            return { ...item, usageCount: (item?.usageCount || 0) + 1 };
          }
          return item;
        });
      } else {
        const newItem = { ...action.payload, usageCount: 1 };
        state.mostUsed = [...state.mostUsed, newItem];
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getCategoryThunk.pending, (state) => {
      state.loading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(getCategoryThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.message = "";
      state.error = null;
      state.data = action.payload.data;
      let counts = action.payload.data.length;
      action.payload.data.map((ele) => {
        counts += ele.categories.length;
      });
      state.totalCounts = counts;
      state.mostUsed = action.payload?.mostUsed || [];
    });
    builder.addCase(getCategoryThunk.rejected, (state, action) => {
      state.loading = false;
      state.message = "";
      state.error = action.payload.message;
    });

    // create category

    builder.addCase(createCategoryThunk.pending, (state) => {
      state.loading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(createCategoryThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.message = "";
      state.error = null;
      state.data = state.data?.map((item) => {
        if (item._id == action.payload.id) {
          return {
            ...item,
            categories: [...item.categories, action.payload.data],
          };
        }
        return item;
      });
      const selectedCategory = state.selectedCategory?.categories || [];
      state.selectedCategory = {
        ...state.selectedCategory,
        categories: [...selectedCategory, action.payload.data],
      };
      state.categories.push(action.payload.data);
    });
    builder.addCase(createCategoryThunk.rejected, (state, action) => {
      state.loading = false;
      state.message = "";
      state.error = action.payload.message;
    });

    // update category

    builder.addCase(updateCategoryThunk.pending, (state) => {
      state.loading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(updateCategoryThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.message = "";
      state.error = null;
      // Update the categories within the head category
      state.data = state.data?.map((item) => {
        if (item._id === action.payload.headId) {
          return {
            ...item,
            categories: item?.categories?.map((category) => {
              if (category._id === action.payload.id) {
                return { ...category, ...action.payload.data }; // Replace the updated category
              }
              return category;
            }),
          };
        }
        return item;
      });

      // Update the selectedCategory if necessary
      if (state.selectedCategory?._id == action.payload.headId) {
        state.selectedCategory = {
          ...state.selectedCategory,
          categories: state.selectedCategory.categories?.map((category) => {
            if (category._id == action.payload.id) {
              return { ...category, ...action.payload.data }; // Replace in selectedCategory as well
            }
            return category;
          }),
        };
      }

      // update single category
      state.categories = state.categories?.map((item) => {
        if (item._id == action.payload.id) {
          return action.payload.data;
        }
        return item;
      });
    });
    builder.addCase(updateCategoryThunk.rejected, (state, action) => {
      state.loading = false;
      state.message = "";
      state.error = action.payload.message;
    });

    // create head category

    builder.addCase(createHeadThunk.pending, (state) => {
      state.loading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(createHeadThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.message = "";
      state.error = null;
      action.payload.data.categories = [];
      state.data.push(action.payload.data);
    });
    builder.addCase(createHeadThunk.rejected, (state, action) => {
      state.loading = false;
      state.message = "";
      state.error = action.payload.message;
    });

    // update head category

    builder.addCase(updateHeadThunk.pending, (state) => {
      state.loading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(updateHeadThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.message = "";
      state.error = null;
      state.data = state.data?.map((item) => {
        if (item?._id == action.payload.id) {
          return { ...item, ...action.payload.data };
        }
        return item;
      });
      state.selectedCategory = {
        ...state.selectedCategory,
        ...action.payload.data,
      };
    });
    builder.addCase(updateHeadThunk.rejected, (state, action) => {
      state.loading = false;
      state.message = "";
      state.error = action.payload.message;
    });
  },
});

export const {
  resetCategory,
  countTotalCategory,
  setSelectedCategory,
  setCategoriesOfHeadCategory,
  setSelectedSubCategory,
  setMostUsedCategory,
} = slice.actions;
export default slice.reducer;
