import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useApp } from "../context/AppContext";
import ToastViewport from "../components/ToastViewport";
import GlobalSearch from "../components/GlobalSearch";

const navItems = [
  { to: "/", label: "Overview" },
  { to: "/marketplace", label: "Projects" },
  { to: "/chat", label: "Chat" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/learning", label: "Learning" },
  { to: "/internships", label: "Internships" }
];

export default function AppLayout({ children }) {
  const { demoMode, toggleDemoMode, currentUser, logout, toasts } = useApp();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <ToastViewport toasts={toasts} />
      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-xl font-semibold tracking-wide text-white">
              FreelanceFlow
            </Link>
            <nav className="hidden gap-2 md:flex">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `rounded-full px-4 py-2 text-sm ${isActive ? "bg-teal-500 text-slate-950" : "text-slate-300 hover:bg-white/5"}`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              {currentUser?.role === "admin" && (
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    `rounded-full px-4 py-2 text-sm font-semibold ${isActive ? "bg-indigo-500 text-white" : "text-indigo-400 hover:bg-indigo-500/10"}`
                  }
                >
                  Admin
                </NavLink>
              )}
            </nav>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="group flex items-center justify-center rounded-full p-2.5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
              aria-label="Open search"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button
              onClick={toggleDemoMode}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                demoMode ? "bg-amber-400 text-slate-950" : "border border-white/10 bg-white/5 text-slate-100"
              }`}
            >
              Demo Mode: {demoMode ? "On" : "Off"}
            </button>
            {currentUser ? (
              <>
                <div className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300">
                  {currentUser.name} · {currentUser.role}
                </div>
                <button onClick={logout} className="rounded-full bg-white/5 px-4 py-2 text-sm text-slate-200">
                  Logout
                </button>
              </>
            ) : (
              <Link to="/auth" className="rounded-full bg-teal-500 px-4 py-2 text-sm font-semibold text-slate-950">
                Login
              </Link>
            )}
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
