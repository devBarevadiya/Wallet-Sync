import axios from "axios";
import { baseUrl } from "../config/config";
import { toastError } from "../config/toastConfig";

export const getToken = () => {
  const token = localStorage.getItem("token");
  return token ? token : "";
};

const api = axios.create({
  baseURL: baseUrl || import.meta.env.VITE_SERVER_LOCAL_URL,
  // headers: {
  //   "Content-Type": "application/json",
  // },
});

// Interceptors for handling requests data
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.log("[ERROR]:", error);
    return Promise.reject(error);
  }
);

// Interceptors for handling response data
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      toastError(error.message);
      // localStorage.removeItem("token");
    } else {
      console.log("[ERROR]:", error);
    }

    return Promise.reject(error);
  }
);
export const get = (url, queryParams) => {
  const token = getToken();
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  const queryArray = [];
  // console.log(queryParams);

  if (queryParams) {
    for (let [key, value] of Object.entries(queryParams)) {
      // if (value?.trim()) {
      if (Array.isArray(value)) {
        value.forEach((val) => {
          queryArray.push(`${key}=${val}`);
        });
      } else {
        queryArray.push(`${key}=${value}`);
      }
      // }
    }
  }

  const queryString = queryArray.join("&");
  const separator = queryString ? "?" : "";
  const fullUrl = `${url}${separator}${queryString}`;

  return api.get(fullUrl);
};

export const post = (url, data) => {
  const token = getToken();
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  return api.post(url, data);
};

export const patch = (url, data) => {
  const token = getToken();
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  return api.patch(url, data);
};

export const remove = (url, data) => {
  const token = getToken();
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  return api.delete(url, { data });
};
