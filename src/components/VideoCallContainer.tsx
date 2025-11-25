import { useState, useEffect, useCallback } from "react";
import { webrtcService } from "../services/webrtcService";
import { userPresenceEvents } from "../services/socketEvents";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { LocalVideo } from "./LocalVideo";
import { RemoteVideos } from "./RemoteVideos";
import { CallControls } from "./CallControls";
import type { PeerConnection, OnlineUsersEvent } from "../types";

export const VideoCallContainer: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isInCall, setIsInCall] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [peerConnections, setPeerConnections] = useState<
    Map<string, PeerConnection>
  >(new Map());
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoDisabled, setIsVideoDisabled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<
    Array<{ id: string; username: string }>
  >([]);

  // Track online users for call initiation
  useEffect(() => {
    const handleOnlineUsers = (event: OnlineUsersEvent) => {
      setOnlineUsers(
        event.users
          .filter((u) => u.id !== user?.id)
          .map((u) => ({ id: u.id, username: u.username }))
      );
    };

    userPresenceEvents.onOnlineUsers(handleOnlineUsers);

    return () => {
      userPresenceEvents.offOnlineUsers(handleOnlineUsers);
    };
  }, [user?.id]);

  // Initialize WebRTC service
  useEffect(() => {
    webrtcService.initialize();

    return () => {
      webrtcService.cleanup();
    };
  }, []);

  // Update peer connections state when they change
  useEffect(() => {
    if (isInCall) {
      const interval = setInterval(() => {
        setPeerConnections(new Map(webrtcService.getPeerConnections()));
      }, 500);

      return () => clearInterval(interval);
    }
  }, [isInCall]);

  const handleStartCall = async () => {
    try {
      setError(null);

      // Get local media stream
      const stream = await webrtcService.requestLocalStream(true, true);
      setLocalStream(stream);
      setIsInCall(true);
      showToast("Call started", "success");

      // Create offers to all online users
      for (const onlineUser of onlineUsers) {
        await webrtcService.createOffer(
          onlineUser.id,
          onlineUser.username,
          () => {
            // Update peer connections when remote stream is received
            setPeerConnections(new Map(webrtcService.getPeerConnections()));
          }
        );
      }
    } catch (err) {
      console.error("Error starting call:", err);
      let errorMessage = "Failed to start call. Please try again.";

      if (err instanceof Error) {
        if (err.name === "NotAllowedError") {
          errorMessage =
            "Camera and microphone access denied. Please grant permissions to start a call.";
        } else if (err.name === "NotFoundError") {
          errorMessage =
            "No camera or microphone found. Please connect a device and try again.";
        }
        setError(errorMessage);
      }

      showToast(errorMessage, "error");
      setIsInCall(false);
    }
  };

  const handleEndCall = useCallback(() => {
    webrtcService.endAllCalls();
    webrtcService.stopLocalStream();
    setLocalStream(null);
    setIsInCall(false);
    setIsAudioMuted(false);
    setIsVideoDisabled(false);
    setPeerConnections(new Map());
    showToast("Call ended", "info");
  }, [showToast]);

  const handleToggleAudio = () => {
    const newMutedState = !isAudioMuted;
    webrtcService.setAudioEnabled(!newMutedState);
    setIsAudioMuted(newMutedState);
  };

  const handleToggleVideo = () => {
    const newDisabledState = !isVideoDisabled;
    webrtcService.setVideoEnabled(!newDisabledState);
    setIsVideoDisabled(newDisabledState);
  };

  const handlePermissionError = (err: Error) => {
    console.error("Permission error:", err);
    setError(err.message);
  };

  const handleRemoveParticipant = (userId: string) => {
    webrtcService.endCall(userId);
    setPeerConnections(new Map(webrtcService.getPeerConnections()));
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isInCall) {
        handleEndCall();
      }
    };
  }, [isInCall, handleEndCall]);

  return (
    <div className="h-full flex flex-col bg-gray-900">
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 p-3 sm:p-4 overflow-hidden">
        {/* Local video */}
        <div className="lg:col-span-1">
          <div className="h-full min-h-[200px] animate-fade-in">
            {localStream ? (
              <LocalVideo
                stream={localStream}
                isAudioMuted={isAudioMuted}
                isVideoDisabled={isVideoDisabled}
                onPermissionError={handlePermissionError}
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center bg-gray-800 rounded-lg shadow-lg"
                role="status"
                aria-label="Camera preview - not active"
              >
                <div className="text-center text-gray-400 animate-fade-in">
                  <svg
                    className="w-16 h-16 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-lg font-medium">Your Camera</p>
                  <p className="text-sm mt-2 text-gray-500">
                    Start a call to enable video
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Remote videos */}
        <div className="lg:col-span-2">
          <div className="h-full min-h-[200px]">
            <RemoteVideos
              peerConnections={peerConnections}
              onRemoveParticipant={handleRemoveParticipant}
            />
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mx-4 mb-4 p-3 bg-red-600 text-white rounded-lg flex items-start gap-2">
          <svg
            className="w-5 h-5 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="flex-1">
            <p className="font-medium">Error</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-white hover:text-gray-200"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Call controls */}
      <div className="p-4">
        <CallControls
          isInCall={isInCall}
          isAudioMuted={isAudioMuted}
          isVideoDisabled={isVideoDisabled}
          onStartCall={handleStartCall}
          onEndCall={handleEndCall}
          onToggleAudio={handleToggleAudio}
          onToggleVideo={handleToggleVideo}
        />
      </div>
    </div>
  );
};
