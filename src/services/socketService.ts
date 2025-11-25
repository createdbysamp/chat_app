import { io, Socket } from "socket.io-client";

export const ConnectionStatus = {
  DISCONNECTED: "disconnected",
  CONNECTING: "connecting",
  CONNECTED: "connected",
  RECONNECTING: "reconnecting",
  ERROR: "error",
} as const;

export type ConnectionStatusType =
  (typeof ConnectionStatus)[keyof typeof ConnectionStatus];

type EventHandler = (...args: any[]) => void;

class SocketService {
  private socket: Socket | null = null;
  private connectionStatus: ConnectionStatusType =
    ConnectionStatus.DISCONNECTED;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private baseReconnectDelay = 1000; // 1 second
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private eventHandlers: Map<string, Set<EventHandler>> = new Map();
  private statusChangeListeners: Set<(status: ConnectionStatusType) => void> =
    new Set();

  /**
   * Connect to the WebSocket server
   */
  connect(url: string, token?: string): void {
    if (this.socket?.connected) {
      console.warn("Socket already connected");
      return;
    }

    this.setConnectionStatus(ConnectionStatus.CONNECTING);

    const options: any = {
      transports: ["websocket"],
      reconnection: false, // We'll handle reconnection manually
    };

    if (token) {
      options.auth = { token };
    }

    this.socket = io(url, options);

    this.setupSocketListeners();
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.reconnectAttempts = 0;

    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }

    this.setConnectionStatus(ConnectionStatus.DISCONNECTED);
  }

  /**
   * Register an event listener
   */
  on(event: string, handler: EventHandler): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);

    // If socket is already connected, register the handler immediately
    if (this.socket) {
      this.socket.on(event, handler);
    }
  }

  /**
   * Unregister an event listener
   */
  off(event: string, handler: EventHandler): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.eventHandlers.delete(event);
      }
    }

    if (this.socket) {
      this.socket.off(event, handler);
    }
  }

  /**
   * Emit an event to the server
   */
  emit(event: string, ...args: any[]): void {
    if (!this.socket || !this.socket.connected) {
      console.error("Cannot emit event: socket not connected");
      return;
    }

    this.socket.emit(event, ...args);
  }

  /**
   * Get current connection status
   */
  getConnectionStatus(): ConnectionStatusType {
    return this.connectionStatus;
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * Register a listener for connection status changes
   */
  onStatusChange(listener: (status: ConnectionStatusType) => void): void {
    this.statusChangeListeners.add(listener);
  }

  /**
   * Unregister a connection status change listener
   */
  offStatusChange(listener: (status: ConnectionStatusType) => void): void {
    this.statusChangeListeners.delete(listener);
  }

  /**
   * Setup socket event listeners
   */
  private setupSocketListeners(): void {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("Socket connected");
      this.reconnectAttempts = 0;
      this.setConnectionStatus(ConnectionStatus.CONNECTED);

      // Re-register all event handlers
      this.eventHandlers.forEach((handlers, event) => {
        handlers.forEach((handler) => {
          this.socket!.on(event, handler);
        });
      });
    });

    this.socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      this.setConnectionStatus(ConnectionStatus.DISCONNECTED);

      // Attempt reconnection if disconnect was not intentional
      if (reason === "io server disconnect") {
        // Server disconnected the client, don't reconnect automatically
        return;
      }

      this.attemptReconnect();
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      this.setConnectionStatus(ConnectionStatus.ERROR);
      this.attemptReconnect();
    });
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("Max reconnection attempts reached");
      this.setConnectionStatus(ConnectionStatus.ERROR);
      return;
    }

    this.reconnectAttempts++;
    this.setConnectionStatus(ConnectionStatus.RECONNECTING);

    // Calculate delay with exponential backoff
    const delay =
      this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(
      `Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`
    );

    this.reconnectTimer = setTimeout(() => {
      if (this.socket && !this.socket.connected) {
        this.socket.connect();
      }
    }, delay);
  }

  /**
   * Update connection status and notify listeners
   */
  private setConnectionStatus(status: ConnectionStatusType): void {
    this.connectionStatus = status;
    this.statusChangeListeners.forEach((listener) => listener(status));
  }
}

// Export singleton instance
export const socketService = new SocketService();
