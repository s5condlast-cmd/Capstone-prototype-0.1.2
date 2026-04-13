"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession, logout, User, getUsers } from "@/lib/auth";
import { useTheme } from "@/lib/ThemeContext";

interface Message {
  id: string;
  fromId: string;
  fromName: string;
  toId: string;
  toName: string;
  subject: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export default function MessagesPage() {
  const router = useRouter();
  const [session, setSession] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showCompose, setShowCompose] = useState(false);
  const [composeData, setComposeData] = useState({ toId: "", subject: "", content: "" });
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { darkMode, setDarkMode } = useTheme();

  useEffect(() => {
    const currentSession = getSession();
    if (!currentSession) {
      router.push("/login");
      return;
    }
    setSession(currentSession);
    setAllUsers(getUsers());

    const savedMessages = localStorage.getItem("practicum_messages");
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, []);

  const saveMessages = (data: Message[]) => {
    setMessages(data);
    localStorage.setItem("practicum_messages", JSON.stringify(data));
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeData.toId || !composeData.subject || !composeData.content) {
      alert("Please fill in all fields");
      return;
    }

    const recipient = allUsers.find(u => u.id === composeData.toId);
    if (!recipient) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      fromId: session?.id || "",
      fromName: session?.name || "Admin",
      toId: composeData.toId,
      toName: recipient.name,
      subject: composeData.subject,
      content: composeData.content,
      timestamp: new Date().toISOString(),
      read: false,
    };

    saveMessages([...messages, newMessage]);
    setShowCompose(false);
    setComposeData({ toId: "", subject: "", content: "" });
    alert("Message sent!");
  };

  const myMessages = session?.role === "student" 
    ? messages.filter(m => m.toId === session?.id)
    : messages.filter(m => m.fromId === session?.id || m.toId === session?.id);

  const unreadCount = myMessages.filter(m => !m.read).length;

  const getNavItems = () => {
    if (session?.role === "admin") {
      return [
        { name: "User Management", href: "/admin" },
        { name: "Messages", href: "/messages" },
      ];
    } else if (session?.role === "advisor") {
      return [
        { name: "Submissions", href: "/advisor" },
        { name: "Messages", href: "/messages" },
      ];
    } else {
      return [
        { name: "Dashboard", href: "/dashboard" },
        { name: "Messages", href: "/messages" },
      ];
    }
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#F8FAFC" }}>
      <aside className="w-60 flex-shrink-0 flex flex-col" style={{ backgroundColor: "#FFFFFF", borderRight: "1px solid #E2E8F0" }}>
        <div className="p-6 border-b" style={{ borderColor: "#E2E8F0" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00529B 0%, #0073C7 100%)' }}>
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div>
              <h1 className="font-bold text-sm" style={{ color: "#1E293B" }}>Practicum</h1>
              <p className="text-xs" style={{ color: "#64748B" }}>System</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {getNavItems().map((item) => (
              <li key={item.name}>
                <button onClick={() => router.push(item.href)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium" style={{ color: "#64748B" }}>
                  {item.name}
                </button>
              </li>
            ))}
            {session?.role === "student" && (
              <>
                <li><button onClick={() => router.push("/journal")} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium" style={{ color: "#64748B" }}>Journal</button></li>
              </>
            )}
          </ul>
        </nav>
        <div className="p-4 border-t" style={{ borderColor: "#E2E8F0" }}>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium" style={{ color: "#DC2626" }}>Logout</button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <header className="px-8 py-4 flex items-center justify-between" style={{ backgroundColor: "#FFFFFF", borderBottom: "1px solid #E2E8F0" }}>
          <h2 className="text-lg font-bold" style={{ color: "#1E293B" }}>Messages</h2>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 p-2 -m-2 rounded-xl transition-colors"
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: "#F0F7FF" }}>
                <span className="font-medium text-sm" style={{ color: "#00529B" }}>{session?.name?.charAt(0) || "?"}</span>
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: "#1E293B" }}>{session?.name}</p>
                <p className="text-xs" style={{ color: "#64748B" }}>{session?.role}</p>
              </div>
            </button>
          </div>
        </header>

        {/* User Menu Dropdown */}
        {showUserMenu && (
          <div 
            className="absolute right-8 top-20 w-64 rounded-2xl overflow-hidden z-50"
            style={{ 
              backgroundColor: "#FFFFFF",
              border: "1px solid #E2E8F0",
              boxShadow: '0 10px 40px -10px rgba(0,0,0,0.15)'
            }}
          >
            <div className="px-4 py-3 border-b" style={{ borderColor: "#E2E8F0" }}>
              <p className="font-semibold text-sm" style={{ color: "#1E293B" }}>{session?.name}</p>
              <p className="text-xs" style={{ color: darkMode ? "#94A3B8" : "#64748B" }}>ID: {session?.studentId}</p>
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

        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm" style={{ color: "#64748B" }}>{unreadCount} unread message(s)</p>
            {(session?.role === "admin" || session?.role === "advisor") && (
              <button onClick={() => setShowCompose(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium" style={{ backgroundColor: "#00529B", color: "white" }}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Compose
              </button>
            )}
          </div>

          <div className="space-y-3">
            {myMessages.length === 0 ? (
              <div className="p-8 text-center" style={{ backgroundColor: "#FFFFFF", borderRadius: "16px" }}>
                <p className="text-sm" style={{ color: "#64748B" }}>No messages yet.</p>
              </div>
            ) : (
              myMessages.map((msg) => (
                <div key={msg.id} className="p-4 rounded-2xl" style={{ backgroundColor: "#FFFFFF", boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)', borderLeft: msg.read ? "none" : "4px solid #00529B" }}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold" style={{ color: "#1E293B" }}>{msg.subject}</p>
                    <span className="text-xs" style={{ color: "#64748B" }}>{new Date(msg.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="text-sm mb-2" style={{ color: "#64748B" }}>{msg.content}</p>
                  <p className="text-xs" style={{ color: "#94A3B8" }}>From: {msg.fromName} • To: {msg.toName}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {showCompose && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="p-6 rounded-2xl w-full max-w-lg" style={{ backgroundColor: "#FFFFFF" }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: "#1E293B" }}>Compose Message</h3>
            
            <form onSubmit={handleSendMessage} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#334155" }}>To (Student)</label>
                <select value={composeData.toId} onChange={(e) => setComposeData({ ...composeData, toId: e.target.value })} className="w-full px-4 py-2 rounded-xl border text-sm" style={{ borderColor: "#E2E8F0" }}>
                  <option value="">Select Student</option>
                  {allUsers.filter(u => u.role === "student").map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.studentId})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#334155" }}>Subject</label>
                <input type="text" value={composeData.subject} onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })} className="w-full px-4 py-2 rounded-xl border text-sm" style={{ borderColor: "#E2E8F0" }} placeholder="Message subject" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#334155" }}>Message</label>
                <textarea value={composeData.content} onChange={(e) => setComposeData({ ...composeData, content: e.target.value })} className="w-full px-4 py-2 rounded-xl border text-sm" style={{ borderColor: "#E2E8F0" }} rows={4} placeholder="Write your message..." />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowCompose(false)} className="flex-1 py-2 rounded-xl text-sm font-medium" style={{ backgroundColor: "#F1F5F9", color: "#64748B" }}>Cancel</button>
                <button type="submit" className="flex-1 py-2 rounded-xl text-sm font-medium" style={{ backgroundColor: "#00529B", color: "white" }}>Send</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}