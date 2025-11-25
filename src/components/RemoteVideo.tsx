import { useEffect, useRef, useState } from "react";

interface RemoteVideoProps {
  stream: MediaStream | null;
  username: string;
  onStreamEnded?: () => void;
}

export const RemoteVideo: React.FC<RemoteVideoProps> = ({
  stream,
  username,
  onStreamEnded,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasVideo, setHasVideo] = useState(true);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;

      // Check if stream has video tracks
      const videoTracks = stream.getVideoTracks();
      setHasVideo(videoTracks.length > 0 && videoTracks[0].enabled);

      // Listen for track changes
      const handleTrackEnded = () => {
        if (onStreamEnded) {
          onStreamEnded();
        }
      };

      stream.getTracks().forEach((track) => {
        track.addEventListener("ended", handleTrackEnded);
      });

      // Monitor video track enabled state
      const checkVideoState = setInterval(() => {
        const videoTracks = stream.getVideoTracks();
        setHasVideo(videoTracks.length > 0 && videoTracks[0].enabled);
      }, 500);

      return () => {
        clearInterval(checkVideoState);
        stream.getTracks().forEach((track) => {
          track.removeEventListener("ended", handleTrackEnded);
        });
      };
    }
  }, [stream, onStreamEnded]);

  return (
    <div
      className="relative w-full h-full bg-gray-900 rounded-lg overflow-hidden shadow-lg"
      role="region"
      aria-label={`Video feed from ${username}`}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          !hasVideo ? "hidden" : ""
        }`}
        aria-hidden={!hasVideo}
      />

      {!hasVideo && stream && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 animate-fade-in">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-2 bg-gray-700 rounded-full flex items-center justify-center shadow-md">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <p className="text-gray-400 text-sm font-medium">{username}</p>
            <p className="text-gray-500 text-xs mt-1">Camera off</p>
          </div>
        </div>
      )}

      <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 px-3 py-1 rounded-md text-white text-sm font-medium backdrop-blur-sm shadow-md">
        {username}
      </div>

      {!stream && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 animate-fade-in">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-3"></div>
            <p className="text-gray-400 text-sm font-medium">
              Connecting to {username}...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
