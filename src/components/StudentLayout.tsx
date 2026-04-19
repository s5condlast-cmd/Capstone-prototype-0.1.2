"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getSession, logout, User } from "@/lib/auth";
import { useTheme } from "@/lib/ThemeContext";
import Link from "next/link";

interface Notification {
  id: string;
  type: "success" | "info" | "warning";
  message: string;
  time: string;
  read: boolean;
}

export default function StudentLayout({ children, activeNav }: { children: React.ReactNode, activeNav: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const { darkMode, setDarkMode } = useTheme();
  
  const [session, setSession] = useState<User | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const s = getSession();
    if (!s || s.role !== "student") {
      router.push("/login");
      return;
    }
    setSession(s);

    const rawSubs: any[] = JSON.parse(localStorage.getItem("practicum_submissions") || "[]");
    const mySubs = rawSubs.filter((sub) => sub.studentId === s.studentId);
    
    const notifs: Notification[] = [];
    mySubs.forEach((sub) => {
      if (sub.status === "approved") notifs.push({ id: sub.id + "-a", type: "success", message: `${sub.title} approved`, time: "Just now", read: false });
      else if (sub.status === "rejected") notifs.push({ id: sub.id + "-r", type: "warning", message: `${sub.title} rejected`, time: "Just now", read: false });
    });
    if (notifs.length === 0) {
      notifs.push({ id: "n1", type: "info", message: "Welcome to your dashboard!", time: "Just now", read: false });
    }
    setNotifications(notifs);
  }, [router]);

  if (!session) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  /* Messages REMOVED from navItems */
  const navItems = [
    { label: "Dashboard", key: "dashboard", href: "/dashboard", icon: "home" },
    { label: "Journal", key: "journal", href: "/journal", icon: "journal" },
    { label: "DTR", key: "dtr", href: "/dtr", icon: "clock" },
    { label: "MOA", key: "moa", href: "/moa", icon: "doc" },
    { label: "Evaluation", key: "evaluation", href: "/evaluation", icon: "chart" },
    { label: "Templates", key: "templates", href: "/templates", icon: "template" },
    { label: "Documents", key: "documents", href: "/documents", icon: "folder" },
  ];

  const renderIcon = (name: string, className = "w-5 h-5") => {
    const paths: Record<string, string> = {
      home: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
      journal: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
      clock: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
      doc: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
      chart: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
      folder: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z",
      template: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z",
    };
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={paths[name] || ""} />
      </svg>
    );
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 overflow-hidden">
      
      {/* ═══ SIDEBAR ═══ */}
      <aside className="w-64 flex-shrink-0 hidden md:flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-colors">
        <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-tight leading-none text-slate-900 dark:text-white">PRACTICUM</h1>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">System</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <div className="px-3 mb-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Menu</div>
          {navItems.map((item) => {
            const isActive = item.key === activeNav;
            return (
              <Link
                key={item.key}
                href={item.href}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? "bg-blue-600 text-white shadow-sm" 
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {renderIcon(item.icon, `w-5 h-5 ${isActive ? "text-white" : "text-slate-400 dark:text-slate-500"}`)}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={() => { logout(); router.push("/login"); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* ═══ MAIN ═══ */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 lg:px-8 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-10">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white capitalize">{activeNav}</h2>
          
          <div className="flex items-center gap-4">
            {/* Notifications next to name */}
            <div className="relative">
              <button 
                onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); }} 
                className="p-2 rounded-full text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900" />
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                    <span className="font-semibold text-sm">Notifications</span>
                    <button onClick={() => setNotifications(notifications.map(n => ({...n, read: true})))} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">Mark all read</button>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.map(n => (
                      <div key={n.id} className={`p-4 border-b border-slate-100 dark:border-slate-700/50 flex gap-3 ${!n.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                        <div className="flex-1">
                          <p className="text-sm text-slate-800 dark:text-slate-200">{n.message}</p>
                          <p className="text-xs text-slate-500 mt-1">{n.time}</p>
                        </div>
                        {!n.read && <div className="w-2 h-2 rounded-full bg-blue-500 mt-1" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-sm">
                  {session.name.charAt(0)}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">{session.name}</div>
                  <div className="text-xs text-slate-500 leading-tight">Student</div>
                </div>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-2 z-50">
                  {/* Profile above darkmode */}
                  <Link href="/profile" onClick={() => setShowUserMenu(false)} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    <span>Profile Settings</span>
                  </Link>
                  
                  <button onClick={() => setDarkMode(!darkMode)} className="w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                      Dark Mode
                    </div>
                    <div className={`w-8 h-4 rounded-full relative transition-colors ${darkMode ? "bg-blue-500" : "bg-slate-300"}`}>
                      <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${darkMode ? "left-4" : "left-0.5"}`} />
                    </div>
                  </button>
                  
                  <div className="border-t border-slate-200 dark:border-slate-700 my-2" />
                  <button onClick={() => { logout(); router.push("/login"); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── Scrollable Body ── */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50 dark:bg-slate-950">
          {children}
        </main>
      </div>
    </div>
  );
}
