import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE === "development"
    ? "http://localhost:5050"
    : "https://chatty-backend-dfjr.onrender.com",
  withCredentials: true,
});

export { axiosInstance };
