import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "../Interfaces/User";
import { getProfile } from "../Services/auth.service";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  setAuth: (token: string, user?: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) as User : null;
  });
  const [loading, setLoading] = useState(Boolean(localStorage.getItem("token")));

  async function refreshUser() {
    if (!localStorage.getItem("token")) return;
    try {
      const response = await getProfile();
      const profile = response?.data?.user ?? response?.data ?? response?.user ?? response;
      setUser(profile);
      localStorage.setItem("user", JSON.stringify(profile));
    } finally {
      setLoading(false);
    }
  }

  function setAuth(newToken: string, newUser?: User) {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    if (newUser) {
      localStorage.setItem("user", JSON.stringify(newUser));
      setUser(newUser);
    }
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  }

  useEffect(() => {
    if (token) refreshUser().catch(() => setLoading(false));
    else setLoading(false);
  }, []);

  return <AuthContext.Provider value={{ user, token, loading, setAuth, logout, refreshUser }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
