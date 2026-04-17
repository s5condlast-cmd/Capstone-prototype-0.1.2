"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "@/lib/ThemeContext";
import { logout, User } from "@/lib/auth";
import { useRouter } from "next/navigation";

interface TopbarProps {
  session: User | null;
  title: string;
}

export default function Topbar({ session, title }: TopbarProps) {
  const router = useRouter();
  const { darkMode, setDarkMode } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const initials = session?.name ? session.name.split(' ').slice(0, 2).map(n => n[0]).join('') : '?';

  return (
    <header className="h-20 glass sticky top-0 z-40 flex items-center justify-between px-8 border-b border-border transition-all duration-300">
      <h2 className="text-xl font-black text-foreground tracking-tight">{title}</h2>

      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all duration-200"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {darkMode ? (
              <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            ) : (
              <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            )}
          </svg>
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all duration-200 relative"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary ring-2 ring-background animate-pulse" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 glass rounded-2xl shadow-2xl border border-white/10 overflow-hidden animate-in">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <span className="font-bold text-sm">Notifications</span>
                <button className="text-xs text-primary font-bold hover:underline">Mark all read</button>
              </div>
              <div className="max-h-80 overflow-y-auto p-2 space-y-1">
                <div className="p-3 rounded-xl hover:bg-primary/5 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <div>
                      <p className="text-sm font-semibold group-hover:text-primary transition-colors">Journal entry approved</p>
                      <p className="text-xs text-muted-foreground">2 hours ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 p-1.5 pl-3 rounded-xl border border-border hover:bg-primary/5 transition-all duration-200"
          >
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-foreground leading-none">{session?.name?.split(' ')[0] || 'User'}</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{session?.role || 'Guest'}</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-white font-black text-sm shadow-md shadow-primary/20">
              {initials}
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-3 w-56 glass rounded-2xl shadow-2xl border border-white/10 overflow-hidden animate-in">
              <div className="p-4 border-b border-border">
                <p className="text-sm font-bold truncate">{session?.name || 'User Name'}</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest truncate">{session?.email || 'email@example.com'}</p>
              </div>
              <div className="p-2 space-y-1">
                <button 
                  onClick={() => router.push("/profile")}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-muted-foreground hover:bg-primary/5 hover:text-primary transition-all duration-200"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profile Settings
                </button>
                <div className="h-px bg-border my-1 mx-2" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-bold text-destructive hover:bg-destructive/10 transition-all duration-200"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
