import React, { useEffect, useRef, useState } from "react";
import type { Message as MessageType } from "../types";
import { Message } from "./Message";

interface MessageListProps {
  messages: MessageType[];
}

export const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isUserScrolling, setIsUserScrolling] = useState(false);

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive, unless user is scrolling
    if (!isUserScrolling) {
      scrollToBottom("smooth");
    }
  }, [messages, isUserScrolling]);

  useEffect(() => {
    // Initial scroll to bottom on mount
    scrollToBottom("auto");
  }, []);

  const handleScroll = () => {
    if (!containerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;

    setShowScrollButton(!isAtBottom);
    setIsUserScrolling(!isAtBottom);
  };

  const handleScrollButtonClick = () => {
    setIsUserScrolling(false);
    scrollToBottom("smooth");
  };

  if (messages.length === 0) {
    return (
      <div
        className="flex-1 flex items-center justify-center text-gray-500"
        role="status"
        aria-label="No messages"
      >
        <div className="text-center animate-fade-in">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <p className="text-lg mb-2 font-medium">No messages yet</p>
          <p className="text-sm text-gray-400">Start the conversation!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 relative">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto px-4 py-4 scrollbar-thin"
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
      >
        {messages.map((message) => (
          <Message key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} aria-hidden="true" />
      </div>

      {showScrollButton && (
        <button
          onClick={handleScrollButtonClick}
          className="absolute bottom-4 right-4 bg-blue-500 text-white rounded-full p-3 shadow-lg hover:bg-blue-600 active:bg-blue-700 transition-all duration-200 hover:scale-110 focus:scale-110 animate-bounce-in"
          aria-label="Scroll to bottom of messages"
          title="Scroll to bottom"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </button>
      )}
    </div>
  );
};
