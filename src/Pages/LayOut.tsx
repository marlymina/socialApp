import { useEffect } from "react";
import Footer from "../Components/Footer";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../Components/Navbar";
import { useAuth } from "../Context/useAuth";

const pageTitles: Record<string, string> = {
  "/feed": "Feed",
  "/profile": "Profile",
  "/notifications": "Notifications",
  "/login": "Login",
  "/register": "Register",
};

export default function LayOut() {
  const { token } = useAuth();
  const { pathname } = useLocation();

  useEffect(() => {
    const cleanPath =
      pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
    const title = pageTitles[cleanPath] || "Not Found";
    document.title = `${title} | Social App`;
  }, [pathname]);

  return (
    <>
      {token && <Navbar />}

      <main className="mx-auto container">
        <Outlet></Outlet>
      </main>

      <Footer />
    </>
  );
}
