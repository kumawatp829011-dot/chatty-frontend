// frontend/src/lib/axios.js
import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // keep env ❌ do NOT remove
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Debug only (helps us see server messages)
axiosInstance.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("AXIOS ERROR:", err?.response?.data || err.message);
    return Promise.reject(err);
  }
);
