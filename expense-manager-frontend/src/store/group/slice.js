import { createSlice } from "@reduxjs/toolkit";
import {
  addMemberThunk,
  changePermissionThunk,
  createGroupThunk,
  deleteGroupThunk,
  getAllGroupsThunk,
  getGroupDetailsThunk,
  leaveGroupThunk,
  removeMemberThunk,
  switchGroupThunk,
  updateGroupThunk,
  userLeaveGroupThunk,
} from "./thunk";

const initialState = {
  data: [],
  singleUserGroupData: {},
  loading: false,
  actionLoading: false,
  message: "",
  error: null,

  singleData: {},
  singleLoading: false,
};

const Slice = createSlice({
  name: "Group",
  initialState,
  reducers: {
    resetGroup: (state) => {
      state.data = [];
    },
  },
  extraReducers: (builder) => {
    // ===========================================
    //               create group
    // ===========================================

    builder.addCase(createGroupThunk.pending, (state) => {
      state.actionLoading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(createGroupThunk.fulfilled, (state, action) => {
      state.actionLoading = false;
      state.message = "";
      state.error = null;
      // state.data = state.data.push(action.payload.data);
    });
    builder.addCase(createGroupThunk.rejected, (state, action) => {
      state.actionLoading = false;
      state.message = "";
      state.error = action.payload.message;
    });

    // ===========================================
    //              get all groups
    // ===========================================

    builder.addCase(getAllGroupsThunk.pending, (state) => {
      state.loading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(getAllGroupsThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.message = "";
      state.error = null;
      state.singleUserGroupData = action.payload.singleUserData;
      state.data = action.payload.data;
    });
    builder.addCase(getAllGroupsThunk.rejected, (state, action) => {
      state.loading = false;
      state.message = "";
      state.error = action.payload.message;
    });

    // ===========================================
    //            get group details
    // ===========================================

    builder.addCase(getGroupDetailsThunk.pending, (state) => {
      state.singleLoading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(getGroupDetailsThunk.fulfilled, (state, action) => {
      state.singleLoading = false;
      state.message = "";
      state.error = null;
      state.singleData = action.payload.data;
    });
    builder.addCase(getGroupDetailsThunk.rejected, (state, action) => {
      state.singleLoading = false;
      state.message = "";
      state.error = action.payload.message;
    });

    // ===========================================
    //            update group details
    // ===========================================

    builder.addCase(updateGroupThunk.pending, (state) => {
      state.actionLoading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(updateGroupThunk.fulfilled, (state, action) => {
      state.actionLoading = false;
      state.message = "";
      state.error = null;
      state.singleData = { ...state.singleData, ...action.payload.data };
      state.data = state.data?.map((item) => {
        if (item?._id == action.payload?.id) {
          return { ...item, ...action.payload.data };
        }
        return item;
      });
    });
    builder.addCase(updateGroupThunk.rejected, (state, action) => {
      state.actionLoading = false;
      state.message = "";
      state.error = action.payload.message;
    });

    // ===========================================
    //              switch group
    // ===========================================

    builder.addCase(switchGroupThunk.pending, (state) => {
      state.actionLoading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(switchGroupThunk.fulfilled, (state, action) => {
      state.actionLoading = false;
      state.message = "";
      state.error = null;
      state.data = state.data?.map((item) => {
        const currentMember = item?.members?.map((ele) => {
          if (
            ele?.user == action.payload.userId &&
            item?._id == action.payload.id
          ) {
            return { ...ele, isActive: true };
          }
          return { ...ele, isActive: false };
        });
        return { ...item, members: currentMember };
      });
    });
    builder.addCase(switchGroupThunk.rejected, (state, action) => {
      state.actionLoading = false;
      state.message = "";
      state.error = action.payload.message;
    });

    // ===========================================
    //            delete group details
    // ===========================================

    builder.addCase(deleteGroupThunk.pending, (state) => {
      state.singleLoading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(deleteGroupThunk.fulfilled, (state, action) => {
      state.singleLoading = false;
      state.message = "";
      state.error = null;
      state.data = state.data?.filter(
        (item) => item?._id !== action.payload.id
      );
      state.singleData = {};
    });
    builder.addCase(deleteGroupThunk.rejected, (state, action) => {
      state.singleLoading = false;
      state.message = "";
      state.error = action.payload.message;
    });

    // ===========================================
    //              add members
    // ===========================================

    builder.addCase(addMemberThunk.pending, (state) => {
      state.actionLoading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(addMemberThunk.fulfilled, (state, action) => {
      state.actionLoading = false;
      state.message = "";
      state.error = null;
      // state.singleData?.members.push(action.payload.data.members);
      state.singleData = action.payload.data;
    });
    builder.addCase(addMemberThunk.rejected, (state, action) => {
      state.actionLoading = false;
      state.message = "";
      state.error = action.payload.message;
    });

    // ===========================================
    //              remove member
    // ===========================================

    builder.addCase(removeMemberThunk.pending, (state) => {
      state.actionLoading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(removeMemberThunk.fulfilled, (state, action) => {
      state.actionLoading = false;
      state.message = "";
      state.error = null;
      state.singleData.members = state.singleData?.members?.filter(
        (item) => item?.user?._id !== action.payload.id
      );
    });
    builder.addCase(removeMemberThunk.rejected, (state, action) => {
      state.actionLoading = false;
      state.message = "";
      state.error = action.payload.message;
    });

    // ===========================================
    //                leave group
    // ===========================================

    builder.addCase(leaveGroupThunk.pending, (state) => {
      state.actionLoading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(leaveGroupThunk.fulfilled, (state, action) => {
      state.actionLoading = false;
      state.message = "";
      state.error = null;
      state.data = state.data?.map((item) => {
        const currentMember = item?.members?.map((ele) => {
          if (
            ele?.user == action.payload.userId &&
            item?._id == action.payload.id
          ) {
            return { ...ele, isActive: false };
          }
          return ele;
        });
        return { ...item, members: currentMember };
      });
      state.singleUserGroupData = {};
      // state.data = state.data.filter(
      //   (item) => item?._id !== action.payload?.id
      // );
    });
    builder.addCase(leaveGroupThunk.rejected, (state, action) => {
      state.actionLoading = false;
      state.message = "";
      state.error = action.payload.message;
    });

    // ===========================================
    //                user leave group
    // ===========================================

    builder.addCase(userLeaveGroupThunk.pending, (state) => {
      state.actionLoading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(userLeaveGroupThunk.fulfilled, (state, action) => {
      state.actionLoading = false;
      state.message = "";
      state.error = null;
      state.data = state.data.filter(
        (item) => item?._id !== action.payload?.id
      );
    });
    builder.addCase(userLeaveGroupThunk.rejected, (state, action) => {
      state.actionLoading = false;
      state.message = "";
      state.error = action.payload.message;
    });

    // ===========================================
    //            change permission
    // ===========================================

    builder.addCase(changePermissionThunk.pending, (state) => {
      state.actionLoading = true;
      state.message = "";
      state.error = null;
    });
    builder.addCase(changePermissionThunk.fulfilled, (state, action) => {
      state.actionLoading = false;
      state.message = "";
      state.error = null;
      state.singleData = {
        ...state.singleData,
        members: action.payload.data.members,
      };
    });
    builder.addCase(changePermissionThunk.rejected, (state, action) => {
      state.actionLoading = false;
      state.message = "";
      state.error = action.payload.message;
    });
  },
});

export const { resetGroup } = Slice.actions;
export default Slice.reducer;
