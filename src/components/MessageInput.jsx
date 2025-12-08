// frontend/src/components/MessageInput.jsx
import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

let typingTimeout;

const MessageInput = () => {
  const [text, setText] = useState("");
  const { socket, authUser } = useAuthStore();
  const { selectedUser, sendMessage } = useChatStore();

  const handleTyping = () => {
    if (!socket || !authUser || !selectedUser) return;

    socket.emit("typing", {
      senderId: authUser._id,
      receiverId: selectedUser._id,
    });

    clearTimeout(typingTimeout);

    typingTimeout = setTimeout(() => {
      socket.emit("stopTyping", {
        senderId: authUser._id,
        receiverId: selectedUser._id,
      });
    }, 800);
  };

  const handleSend = () => {
    if (!text.trim()) return;

    sendMessage({ message: text }); // MUST BE message ✔
    setText("");

    socket.emit("stopTyping", {
      senderId: authUser._id,
      receiverId: selectedUser._id,
    });
  };

  return (
    <div className="p-3 flex gap-2 border-t border-base-300">
      <input
        type="text"
        className="input input-bordered flex-1"
        placeholder="Type a message..."
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          handleTyping();
        }}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
      />

      <button className="btn btn-primary" onClick={handleSend}>
        Send
      </button>
    </div>
  );
};

export default MessageInput;
