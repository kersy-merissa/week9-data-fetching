import axios from "axios";

// Create a shared Axios instance with a base URL and timeout
export const api = axios.create({
  baseURL: "https://dummyjson.com",
  timeout: 8000,
});

// Response interceptor: log or format API errors consistently in one place
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || "Network error occurred";
    return Promise.reject(new Error(message));
  }
);