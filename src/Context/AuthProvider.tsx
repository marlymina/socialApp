import { useCallback, useEffect, useState, type ReactNode } from "react";
import type { User } from "../Interfaces/User";
import { getProfile } from "../Services/auth.service";
import { AuthContext } from "./AuthContext";

function readSavedUser(): User | null {
  try {
    const saved = localStorage.getItem("user");
    return saved ? (JSON.parse(saved) as User) : null;
  } catch {
    localStorage.removeItem("user");
    return null;
  }
}

interface ProfileResponse {
  data?: User & { user?: User };
  user?: User;
}

function extractProfile(response: unknown): User {
  const res = response as ProfileResponse | undefined;
  return (res?.data?.user ?? res?.data ?? res?.user ?? response) as User;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token"),
  );
  const [user, setUser] = useState<User | null>(readSavedUser);
  const [loading, setLoading] = useState<boolean>(
    Boolean(localStorage.getItem("token")),
  );

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!localStorage.getItem("token")) return;
    try {
      const response = await getProfile();
      const profile = extractProfile(response);
      setUser(profile);
      localStorage.setItem("user", JSON.stringify(profile));
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  const setAuth = useCallback((newToken: string, newUser?: User) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    if (newUser) {
      localStorage.setItem("user", JSON.stringify(newUser));
      setUser(newUser);
    }
  }, []);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;
    getProfile()
      .then((response) => {
        if (cancelled) return;
        const profile = extractProfile(response);
        setUser(profile);
        localStorage.setItem("user", JSON.stringify(profile));
      })
      .catch(() => {
        if (!cancelled) logout(); 
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token, logout]);

  return (
    <AuthContext.Provider
      value={{ user, token, loading, setAuth, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}
