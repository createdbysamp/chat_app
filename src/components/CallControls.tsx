interface CallControlsProps {
  isInCall: boolean;
  isAudioMuted: boolean;
  isVideoDisabled: boolean;
  onStartCall: () => void;
  onEndCall: () => void;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  disabled?: boolean;
}

export const CallControls: React.FC<CallControlsProps> = ({
  isInCall,
  isAudioMuted,
  isVideoDisabled,
  onStartCall,
  onEndCall,
  onToggleAudio,
  onToggleVideo,
  disabled = false,
}) => {
  return (
    <div
      className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gray-800 rounded-lg"
      role="toolbar"
      aria-label="Video call controls"
    >
      {!isInCall ? (
        <button
          onClick={onStartCall}
          disabled={disabled}
          className="flex items-center gap-2 px-4 sm:px-6 py-3 bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
          aria-label="Start video call"
        >
          <svg
            className="w-5 h-5"
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
          <span className="hidden sm:inline">Start Call</span>
          <span className="sm:hidden">Start</span>
        </button>
      ) : (
        <>
          <button
            onClick={onToggleAudio}
            disabled={disabled}
            className={`p-3 sm:p-4 rounded-full transition-all duration-200 shadow-md hover:shadow-lg ${
              isAudioMuted
                ? "bg-red-600 hover:bg-red-700 active:bg-red-800"
                : "bg-gray-700 hover:bg-gray-600 active:bg-gray-500"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title={isAudioMuted ? "Unmute microphone" : "Mute microphone"}
            aria-label={isAudioMuted ? "Unmute microphone" : "Mute microphone"}
            aria-pressed={isAudioMuted}
          >
            {isAudioMuted ? (
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-white"
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
            ) : (
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            )}
          </button>

          <button
            onClick={onToggleVideo}
            disabled={disabled}
            className={`p-3 sm:p-4 rounded-full transition-all duration-200 shadow-md hover:shadow-lg ${
              isVideoDisabled
                ? "bg-red-600 hover:bg-red-700 active:bg-red-800"
                : "bg-gray-700 hover:bg-gray-600 active:bg-gray-500"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title={isVideoDisabled ? "Enable camera" : "Disable camera"}
            aria-label={isVideoDisabled ? "Enable camera" : "Disable camera"}
            aria-pressed={isVideoDisabled}
          >
            {isVideoDisabled ? (
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-white"
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
            ) : (
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-white"
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
            )}
          </button>

          <button
            onClick={onEndCall}
            disabled={disabled}
            className="flex items-center gap-2 px-4 sm:px-6 py-3 bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
            aria-label="End video call"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z"
              />
            </svg>
            <span className="hidden sm:inline">End Call</span>
            <span className="sm:hidden">End</span>
          </button>
        </>
      )}
    </div>
  );
};
