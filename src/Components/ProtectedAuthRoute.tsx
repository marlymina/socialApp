import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../Context/useAuth";

export default function ProtectedAuthRoute() {
  const { token, loading } = useAuth();
  if (loading) return <div className="page-loading">Loading...</div>;
  return token ? <Navigate to="/" replace /> : <Outlet />;
}
