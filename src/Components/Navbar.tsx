import { useEffect, useRef, useState } from "react";
import {
  Bell,
  ChevronDown,
  House,
  LogOut,
  Settings,
  UserRound,
} from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/useAuth";
import toast from "react-hot-toast";
import { TbWorld } from "react-icons/tb";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  function goTo(path: string) {
    setMenuOpen(false);
    navigate(path);
  }

  function handleLogout() {
    setMenuOpen(false);
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  }

  return (
    <header className="topbar">
      <Link to="/" className="brand">
        <span className="brand-icon ">
          <TbWorld className="text-2xl" />
        </span>
        <span>Social App</span>
      </Link>
      <nav className="top-links">
        <NavLink to="/">
          <House size={20} /> Feed
        </NavLink>
        <NavLink to="/profile">
          <UserRound size={20} /> Profile
        </NavLink>
        <NavLink to="/notifications">
          <Bell size={20} /> Notifications
        </NavLink>
      </nav>
      <div className="post-menu-wrap" ref={menuRef}>
        <button
          type="button"
          className="account-menu bg-transparent cursor-pointer"
          onClick={() => setMenuOpen((value) => !value)}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
        >
          <img
            src={
              user?.photo ||
              user?.image ||
              "https://ui-avatars.com/api/?name=Route+User&background=0b3b9c&color=fff"
            }
            alt="Profile"
          />
          <span>
            {user?.name || user?.userName || user?.username || "My Account"}
          </span>
          <ChevronDown
            size={16}
            className={menuOpen ? "rotate-180 transition" : "transition"}
          />
        </button>
        {menuOpen && (
          <div className="dropdown-menu" style={{ top: 58, minWidth: 190 }}>
            <button
              type="button"
              className="flex items-center gap-2"
              onClick={() => goTo("/profile")}
            >
              <UserRound size={16} /> Profile
            </button>
            <button
              type="button"
              className="flex items-center gap-2"
              onClick={() => goTo("/settings")}
            >
              <Settings size={16} /> Settings
            </button>
            <button
              type="button"
              className="dropdown-danger flex items-center gap-2"
              onClick={handleLogout}
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
