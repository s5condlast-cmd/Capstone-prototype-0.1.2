"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession, logout, User } from "@/lib/auth";
import { useTheme } from "@/lib/ThemeContext";

interface Revision {
  id: string;
  date: string;
  adviser: string;
  note: string;
}

interface Notification {
  id: string;
  type: "success" | "info" | "warning";
  message: string;
  time: string;
  read: boolean;
}

const sampleNotifications: Notification[] = [
  { id: "1", type: "success", message: "Journal entry approved", time: "2h ago", read: false },
  { id: "2", type: "info", message: "New template available", time: "5h ago", read: false },
  { id: "3", type: "warning", message: "Submit weekly report", time: "1d ago", read: true },
  { id: "4", type: "info", message: "AI report ready for review", time: "2d ago", read: true },
];

export default function MOAPage() {
  const router = useRouter();
  const [session, setSession] = useState<User | null>(null);
  const [activeNav, setActiveNav] = useState("moa");
  const [isUrgent, setIsUrgent] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(sampleNotifications);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { darkMode, setDarkMode } = useTheme();

  const sampleRevisions: Revision[] = [
    { id: "1", date: "2026-04-10", adviser: "Ms. Rodriguez", note: "Please include company letterhead and signature on page 2." },
    { id: "2", date: "2026-04-08", adviser: "Ms. Rodriguez", note: "Add duration of practicum (500 hours) in section 3." },
  ];

  useEffect(() => {
    const currentSession = getSession();
    if (!currentSession || currentSession.role !== "student") {
      if (currentSession?.role === "admin") {
        router.push("/admin");
      } else if (currentSession?.role === "advisor") {
        router.push("/advisor");
      } else {
        router.push("/login");
      }
      return;
    }
    setSession(currentSession);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleFileUpload = () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".pdf,.doc,.docx,.jpg,.png";
    fileInput.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = () => {
          setUploadedFile(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    };
    fileInput.click();
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: darkMode ? "#1E293B" : "#F8FAFC" }}>
      <aside className="w-60 flex-shrink-0 flex flex-col" style={{ backgroundColor: darkMode ? "#1E293B" : "#FFFFFF", borderRight: darkMode ? "1px solid #475569" : "1px solid #E2E8F0" }}>
        <div className="p-6 border-b" style={{ borderColor: darkMode ? "#475569" : "#E2E8F0" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00529B 0%, #0073C7 100%)' }}>
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h1 className="font-bold text-sm" style={{ color: darkMode ? "#F8FAFC" : "#1E293B" }}>Practicum</h1>
              <p className="text-xs" style={{ color: darkMode ? "#94A3B8" : "#64748B" }}>System</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => {
                  setActiveNav("dashboard");
                  router.push("/dashboard");
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
                style={{
                  backgroundColor: activeNav === "dashboard" ? "#00529B" : "transparent",
                  color: activeNav === "dashboard" ? "#FFFFFF" : darkMode ? "#94A3B8" : "#64748B",
                }}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Dashboard
              </button>
            </li>
            <li className="px-4 py-2 text-xs font-medium" style={{ color: darkMode ? "#64748B" : "#94A3B8" }}>REQUIREMENTS</li>
            <li>
              <button
                onClick={() => {
                  setActiveNav("journal");
                  router.push("/journal");
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
                style={{
                  backgroundColor: activeNav === "journal" ? "#00529B" : "transparent",
                  color: activeNav === "journal" ? "#FFFFFF" : darkMode ? "#94A3B8" : "#64748B",
                }}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Journal
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  setActiveNav("dtr");
                  router.push("/dtr");
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
                style={{
                  backgroundColor: activeNav === "dtr" ? "#00529B" : "transparent",
                  color: activeNav === "dtr" ? "#FFFFFF" : darkMode ? "#94A3B8" : "#64748B",
                }}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                DTR
              </button>
            </li>
<li>
              <button
                onClick={() => {
                  setActiveNav("moa");
                  router.push("/moa");
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
                style={{
                  backgroundColor: activeNav === "moa" ? "#00529B" : "transparent",
                  color: activeNav === "moa" ? "#FFFFFF" : darkMode ? "#94A3B8" : "#64748B",
                }}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                MOA
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  setActiveNav("evaluation");
                  router.push("/evaluation");
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
                style={{
                  backgroundColor: activeNav === "evaluation" ? "#00529B" : "transparent",
                  color: activeNav === "evaluation" ? "#FFFFFF" : darkMode ? "#94A3B8" : "#64748B",
                }}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Evaluation
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  setActiveNav("documents");
                  router.push("/documents");
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
                style={{
                  backgroundColor: activeNav === "documents" ? "#00529B" : "transparent",
                  color: activeNav === "documents" ? "#FFFFFF" : darkMode ? "#94A3B8" : "#64748B",
                }}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                Documents
              </button>
            </li>
</ul>
        </nav>
        <div className="p-4 border-t" style={{ borderColor: darkMode ? "#475569" : "#E2E8F0" }}>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium" style={{ color: "#DC2626" }}>Logout</button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <header className="px-8 py-4 flex items-center justify-between relative" style={{ backgroundColor: darkMode ? "#334155" : "#FFFFFF", borderBottom: darkMode ? "1px solid #475569" : "1px solid #E2E8F0" }}>
          <h2 className="text-lg font-bold" style={{ color: darkMode ? "#F8FAFC" : "#1E293B" }}>Memorandum of Agreement (MOA)</h2>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl transition-colors"
              style={{ backgroundColor: darkMode ? "#475569" : "#F8FAFC", color: darkMode ? "#F8FAFC" : "#64748B" }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 p-2 -m-2 rounded-xl transition-colors"
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: "#F0F7FF" }}>
                <span className="font-medium text-sm" style={{ color: "#00529B" }}>{session?.name?.charAt(0) || "?"}</span>
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: darkMode ? "#F8FAFC" : "#1E293B" }}>{session?.name || "Student"}</p>
                <p className="text-xs" style={{ color: darkMode ? "#94A3B8" : "#64748B" }}>{session?.studentId || "Student"}</p>
              </div>
            </button>
          </div>
        </header>

        {/* User Menu Dropdown */}
        {showUserMenu && (
          <div 
            className="absolute right-8 top-20 w-64 rounded-2xl overflow-hidden z-50"
            style={{ 
              backgroundColor: darkMode ? "#334155" : "#FFFFFF",
              border: darkMode ? "1px solid #475569" : "1px solid #E2E8F0",
              boxShadow: '0 10px 40px -10px rgba(0,0,0,0.15)'
            }}
          >
            <div className="px-4 py-3 border-b" style={{ borderColor: darkMode ? "#475569" : "#E2E8F0" }}>
              <p className="font-semibold text-sm" style={{ color: darkMode ? "#F8FAFC" : "#1E293B" }}>{session?.name || "Student"}</p>
              <p className="text-xs" style={{ color: darkMode ? "#94A3B8" : "#64748B" }}>ID: {session?.studentId || "N/A"}</p>
            </div>
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-opacity-50"
              style={{ backgroundColor: darkMode ? "#1E293B" : "#F8FAFC" }}
            >
              <div className="flex items-center gap-3">
                {darkMode ? (
                  <svg className="w-5 h-5" style={{ color: darkMode ? "#F8FAFC" : "#64748B" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" style={{ color: darkMode ? "#94A3B8" : "#64748B" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
                <span className="text-sm" style={{ color: darkMode ? "#F8FAFC" : "#1E293B" }}>Dark Mode</span>
              </div>
              <div 
                className={`w-10 h-5 rounded-full relative transition-colors ${darkMode ? 'bg-blue-500' : 'bg-gray-300'}`}
              >
                <div 
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${darkMode ? 'left-5' : 'left-0.5'}`}
                />
              </div>
            </button>

            {/* Profile */}
            <button 
              onClick={() => { setShowUserMenu(false); router.push("/profile"); }}
              className="w-full flex items-center gap-3 px-4 py-3 border-t hover:bg-opacity-50"
              style={{ borderColor: darkMode ? "#475569" : "#E2E8F0", backgroundColor: darkMode ? "#334155" : "#FFFFFF" }}
            >
              <svg className="w-5 h-5" style={{ color: darkMode ? "#94A3B8" : "#64748B" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-sm" style={{ color: darkMode ? "#F8FAFC" : "#1E293B" }}>Profile</span>
            </button>

            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 border-t hover:bg-opacity-50"
              style={{ borderColor: darkMode ? "#475569" : "#E2E8F0", backgroundColor: darkMode ? "#334155" : "#FFFFFF" }}
            >
              <svg className="w-5 h-5" style={{ color: "#DC2626" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="text-sm" style={{ color: "#DC2626" }}>Logout</span>
            </button>
          </div>
        )}

        {showNotifications && (
          <div 
            className="absolute right-8 top-20 w-80 rounded-2xl overflow-hidden z-50"
            style={{ 
              backgroundColor: darkMode ? "#334155" : "#FFFFFF",
              border: darkMode ? "1px solid #475569" : "1px solid #E2E8F0",
              boxShadow: '0 10px 40px -10px rgba(0,0,0,0.15)'
            }}
          >
            <div 
              className="px-4 py-3 flex items-center justify-between"
              style={{ borderBottom: darkMode ? "1px solid #475569" : "1px solid #E2E8F0" }}
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" style={{ color: "#00529B" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="font-semibold text-sm" style={{ color: darkMode ? "#F8FAFC" : "#1E293B" }}>Notifications</span>
              </div>
              <button 
                onClick={() => setShowNotifications(false)}
                className="p-1 rounded-lg hover:bg-slate-100"
              >
                <svg className="w-4 h-4" style={{ color: darkMode ? "#94A3B8" : "#64748B" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto">
              {notifications.map((notification) => (
                <div 
                  key={notification.id}
                  className="px-4 py-3 flex items-start gap-3 border-b"
                  style={{ borderBottom: darkMode ? "1px solid #475569" : "1px solid #F1F5F9" }}
                >
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      notification.type === "success" ? "bg-green-100" :
                      notification.type === "warning" ? "bg-yellow-100" : "bg-blue-100"
                    }`}
                  >
                    {notification.type === "success" && (
                      <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {notification.type === "warning" && (
                      <svg className="w-4 h-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    )}
                    {notification.type === "info" && (
                      <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm" style={{ color: darkMode ? "#F8FAFC" : "#1E293B" }}>{notification.message}</p>
                    <p className="text-xs" style={{ color: darkMode ? "#64748B" : "#94A3B8" }}>{notification.time}</p>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-2" />
                  )}
                </div>
              ))}
            </div>

            <div className="px-4 py-3" style={{ backgroundColor: darkMode ? "#1E293B" : "#F8FAFC" }}>
              <button 
                onClick={markAllAsRead}
                className="w-full py-2 text-sm font-medium rounded-lg"
                style={{ color: "#00529B" }}
              >
                Mark all as read
              </button>
            </div>
          </div>
        )}

        <div className="p-8">
          <div className="mb-6">
            <h3 className="text-lg font-bold" style={{ color: darkMode ? "#F8FAFC" : "#1E293B" }}>Requirements</h3>
          </div>
          <div className="space-y-6">
            <div className="p-6 rounded-2xl" style={{ backgroundColor: darkMode ? "#334155" : "#FFFFFF", boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold" style={{ color: darkMode ? "#F8FAFC" : "#1E293B" }}>MOA Overview</h3>
                <button onClick={handleFileUpload} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium" style={{ backgroundColor: "#00529B", color: "white" }}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Upload MOA
                </button>
              </div>

              {uploadedFile ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl" style={{ backgroundColor: darkMode ? "#1E293B" : "#F8FAFC", border: darkMode ? "1px solid #475569" : "1px solid #E2E8F0" }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <svg className="w-6 h-6" style={{ color: "#00529B" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-sm font-medium" style={{ color: darkMode ? "#F8FAFC" : "#1E293B" }}>{fileName}</span>
                      </div>
                      <button onClick={() => { setUploadedFile(null); setFileName(""); }} style={{ color: darkMode ? "#94A3B8" : "#64748B", background: "none", border: "none", cursor: "pointer" }}>✕</button>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl border" style={{ borderColor: darkMode ? "#475569" : "#E2E8F0", minHeight: "400px" }}>
                    <div className="flex items-center justify-center h-full" style={{ minHeight: "350px", color: darkMode ? "#94A3B8" : "#64748B" }}>
                      <div className="text-center">
                        <svg className="w-12 h-12 mx-auto mb-3" style={{ color: darkMode ? "#64748B" : "#94A3B8" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-sm" style={{ color: darkMode ? "#F8FAFC" : "#1E293B" }}>File preview</p>
                        <p className="text-xs" style={{ color: darkMode ? "#64748B" : "#94A3B8" }}>PDF/DOCX viewer would render here</p>
                      </div>
                    </div>
                  </div>
                    <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium" style={{ color: darkMode ? "#F8FAFC" : "#1E293B" }}>Mark as Urgent</span>
                      <button onClick={() => setIsUrgent(!isUrgent)} className="relative inline-flex h-8 w-14 items-center rounded-full transition-colors" style={{ backgroundColor: isUrgent ? "#DC2626" : darkMode ? "#475569" : "#E2E8F0" }}>
                        <span className="inline-block h-6 w-6 rounded-full bg-white shadow-lg transform transition-transform duration-200" style={{ transform: isUrgent ? "translateX(28px)" : "translateX(4px)" }} />
                      </button>
                      {isUrgent && <span className="text-xs font-medium" style={{ color: "#DC2626" }}>Urgent - Adviser will be notified</span>}
                    </div>
                    <button onClick={() => {
                      const submission = {
                        id: Date.now().toString(),
                        type: "moa",
                        studentName: session?.name || "Student",
                        studentId: session?.studentId || "",
                        title: `MOA - ${fileName}`,
                        status: "pending",
                        submittedAt: new Date().toISOString(),
                        isUrgent,
                        fileName,
                      };
                      const existingSubs = JSON.parse(localStorage.getItem("practicum_submissions") || "[]");
                      localStorage.setItem("practicum_submissions", JSON.stringify([...existingSubs, submission]));
                      alert("MOA submitted for review!");
                      setUploadedFile(null);
                      setFileName("");
                      setIsUrgent(false);
                    }} className="px-4 py-2 rounded-xl text-sm font-medium" style={{ backgroundColor: "#16A34A", color: "white" }}>Submit MOA</button>
                  </div>
                </div>
              ) : (
                <div className="p-12 rounded-xl border-dashed border-2 flex flex-col items-center justify-center" style={{ borderColor: darkMode ? "#475569" : "#E2E8F0" }}>
                  <svg className="w-12 h-12 mb-4" style={{ color: darkMode ? "#64748B" : "#94A3B8" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <p className="text-sm font-medium mb-2" style={{ color: darkMode ? "#F8FAFC" : "#1E293B" }}>Upload your Memorandum of Agreement</p>
                  <p className="text-xs mb-4" style={{ color: darkMode ? "#94A3B8" : "#64748B" }}>Supported formats: PDF, DOCX, JPG, PNG</p>
                  <button onClick={handleFileUpload} className="px-4 py-2 rounded-xl text-sm font-medium" style={{ backgroundColor: "#00529B", color: "white" }}>Choose File</button>
                </div>
              )}
            </div>

            <div className="p-6 rounded-2xl" style={{ backgroundColor: darkMode ? "#334155" : "#FFFFFF", boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: darkMode ? "#F8FAFC" : "#1E293B" }}>Adviser Revisions</h3>
              {sampleRevisions.length > 0 ? (
                <div className="space-y-3">
                  {sampleRevisions.map((rev) => (
                    <div key={rev.id} className="p-4 rounded-xl" style={{ backgroundColor: "#FEF3C7", border: "1px solid #F59E0B" }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium" style={{ color: "#92400E" }}>{rev.adviser}</span>
                        <span className="text-xs" style={{ color: "#B45309" }}>{rev.date}</span>
                      </div>
                      <p className="text-sm" style={{ color: "#92400E" }}>{rev.note}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm" style={{ color: darkMode ? "#94A3B8" : "#64748B" }}>No revisions yet.</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}