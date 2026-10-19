import { createContext } from "react";
import type { User } from "../Interfaces/User";

export interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  setAuth: (token: string, user?: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);