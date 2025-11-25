import { socketService } from "./socketService";
import type {
  PeerConnection,
  WebRTCOfferEvent,
  WebRTCAnswerEvent,
  WebRTCIceCandidateEvent,
} from "../types";

/**
 * WebRTC configuration with ICE servers
 */
const RTC_CONFIGURATION: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

/**
 * WebRTC signaling event names
 */
export const WEBRTC_EVENTS = {
  CALL_OFFER: "webrtc:offer",
  CALL_ANSWER: "webrtc:answer",
  ICE_CANDIDATE: "webrtc:ice-candidate",
  CALL_END: "webrtc:call-end",
} as const;

/**
 * WebRTC Service for managing peer connections
 */
class WebRTCService {
  private peerConnections: Map<string, PeerConnection> = new Map();
  private localStream: MediaStream | null = null;
  private connectionStateHandlers: Map<
    string,
    (state: RTCPeerConnectionState) => void
  > = new Map();

  /**
   * Initialize the WebRTC service and set up signaling listeners
   */
  initialize(): void {
    this.setupSignalingListeners();
  }

  /**
   * Set up WebSocket listeners for WebRTC signaling
   */
  private setupSignalingListeners(): void {
    // Listen for incoming call offers
    socketService.on(WEBRTC_EVENTS.CALL_OFFER, this.handleOffer.bind(this));

    // Listen for call answers
    socketService.on(WEBRTC_EVENTS.CALL_ANSWER, this.handleAnswer.bind(this));

    // Listen for ICE candidates
    socketService.on(
      WEBRTC_EVENTS.ICE_CANDIDATE,
      this.handleIceCandidate.bind(this)
    );

    // Listen for call end events
    socketService.on(WEBRTC_EVENTS.CALL_END, this.handleCallEnd.bind(this));
  }

  /**
   * Clean up signaling listeners
   */
  cleanup(): void {
    socketService.off(WEBRTC_EVENTS.CALL_OFFER, this.handleOffer.bind(this));
    socketService.off(WEBRTC_EVENTS.CALL_ANSWER, this.handleAnswer.bind(this));
    socketService.off(
      WEBRTC_EVENTS.ICE_CANDIDATE,
      this.handleIceCandidate.bind(this)
    );
    socketService.off(WEBRTC_EVENTS.CALL_END, this.handleCallEnd.bind(this));

    this.closeAllConnections();
  }

  /**
   * Get local media stream (camera and microphone)
   */
  async requestLocalStream(
    audio: boolean = true,
    video: boolean = true
  ): Promise<MediaStream> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio,
        video,
      });
      this.localStream = stream;
      return stream;
    } catch (error) {
      console.error("Error accessing media devices:", error);
      throw error;
    }
  }

  /**
   * Create a peer connection for a specific user
   */
  createPeerConnection(
    userId: string,
    username: string,
    onTrack?: (stream: MediaStream) => void
  ): RTCPeerConnection {
    const connection = new RTCPeerConnection(RTC_CONFIGURATION);

    // Add local stream tracks to the connection
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        if (this.localStream) {
          connection.addTrack(track, this.localStream);
        }
      });
    }

    // Handle ICE candidates
    connection.onicecandidate = (event) => {
      if (event.candidate) {
        socketService.emit(WEBRTC_EVENTS.ICE_CANDIDATE, {
          toUserId: userId,
          candidate: event.candidate.toJSON(),
        });
      }
    };

    // Handle incoming tracks
    connection.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        const remoteStream = event.streams[0];
        const peerConn = this.peerConnections.get(userId);
        if (peerConn) {
          peerConn.stream = remoteStream;
        }
        if (onTrack) {
          onTrack(remoteStream);
        }
      }
    };

    // Monitor connection state
    connection.onconnectionstatechange = () => {
      const handler = this.connectionStateHandlers.get(userId);
      if (handler) {
        handler(connection.connectionState);
      }
    };

    // Store the peer connection
    this.peerConnections.set(userId, {
      userId,
      username,
      connection,
      stream: null,
    });

    return connection;
  }

  /**
   * Create and send an offer to a peer
   */
  async createOffer(
    userId: string,
    username: string,
    onTrack?: (stream: MediaStream) => void
  ): Promise<void> {
    const connection = this.createPeerConnection(userId, username, onTrack);

    try {
      const offer = await connection.createOffer();
      await connection.setLocalDescription(offer);

      socketService.emit(WEBRTC_EVENTS.CALL_OFFER, {
        toUserId: userId,
        offer: offer,
      });
    } catch (error) {
      console.error("Error creating offer:", error);
      throw error;
    }
  }

  /**
   * Handle incoming offer from a peer
   */
  private async handleOffer(event: WebRTCOfferEvent): Promise<void> {
    const { fromUserId, fromUsername, offer } = event;

    const connection = this.createPeerConnection(fromUserId, fromUsername);

    try {
      await connection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await connection.createAnswer();
      await connection.setLocalDescription(answer);

      socketService.emit(WEBRTC_EVENTS.CALL_ANSWER, {
        toUserId: fromUserId,
        answer: answer,
      });
    } catch (error) {
      console.error("Error handling offer:", error);
    }
  }

  /**
   * Handle incoming answer from a peer
   */
  private async handleAnswer(event: WebRTCAnswerEvent): Promise<void> {
    const { fromUserId, answer } = event;
    const peerConnection = this.peerConnections.get(fromUserId);

    if (peerConnection) {
      try {
        await peerConnection.connection.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
      } catch (error) {
        console.error("Error handling answer:", error);
      }
    }
  }

  /**
   * Handle incoming ICE candidate from a peer
   */
  private async handleIceCandidate(
    event: WebRTCIceCandidateEvent
  ): Promise<void> {
    const { fromUserId, candidate } = event;
    const peerConnection = this.peerConnections.get(fromUserId);

    if (peerConnection) {
      try {
        await peerConnection.connection.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      } catch (error) {
        console.error("Error adding ICE candidate:", error);
      }
    }
  }

  /**
   * Handle call end from a peer
   */
  private handleCallEnd(event: { userId: string }): void {
    this.closePeerConnection(event.userId);
  }

  /**
   * End call with a specific peer
   */
  endCall(userId: string): void {
    socketService.emit(WEBRTC_EVENTS.CALL_END, { toUserId: userId });
    this.closePeerConnection(userId);
  }

  /**
   * End all calls
   */
  endAllCalls(): void {
    this.peerConnections.forEach((_, userId) => {
      this.endCall(userId);
    });
  }

  /**
   * Close a specific peer connection
   */
  private closePeerConnection(userId: string): void {
    const peerConnection = this.peerConnections.get(userId);
    if (peerConnection) {
      peerConnection.connection.close();
      this.peerConnections.delete(userId);
      this.connectionStateHandlers.delete(userId);
    }
  }

  /**
   * Close all peer connections
   */
  private closeAllConnections(): void {
    this.peerConnections.forEach((peerConnection) => {
      peerConnection.connection.close();
    });
    this.peerConnections.clear();
    this.connectionStateHandlers.clear();

    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }
  }

  /**
   * Get all active peer connections
   */
  getPeerConnections(): Map<string, PeerConnection> {
    return this.peerConnections;
  }

  /**
   * Get local stream
   */
  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  /**
   * Stop local stream
   */
  stopLocalStream(): void {
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }
  }

  /**
   * Mute/unmute audio
   */
  setAudioEnabled(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = enabled;
      });
    }
  }

  /**
   * Enable/disable video
   */
  setVideoEnabled(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach((track) => {
        track.enabled = enabled;
      });
    }
  }

  /**
   * Register a connection state change handler for a specific peer
   */
  onConnectionStateChange(
    userId: string,
    handler: (state: RTCPeerConnectionState) => void
  ): void {
    this.connectionStateHandlers.set(userId, handler);
  }

  /**
   * Remove connection state change handler
   */
  offConnectionStateChange(userId: string): void {
    this.connectionStateHandlers.delete(userId);
  }
}

export const webrtcService = new WebRTCService();
