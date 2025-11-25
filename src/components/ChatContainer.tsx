import React, { useEffect, useState, useCallback, useRef } from "react";
import type { Message as MessageType, MessageReceivedEvent } from "../types";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { socketService, ConnectionStatus } from "../services/socketService";
import { messageEvents } from "../services/socketEvents";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3001";

export const ChatContainer: React.FC = () => {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const previousStatusRef = useRef<string>(ConnectionStatus.DISCONNECTED);

  // Handle incoming messages
  const handleMessageReceived = useCallback(
    (messageEvent: MessageReceivedEvent) => {
      const newMessage: MessageType = {
        id: messageEvent.id,
        senderId: messageEvent.senderId,
        senderUsername: messageEvent.senderUsername,
        content: messageEvent.content,
        timestamp: new Date(messageEvent.timestamp),
      };

      setMessages((prevMessages) => [...prevMessages, newMessage]);
    },
    []
  );

  // Handle connection status changes
  const handleStatusChange = useCallback(
    (status: string) => {
      const previousStatus = previousStatusRef.current;
      previousStatusRef.current = status;

      setIsConnected(status === ConnectionStatus.CONNECTED);

      // Show toast notifications for status changes
      if (
        status === ConnectionStatus.CONNECTED &&
        previousStatus !== ConnectionStatus.CONNECTED
      ) {
        if (previousStatus === ConnectionStatus.RECONNECTING) {
          showToast("Reconnected to chat", "success");
        }
      } else if (status === ConnectionStatus.ERROR) {
        showToast(
          "Failed to connect to chat. Please check your connection.",
          "error"
        );
      } else if (status === ConnectionStatus.RECONNECTING) {
        showToast("Connection lost. Attempting to reconnect...", "warning");
      }
    },
    [showToast]
  );

  // Send message handler
  const handleSendMessage = useCallback(
    (content: string) => {
      if (!isConnected) {
        showToast("Cannot send message: not connected to chat", "error");
        return;
      }

      try {
        messageEvents.sendMessage(content);
      } catch (error) {
        showToast("Failed to send message. Please try again.", "error");
      }
    },
    [isConnected, showToast]
  );

  useEffect(() => {
    // Initialize WebSocket connection
    socketService.connect(SOCKET_URL, token || undefined);

    // Register event listeners
    messageEvents.onMessageReceived(handleMessageReceived);
    socketService.onStatusChange(handleStatusChange);

    // Set initial connection status
    setIsConnected(socketService.isConnected());

    // Cleanup on unmount
    return () => {
      messageEvents.offMessageReceived(handleMessageReceived);
      socketService.offStatusChange(handleStatusChange);
      socketService.disconnect();
    };
  }, [token, handleMessageReceived, handleStatusChange]);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {!isConnected && (
        <div className="bg-yellow-100 border-b border-yellow-300 px-4 py-2 text-sm text-yellow-800">
          {socketService.getConnectionStatus() === ConnectionStatus.CONNECTING
            ? "Connecting to chat..."
            : socketService.getConnectionStatus() ===
              ConnectionStatus.RECONNECTING
            ? "Reconnecting..."
            : "Disconnected from chat"}
        </div>
      )}

      <MessageList messages={messages} />
      <MessageInput
        onSendMessage={handleSendMessage}
        isConnected={isConnected}
      />
    </div>
  );
};
