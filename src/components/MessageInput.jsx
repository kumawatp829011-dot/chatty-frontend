// frontend/src/components/MessageInput.jsx
import { useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";

let typingTimeout;

const MessageInput = () => {
  const [text, setText] = useState("");
  const { selectedUser, sendMessage } = useChatStore();
  const { socket, authUser } = useAuthStore();

  const handleTyping = (e) => {
    setText(e.target.value);

    if (!socket || !selectedUser) return;

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
    }, 1000);
  };

  const send = () => {
    if (!text.trim() || !selectedUser) return;
    sendMessage({ message: text });
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
        onChange={handleTyping}
      />
      <button onClick={send} className="btn btn-primary">
        Send
      </button>
    </div>
  );
};

export default MessageInput;
