import { RemoteVideo } from "./RemoteVideo";
import type { PeerConnection } from "../types";

interface RemoteVideosProps {
  peerConnections: Map<string, PeerConnection>;
  onRemoveParticipant?: (userId: string) => void;
}

export const RemoteVideos: React.FC<RemoteVideosProps> = ({
  peerConnections,
  onRemoveParticipant,
}) => {
  const participants = Array.from(peerConnections.values());
  const participantCount = participants.length;

  // Calculate grid layout based on participant count
  const getGridClass = () => {
    if (participantCount === 0) return "";
    if (participantCount === 1) return "grid-cols-1";
    if (participantCount === 2) return "grid-cols-1 sm:grid-cols-2";
    if (participantCount <= 4) return "grid-cols-1 sm:grid-cols-2";
    if (participantCount <= 6) return "grid-cols-2 sm:grid-cols-3";
    if (participantCount <= 9) return "grid-cols-2 sm:grid-cols-3";
    return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4";
  };

  const handleStreamEnded = (userId: string) => {
    if (onRemoveParticipant) {
      onRemoveParticipant(userId);
    }
  };

  if (participantCount === 0) {
    return (
      <div
        className="w-full h-full flex items-center justify-center bg-gray-900 rounded-lg"
        role="status"
        aria-label="No participants in call"
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
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <p className="text-lg font-medium">No participants yet</p>
          <p className="text-sm mt-2 text-gray-500">
            Start a call to connect with others
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`grid ${getGridClass()} gap-2 sm:gap-3 w-full h-full p-2 sm:p-3 auto-rows-fr`}
      role="region"
      aria-label={`Video call with ${participantCount} ${
        participantCount === 1 ? "participant" : "participants"
      }`}
    >
      {participants.map((peer) => (
        <div
          key={peer.userId}
          className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden shadow-lg animate-fade-in min-h-[150px]"
        >
          <RemoteVideo
            stream={peer.stream}
            username={peer.username}
            onStreamEnded={() => handleStreamEnded(peer.userId)}
          />
        </div>
      ))}
    </div>
  );
};
