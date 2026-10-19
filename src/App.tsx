import { createHashRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { HelmetProvider } from "react-helmet-async";
import { useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import Layout from "./Components/Layout";
import ProtectedRoute from "./Components/ProtectedRoute";
import ProtectedAuthRoute from "./Components/ProtectedAuthRoute";
import Home from "./Pages/Home";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Profile from "./Pages/Profile";
import PostDetails from "./Pages/PostDetails";
import Notifications from "./Pages/Notifications";
import ChangePassword from "./Pages/ChangePassword";
import Community from "./Pages/Community";
import NotFound from "./Pages/NotFound";
import { AuthProvider } from "./Context/AuthProvider";
import { CounterProvider } from "./Context/CounterContext";
import "./App.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 30000 },
  },
});

function NetworkStatus() {
  useEffect(() => {
    function offline() {
      toast.error("You are offline. Check your internet connection.", {
        id: "network-status",
      });
    }
    function online() {
      toast.success("Connection restored", { id: "network-status" });
    }
    window.addEventListener("offline", offline);
    window.addEventListener("online", online);
    return () => {
      window.removeEventListener("offline", offline);
      window.removeEventListener("online", online);
    };
  }, []);
  return null;
}

const router = createHashRouter([
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        element: <Layout />,
        children: [
          { index: true, element: <Home /> },
          { path: "profile", element: <Profile /> },
          { path: "community", element: <Community /> },
          { path: "profile/:userId", element: <Profile /> },
          { path: "posts/:postId", element: <PostDetails /> },
          { path: "notifications", element: <Notifications /> },
          { path: "change-password", element: <ChangePassword /> },
          { path: "settings", element: <ChangePassword /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedAuthRoute />,
    children: [
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
    ],
  },
  { path: "*", element: <NotFound /> },
]);

export default function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CounterProvider>
            <NetworkStatus />
            <Toaster position="top-right" />
            <RouterProvider router={router} />
            <ReactQueryDevtools initialIsOpen={false} />
          </CounterProvider>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}
