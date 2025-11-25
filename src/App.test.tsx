import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ChatroomPage } from "./pages/ChatroomPage";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Mock the AuthContext
vi.mock("./contexts/AuthContext", () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  useAuth: () => ({
    user: null,
    token: null,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    isAuthenticated: false,
    isLoading: false,
  }),
}));

// Mock the pages
vi.mock("./pages/LoginPage", () => ({
  LoginPage: () => <div>Login Page</div>,
}));

vi.mock("./pages/RegisterPage", () => ({
  RegisterPage: () => <div>Register Page</div>,
}));

vi.mock("./pages/ChatroomPage", () => ({
  ChatroomPage: () => <div>Chatroom Page</div>,
}));

// Helper to render routes with MemoryRouter
const renderWithRouter = (initialRoute: string) => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
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
    </MemoryRouter>
  );
};

describe("App Routing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects root path to login", () => {
    renderWithRouter("/");
    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  it("renders login page at /login", () => {
    renderWithRouter("/login");
    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  it("renders register page at /register", () => {
    renderWithRouter("/register");
    expect(screen.getByText("Register Page")).toBeInTheDocument();
  });

  it("redirects unknown routes to login", () => {
    renderWithRouter("/unknown-route");
    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });
});
