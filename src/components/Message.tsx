import React from "react";
import type { Message as MessageType } from "../types";
import { useAuth } from "../contexts/AuthContext";

interface MessageProps {
  message: MessageType;
}

export const Message: React.FC<MessageProps> = ({ message }) => {
  const { user } = useAuth();
  const isOwnMessage = user?.id === message.senderId;

  const formatTimestamp = (timestamp: Date): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }

    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div
      className={`flex flex-col mb-4 animate-slide-up ${
        isOwnMessage ? "items-end" : "items-start"
      }`}
      role="article"
      aria-label={`Message from ${message.senderUsername}`}
    >
      <div
        className={`max-w-[70%] sm:max-w-[60%] rounded-lg px-4 py-2 shadow-sm transition-all duration-200 hover:shadow-md ${
          isOwnMessage
            ? "bg-blue-500 text-white rounded-br-none"
            : "bg-gray-200 text-gray-900 rounded-bl-none"
        }`}
      >
        {!isOwnMessage && (
          <div className="text-xs font-semibold mb-1 opacity-75">
            {message.senderUsername}
          </div>
        )}
        <div className="text-sm break-words whitespace-pre-wrap">
          {message.content}
        </div>
      </div>
      <div
        className={`text-xs text-gray-500 mt-1 px-1 ${
          isOwnMessage ? "text-right" : "text-left"
        }`}
      >
        <time dateTime={message.timestamp.toISOString()}>
          {formatTimestamp(message.timestamp)}
        </time>
      </div>
    </div>
  );
};
