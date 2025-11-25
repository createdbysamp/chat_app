import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ChatroomPage } from "./pages/ChatroomPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ToastContainer } from "./components/ToastContainer";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { socketService } from "./services/socketService";
import { webrtcService } from "./services/webrtcService";

// Mock fetch for authentication
globalThis.fetch = vi.fn();

// Mock socket.io-client
vi.mock("socket.io-client", () => ({
  io: vi.fn(() => ({
    connected: false,
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(),
    removeAllListeners: vi.fn(),
  })),
}));

// Mock WebRTC APIs
const mockGetUserMedia = vi.fn();
const mockRTCPeerConnection = vi.fn();

Object.defineProperty(global.navigator, "mediaDevices", {
  value: {
    getUserMedia: mockGetUserMedia,
  },
  writable: true,
});

(global as any).RTCPeerConnection = mockRTCPeerConnection;
(global as any).RTCSessionDescription = class RTCSessionDescription {
  constructor(public init: any) {}
};
(global as any).RTCIceCandidate = class RTCIceCandidate {
  constructor(public init: any) {}
};

// Helper to render app with routing
const renderApp = (initialRoute: string) => {
  return render(
    <ErrorBoundary>
      <MemoryRouter initialEntries={[initialRoute]}>
        <ToastProvider>
          <AuthProvider>
            <ToastContainer />
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route
                path="/chatroom"
                element={
                  <ProtectedRoute>
                    <ChatroomPage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </AuthProvider>
        </ToastProvider>
      </MemoryRouter>
    </ErrorBoundary>
  );
};

describe("Integration Tests - Core Flows", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();

    // Setup default mock implementations
    mockGetUserMedia.mockResolvedValue({
      getTracks: () => [],
      getAudioTracks: () => [],
      getVideoTracks: () => [],
    });

    mockRTCPeerConnection.mockImplementation(() => ({
      addTrack: vi.fn(),
      createOffer: vi.fn().mockResolvedValue({}),
      createAnswer: vi.fn().mockResolvedValue({}),
      setLocalDescription: vi.fn().mockResolvedValue(undefined),
      setRemoteDescription: vi.fn().mockResolvedValue(undefined),
      addIceCandidate: vi.fn().mockResolvedValue(undefined),
      close: vi.fn(),
      onicecandidate: null,
      ontrack: null,
      onconnectionstatechange: null,
      connectionState: "new",
    }));
  });

  afterEach(() => {
    socketService.disconnect();
    webrtcService.cleanup();
  });

  describe("Authentication Flow", () => {
    it("should complete register → login → access chatroom flow", async () => {
      const user = userEvent.setup();

      // Mock successful registration
      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          token: "register-token",
          user: { id: "1", username: "newuser", email: "new@test.com" },
        }),
      });

      renderApp("/register");

      // Fill registration form
      const usernameInput = screen.getByLabelText(/username/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await user.type(usernameInput, "newuser");
      await user.type(emailInput, "new@test.com");
      await user.type(passwordInput, "password123");

      // Submit registration
      const registerButton = screen.getByRole("button", {
        name: /sign up|register|create account/i,
      });
      await user.click(registerButton);

      // Should redirect to chatroom after successful registration
      await waitFor(() => {
        expect(screen.queryByText(/create account/i)).not.toBeInTheDocument();
      });

      // Verify token is stored
      expect(localStorage.getItem("authToken")).toBe("register-token");
      expect(JSON.parse(localStorage.getItem("authUser")!)).toEqual({
        id: "1",
        username: "newuser",
        email: "new@test.com",
      });
    });

    it("should complete login flow and access chatroom", async () => {
      const user = userEvent.setup();

      // Mock successful login
      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          token: "login-token",
          user: { id: "2", username: "testuser", email: "test@test.com" },
        }),
      });

      renderApp("/login");

      // Fill login form
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await user.type(emailInput, "test@test.com");
      await user.type(passwordInput, "password123");

      // Submit login
      const loginButton = screen.getByRole("button", {
        name: /sign in|login/i,
      });
      await user.click(loginButton);

      // Should redirect to chatroom
      await waitFor(() => {
        expect(screen.queryByText(/welcome back/i)).not.toBeInTheDocument();
      });

      // Verify authentication state
      expect(localStorage.getItem("authToken")).toBe("login-token");
    });

    it("should redirect authenticated users from login to chatroom", async () => {
      // Set up authenticated state
      localStorage.setItem("authToken", "existing-token");
      localStorage.setItem(
        "authUser",
        JSON.stringify({
          id: "3",
          username: "authuser",
          email: "auth@test.com",
        })
      );

      renderApp("/login");

      // Should automatically redirect to chatroom
      await waitFor(() => {
        expect(screen.queryByText(/welcome back/i)).not.toBeInTheDocument();
      });
    });
  });

  describe("Message Sending and Receiving", () => {
    beforeEach(() => {
      // Set up authenticated state
      localStorage.setItem("authToken", "test-token");
      localStorage.setItem(
        "authUser",
        JSON.stringify({
          id: "1",
          username: "testuser",
          email: "test@test.com",
        })
      );
    });

    it("should send and display messages", async () => {
      const user = userEvent.setup();
      const mockEmit = vi.fn();

      // Mock socket service
      vi.spyOn(socketService, "emit").mockImplementation(mockEmit);
      vi.spyOn(socketService, "isConnected").mockReturnValue(true);

      renderApp("/chatroom");

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/type a message/i)
        ).toBeInTheDocument();
      });

      // Type and send a message
      const messageInput = screen.getByPlaceholderText(/type a message/i);
      await user.type(messageInput, "Hello, world!");

      const sendButton = screen.getByRole("button", { name: /send/i });
      await user.click(sendButton);

      // Verify message was emitted
      expect(mockEmit).toHaveBeenCalledWith("message:send", {
        content: "Hello, world!",
      });

      // Verify input is cleared
      expect(messageInput).toHaveValue("");
    });

    it("should receive and display incoming messages", async () => {
      let messageHandler: any;

      vi.spyOn(socketService, "on").mockImplementation((event, handler) => {
        if (event === "message:received") {
          messageHandler = handler;
        }
      });

      renderApp("/chatroom");

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/type a message/i)
        ).toBeInTheDocument();
      });

      // Simulate receiving a message
      if (messageHandler) {
        messageHandler({
          id: "msg-1",
          senderId: "user-2",
          senderUsername: "otheruser",
          content: "Hello from another user!",
          timestamp: new Date().toISOString(),
        });
      }

      // Verify message is displayed
      await waitFor(() => {
        expect(
          screen.getByText("Hello from another user!")
        ).toBeInTheDocument();
        expect(screen.getByText("otheruser")).toBeInTheDocument();
      });
    });
  });

  describe("User Presence Updates", () => {
    beforeEach(() => {
      localStorage.setItem("authToken", "test-token");
      localStorage.setItem(
        "authUser",
        JSON.stringify({
          id: "1",
          username: "testuser",
          email: "test@test.com",
        })
      );
    });

    it("should update online users list when users join", async () => {
      let userJoinedHandler: any;
      let onlineUsersHandler: any;

      vi.spyOn(socketService, "on").mockImplementation((event, handler) => {
        if (event === "user:joined") {
          userJoinedHandler = handler;
        } else if (event === "online:users") {
          onlineUsersHandler = handler;
        }
      });

      renderApp("/chatroom");

      // Wait for chatroom to load
      await waitFor(() => {
        expect(screen.getByRole("main")).toBeInTheDocument();
      });

      // Simulate initial online users list
      if (onlineUsersHandler) {
        onlineUsersHandler({
          users: [
            { id: "1", username: "testuser" },
            { id: "2", username: "user2" },
          ],
        });
      }

      await waitFor(() => {
        expect(screen.getByText("user2")).toBeInTheDocument();
      });

      // Simulate a new user joining
      if (userJoinedHandler) {
        userJoinedHandler({
          userId: "3",
          username: "newuser",
        });
      }

      await waitFor(() => {
        expect(screen.getByText("newuser")).toBeInTheDocument();
      });
    });

    it("should update online users list when users leave", async () => {
      let userLeftHandler: any;
      let onlineUsersHandler: any;

      vi.spyOn(socketService, "on").mockImplementation((event, handler) => {
        if (event === "user:left") {
          userLeftHandler = handler;
        } else if (event === "online:users") {
          onlineUsersHandler = handler;
        }
      });

      renderApp("/chatroom");

      // Wait for chatroom to load
      await waitFor(() => {
        expect(screen.getByRole("main")).toBeInTheDocument();
      });

      // Set initial users
      if (onlineUsersHandler) {
        onlineUsersHandler({
          users: [
            { id: "1", username: "testuser" },
            { id: "2", username: "leavinguser" },
          ],
        });
      }

      await waitFor(() => {
        expect(screen.getByText("leavinguser")).toBeInTheDocument();
      });

      // Simulate user leaving
      if (userLeftHandler) {
        userLeftHandler({
          userId: "2",
          username: "leavinguser",
        });
      }

      await waitFor(() => {
        expect(screen.queryByText("leavinguser")).not.toBeInTheDocument();
      });
    });
  });

  describe("Video Call Initiation and Controls", () => {
    beforeEach(() => {
      localStorage.setItem("authToken", "test-token");
      localStorage.setItem(
        "authUser",
        JSON.stringify({
          id: "1",
          username: "testuser",
          email: "test@test.com",
        })
      );
    });

    it("should initiate video call and request media permissions", async () => {
      const user = userEvent.setup();
      const mockStream = {
        getTracks: () => [{ kind: "video" }, { kind: "audio" }],
        getAudioTracks: () => [{ enabled: true }],
        getVideoTracks: () => [{ enabled: true }],
      };

      mockGetUserMedia.mockResolvedValue(mockStream);

      renderApp("/chatroom");

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /start call/i })
        ).toBeInTheDocument();
      });

      // Click start call button
      const startCallButton = screen.getByRole("button", {
        name: /start call/i,
      });
      await user.click(startCallButton);

      // Verify getUserMedia was called
      await waitFor(() => {
        expect(mockGetUserMedia).toHaveBeenCalledWith({
          audio: true,
          video: true,
        });
      });
    });

    it("should toggle audio mute during call", async () => {
      const user = userEvent.setup();
      const mockAudioTrack = { enabled: true };
      const mockStream = {
        getTracks: () => [mockAudioTrack],
        getAudioTracks: () => [mockAudioTrack],
        getVideoTracks: () => [],
      };

      mockGetUserMedia.mockResolvedValue(mockStream);

      renderApp("/chatroom");

      // Start call first
      const startCallButton = screen.getByRole("button", {
        name: /start call/i,
      });
      await user.click(startCallButton);

      await waitFor(() => {
        expect(mockGetUserMedia).toHaveBeenCalled();
      });

      // Find and click mute button
      const muteButton = screen.getByRole("button", { name: /mute|unmute/i });
      await user.click(muteButton);

      // Verify audio track was disabled
      await waitFor(() => {
        expect(mockAudioTrack.enabled).toBe(false);
      });
    });

    it("should toggle video during call", async () => {
      const user = userEvent.setup();
      const mockVideoTrack = { enabled: true };
      const mockStream = {
        getTracks: () => [mockVideoTrack],
        getAudioTracks: () => [],
        getVideoTracks: () => [mockVideoTrack],
      };

      mockGetUserMedia.mockResolvedValue(mockStream);

      renderApp("/chatroom");

      // Start call
      const startCallButton = screen.getByRole("button", {
        name: /start call/i,
      });
      await user.click(startCallButton);

      await waitFor(() => {
        expect(mockGetUserMedia).toHaveBeenCalled();
      });

      // Find and click video toggle button
      const videoButton = screen.getByRole("button", { name: /video|camera/i });
      await user.click(videoButton);

      // Verify video track was disabled
      await waitFor(() => {
        expect(mockVideoTrack.enabled).toBe(false);
      });
    });

    it("should end call and cleanup resources", async () => {
      const user = userEvent.setup();
      const mockTrack = { stop: vi.fn(), enabled: true };
      const mockStream = {
        getTracks: () => [mockTrack],
        getAudioTracks: () => [mockTrack],
        getVideoTracks: () => [mockTrack],
      };

      mockGetUserMedia.mockResolvedValue(mockStream);

      renderApp("/chatroom");

      // Start call
      const startCallButton = screen.getByRole("button", {
        name: /start call/i,
      });
      await user.click(startCallButton);

      await waitFor(() => {
        expect(mockGetUserMedia).toHaveBeenCalled();
      });

      // End call
      const endCallButton = screen.getByRole("button", { name: /end call/i });
      await user.click(endCallButton);

      // Verify tracks were stopped
      await waitFor(() => {
        expect(mockTrack.stop).toHaveBeenCalled();
      });
    });
  });
});
