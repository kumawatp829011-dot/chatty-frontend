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

  // SIDEBAR USERS
  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/api/messages/users");
      set({ users: res.data });
    } catch (error) {
      console.error("getUsers error:", error?.response?.data || error.message);
      toast.error("Error fetching users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  // CHAT MESSAGES
  getMessages: async (userId) => {
    if (!userId) return;
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/api/messages/${userId}`);
      set({ messages: res.data });

      // unread reset
      const counts = { ...get().unreadCount };
      counts[userId] = 0;
      set({ unreadCount: counts });
    } catch (error) {
      console.error(
        "getMessages error:",
        error?.response?.data || error.message
      );
      toast.error("Error fetching messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  // SEND MESSAGE
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    if (!selectedUser?._id) return;

    try {
      const res = await axiosInstance.post(
        `/api/messages/send/${selectedUser._id}`,
        messageData
      );
      set({ messages: [...messages, res.data] });
    } catch (error) {
      console.error(
        "sendMessage error:",
        error?.response?.data || error.message
      );
      toast.error("Error sending message");
    }
  },

  // MARK AS SEEN
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
      console.error(
        "markAsSeen error:",
        error?.response?.data || error.message
      );
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
      console.error(
        "deleteForMe error:",
        error?.response?.data || error.message
      );
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
      console.error(
        "deleteForEveryone error:",
        error?.response?.data || error.message
      );
      toast.error("Cannot delete this message for everyone");
    }
  },

  setSelectedUser: (user) => {
    set({ selectedUser: user });
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
