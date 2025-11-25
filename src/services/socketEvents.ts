import { socketService } from "./socketService";
import type {
  MessageReceivedEvent,
  UserJoinedEvent,
  UserLeftEvent,
  TypingIndicatorEvent,
  OnlineUsersEvent,
} from "../types";

/**
 * Socket event names
 */
export const SOCKET_EVENTS = {
  // Message events
  MESSAGE_SEND: "message:send",
  MESSAGE_RECEIVED: "message:received",

  // User presence events
  USER_JOINED: "user:joined",
  USER_LEFT: "user:left",
  ONLINE_USERS: "online:users",

  // Typing indicator events (optional)
  TYPING_START: "typing:start",
  TYPING_STOP: "typing:stop",
  TYPING_INDICATOR: "typing:indicator",
} as const;

/**
 * Message event handlers
 */
export const messageEvents = {
  /**
   * Send a message to the server
   */
  sendMessage(content: string): void {
    socketService.emit(SOCKET_EVENTS.MESSAGE_SEND, { content });
  },

  /**
   * Listen for incoming messages
   */
  onMessageReceived(handler: (message: MessageReceivedEvent) => void): void {
    socketService.on(SOCKET_EVENTS.MESSAGE_RECEIVED, handler);
  },

  /**
   * Stop listening for incoming messages
   */
  offMessageReceived(handler: (message: MessageReceivedEvent) => void): void {
    socketService.off(SOCKET_EVENTS.MESSAGE_RECEIVED, handler);
  },
};

/**
 * User presence event handlers
 */
export const userPresenceEvents = {
  /**
   * Listen for user joined events
   */
  onUserJoined(handler: (event: UserJoinedEvent) => void): void {
    socketService.on(SOCKET_EVENTS.USER_JOINED, handler);
  },

  /**
   * Stop listening for user joined events
   */
  offUserJoined(handler: (event: UserJoinedEvent) => void): void {
    socketService.off(SOCKET_EVENTS.USER_JOINED, handler);
  },

  /**
   * Listen for user left events
   */
  onUserLeft(handler: (event: UserLeftEvent) => void): void {
    socketService.on(SOCKET_EVENTS.USER_LEFT, handler);
  },

  /**
   * Stop listening for user left events
   */
  offUserLeft(handler: (event: UserLeftEvent) => void): void {
    socketService.off(SOCKET_EVENTS.USER_LEFT, handler);
  },

  /**
   * Listen for online users list updates
   */
  onOnlineUsers(handler: (event: OnlineUsersEvent) => void): void {
    socketService.on(SOCKET_EVENTS.ONLINE_USERS, handler);
  },

  /**
   * Stop listening for online users list updates
   */
  offOnlineUsers(handler: (event: OnlineUsersEvent) => void): void {
    socketService.off(SOCKET_EVENTS.ONLINE_USERS, handler);
  },
};

/**
 * Typing indicator event handlers (optional enhancement)
 */
export const typingEvents = {
  /**
   * Notify server that user started typing
   */
  startTyping(): void {
    socketService.emit(SOCKET_EVENTS.TYPING_START);
  },

  /**
   * Notify server that user stopped typing
   */
  stopTyping(): void {
    socketService.emit(SOCKET_EVENTS.TYPING_STOP);
  },

  /**
   * Listen for typing indicator events
   */
  onTypingIndicator(handler: (event: TypingIndicatorEvent) => void): void {
    socketService.on(SOCKET_EVENTS.TYPING_INDICATOR, handler);
  },

  /**
   * Stop listening for typing indicator events
   */
  offTypingIndicator(handler: (event: TypingIndicatorEvent) => void): void {
    socketService.off(SOCKET_EVENTS.TYPING_INDICATOR, handler);
  },
};

/**
 * Combined export for all socket event handlers
 */
export const socketEventHandlers = {
  message: messageEvents,
  userPresence: userPresenceEvents,
  typing: typingEvents,
};
