import { useEffect, useRef } from "react";

interface LocalVideoProps {
  stream: MediaStream | null;
  isAudioMuted: boolean;
  isVideoDisabled: boolean;
  onPermissionError?: (error: Error) => void;
}

export const LocalVideo: React.FC<LocalVideoProps> = ({
  stream,
  isAudioMuted,
  isVideoDisabled,
  onPermissionError,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    // Handle permission errors
    if (stream) {
      const videoTracks = stream.getVideoTracks();
      const audioTracks = stream.getAudioTracks();

      videoTracks.forEach((track) => {
        track.addEventListener("ended", () => {
          if (onPermissionError) {
            onPermissionError(
              new Error("Video track ended - permission may have been revoked")
            );
          }
        });
      });

      audioTracks.forEach((track) => {
        track.addEventListener("ended", () => {
          if (onPermissionError) {
            onPermissionError(
              new Error("Audio track ended - permission may have been revoked")
            );
          }
        });
      });
    }
  }, [stream, onPermissionError]);

  return (
    <div
      className="relative w-full h-full bg-gray-900 rounded-lg overflow-hidden shadow-lg"
      role="region"
      aria-label="Your video feed"
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isVideoDisabled ? "hidden" : ""
        }`}
        aria-hidden={isVideoDisabled}
      />

      {isVideoDisabled && (
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
            <p className="text-gray-400 text-sm font-medium">Camera Off</p>
          </div>
        </div>
      )}

      <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 px-3 py-1 rounded-md text-white text-sm font-medium backdrop-blur-sm">
        You
      </div>

      <div
        className="absolute top-2 right-2 flex gap-2"
        role="status"
        aria-label="Video status indicators"
      >
        {isAudioMuted && (
          <div
            className="bg-red-600 p-1.5 rounded-full shadow-md animate-fade-in"
            title="Microphone muted"
            aria-label="Microphone is muted"
          >
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
              />
            </svg>
          </div>
        )}

        {isVideoDisabled && (
          <div
            className="bg-red-600 p-1.5 rounded-full shadow-md animate-fade-in"
            title="Camera disabled"
            aria-label="Camera is disabled"
          >
            <svg
              className="w-4 h-4 text-white"
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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3l18 18"
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};
