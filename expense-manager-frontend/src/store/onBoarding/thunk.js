import { createAsyncThunk } from "@reduxjs/toolkit";
import { toastError } from "../../config/toastConfig";
import { db } from "../../firebase/config";
import { doc, setDoc } from "firebase/firestore";

export const setDocThunk = createAsyncThunk(
  "setDocThunk",
  async ({ title, data }, { rejectWithValue }) => {
    try {
      const docRef = doc(db, `Onboarding-Web/${data?.email}/files/${title}`);
      await setDoc(docRef, {
        ...data,
      });
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
