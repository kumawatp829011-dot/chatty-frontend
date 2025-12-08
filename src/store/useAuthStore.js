import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5050"
    : "https://chatty-backend-dfjr.onrender.com";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  // 🔍 App load hone par user check
  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/api/auth/check");
      // backend se direct user object aa raha hota hai
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  // 🆕 Signup
  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/api/auth/signup", data);

      // yahan bhi backend se user object hi aata hai
      set({ authUser: res.data });

      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      set({ isSigningUp: false });
    }
  },

  // 🔐 Login
  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/api/auth/login", data);

      set({ authUser: res.data });
      toast.success("Logged in successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Invalid Credentials");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  // 🚪 Logout
  logout: async () => {
    try {
      const { socket, authUser } = get();

      if (socket && authUser) {
        socket.emit("logout");
      }

      await axiosInstance.post("/api/auth/logout");

      set({ authUser: null });
      get().disconnectSocket();
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Logout failed");
    }
  },

  // 👤 Profile update
  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/api/auth/update-profile", data);

      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Profile update failed");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  // 🌐 Socket connect
  // connectSocket: () => {
  //   const { authUser, socket } = get();
  //   if (!authUser || socket?.connected) return;

  //   const newSocket = io(BASE_URL, {
  //     query: { userId: authUser._id },
  //   });

  //   newSocket.connect();
  //   set({ socket: newSocket });

  //   newSocket.on("getOnlineUsers", (userIds) => {
  //     set({ onlineUsers: userIds });
  //     console.log("Online users updated:", userIds);
  //   });

  // 🌐 Socket connect
connectSocket: () => {
  const { authUser, socket } = get();
  if (!authUser || socket?.connected) return;

  const newSocket = io(BASE_URL, {
    withCredentials: true,        // cookie send karega
    transports: ["websocket"],    // mobile ke liye must
    path: "/socket.io",
    query: { userId: authUser._id },
  });

  set({ socket: newSocket });

  newSocket.on("getOnlineUsers", (userIds) => {
    set({ onlineUsers: userIds });
    console.log("Online users updated:", userIds);
  });
},

  

  // ❌ Socket disconnect
  disconnectSocket: () => {
    const { socket } = get();
    if (socket?.connected) socket.disconnect();
  },
}));
