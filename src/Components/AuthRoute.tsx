import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../Context/useAuth";

export default function AuthRoute({ children }: { children: ReactNode }) {
  const { token, loading } = useAuth();

  if (loading) return <div className="page-loading">Loading...</div>;
  if (token) return <Navigate to="/" replace />;

  return <>{children}</>;
}
