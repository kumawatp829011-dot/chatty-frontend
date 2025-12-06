import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();

  if (!selectedUser) {
    return (
      <div className="p-3 border-b border-base-300 text-center text-sm text-zinc-400">
        Select a conversation to start chatting
      </div>
    );
  }

  return (
    <div className="p-3 border-b border-base-300 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className="relative">
          <img
            src={selectedUser?.profilePic || "/avatar.png"}
            alt="profile"
            className="size-10 rounded-full object-cover"
          />
          {onlineUsers?.includes(selectedUser._id) && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-zinc-900" />
          )}
        </div>

        <div>
          <h3 className="font-semibold">{selectedUser?.fullName || "Unknown"}</h3>
          <p className="text-xs text-zinc-400">
            {onlineUsers?.includes(selectedUser._id) ? "Online" : "Offline"}
          </p>
        </div>
      </div>

      <button
        onClick={() => setSelectedUser(null)}
        className="hover:text-red-500 transition"
      >
        <X size={20} />
      </button>
    </div>
  );
};

export default ChatHeader;