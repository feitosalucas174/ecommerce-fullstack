"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { User } from "@/types";
import api from "@/services/api";
import { LoginModal } from "@/components/LoginModal";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (data: RegisterPayload) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  openLoginModal: () => void;
}

interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  password2: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  address?: string;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const openLoginModal = useCallback(() => setLoginModalOpen(true), []);

  // Helpers para sincronizar cookies (lidos pelo middleware) com localStorage
  const setCookies = (access: string, user: User) => {
    const expires = new Date(Date.now() + 60 * 60 * 1000).toUTCString(); // 1h
    document.cookie = `access_token=${access}; path=/; expires=${expires}; SameSite=Lax`;
    document.cookie = `user=${encodeURIComponent(JSON.stringify(user))}; path=/; expires=${expires}; SameSite=Lax`;
  };

  const clearCookies = () => {
    document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  };

  // Restore session from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("user");
    const access = localStorage.getItem("access_token");
    if (stored && access) {
      try {
        const parsedUser = JSON.parse(stored);
        setUser(parsedUser);
        setCookies(access, parsedUser); // sync cookie for middleware
      } catch {
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const { data } = await api.post("/auth/login/", { username, password });
    localStorage.setItem("access_token", data.access);
    localStorage.setItem("refresh_token", data.refresh);
    localStorage.setItem("user", JSON.stringify(data.user));
    setCookies(data.access, data.user);
    setUser(data.user);
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    await api.post("/auth/register/", payload);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    clearCookies();
    setUser(null);
  }, []);

  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, isAdmin, openLoginModal }}>
      {children}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLogin={login}
      />
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
