import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const MessageInput = ({ socket, selectedUser }) => {
  const [text, setText] = useState("");
  const { authUser } = useAuthStore();
  const { sendMessage } = useChatStore();

  let typingTimeout;

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
    }, 600);
  };

  const handleSend = () => {
    if (!text.trim()) return;

    sendMessage({ text });
    setText("");

    socket.emit("stopTyping", {
      senderId: authUser._id,
      receiverId: selectedUser._id,
    });
  };

  return (
    <div className="p-3 flex gap-2">
      <input
        type="text"
        className="input input-bordered flex-1"
        placeholder="Type a message..."
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          handleTyping();
        }}
      />

      <button className="btn btn-primary" onClick={handleSend}>
        Send
      </button>
    </div>
  );
};

export default MessageInput;
