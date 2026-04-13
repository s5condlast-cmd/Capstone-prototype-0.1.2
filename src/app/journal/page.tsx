"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession, logout, User } from "@/lib/auth";
import { useTheme } from "@/lib/ThemeContext";

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

export default function JournalPage() {
  const router = useRouter();
  const [session, setSession] = useState<User | null>(null);
  const [activeNav, setActiveNav] = useState("journal");
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activities, setActivities] = useState("");
  const [aiSummary, setAiSummary] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [journals, setJournals] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(sampleNotifications);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [viewJournal, setViewJournal] = useState<any>(null);
  const { darkMode, setDarkMode } = useTheme();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

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

    const saved = localStorage.getItem("practicum_journals");
    if (saved) {
      setJournals(JSON.parse(saved));
    } else {
      const sampleJournals = [
        {
          id: "1",
          type: "journal",
          studentName: "John Dwayne",
          studentId: "IT-2021-001",
          title: "Journal - 04/14/2026",
          content: "Today I worked on implementing the user authentication system. I created the login page with form validation and integrated it with the backend API. I also fixed a bug in the session management that was causing users to be logged out unexpectedly. Tomorrow I will start working on the dashboard components.",
          isUrgent: false,
          status: "pending",
          submittedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "2",
          type: "journal",
          studentName: "John Dwayne",
          studentId: "IT-2021-001",
          title: "Journal - 04/13/2026",
          content: "Completed the database schema design for the practicum management system. Created tables for students, advisors, journals, and documents. Implemented the CRUD operations for the journal entries.",
          isUrgent: true,
          status: "approved",
          submittedAt: new Date(Date.now() - 86400000).toISOString(),
          feedback: "Excellent progress! Your database design is well-structured. Keep up the good work.",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: "3",
          type: "journal",
          studentName: "John Dwayne",
          studentId: "IT-2021-001",
          title: "Journal - 04/12/2026",
          content: "Attended the weekly meeting with my advisor. Discussed the project timeline and deliverables. Reviewed the requirements document and clarified some ambiguities.",
          isUrgent: false,
          status: "rejected",
          submittedAt: new Date(Date.now() - 172800000).toISOString(),
          feedback: "Please provide more details about your daily activities. The entry seems too brief.",
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          updatedAt: new Date(Date.now() - 172800000).toISOString(),
        },
      ];
      setJournals(sampleJournals);
      localStorage.setItem("practicum_journals", JSON.stringify(sampleJournals));
    }
  }, []);

  useEffect(() => {
  }, [showPreview, activities]);

  const handlePreview = () => {
    if (!activities.trim()) {
      alert("Please add some content first.");
      return;
    }
    setShowPreview(true);
  };

  const saveJournals = (data: any[]) => {
    setJournals(data);
    localStorage.setItem("practicum_journals", JSON.stringify(data));
  };

  const handleSaveDraft = () => {
    if (!activities.trim()) {
      alert("Please add some content first.");
      return;
    }
    const draft = {
      id: Date.now().toString(),
      content: activities,
      isUrgent,
      status: "draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveJournals([...journals, draft]);
    setActivities("");
    setIsUrgent(false);
    alert("Draft saved!");
  };

  const handleSubmit = () => {
    if (!activities.trim()) {
      alert("Please add some content first.");
      return;
    }
    const entry = {
      id: Date.now().toString(),
      type: "journal",
      studentName: session?.name || "Student",
      studentId: session?.studentId || "",
      title: `Journal - ${new Date().toLocaleDateString()}`,
      content: activities,
      isUrgent,
      status: "pending",
      submittedAt: new Date().toISOString(),
    };
    
    const existingSubs = JSON.parse(localStorage.getItem("practicum_submissions") || "[]");
    localStorage.setItem("practicum_submissions", JSON.stringify([...existingSubs, entry]));
    saveJournals([...journals, { ...entry, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }]);
    setActivities("");
    setIsUrgent(false);
    alert("Journal submitted for review!");
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        await transcribeAudio(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
      alert("Could not access microphone. Please grant permission.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    try {
      const arrayBuffer = await audioBlob.arrayBuffer();
      const base64 = btoa(new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), ""));

      const response = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "transcribe", audioData: base64 }),
      });

      const data = await response.json();
      if (data.error) {
        alert(data.error);
      } else {
        setAiSummary(data.summary || "");
        setShowSummary(true);
      }
    } catch (error) {
      console.error("Transcription error:", error);
      alert("Failed to transcribe audio");
    } finally {
      setIsProcessing(false);
    }
  };

  const generateFullJournal = async () => {
    if (!aiSummary.trim()) {
      alert("No summary to generate from. Please use voice input first.");
      return;
    }
    setIsGenerating(true);
    try {
      const response = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "generate", summary: aiSummary }),
      });
      const data = await response.json();
      if (data.error) {
        alert(data.error);
      } else {
        setActivities(data.journal || "");
        setShowSummary(false);
      }
    } catch (error) {
      console.error("Generation error:", error);
      alert("Failed to generate journal");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

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
                  color: activeNav === "dashboard" ? "#FFFFFF" : "#64748B",
                }}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Dashboard
              </button>
            </li>
            <li className="px-4 py-2 text-xs font-medium" style={{ color: "#94A3B8" }}>REQUIREMENTS</li>
            <li>
              <button
                onClick={() => {
                  setActiveNav("journal");
                  router.push("/journal");
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
                style={{
                  backgroundColor: activeNav === "journal" ? "#00529B" : "transparent",
                  color: activeNav === "journal" ? "#FFFFFF" : "#64748B",
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
                  color: activeNav === "dtr" ? "#FFFFFF" : "#64748B",
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
                  color: activeNav === "moa" ? "#FFFFFF" : "#64748B",
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
                  color: activeNav === "evaluation" ? "#FFFFFF" : "#64748B",
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
                  color: activeNav === "documents" ? "#FFFFFF" : "#64748B",
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
        <div className="p-4 border-t" style={{ borderColor: "#E2E8F0" }}>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium" style={{ color: "#DC2626" }}>Logout</button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <header className="px-8 py-4 flex items-center justify-between relative" style={{ backgroundColor: darkMode ? "#1E293B" : "#FFFFFF", borderBottom: darkMode ? "1px solid #475569" : "1px solid #E2E8F0" }}>
          <h2 className="text-lg font-bold" style={{ color: darkMode ? "#F8FAFC" : "#1E293B" }}>Journal</h2>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl transition-colors"
              style={{ backgroundColor: darkMode ? "#334155" : "#F8FAFC", color: darkMode ? "#94A3B8" : "#64748B" }}
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
              style={{ 
                borderColor: darkMode ? "#475569" : "#E2E8F0",
                backgroundColor: darkMode ? "#334155" : "#FFFFFF"
              }}
            >
              <svg className="w-5 h-5" style={{ color: darkMode ? "#94A3B8" : "#64748B" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-sm" style={{ color: darkMode ? "#F8FAFC" : "#1E293B" }}>Profile</span>
            </button>

            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 border-t hover:bg-opacity-50"
              style={{ 
                borderColor: darkMode ? "#475569" : "#E2E8F0",
                backgroundColor: darkMode ? "#334155" : "#FFFFFF"
              }}
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
                  style={{ borderBottom: darkMode ? "#475569" : "#F1F5F9" }}
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
                    <p className="text-xs" style={{ color: darkMode ? "#94A3B8" : "#94A3B8" }}>{notification.time}</p>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-2" />
                  )}
                </div>
              ))}
            </div>

            <div className="px-4 py-3" style={{ backgroundColor: "#F8FAFC" }}>
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

        <div className="flex">
          {/* Left Side - New Journal Entry */}
          <div className="flex-1 p-8">
            <div id="journal-form" className="p-6 rounded-2xl" style={{ backgroundColor: darkMode ? "#334155" : "#FFFFFF", boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#00529B" }}>
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold" style={{ color: darkMode ? "#F8FAFC" : "#1E293B" }}>New Journal Entry</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: darkMode ? "#94A3B8" : "#64748B" }}>Activities / What is it about?</label>
                  <textarea className="w-full px-4 py-3 rounded-xl border text-sm" style={{ borderColor: darkMode ? "#475569" : "#E2E8F0", backgroundColor: darkMode ? "#1E293B" : "#FFFFFF", color: darkMode ? "#F8FAFC" : "#1E293B" }} rows={12} placeholder="Describe your activities for the day... Or use voice input" value={activities} onChange={(e) => setActivities(e.target.value)} />
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium" style={{ color: darkMode ? "#94A3B8" : "#64748B" }}>Urgent</span>
                    <button onClick={() => setIsUrgent(!isUrgent)} className="relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300" style={{ backgroundColor: isUrgent ? "#DC2626" : darkMode ? "#475569" : "#E2E8F0" }}>
                      <span className="inline-block h-6 w-6 rounded-full bg-white shadow-lg transform transition-transform duration-300" style={{ transform: isUrgent ? "translateX(28px)" : "translateX(4px)" }} />
                    </button>
                  </div>
                  <button onClick={handleSubmit} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-105" style={{ backgroundColor: "#16A34A", color: "white" }}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Submit Document
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - 3 Boxes */}
          <div className="w-72 p-6 space-y-4 flex-shrink-0" style={{ backgroundColor: darkMode ? "#1E293B" : "#FFFFFF", borderLeft: darkMode ? "1px solid #475569" : "1px solid #E2E8F0" }}>
            {/* Box 1: Document Info */}
            <div className="p-4 rounded-xl" style={{ backgroundColor: darkMode ? "#1E293B" : "#F8FAFC", border: darkMode ? "1px solid #475569" : "1px solid #E2E8F0" }}>
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-4 h-4" style={{ color: "#00529B" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h4 className="text-sm font-semibold" style={{ color: darkMode ? "#F8FAFC" : "#1E293B" }}>Document Info</h4>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-1 border-b" style={{ borderColor: darkMode ? "#475569" : "#E2E8F0" }}>
                  <span style={{ color: darkMode ? "#94A3B8" : "#64748B" }}>Filename</span>
                  <span style={{ color: darkMode ? "#F8FAFC" : "#1E293B" }}>Journal_001.pdf</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b" style={{ borderColor: darkMode ? "#475569" : "#E2E8F0" }}>
                  <span style={{ color: darkMode ? "#94A3B8" : "#64748B" }}>Journal No.</span>
                  <span style={{ color: darkMode ? "#F8FAFC" : "#1E293B" }}>JN-2026-001</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b" style={{ borderColor: darkMode ? "#475569" : "#E2E8F0" }}>
                  <span style={{ color: darkMode ? "#94A3B8" : "#64748B" }}>Date</span>
                  <span style={{ color: darkMode ? "#F8FAFC" : "#1E293B" }}>04/14/2026</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b" style={{ borderColor: darkMode ? "#475569" : "#E2E8F0" }}>
                  <span style={{ color: darkMode ? "#94A3B8" : "#64748B" }}>Time</span>
                  <span style={{ color: darkMode ? "#F8FAFC" : "#1E293B" }}>10:30 AM</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span style={{ color: darkMode ? "#94A3B8" : "#64748B" }}>Status</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: "#FEF3C7", color: "#D97706" }}>Pending</span>
                </div>
              </div>
            </div>

            {/* Box 2: Voice Input */}
            <div className="p-4 rounded-xl" style={{ backgroundColor: darkMode ? "#334155" : "#F8FAFC", border: darkMode ? "1px solid #475569" : "1px solid #E2E8F0" }}>
              <h4 className="text-sm font-semibold mb-3" style={{ color: darkMode ? "#F8FAFC" : "#1E293B" }}>Voice Input</h4>
              <button className="w-full py-2 px-4 rounded-lg text-sm font-medium" style={{ background: "linear-gradient(135deg, #00529B 0%, #0073C7 100%)", color: "white" }}>
                Record / Speak
              </button>
            </div>

            {/* Box 3: Comments from Advisor (Chat Style) */}
            <div className="p-4 rounded-xl" style={{ backgroundColor: darkMode ? "#334155" : "#F8FAFC", border: darkMode ? "1px solid #475569" : "1px solid #E2E8F0" }}>
              <h4 className="text-sm font-semibold mb-3" style={{ color: darkMode ? "#F8FAFC" : "#1E293B" }}>Comments from Advisor</h4>
              <div className="flex flex-col gap-2">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#00529B" }}>
                    <span className="text-sm font-medium text-white">A</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium" style={{ color: darkMode ? "#F8FAFC" : "#1E293B" }}>Advisor</span>
                      <span className="text-xs" style={{ color: darkMode ? "#94A3B8" : "#64748B" }}>10:30 AM</span>
                    </div>
                    <div className="p-3 rounded-xl rounded-tl-none" style={{ backgroundColor: darkMode ? "#1E293B" : "#E0F2FE" }}>
                      <p className="text-sm" style={{ color: darkMode ? "#F8FAFC" : "#1E293B" }}>Your journal shows good progress. Keep it up!</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
}