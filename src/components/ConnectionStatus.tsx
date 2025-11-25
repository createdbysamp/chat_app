import React, { useEffect, useState } from "react";
import {
  socketService,
  ConnectionStatus as Status,
  type ConnectionStatusType,
} from "../services/socketService";

export const ConnectionStatus: React.FC = () => {
  const [status, setStatus] = useState<ConnectionStatusType>(
    socketService.getConnectionStatus()
  );

  useEffect(() => {
    const handleStatusChange = (newStatus: ConnectionStatusType) => {
      setStatus(newStatus);
    };

    socketService.onStatusChange(handleStatusChange);

    return () => {
      socketService.offStatusChange(handleStatusChange);
    };
  }, []);

  // Don't show anything when connected
  if (status === Status.CONNECTED) {
    return null;
  }

  const getStatusConfig = () => {
    switch (status) {
      case Status.CONNECTING:
        return {
          text: "Connecting...",
          bgColor: "bg-yellow-500",
          icon: "⟳",
        };
      case Status.RECONNECTING:
        return {
          text: "Reconnecting...",
          bgColor: "bg-orange-500",
          icon: "⟳",
        };
      case Status.ERROR:
        return {
          text: "Connection failed",
          bgColor: "bg-red-500",
          icon: "⚠",
        };
      case Status.DISCONNECTED:
      default:
        return {
          text: "Disconnected",
          bgColor: "bg-gray-500",
          icon: "○",
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div
      className={`${config.bgColor} text-white px-4 py-2 text-sm font-medium flex items-center justify-center space-x-2 shadow-md`}
      role="status"
      aria-live="polite"
    >
      <span
        className={
          status === Status.CONNECTING || status === Status.RECONNECTING
            ? "animate-spin"
            : ""
        }
      >
        {config.icon}
      </span>
      <span>{config.text}</span>
    </div>
  );
};
