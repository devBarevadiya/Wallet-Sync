import { createAsyncThunk } from "@reduxjs/toolkit";
import { toastError, toastSuccess } from "../../config/toastConfig";
import {
  addMember,
  changePermission,
  createGroup,
  deleteGroup,
  getAllGroup,
  getGroupDetails,
  leaveGroup,
  removeMember,
  switchGroup,
  updateGroup,
  userLeaveGroup,
} from "../../helpers/backend_helper";
import { groupAccessEnum } from "../../helpers/enum";

export const createGroupThunk = createAsyncThunk(
  "createGroupThunk",
  async (values, { rejectWithValue }) => {
    try {
      const { data } = await createGroup(values);
      toastSuccess(data.message);
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.message;
      if (errorMessage) {
        toastError(errorMessage);
      }
      // Reject with error response
      return rejectWithValue({
        status: error.response.status,
        message: errorMessage,
      });
    }
  }
);

export const getAllGroupsThunk = createAsyncThunk(
  "getAllGroupsThunk",
  async (_, { getState, rejectWithValue }) => {
    try {
      const userId = getState().Auth.user?._id;
      const { data } = await getAllGroup();
      const [filterActiveGroup] =
        data?.data
          ?.map((item) => {
            const filterData =
              item?.members?.filter(
                (ele) => ele?.user == userId && ele?.isActive
              ) || {};
            const filterAccount = filterData?.[0]?.accounts?.filter(
              (ele) => ele?.permission !== groupAccessEnum.NO_ACCESS
            );
            return (
              filterData?.length && {
                ...item,
                members: filterData,
                member: { ...filterData?.[0], accounts: filterAccount || [] },
              }
            );
          })
          ?.filter(Boolean) || {};
      data.singleUserData = filterActiveGroup || {};
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.message;
      if (errorMessage) {
        toastError(errorMessage);
      }
      // Reject with error response
      return rejectWithValue({
        status: error.response.status,
        message: errorMessage,
      });
    }
  }
);

export const getGroupDetailsThunk = createAsyncThunk(
  "getGroupDetailsThunk",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await getGroupDetails(id);
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.message;
      if (errorMessage) {
        toastError(errorMessage);
      }
      // Reject with error response
      return rejectWithValue({
        status: error.response.status,
        message: errorMessage,
      });
    }
  }
);

export const updateGroupThunk = createAsyncThunk(
  "updateGroupThunk",
  async ({ id, values }, { rejectWithValue }) => {
    try {
      const { data } = await updateGroup(id, values);
      data.id = id;
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.message;
      if (errorMessage) {
        toastError(errorMessage);
      }
      // Reject with error response
      return rejectWithValue({
        status: error.response.status,
        message: errorMessage,
      });
    }
  }
);

export const switchGroupThunk = createAsyncThunk(
  "switchGroupThunk",
  async ({ id, userId }, { rejectWithValue }) => {
    try {
      const { data } = await switchGroup(id);
      data.id = id;
      data.userId = userId;
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.message;
      if (errorMessage) {
        toastError(errorMessage);
      }
      // Reject with error response
      return rejectWithValue({
        status: error.response.status,
        message: errorMessage,
      });
    }
  }
);

export const deleteGroupThunk = createAsyncThunk(
  "deleteGroupThunk",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await deleteGroup(id);
      data.id = id;
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.message;
      if (errorMessage) {
        toastError(errorMessage);
      }
      // Reject with error response
      return rejectWithValue({
        status: error.response.status,
        message: errorMessage,
      });
    }
  }
);

export const addMemberThunk = createAsyncThunk(
  "addMemberThunk",
  async ({ id, values }, { rejectWithValue }) => {
    try {
      const { data } = await addMember(id, values);
      toastSuccess(data.message);
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.message;
      if (errorMessage) {
        toastError(errorMessage);
      }
      // Reject with error response
      return rejectWithValue({
        status: error.response.status,
        message: errorMessage,
      });
    }
  }
);

export const removeMemberThunk = createAsyncThunk(
  "removeMemberThunk",
  async ({ groupId, id }, { rejectWithValue }) => {
    try {
      const { data } = await removeMember(groupId, id);
      data.id = id;
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.message;
      if (errorMessage) {
        toastError(errorMessage);
      }
      // Reject with error response
      return rejectWithValue({
        status: error.response.status,
        message: errorMessage,
      });
    }
  }
);

export const leaveGroupThunk = createAsyncThunk(
  "leaveGroupThunk",
  async ({ id, userId }, { rejectWithValue }) => {
    try {
      const { data } = await leaveGroup(id);
      data.id = id;
      data.userId = userId;
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.message;
      if (errorMessage) {
        toastError(errorMessage);
      }
      // Reject with error response
      return rejectWithValue({
        status: error.response.status,
        message: errorMessage,
      });
    }
  }
);

export const userLeaveGroupThunk = createAsyncThunk(
  "userLeaveGroupThunk",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await userLeaveGroup(id);
      data.id = id;
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.message;
      if (errorMessage) {
        toastError(errorMessage);
      }
      // Reject with error response
      return rejectWithValue({
        status: error.response.status,
        message: errorMessage,
      });
    }
  }
);

export const changePermissionThunk = createAsyncThunk(
  "changePermissionThunk",
  async ({ groupId, values }, { rejectWithValue }) => {
    try {
      const { data } = await changePermission(groupId, values);
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.message;
      if (errorMessage) {
        toastError(errorMessage);
      }
      // Reject with error response
      return rejectWithValue({
        status: error.response.status,
        message: errorMessage,
      });
    }
  }
);
