import { Header } from "../components/Header";
import { ChatContainer } from "../components/ChatContainer";
import { OnlineUsersList } from "../components/OnlineUsersList";
import { VideoCallContainer } from "../components/VideoCallContainer";
import { ConnectionStatus } from "../components/ConnectionStatus";

export const ChatroomPage = () => {
  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Connection status indicator */}
      <ConnectionStatus />

      {/* Header with logout functionality */}
      <Header />

      {/* Main content area */}
      <main className="flex-1 overflow-hidden" role="main">
        <div className="h-full max-w-[1920px] mx-auto px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4">
          {/* Responsive layout: stacked on mobile, side-by-side on desktop */}
          <div className="h-full flex flex-col lg:flex-row gap-2 sm:gap-3 lg:gap-4">
            {/* Left section: Chat and Users */}
            <div className="flex-1 flex flex-col lg:flex-row gap-2 sm:gap-3 lg:gap-4 min-h-0">
              {/* Chat section */}
              <div
                className="flex-1 bg-white shadow-lg rounded-lg overflow-hidden transition-shadow duration-200 hover:shadow-xl"
                role="region"
                aria-label="Chat messages"
              >
                <ChatContainer />
              </div>

              {/* Online users section - hidden on mobile, visible on tablet+ */}
              <div
                className="hidden md:block md:w-64 lg:w-72 xl:w-80 bg-white shadow-lg rounded-lg overflow-hidden transition-shadow duration-200 hover:shadow-xl"
                role="complementary"
                aria-label="Online users"
              >
                <OnlineUsersList />
              </div>
            </div>

            {/* Right section: Video calls - takes full width on mobile, fixed width on desktop */}
            <div
              className="w-full lg:w-96 xl:w-[28rem] bg-white shadow-lg rounded-lg overflow-hidden min-h-[300px] lg:min-h-0 transition-shadow duration-200 hover:shadow-xl"
              role="region"
              aria-label="Video call"
            >
              <VideoCallContainer />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
