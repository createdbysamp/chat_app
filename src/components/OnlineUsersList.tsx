import { useState, useEffect } from "react";
import { userPresenceEvents } from "../services/socketEvents";
import { useAuth } from "../contexts/AuthContext";
import { UserItem } from "./UserItem";
import type {
  OnlineUser,
  UserJoinedEvent,
  UserLeftEvent,
  OnlineUsersEvent,
} from "../types";

export const OnlineUsersList: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);

  useEffect(() => {
    // Handler for initial online users list
    const handleOnlineUsers = (event: OnlineUsersEvent) => {
      setOnlineUsers(event.users);
    };

    // Handler for user joined event
    const handleUserJoined = (event: UserJoinedEvent) => {
      const newUser: OnlineUser = {
        id: event.userId,
        username: event.username,
        socketId: event.socketId,
        connectedAt: new Date(event.timestamp),
      };

      setOnlineUsers((prev) => {
        // Check if user already exists to avoid duplicates
        if (prev.some((u) => u.id === newUser.id)) {
          return prev;
        }
        return [...prev, newUser];
      });
    };

    // Handler for user left event
    const handleUserLeft = (event: UserLeftEvent) => {
      setOnlineUsers((prev) => prev.filter((u) => u.id !== event.userId));
    };

    // Register event listeners
    userPresenceEvents.onOnlineUsers(handleOnlineUsers);
    userPresenceEvents.onUserJoined(handleUserJoined);
    userPresenceEvents.onUserLeft(handleUserLeft);

    // Cleanup event listeners on unmount
    return () => {
      userPresenceEvents.offOnlineUsers(handleOnlineUsers);
      userPresenceEvents.offUserJoined(handleUserJoined);
      userPresenceEvents.offUserLeft(handleUserLeft);
    };
  }, []);

  return (
    <div className="h-full flex flex-col bg-white border-l border-gray-200">
      <div className="px-4 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <svg
            className="w-5 h-5 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          Online Users
        </h2>
        <p
          className="text-sm text-gray-600 mt-1"
          role="status"
          aria-live="polite"
        >
          <span className="font-semibold text-blue-600">
            {onlineUsers.length}
          </span>{" "}
          {onlineUsers.length === 1 ? "user" : "users"} online
        </p>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin" role="list">
        {onlineUsers.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center h-32 text-gray-400 text-sm animate-fade-in"
            role="status"
          >
            <svg
              className="w-12 h-12 mb-2 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <p>No users online</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {onlineUsers.map((user) => (
              <UserItem
                key={user.id}
                user={user}
                isCurrentUser={user.id === currentUser?.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
