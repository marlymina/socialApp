import { ReactNode, useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext";

export default function AuthRoute({ children }: { children: ReactNode }) {
  const { userToken } = useContext(AuthContext);

  if (userToken) {
    return <Navigate to="/feed" replace />;
  }

  return <>{children}</>;
}
