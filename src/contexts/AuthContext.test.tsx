import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "./AuthContext";
import type { ReactNode } from "react";

// Mock fetch
globalThis.fetch = vi.fn();

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe("AuthContext", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Reset fetch mock
    vi.clearAllMocks();
  });

  describe("Initial state", () => {
    it("should initialize with no user and not authenticated", () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it("should load user and token from localStorage on mount", async () => {
      const mockUser = {
        id: "1",
        username: "testuser",
        email: "test@example.com",
      };
      const mockToken = "test-token";

      localStorage.setItem("authToken", mockToken);
      localStorage.setItem("authUser", JSON.stringify(mockUser));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.token).toBe(mockToken);
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  describe("Login", () => {
    it("should update state and store token on successful login", async () => {
      const mockUser = {
        id: "1",
        username: "testuser",
        email: "test@example.com",
      };
      const mockToken = "auth-token-123";

      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: mockToken, user: mockUser }),
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.login("test@example.com", "password123");
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.token).toBe(mockToken);
      expect(result.current.isAuthenticated).toBe(true);
      expect(localStorage.getItem("authToken")).toBe(mockToken);
      expect(localStorage.getItem("authUser")).toBe(JSON.stringify(mockUser));
    });

    it("should throw error on failed login", async () => {
      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: false,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await expect(
        act(async () => {
          await result.current.login("test@example.com", "wrongpassword");
        })
      ).rejects.toThrow("Authentication failed");

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe("Register", () => {
    it("should update state and store token on successful registration", async () => {
      const mockUser = {
        id: "2",
        username: "newuser",
        email: "new@example.com",
      };
      const mockToken = "new-auth-token";

      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: mockToken, user: mockUser }),
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.register(
          "newuser",
          "new@example.com",
          "password123"
        );
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.token).toBe(mockToken);
      expect(result.current.isAuthenticated).toBe(true);
      expect(localStorage.getItem("authToken")).toBe(mockToken);
      expect(localStorage.getItem("authUser")).toBe(JSON.stringify(mockUser));
    });

    it("should throw error on failed registration", async () => {
      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: false,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await expect(
        act(async () => {
          await result.current.register(
            "newuser",
            "new@example.com",
            "password"
          );
        })
      ).rejects.toThrow("Registration failed");

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe("Logout", () => {
    it("should clear user state and remove token from storage", async () => {
      const mockUser = {
        id: "1",
        username: "testuser",
        email: "test@example.com",
      };
      const mockToken = "auth-token-123";

      localStorage.setItem("authToken", mockToken);
      localStorage.setItem("authUser", JSON.stringify(mockUser));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(true);

      act(() => {
        result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(localStorage.getItem("authToken")).toBeNull();
      expect(localStorage.getItem("authUser")).toBeNull();
    });
  });

  describe("Token storage", () => {
    it("should persist token and user data in localStorage", async () => {
      const mockUser = {
        id: "1",
        username: "testuser",
        email: "test@example.com",
      };
      const mockToken = "persistent-token";

      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: mockToken, user: mockUser }),
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.login("test@example.com", "password123");
      });

      expect(localStorage.getItem("authToken")).toBe(mockToken);
      expect(JSON.parse(localStorage.getItem("authUser")!)).toEqual(mockUser);
    });

    it("should retrieve token and user data from localStorage on initialization", async () => {
      const mockUser = {
        id: "1",
        username: "testuser",
        email: "test@example.com",
      };
      const mockToken = "stored-token";

      localStorage.setItem("authToken", mockToken);
      localStorage.setItem("authUser", JSON.stringify(mockUser));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.token).toBe(mockToken);
      expect(result.current.user).toEqual(mockUser);
    });
  });
});
