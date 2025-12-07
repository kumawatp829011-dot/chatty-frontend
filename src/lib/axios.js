import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// Automatically attach token in every request
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("chatty-token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
