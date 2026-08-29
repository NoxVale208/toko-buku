import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json",
  },
});

// Attach bearer token (Sanctum token-based auth) to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("bookvault_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-clear auth state on 401 (without a disruptive full-page reload, which can
// interrupt in-flight requests like a fresh login submission and leave the SPA stuck)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("bookvault_token");
      localStorage.removeItem("bookvault_user");
      window.dispatchEvent(new Event("auth:unauthorized"));
    }
    return Promise.reject(error);
  }
);

export default api;
