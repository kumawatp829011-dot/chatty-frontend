// frontend/src/components/ChatHeader.jsx
import { useChatStore } from "../store/useChatStore";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser, setShowSidebar } = useChatStore();

  const handleClose = () => {
    setSelectedUser(null);
    if (window.innerWidth < 768) setShowSidebar(true);
  };

  return (
    <div className="flex justify-between items-center p-3 border-b border-base-300">
      <div className="flex items-center gap-3">
        <img
          src={selectedUser.profilePic || "/avatar.png"}
          className="size-10 rounded-full"
        />
        <div className="font-medium">{selectedUser.fullName}</div>
      </div>

      <button onClick={handleClose} className="text-xl font-bold">
        ✕
      </button>
    </div>
  );
};

export default ChatHeader;
