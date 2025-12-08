// frontend/src/store/useChatStore.js
import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

export const useChatStore = create((set, get) => ({
  users: [],
  messages: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  unreadCount: {},

  // sidebar visibility (mobile ke liye)
  showSidebar: true,
  setShowSidebar: (value) => set({ showSidebar: value }),

  // ⭐ SELECT USER
  setSelectedUser: (user) => {
    set({ selectedUser: user });

    // ⭐ reset unread when chat opened
    if (user?._id && get().unreadCount[user._id]) {
      const countData = { ...get().unreadCount };
      countData[user._id] = 0;
      set({ unreadCount: countData });
    }

    // ⭐ Mobile Responsive: Hide Sidebar
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      set({ showSidebar: false });
    }
  },

  // Fetch sidebar users
  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/api/messages/users");
      set({ users: res.data });
    } catch (error) {
      console.error("getUsers error:", error?.response || error);
      toast.error("Failed to fetch users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  // Fetch messages from server
  getMessages: async (userId) => {
    if (!userId) return;
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/api/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      console.error("getMessages error:", error?.response || error);
      toast.error("Failed to load messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  // ✅ SEND MESSAGE – ab sirf text string lega
  sendMessage: async (data) => {
    try {
      const { selectedUser, messages } = get();
      if (!selectedUser) return toast.error("Select a user first!");

      const payload = { message: data.message || data.text }; // FIX ✔

      const res = await axiosInstance.post(
        `/api/messages/send/${selectedUser._id}`,
        payload
      );

      set({ messages: [...messages, res.data] });
    } catch (error) {
      console.error("sendMessage error:", error?.response);
      toast.error(error?.response?.data?.message || "Message sending failed");
    }
  },

  // 👁 MARK AS SEEN (same as pehle ka)
  markAsSeen: async (messageId) => {
    try {
      const res = await axiosInstance.put(`/api/messages/seen/${messageId}`);
      const updated = res.data;

      set({
        messages: get().messages.map((msg) =>
          msg._id === updated._id ? updated : msg
        ),
      });
    } catch (error) {
      console.error("markAsSeen error:", error?.response || error);
    }
  },

  // DELETE FOR ME
  deleteForMe: async (messageId) => {
    try {
      await axiosInstance.delete(`/api/messages/${messageId}/me`);
      set({
        messages: get().messages.filter((msg) => msg._id !== messageId),
      });
    } catch (error) {
      console.error("deleteForMe error:", error?.response || error);
      toast.error("Cannot delete this message");
    }
  },

  // DELETE FOR EVERYONE
  deleteForEveryone: async (messageId) => {
    try {
      await axiosInstance.delete(`/api/messages/${messageId}/everyone`);
      set({
        messages: get().messages.filter((msg) => msg._id !== messageId),
      });
    } catch (error) {
      console.error("deleteForEveryone error:", error?.response || error);
      toast.error("Cannot delete this message for everyone");
    }
  },

  // unread helpers
  incrementUnread: (userId) => {
    const counts = { ...get().unreadCount };
    counts[userId] = (counts[userId] || 0) + 1;
    set({ unreadCount: counts });
  },

  resetUnread: (userId) => {
    const counts = { ...get().unreadCount };
    counts[userId] = 0;
    set({ unreadCount: counts });
  },
}));
