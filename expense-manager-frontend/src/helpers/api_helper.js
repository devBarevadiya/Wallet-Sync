import axios from "axios";
import { baseUrl } from "../config/config";
import { toastError } from "../config/toastConfig";

export const getToken = () => {
  const token = localStorage.getItem("token");
  return token ? token : "";
};

const api = axios.create({
  baseURL: baseUrl || import.meta.env.VITE_SERVER_LOCAL_URL,
  timeout: 60000, // 60s timeout to allow Render wake-up on free tier
});

// Helper to extract error message safely
export const extractErrorMessage = (error) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Something went wrong. Please try again."
  );
};

// Interceptors for handling requests data
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => {
    console.log("[REQUEST ERROR]:", error);
    return Promise.reject(error);
  }
);

let isRedirecting = false;

// Interceptors for handling response data
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const requestUrl = error?.config?.url || "";

    // If 401 Unauthorized (and not attempting login/register), token is invalid or expired
    const isAuthRoute =
      requestUrl.includes("/login") ||
      requestUrl.includes("/register") ||
      requestUrl.includes("/forgotpassword") ||
      requestUrl.includes("/resetpassword");

    if (status === 401 && !isAuthRoute) {
      console.warn("[AUTH]: Token expired or invalid, clearing session...");
      if (!isRedirecting) {
        isRedirecting = true;
        localStorage.removeItem("token");
        localStorage.removeItem("deviceToken");
        toastError("Your session has expired. Please sign in again.");
        setTimeout(() => {
          if (
            window.location.pathname !== "/sign-in" &&
            !window.location.pathname.startsWith("/sign-in")
          ) {
            window.location.href = "/sign-in";
          }
          isRedirecting = false;
        }, 1200);
      }
    } else if (!error.response) {
      // Network error or timeout (common with Render sleeping instances)
      console.warn("[NETWORK]: Server connection timeout or offline:", error.message);
      toastError(
        error.code === "ECONNABORTED"
          ? "Server connection timed out while waking up. Please retry."
          : "Unable to connect to server. Please check your network."
      );
    } else {
      console.log("[API ERROR]:", error);
    }

    return Promise.reject(error);
  }
);

export const get = (url, queryParams) => {
  const queryArray = [];

  if (queryParams) {
    for (let [key, value] of Object.entries(queryParams)) {
      if (Array.isArray(value)) {
        value.forEach((val) => {
          if (val !== undefined && val !== null) {
            queryArray.push(
              `${encodeURIComponent(key)}=${encodeURIComponent(val)}`
            );
          }
        });
      } else if (value !== undefined && value !== null) {
        queryArray.push(
          `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
        );
      }
    }
  }

  const queryString = queryArray.join("&");
  const separator = queryString ? "?" : "";
  const fullUrl = `${url}${separator}${queryString}`;

  return api.get(fullUrl);
};

export const post = (url, data) => {
  return api.post(url, data);
};

export const patch = (url, data) => {
  return api.patch(url, data);
};

export const remove = (url, data) => {
  return api.delete(url, { data });
};
