import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // e.g. https://chatty-backend-dfjr.onrender.com
  withCredentials: true,                  // jwt cookie bhejne ke liye
});

// ❌ Yahan koi token / interceptor ki zarurat nahi
// Backend already httpOnly cookie se auth handle karega
