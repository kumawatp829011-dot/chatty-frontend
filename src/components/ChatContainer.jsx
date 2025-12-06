// frontend/src/components/ChatContainer.jsx
import { useEffect, useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    markAsSeen,
    deleteForMe,
    deleteForEveryone,
    incrementUnread,
  } = useChatStore();

  const { authUser, socket } = useAuthStore();
  const [isTyping, setIsTyping] = useState(false);
  const messageEndRef = useRef(null);

  // Messages load when chat selected
  useEffect(() => {
    if (!selectedUser?._id) return;
    getMessages(selectedUser._id);
  }, [selectedUser?._id]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage) => {
      if (!authUser) return;

      const isCurrentChat =
        selectedUser &&
        ((newMessage.senderId === selectedUser._id &&
          newMessage.receiverId === authUser._id) ||
          (newMessage.receiverId === selectedUser._id &&
            newMessage.senderId === authUser._id));

      if (isCurrentChat) {
        useChatStore.setState((state) => ({
          messages: [...state.messages, newMessage],
        }));
      } else {
        // unread badge update
        const otherUserId =
          newMessage.senderId === authUser._id
            ? newMessage.receiverId
            : newMessage.senderId;
        incrementUnread(otherUserId);
      }
    };

    const handleMessageSeen = (updatedMessage) => {
      useChatStore.setState((state) => ({
        messages: state.messages.map((m) =>
          m._id === updatedMessage._id ? updatedMessage : m
        ),
      }));
    };

    const handleMessageDeleted = ({ messageId }) => {
      useChatStore.setState((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === messageId
            ? { ...msg, isDeleted: true, text: "", image: null }
            : msg
        ),
      }));
    };

    const handleTyping = ({ senderId }) => {
      if (selectedUser && senderId === selectedUser._id) setIsTyping(true);
    };

    const handleStopTyping = ({ senderId }) => {
      if (selectedUser && senderId === selectedUser._id) setIsTyping(false);
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("messageSeen", handleMessageSeen);
    socket.on("messageDeleted", handleMessageDeleted);
    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("messageSeen", handleMessageSeen);
      socket.off("messageDeleted", handleMessageDeleted);
      socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);
    };
  }, [socket, selectedUser, authUser, incrementUnread]);

  // Auto scroll
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Mark received messages as seen when open
  useEffect(() => {
    if (!selectedUser?._id || !authUser) return;

    const unseen = messages.filter(
      (m) => !m.seen && m.receiverId === authUser._id
    );

    unseen.forEach((m) => {
      markAsSeen(m._id);
    });
  }, [messages, selectedUser, authUser, markAsSeen]);

  const handleDeleteForMe = (id) => {
    deleteForMe(id);
  };

  const handleDeleteForEveryone = (id) => {
    deleteForEveryone(id);
  };

  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-zinc-500 text-sm">
          Select a conversation from the sidebar to start chatting
        </p>
      </div>
    );
  }

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isMe = message.senderId === authUser._id;

          return (
            <div
              key={message._id}
              className={`chat ${isMe ? "chat-end" : "chat-start"}`}
              ref={messageEndRef}
            >
              <div className="chat-image avatar">
                <div className="size-10 rounded-full border">
                  <img
                    src={
                      isMe
                        ? authUser.profilePic || "/avatar.png"
                        : selectedUser.profilePic || "/avatar.png"
                    }
                    alt="profile"
                  />
                </div>
              </div>

              <div className="chat-header mb-1">
                <time className="text-xs opacity-50 ml-1">
                  {formatMessageTime(message.createdAt)}
                </time>
              </div>

              <div className="chat-bubble flex flex-col">
                {message.image && (
                  <img
                    src={message.image}
                    alt="Attachment"
                    className="sm:max-w-[200px] rounded-md mb-2"
                  />
                )}

                {/* {message.isDeleted ? (
                  <p className="italic text-zinc-300">
                    {message.senderId === authUser._id
                      ? "You deleted this message"
                      : "This message was deleted"}
                  </p>
                ) : (
                  message.text && <p>{message.text}</p>
                )} */}

                {message.isDeleted ? (
                  <div
                    className="chat-bubble bg-gray-700/40 border border-gray-500 text-gray-300 italic fade-in"
                    style={{ fontSize: "12px" }}
                  >
                    <div className="flex items-center gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3 opacity-70"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4m-4 0v4m4-4v4M6 7h12"
                        />
                      </svg>

                      <span>
                        {message.senderId === authUser._id
                          ? "You deleted this message"
                          : "This message was deleted"}
                      </span>
                    </div>
                  </div>
                ) : (
                  message.text && <p>{message.text}</p>
                )}

                {isMe && !message.isDeleted && (
                  <small className="text-[10px] text-right mt-1">
                    {message.seen ? "✔✔ Seen" : "✔ Delivered"}
                  </small>
                )}

                {isMe && !message.isDeleted && (
                  <div className="mt-1 flex justify-end gap-3 text-[10px] text-zinc-200">
                    <button onClick={() => handleDeleteForMe(message._id)}>
                      Delete for me
                    </button>
                    <button
                      onClick={() => handleDeleteForEveryone(message._id)}
                    >
                      Delete for everyone
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="text-xs text-zinc-400 px-3 pb-2">Typing...</div>
        )}
      </div>

      <MessageInput socket={socket} selectedUser={selectedUser} />
    </div>
  );
};

export default ChatContainer;
