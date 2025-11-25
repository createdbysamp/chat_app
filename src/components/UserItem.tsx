import type { OnlineUser } from "../types";

interface UserItemProps {
  user: OnlineUser;
  isCurrentUser: boolean;
}

export const UserItem: React.FC<UserItemProps> = ({ user, isCurrentUser }) => {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 transition-all duration-200 hover:bg-gray-50 animate-slide-in ${
        isCurrentUser ? "bg-blue-50 border-l-4 border-blue-500" : ""
      }`}
      role="listitem"
      aria-label={`${user.username}${isCurrentUser ? " (You)" : ""} - Online`}
    >
      <div className="relative" aria-hidden="true">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-base shadow-sm">
          {user.username.charAt(0).toUpperCase()}
        </div>
        <div
          className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse-slow"
          title="Online"
        ></div>
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium truncate ${
            isCurrentUser ? "text-blue-700" : "text-gray-900"
          }`}
        >
          {user.username}
          {isCurrentUser && (
            <span className="ml-2 text-xs text-blue-600 font-normal">
              (You)
            </span>
          )}
        </p>
        <p className="text-xs text-gray-500">Online</p>
      </div>
    </div>
  );
};
