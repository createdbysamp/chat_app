// Type definitions for the chatroom application
// This file will contain shared TypeScript interfaces and types

export interface User {
  id: string;
  username: string;
  email: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderUsername: string;
  content: string;
  timestamp: Date;
}

export interface OnlineUser {
  id: string;
  username: string;
  socketId: string;
  connectedAt: Date;
}

// WebSocket Event Types
export interface MessageReceivedEvent {
  id: string;
  senderId: string;
  senderUsername: string;
  content: string;
  timestamp: string; // ISO string from server
}

export interface UserJoinedEvent {
  userId: string;
  username: string;
  socketId: string;
  timestamp: string;
}

export interface UserLeftEvent {
  userId: string;
  username: string;
  timestamp: string;
}

export interface TypingIndicatorEvent {
  userId: string;
  username: string;
  isTyping: boolean;
}

export interface OnlineUsersEvent {
  users: OnlineUser[];
}

// WebRTC Types
export interface PeerConnection {
  userId: string;
  username: string;
  connection: RTCPeerConnection;
  stream: MediaStream | null;
}

export interface CallState {
  isInCall: boolean;
  localStream: MediaStream | null;
  peerConnections: Map<string, PeerConnection>;
  isAudioMuted: boolean;
  isVideoDisabled: boolean;
}

// WebRTC Signaling Event Types
export interface WebRTCOfferEvent {
  fromUserId: string;
  fromUsername: string;
  offer: RTCSessionDescriptionInit;
}

export interface WebRTCAnswerEvent {
  fromUserId: string;
  answer: RTCSessionDescriptionInit;
}

export interface WebRTCIceCandidateEvent {
  fromUserId: string;
  candidate: RTCIceCandidateInit;
}

export interface WebRTCCallEndEvent {
  userId: string;
}
