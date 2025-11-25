import React from "react";
import { useToast, type Toast, type ToastType } from "../contexts/ToastContext";

const getToastStyles = (type: ToastType): string => {
  const baseStyles = "border-l-4 shadow-lg";

  switch (type) {
    case "success":
      return `${baseStyles} bg-green-50 border-green-500 text-green-800`;
    case "error":
      return `${baseStyles} bg-red-50 border-red-500 text-red-800`;
    case "warning":
      return `${baseStyles} bg-yellow-50 border-yellow-500 text-yellow-800`;
    case "info":
    default:
      return `${baseStyles} bg-blue-50 border-blue-500 text-blue-800`;
  }
};

const getToastIcon = (type: ToastType): string => {
  switch (type) {
    case "success":
      return "✓";
    case "error":
      return "✕";
    case "warning":
      return "⚠";
    case "info":
    default:
      return "ℹ";
  }
};

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
  return (
    <div
      className={`${getToastStyles(
        toast.type
      )} rounded-lg p-4 mb-3 flex items-start justify-between animate-slide-in`}
      role="alert"
    >
      <div className="flex items-start">
        <span className="text-xl mr-3 flex-shrink-0">
          {getToastIcon(toast.type)}
        </span>
        <p className="text-sm font-medium">{toast.message}</p>
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600 focus:outline-none"
        aria-label="Close"
      >
        <span className="text-xl">×</span>
      </button>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div
      className="fixed top-4 right-4 z-50 w-full max-w-sm pointer-events-none"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="pointer-events-auto">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </div>
  );
};
