// frontend/src/components/Sidebar.jsx
import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users } from "lucide-react";

const Sidebar = () => {
  const {
    getUsers,
    users,
    selectedUser,
    setSelectedUser,
    isUsersLoading,
    unreadCount,
    showSidebar,
  } = useChatStore();

  const { onlineUsers, authUser, socket, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    if (!authUser || !socket || isCheckingAuth) return;
    getUsers();
  }, [authUser, socket, isCheckingAuth]);

  if (isUsersLoading || isCheckingAuth) return <SidebarSkeleton />;

  return (
    <aside
      className={`h-full border-r border-base-300 flex flex-col transition-all duration-200 ${
        showSidebar ? "w-20 lg:w-72" : "w-0 overflow-hidden"
      }`}
    >
      <div className="border-b border-base-300 w-full p-5 flex items-center gap-2">
        <Users className="size-6" />
        <span className="font-medium hidden lg:block">Contacts</span>
      </div>

      <div className="overflow-y-auto w-full py-3">
        {users.map((user) => (
          <button
            key={user._id}
            onClick={() => setSelectedUser(user)}
            className={`w-full p-3 flex items-center gap-3 ${
              selectedUser?._id === user._id ? "bg-base-300" : ""
            }`}
          >
            <div className="relative mx-auto lg:mx-0">
              <img
                src={user.profilePic || "/avatar.png"}
                alt={user.fullName}
                className="size-12 object-cover rounded-full"
              />

              {onlineUsers.includes(user._id) && (
                <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-zinc-900" />
              )}

              {unreadCount[user._id] > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-[10px] rounded-full w-5 h-5 flex items-center justify-center text-white font-bold">
                  {unreadCount[user._id]}
                </span>
              )}
            </div>

            <div className="hidden lg:block text-left">
              <div className="font-medium truncate">{user.fullName}</div>
              <div className="text-sm text-zinc-400">
                {onlineUsers.includes(user._id) ? "Online" : "Offline"}
              </div>
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
