# Student Documentation

## Overview

The Practicum Management System provides students with a complete environment to manage their practicum journey. Students can log their Daily Time Records (DTR), write journal entries, manage their Memorandum of Agreement (MOA), view evaluations, access templates, and manage all related documents.

This document covers all the process and code for the student workflows.

**Related Documentation:**
- [admin.md](./admin.md) - For admin workflows.
- [advisor.md](./advisor.md) - For advisor workflows.

---

## Table of Contents

1. [Authentication & Layout](#authentication--layout)
2. [Student Dashboard](#student-dashboard)
3. [Journal Entries](#journal-entries)
4. [Daily Time Record (DTR)](#daily-time-record-dtr)
5. [Memorandum of Agreement (MOA)](#memorandum-of-agreement-moa)
6. [Evaluation](#evaluation)
7. [Templates Repository](#templates-repository)
8. [Documents & Submissions](#documents--submissions)
9. [Student Profile](#student-profile)

---

## Authentication & Layout

Students authenticate into the system via `/login` and are directed to `/dashboard`. The `StudentLayout` component wraps all student routes, ensuring that only authenticated users with the `student` role can view these pages. It also provides the main navigation sidebar and notification systems.

**File:** `src/components/StudentLayout.tsx`
```tsx
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

```

---

## Student Dashboard

The Dashboard provides students with a summary of their practicum progress, recent notifications, quick stats (e.g., hours rendered), and pending tasks.

**File:** `src/app/dashboard/page.tsx`
```tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/auth";
import Link from "next/link";
import StudentLayout from "@/components/StudentLayout";

/* ─── Types ─── */
interface Submission {
  id: string;
  title: string;
  type: string;
  status: string;
  studentId?: string;
  feedback?: string;
  date?: string;
  createdAt?: string;
}

interface DailyEntry {
  id: string;
  date: string;
  totalHours: string;
  activities: string;
  createdAt: string;
}

interface ActivityItem {
  id: string;
  icon: "check" | "cross" | "comment" | "upload";
  message: string;
  time: string;
  color: string;
}

/* ─── Requirement definitions ─── */
const REQUIRED_TYPES = ["journal", "dtr", "moa", "evaluation"] as const;
const REQUIREMENT_LABELS: Record<string, string> = {
  journal: "Journal",
  dtr: "Daily Time Record",
  moa: "Memorandum of Agreement",
  evaluation: "Evaluation Form",
};

export default function Dashboard() {
  const router = useRouter();

  /* data */
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [journals, setJournals] = useState<any[]>([]);
  const [activityFeed, setActivityFeed] = useState<ActivityItem[]>([]);

  /* derived stats */
  const [pending, setPending] = useState(0);
  const [rejected, setRejected] = useState(0);
  const [completionPct, setCompletionPct] = useState(0);
  const [submittedTypes, setSubmittedTypes] = useState<string[]>([]);
  const [missingTypes, setMissingTypes] = useState<string[]>([]);

  /* alerts */
  const [alerts, setAlerts] = useState<{ icon: string; message: string; severity: "error" | "warning" | "info" }[]>([]);

  useEffect(() => {
    const s = getSession();
    if (!s || s.role !== "student") return;

    const rawSubs: Submission[] = JSON.parse(localStorage.getItem("practicum_submissions") || "[]");
    const rawJournals: any[] = JSON.parse(localStorage.getItem("practicum_journals") || "[]");
    const rawDocs: any[] = JSON.parse(localStorage.getItem("practicum_documents") || "[]");

    const mySubs = rawSubs.filter((sub) => sub.studentId === s.studentId);
    setSubmissions(mySubs);
    setJournals(rawJournals);

    /* Counts */
    const all = [...mySubs, ...rawDocs, ...rawJournals];
    setRejected(all.filter((d) => d.status === "rejected").length);
    setPending(all.filter((d) => d.status === "pending" || d.status === "draft").length);

    /* Completion */
    const typesSubmitted = [...new Set(mySubs.map((sub) => sub.type?.toLowerCase()))];
    setSubmittedTypes(typesSubmitted);
    const missing = REQUIRED_TYPES.filter((t) => !typesSubmitted.includes(t));
    setMissingTypes(missing);
    setCompletionPct(Math.round(((REQUIRED_TYPES.length - missing.length) / REQUIRED_TYPES.length) * 100));

    /* Alerts */
    const alertList: typeof alerts = [];
    missing.forEach((t) => {
      alertList.push({ icon: "❗", message: `${REQUIREMENT_LABELS[t]} not submitted`, severity: "error" });
    });
    mySubs.filter(s => s.status === "rejected").forEach(s => alertList.push({ icon: "⚠️", message: `${s.title} was rejected. Please review.`, severity: "warning" }));
    mySubs.filter(s => s.status === "revision").forEach(s => alertList.push({ icon: "🔄", message: `${s.title} needs revision.`, severity: "warning" }));
    
    if (alertList.length === 0) alertList.push({ icon: "⏳", message: "Monthly Progress Report due April 25", severity: "info" });
    setAlerts(alertList);

    /* Activity feed */
    const feed: ActivityItem[] = [];
    mySubs.slice(0, 6).forEach((sub) => {
      if (sub.status === "approved") feed.push({ id: sub.id + "-a", icon: "check", message: `${sub.title} approved`, time: sub.date || sub.createdAt || "Just now", color: "green" });
      else if (sub.status === "rejected") feed.push({ id: sub.id + "-r", icon: "cross", message: `${sub.title} rejected`, time: sub.date || sub.createdAt || "Just now", color: "red" });
      else if (sub.status === "revision") feed.push({ id: sub.id + "-rev", icon: "comment", message: `Revision requested: ${sub.title}`, time: sub.date || sub.createdAt || "Just now", color: "amber" });
      else feed.push({ id: sub.id + "-u", icon: "upload", message: `${sub.title} submitted`, time: sub.date || sub.createdAt || "Just now", color: "blue" });
    });
    if (feed.length === 0) {
      feed.push({ id: "s1", icon: "upload", message: "Journal Entry #1 submitted", time: "2 hours ago", color: "blue" });
      feed.push({ id: "s2", icon: "check", message: "DTR - Week 12 approved", time: "1 day ago", color: "green" });
    }
    setActivityFeed(feed);
  }, []);

  const renderIcon = (name: string, className = "w-5 h-5") => {
    const paths: Record<string, string> = {
      journal: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
      clock: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
      doc: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
      chart: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
      msg: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z",
      check: "M5 13l4 4L19 7",
      cross: "M6 18L18 6M6 6l12 12",
    };
    return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={paths[name] || ""} /></svg>;
  };

  return (
    <StudentLayout activeNav="dashboard">
      <div className="flex flex-col lg:flex-row gap-6 md:gap-8 max-w-[1600px] mx-auto items-start">
        
        {/* ═══ LEFT/CENTER MAIN COLUMN ═══ */}
        <div className="flex-1 space-y-6 md:space-y-8 min-w-0 w-full">
          
          {/* A. HERO SECTION */}
          <section className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-6 md:p-8 text-white shadow-md relative overflow-hidden flex flex-col justify-center">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-40 h-40 rounded-full bg-white opacity-10 pointer-events-none" />
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1">
                <h2 className="text-2xl md:text-3xl font-bold mb-2">Welcome back! 👋</h2>
                <p className="text-blue-100 mb-4 text-sm md:text-base">Here is your practicum progress overview</p>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-sm font-medium">
                  <span className={`w-2 h-2 rounded-full ${completionPct >= 100 ? "bg-green-400" : "bg-yellow-400 animate-pulse"}`} />
                  {completionPct >= 100 ? "Completed" : "In Progress"}
                </div>
              </div>

              <div className="w-full md:w-64 bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm text-blue-100">Overall Progress</span>
                  <span className="text-2xl font-bold">{completionPct}%</span>
                </div>
                <div className="w-full bg-black/20 rounded-full h-2.5 mb-2 overflow-hidden">
                  <div className="bg-green-400 h-2.5 rounded-full transition-all duration-1000 ease-out" style={{ width: `${completionPct}%` }} />
                </div>
                <p className="text-xs text-blue-100">
                  {REQUIRED_TYPES.length - missingTypes.length} of {REQUIRED_TYPES.length} requirements submitted
                </p>
              </div>
            </div>
          </section>

          {/* C. SUMMARY CARDS */}
          <section className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            <Link href="/documents" className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  {renderIcon("doc", "w-5 h-5")}
                </div>
                <span className="text-3xl font-bold text-slate-900 dark:text-white leading-none">{submissions.length}</span>
              </div>
              <span className="text-xs font-medium text-slate-500 text-center">Documents Submitted</span>
            </Link>
            
            <Link href="/journal" className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  {renderIcon("journal", "w-5 h-5")}
                </div>
                <span className="text-3xl font-bold text-slate-900 dark:text-white leading-none">{journals.length}</span>
              </div>
              <span className="text-xs font-medium text-slate-500 text-center">Journals Completed</span>
            </Link>

            <Link href="/documents" className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  {renderIcon("clock", "w-5 h-5")}
                </div>
                <span className="text-3xl font-bold text-slate-900 dark:text-white leading-none">{pending}</span>
              </div>
              <span className="text-xs font-medium text-slate-500 text-center">Pending Reviews</span>
            </Link>

            <Link href="/documents" className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  {renderIcon("cross", "w-5 h-5")}
                </div>
                <span className="text-3xl font-bold text-slate-900 dark:text-white leading-none">{rejected}</span>
              </div>
              <span className="text-xs font-medium text-slate-500 text-center">Rejected Items</span>
            </Link>
          </section>

          {/* Timeline */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Activity Timeline</h3>
              <Link href="/documents" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">View All</Link>
            </div>
            <div className="relative pl-4">
              <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-slate-100 dark:bg-slate-800" />
              <div className="space-y-6 relative">
                {activityFeed.map(item => (
                  <div key={item.id} className="flex gap-4">
                    <div className={`w-5 h-5 mt-0.5 rounded-full flex-shrink-0 flex items-center justify-center border-2 border-white dark:border-slate-900 z-10 ${
                      item.color === 'green' ? 'bg-green-500' :
                      item.color === 'red' ? 'bg-red-500' :
                      item.color === 'amber' ? 'bg-amber-500' : 'bg-blue-500'
                    }`}>
                      {renderIcon(item.icon, "w-3 h-3 text-white")}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{item.message}</p>
                      <p className="text-xs text-slate-500 mt-1">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions & Checklist */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4">Quick Actions</h3>
              <div className="flex flex-col gap-3">
                <button onClick={() => router.push("/journal")} className="w-full flex items-center p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/50 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-sm transition-all text-left group">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mr-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    {renderIcon("journal")}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Submit Journal</div>
                    <div className="text-xs text-slate-500 mt-0.5">Record daily activities</div>
                  </div>
                  <svg className="w-5 h-5 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 group-hover:text-blue-500 transition-all -translate-x-2 group-hover:translate-x-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                <button onClick={() => router.push("/dtr")} className="w-full flex items-center p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/50 hover:border-green-300 dark:hover:border-green-500 hover:shadow-sm transition-all text-left group">
                  <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center mr-4 group-hover:bg-green-600 group-hover:text-white transition-colors">
                    {renderIcon("clock")}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">Upload DTR</div>
                    <div className="text-xs text-slate-500 mt-0.5">Submit time record</div>
                  </div>
                  <svg className="w-5 h-5 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 group-hover:text-green-500 transition-all -translate-x-2 group-hover:translate-x-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                <button onClick={() => router.push("/moa")} className="w-full flex items-center p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/50 hover:border-purple-300 dark:hover:border-purple-500 hover:shadow-sm transition-all text-left group">
                  <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center mr-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    {renderIcon("doc")}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Upload MOA</div>
                    <div className="text-xs text-slate-500 mt-0.5">Submit agreement</div>
                  </div>
                  <svg className="w-5 h-5 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 group-hover:text-purple-500 transition-all -translate-x-2 group-hover:translate-x-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                <button onClick={() => router.push("/evaluation")} className="w-full flex items-center p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/50 hover:border-orange-300 dark:hover:border-orange-500 hover:shadow-sm transition-all text-left group">
                  <div className="w-10 h-10 rounded-lg bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center mr-4 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                    {renderIcon("chart")}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">Submit Eval</div>
                    <div className="text-xs text-slate-500 mt-0.5">Final evaluation</div>
                  </div>
                  <svg className="w-5 h-5 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 group-hover:text-orange-500 transition-all -translate-x-2 group-hover:translate-x-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4">Requirements Checklist</h3>
              <div className="space-y-3">
                {REQUIRED_TYPES.map((type) => {
                  const done = submittedTypes.includes(type);
                  return (
                    <button key={type} onClick={() => router.push(`/${type}`)} className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all text-left ${done ? 'bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-900/30 hover:bg-green-100' : 'bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700 hover:border-blue-300'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded flex items-center justify-center border ${done ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300 dark:border-slate-600'}`}>
                          {done && <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                        </div>
                        <span className={`text-sm font-semibold ${done ? 'text-green-800 dark:text-green-400' : 'text-slate-700 dark:text-slate-300'}`}>{REQUIREMENT_LABELS[type]}</span>
                      </div>
                      {!done && <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-md">Submit now</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

        </div>

        {/* ═══ RIGHT SIDEBAR COLUMN ═══ */}
        <div className="w-full lg:w-72 xl:w-80 flex-shrink-0 space-y-6 md:space-y-8 lg:sticky lg:top-0">
          
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Action Required</h3>
              {alerts.length > 0 && <span className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-xs font-bold px-2 py-0.5 rounded-full">{alerts.length} pending</span>}
            </div>
            <div className="flex-1 space-y-3">
              {alerts.length === 0 ? (
                <div className="py-6 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center text-green-500 mb-3"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">You're all caught up!</p>
                </div>
              ) : (
                alerts.map((alert, i) => (
                  <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${alert.severity === 'error' ? 'bg-red-50 border-red-200 text-red-800' : alert.severity === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
                    <span className="text-base mt-0.5">{alert.icon}</span>
                    <span className="text-sm font-medium leading-tight">{alert.message}</span>
                  </div>
                ))
              )}
            </div>
          </section>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">AI Assistant</h3>
                <p className="text-xs text-slate-500">Need help?</p>
              </div>
            </div>
            <div className="flex-1 space-y-3">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1 flex items-center gap-1">Suggestion</p>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {missingTypes.length > 0 ? `Missing ${REQUIREMENT_LABELS[missingTypes[0]]}. Getting this submitted should be your next priority.` : "Great job! All core requirements are submitted."}
                </p>
              </div>
            </div>
            <button onClick={() => router.push("/journal")} className="mt-6 w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2">
              Create Journal Entry
            </button>
          </div>
        </div>
        
      </div>
    </StudentLayout>
  );
}

```

---

## Journal Entries

The Journal module allows students to write and submit periodic reflections or weekly reports on their practicum experience. These entries are then reviewed by their assigned advisor.

**File:** `src/app/journal/page.tsx`
```tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import StudentLayout from "@/components/StudentLayout";
import { getSession } from "@/lib/auth";

export default function JournalPage() {
  const router = useRouter();
  const [activities, setActivities] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    const s = getSession();
    if (!s || s.role !== "student") router.push("/login");
  }, [router]);

  const handleSubmit = () => {
    if (!activities.trim()) {
      alert("Please add some content first.");
      return;
    }
    const s = getSession();
    const entry = {
      id: Date.now().toString(),
      type: "journal",
      studentId: s?.studentId || "",
      title: `Journal Entry - ${new Date().toLocaleDateString()}`,
      content: activities,
      isUrgent,
      status: "pending",
      date: new Date().toLocaleDateString(),
      createdAt: new Date().toISOString(),
    };
    
    const existingSubs = JSON.parse(localStorage.getItem("practicum_submissions") || "[]");
    localStorage.setItem("practicum_submissions", JSON.stringify([entry, ...existingSubs]));
    
    const existingJournals = JSON.parse(localStorage.getItem("practicum_journals") || "[]");
    localStorage.setItem("practicum_journals", JSON.stringify([entry, ...existingJournals]));
    
    setActivities("");
    setIsUrgent(false);
    alert("Journal submitted successfully!");
    router.push("/dashboard");
  };

  const handleRecord = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      alert("Microphone access would be requested here in a real app. (Demo Mode)");
    }
  };

  return (
    <StudentLayout activeNav="journal">
      <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row gap-6 md:gap-8 items-start">
        
        {/* Left Form Area */}
        <div className="flex-1 w-full">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Journal Entry</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">What happened during your OJT?</label>
                <textarea 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-y" 
                  rows={12} 
                  placeholder="Describe your activities for the day... Or use voice input" 
                  value={activities} 
                  onChange={(e) => setActivities(e.target.value)} 
                />
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Mark as Urgent</span>
                  <button 
                    onClick={() => setIsUrgent(!isUrgent)} 
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 ${isUrgent ? 'bg-red-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                  >
                    <span className={`inline-block h-5 w-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${isUrgent ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                <button 
                  onClick={handleSubmit} 
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Submit Journal
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar Widgets */}
        <div className="w-full lg:w-72 xl:w-80 flex-shrink-0 space-y-6 lg:sticky lg:top-0">
          
          {/* Box 1: Document Info */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Entry Details</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800/50">
                <span className="text-slate-500">Date</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800/50">
                <span className="text-slate-500">Time</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-slate-500">Status</span>
                <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Draft</span>
              </div>
            </div>
          </div>

          {/* Box 2: Voice Input */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-3">Voice Input</h3>
            <button 
              onClick={handleRecord}
              className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                isRecording 
                  ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 animate-pulse' 
                  : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:hover:bg-indigo-900/40'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              {isRecording ? "Stop Recording..." : "Tap to Speak"}
            </button>
            <p className="text-xs text-slate-500 mt-3 text-center">AI will automatically transcribe your speech to text.</p>
          </div>

          {/* Box 3: Comments from Advisor */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Advisor Comments</h3>
            </div>
            
            <div className="flex-1 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <span className="text-xs font-bold text-white">A</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Advisor</span>
                    <span className="text-[10px] font-medium text-slate-400">10:30 AM</span>
                  </div>
                  <div className="p-3 rounded-2xl rounded-tl-none bg-slate-50 border border-slate-100 dark:bg-slate-800 dark:border-slate-700/50">
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      Your journal shows good progress. Keep it up!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </StudentLayout>
  );
}

```

---

## Daily Time Record (DTR)

Students log their work hours through the DTR module. They can record time-in/time-out events, calculate rendered hours, and track progress against the required practicum hours.

**File:** `src/app/dtr/page.tsx`
```tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import StudentLayout from "@/components/StudentLayout";
import { getSession } from "@/lib/auth";

export default function DTRPage() {
  const router = useRouter();
  const [isUrgent, setIsUrgent] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    const s = getSession();
    if (!s || s.role !== "student") router.push("/login");
  }, [router]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedFile(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!uploadedFile) {
      alert("Please upload a file first.");
      return;
    }
    const s = getSession();
    const entry = {
      id: Date.now().toString(),
      type: "dtr",
      studentId: s?.studentId || "",
      title: `DTR Submission - ${fileName}`,
      content: "File uploaded successfully.",
      fileData: uploadedFile,
      fileName,
      isUrgent,
      status: "pending",
      date: new Date().toLocaleDateString(),
      createdAt: new Date().toISOString(),
    };
    
    const existingSubs = JSON.parse(localStorage.getItem("practicum_submissions") || "[]");
    localStorage.setItem("practicum_submissions", JSON.stringify([entry, ...existingSubs]));
    
    const existingDocs = JSON.parse(localStorage.getItem("practicum_documents") || "[]");
    localStorage.setItem("practicum_documents", JSON.stringify([entry, ...existingDocs]));
    
    setUploadedFile(null);
    setFileName("");
    setIsUrgent(false);
    alert("DTR submitted successfully!");
    router.push("/dashboard");
  };

  return (
    <StudentLayout activeNav="dtr">
      <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row gap-6 md:gap-8 items-start">
        
        {/* Left Form Area */}
        <div className="flex-1 w-full">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Upload Daily Time Record (DTR)</h2>
            </div>
            
            <div className="space-y-6">
              {/* File Upload Area */}
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-10 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer relative">
                <input 
                  type="file" 
                  accept=".pdf,.doc,.docx,.jpg,.png" 
                  onChange={handleFileUpload} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">Click to upload or drag and drop</h3>
                <p className="text-xs text-slate-500">PDF, DOC, DOCX, PNG, JPG (Max 5MB)</p>
                
                {fileName && (
                  <div className="mt-4 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium border border-blue-200 dark:border-blue-800/50 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    {fileName}
                  </div>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Mark as Urgent</span>
                  <button 
                    onClick={() => setIsUrgent(!isUrgent)} 
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 ${isUrgent ? 'bg-red-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                  >
                    <span className={`inline-block h-5 w-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${isUrgent ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                <button 
                  onClick={handleSubmit} 
                  className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm ${
                    uploadedFile 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                  }`}
                  disabled={!uploadedFile}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Submit Document
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-full lg:w-72 xl:w-80 flex-shrink-0 space-y-6 lg:sticky lg:top-0">
          
          {/* Info Box */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">DTR Guidelines</h3>
            </div>
            <div className="space-y-3 text-sm">
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-xs">
                Your Daily Time Record must be signed by your supervisor before uploading. Ensure that the total hours computed are clear and legible.
              </p>
              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800/50">
                <span className="text-slate-500">Date</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-slate-500">Status</span>
                <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Not Submitted</span>
              </div>
            </div>
          </div>

          {/* Message from Advisor (Template Download) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Message from Advisor</h3>
            </div>
            
            <div className="flex-1 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <span className="text-xs font-bold text-white">A</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Demo Advisor</span>
                    <span className="text-[10px] font-medium text-slate-400">Just now</span>
                  </div>
                  <div className="p-3 rounded-2xl rounded-tl-none bg-slate-50 border border-slate-100 dark:bg-slate-800 dark:border-slate-700/50 shadow-sm">
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                      Here is the official DTR template you requested. Please use this one.
                    </p>
                    <button className="w-full py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800/50">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      DTR_Template.pdf
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </StudentLayout>
  );
}

```

---

## Memorandum of Agreement (MOA)

This section manages the submission, review, and tracking of the MOA between the student, the university, and the host company.

**File:** `src/app/moa/page.tsx`
```tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import StudentLayout from "@/components/StudentLayout";
import { getSession } from "@/lib/auth";

export default function MOAPage() {
  const router = useRouter();
  const [isUrgent, setIsUrgent] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    const s = getSession();
    if (!s || s.role !== "student") router.push("/login");
  }, [router]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedFile(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!uploadedFile) {
      alert("Please upload a file first.");
      return;
    }
    const s = getSession();
    const entry = {
      id: Date.now().toString(),
      type: "moa",
      studentId: s?.studentId || "",
      title: `MOA Submission - ${fileName}`,
      content: "File uploaded successfully.",
      fileData: uploadedFile,
      fileName,
      isUrgent,
      status: "pending",
      date: new Date().toLocaleDateString(),
      createdAt: new Date().toISOString(),
    };
    
    const existingSubs = JSON.parse(localStorage.getItem("practicum_submissions") || "[]");
    localStorage.setItem("practicum_submissions", JSON.stringify([entry, ...existingSubs]));
    
    const existingDocs = JSON.parse(localStorage.getItem("practicum_documents") || "[]");
    localStorage.setItem("practicum_documents", JSON.stringify([entry, ...existingDocs]));
    
    setUploadedFile(null);
    setFileName("");
    setIsUrgent(false);
    alert("MOA submitted successfully!");
    router.push("/dashboard");
  };

  return (
    <StudentLayout activeNav="moa">
      <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row gap-6 md:gap-8 items-start">
        
        <div className="flex-1 w-full">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Upload Memorandum of Agreement</h2>
            </div>
            
            <div className="space-y-6">
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-10 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer relative">
                <input 
                  type="file" 
                  accept=".pdf,.doc,.docx,.jpg,.png" 
                  onChange={handleFileUpload} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">Click to upload or drag and drop</h3>
                <p className="text-xs text-slate-500">PDF, DOC, DOCX, PNG, JPG (Max 5MB)</p>
                
                {fileName && (
                  <div className="mt-4 px-4 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg text-sm font-medium border border-purple-200 dark:border-purple-800/50 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    {fileName}
                  </div>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Mark as Urgent</span>
                  <button 
                    onClick={() => setIsUrgent(!isUrgent)} 
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 ${isUrgent ? 'bg-red-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                  >
                    <span className={`inline-block h-5 w-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${isUrgent ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                <button 
                  onClick={handleSubmit} 
                  className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm ${
                    uploadedFile 
                      ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                  }`}
                  disabled={!uploadedFile}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Submit Document
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-72 xl:w-80 flex-shrink-0 space-y-6 lg:sticky lg:top-0">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">MOA Guidelines</h3>
            </div>
            <div className="space-y-3 text-sm">
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-xs">
                Ensure that all signatures (Student, Company Rep, and School Coord) are present before submitting your MOA.
              </p>
              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800/50">
                <span className="text-slate-500">Date</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-slate-500">Status</span>
                <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Not Submitted</span>
              </div>
            </div>
          </div>

          {/* Message from Advisor (Template Download) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Message from Advisor</h3>
            </div>
            
            <div className="flex-1 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <span className="text-xs font-bold text-white">A</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Demo Advisor</span>
                    <span className="text-[10px] font-medium text-slate-400">Just now</span>
                  </div>
                  <div className="p-3 rounded-2xl rounded-tl-none bg-slate-50 border border-slate-100 dark:bg-slate-800 dark:border-slate-700/50 shadow-sm">
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                      Please use this official MOA template. Make sure all parties sign it before you upload it here.
                    </p>
                    <button className="w-full py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:hover:bg-purple-900/50 border border-purple-200 dark:border-purple-800/50">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      MOA_Template.docx
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </StudentLayout>
  );
}

```

---

## Evaluation

Students can view evaluations submitted by their industry supervisor or academic advisor. It presents feedback and grading metrics.

**File:** `src/app/evaluation/page.tsx`
```tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import StudentLayout from "@/components/StudentLayout";
import { getSession } from "@/lib/auth";

export default function EvaluationPage() {
  const router = useRouter();
  const [isUrgent, setIsUrgent] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    const s = getSession();
    if (!s || s.role !== "student") router.push("/login");
  }, [router]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedFile(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!uploadedFile) {
      alert("Please upload a file first.");
      return;
    }
    const s = getSession();
    const entry = {
      id: Date.now().toString(),
      type: "evaluation",
      studentId: s?.studentId || "",
      title: `Evaluation Submission - ${fileName}`,
      content: "File uploaded successfully.",
      fileData: uploadedFile,
      fileName,
      isUrgent,
      status: "pending",
      date: new Date().toLocaleDateString(),
      createdAt: new Date().toISOString(),
    };
    
    const existingSubs = JSON.parse(localStorage.getItem("practicum_submissions") || "[]");
    localStorage.setItem("practicum_submissions", JSON.stringify([entry, ...existingSubs]));
    
    const existingDocs = JSON.parse(localStorage.getItem("practicum_documents") || "[]");
    localStorage.setItem("practicum_documents", JSON.stringify([entry, ...existingDocs]));
    
    setUploadedFile(null);
    setFileName("");
    setIsUrgent(false);
    alert("Evaluation submitted successfully!");
    router.push("/dashboard");
  };

  return (
    <StudentLayout activeNav="evaluation">
      <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row gap-6 md:gap-8 items-start">
        
        <div className="flex-1 w-full">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Upload Final Evaluation Form</h2>
            </div>
            
            <div className="space-y-6">
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-10 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer relative">
                <input 
                  type="file" 
                  accept=".pdf,.doc,.docx,.jpg,.png" 
                  onChange={handleFileUpload} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">Click to upload or drag and drop</h3>
                <p className="text-xs text-slate-500">PDF, DOC, DOCX, PNG, JPG (Max 5MB)</p>
                
                {fileName && (
                  <div className="mt-4 px-4 py-2 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 rounded-lg text-sm font-medium border border-orange-200 dark:border-orange-800/50 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    {fileName}
                  </div>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Mark as Urgent</span>
                  <button 
                    onClick={() => setIsUrgent(!isUrgent)} 
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 ${isUrgent ? 'bg-red-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                  >
                    <span className={`inline-block h-5 w-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${isUrgent ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                <button 
                  onClick={handleSubmit} 
                  className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm ${
                    uploadedFile 
                      ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                  }`}
                  disabled={!uploadedFile}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Submit Document
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-72 xl:w-80 flex-shrink-0 space-y-6 lg:sticky lg:top-0">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-4 h-4 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Evaluation Info</h3>
            </div>
            <div className="space-y-3 text-sm">
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-xs">
                Your evaluation must be filled out directly by your host company supervisor. It determines a significant part of your final grade.
              </p>
              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800/50">
                <span className="text-slate-500">Date</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-slate-500">Status</span>
                <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Not Submitted</span>
              </div>
            </div>
          </div>

          {/* Message from Advisor (Template Download) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-4 h-4 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Message from Advisor</h3>
            </div>
            
            <div className="flex-1 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <span className="text-xs font-bold text-white">A</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Demo Advisor</span>
                    <span className="text-[10px] font-medium text-slate-400">Just now</span>
                  </div>
                  <div className="p-3 rounded-2xl rounded-tl-none bg-slate-50 border border-slate-100 dark:bg-slate-800 dark:border-slate-700/50 shadow-sm">
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                      Please have your company supervisor fill out this evaluation form and then submit it here.
                    </p>
                    <button className="w-full py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:hover:bg-orange-900/50 border border-orange-200 dark:border-orange-800/50">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Evaluation_Form.pdf
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </StudentLayout>
  );
}

```

---

## Templates Repository

A centralized place where students can download required forms and document templates (e.g., evaluation forms, final report formats).

**File:** `src/app/templates/page.tsx`
```tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StudentLayout from "@/components/StudentLayout";
import { getSession } from "@/lib/auth";

export default function TemplatesPage() {
  const router = useRouter();

  useEffect(() => {
    const s = getSession();
    if (!s || s.role !== "student") router.push("/login");
  }, [router]);

  const templates = [
    { id: 1, title: "Daily Time Record (DTR) Template", type: "PDF", size: "245 KB", icon: "clock" },
    { id: 2, title: "Memorandum of Agreement (MOA)", type: "DOCX", size: "1.2 MB", icon: "doc" },
    { id: 3, title: "Final Evaluation Form", type: "PDF", size: "450 KB", icon: "chart" },
    { id: 4, title: "Journal Cover Page", type: "DOCX", size: "105 KB", icon: "journal" },
  ];

  return (
    <StudentLayout activeNav="templates">
      <div className="max-w-[1600px] mx-auto space-y-6 md:space-y-8">
        
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Document Templates</h2>
            <p className="text-sm text-slate-500">Download the required forms and templates for your practicum.</p>
          </div>
          <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-900/50">
            <span className="text-sm font-semibold text-blue-700 dark:text-blue-400">{templates.length} Templates Available</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {templates.map(template => (
            <div key={template.id} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group">
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-blue-100 group-hover:text-blue-600 transition-all">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {template.icon === 'doc' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />}
                  {template.icon === 'clock' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />}
                  {template.icon === 'chart' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />}
                  {template.icon === 'journal' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />}
                </svg>
              </div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-1 leading-tight">{template.title}</h3>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500 uppercase tracking-wider mb-6">
                <span>{template.type}</span>
                <span>•</span>
                <span>{template.size}</span>
              </div>
              <button 
                onClick={() => alert(`Downloading ${template.title}...`)}
                className="w-full py-2.5 rounded-lg text-sm font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </button>
            </div>
          ))}
        </div>

      </div>
    </StudentLayout>
  );
}

```

---

## Documents & Submissions

This file repository stores all documents uploaded by the student. It interfaces with the submissions logic so students can track the approval status of their files.

**File:** `src/app/documents/page.tsx`
```tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import StudentLayout from "@/components/StudentLayout";
import { getSession } from "@/lib/auth";

interface Submission {
  id: string;
  type: string;
  title: string;
  studentId?: string;
  status: string;
  submittedAt: string;
  isUrgent?: boolean;
  fileName?: string;
  feedback?: string;
}

export default function DocumentsPage() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const s = getSession();
    if (!s || s.role !== "student") router.push("/login");

    let rawSubs: Submission[] = JSON.parse(localStorage.getItem("practicum_submissions") || "[]");
    let mySubs = rawSubs.filter((sub) => sub.studentId === s?.studentId);
    
    // Add examples if the student has no submissions yet
    if (mySubs.length === 0 && s) {
      const now = Date.now();
      const samples: Submission[] = [
        {
          id: `sample-1-${now}`,
          type: "journal",
          title: "Journal Entry - Week 1",
          status: "approved",
          submittedAt: new Date(now - 86400000 * 5).toISOString(), // 5 days ago
          studentId: s.studentId,
        },
        {
          id: `sample-2-${now}`,
          type: "dtr",
          title: "DTR Submission - March",
          fileName: "DTR_March_Signed.pdf",
          status: "pending",
          submittedAt: new Date(now - 86400000 * 2).toISOString(), // 2 days ago
          studentId: s.studentId,
        },
        {
          id: `sample-3-${now}`,
          type: "moa",
          title: "MOA Submission",
          fileName: "Signed_MOA_TechCorp.pdf",
          status: "rejected",
          feedback: "The company representative signature is missing on page 2. Please have them sign it and re-upload.",
          submittedAt: new Date(now - 86400000 * 4).toISOString(), // 4 days ago
          studentId: s.studentId,
        },
        {
          id: `sample-4-${now}`,
          type: "evaluation",
          title: "Mid-term Evaluation Form",
          fileName: "Midterm_Eval_Supervisor.docx",
          status: "revision",
          feedback: "Please make sure your supervisor fills out the comments section completely at the bottom of the form.",
          submittedAt: new Date(now - 86400000 * 1).toISOString(), // 1 day ago
          studentId: s.studentId,
        }
      ];
      
      // Save samples to local storage so they show up everywhere
      rawSubs = [...rawSubs, ...samples];
      localStorage.setItem("practicum_submissions", JSON.stringify(rawSubs));
      mySubs = samples;
    }

    setSubmissions(mySubs.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()));
  }, [router]);

  const filtered = submissions.filter(s => filter === "all" || s.status === filter);

  return (
    <StudentLayout activeNav="documents">
      <div className="max-w-[1600px] mx-auto space-y-6 md:space-y-8">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">My Submissions</h2>
          
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            {["all", "pending", "approved", "rejected", "revision"].map(f => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                  filter === f 
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <svg className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              No documents found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Document</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date Submitted</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Feedback</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {filtered.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-800 dark:text-slate-200">{doc.title}</div>
                        {doc.fileName && <div className="text-xs text-slate-500">{doc.fileName}</div>}
                      </td>
                      <td className="px-6 py-4">
                        <span className="uppercase text-xs font-bold text-slate-500">{doc.type}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {new Date(doc.submittedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                          doc.status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          doc.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          doc.status === 'revision' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                          'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                          {doc.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {doc.feedback ? doc.feedback : <span className="text-slate-300 dark:text-slate-700">—</span>}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => alert(`Opening document viewer for: ${doc.fileName || doc.title}`)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-blue-400 rounded-lg text-xs font-semibold transition-all shadow-sm"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </StudentLayout>
  );
}

```

---

## Student Profile

The Profile page allows students to view and update their personal information, practicum details, and account settings.

**File:** `src/app/profile/page.tsx`
```tsx
"use client";

import { useState, useEffect } from "react";
import { getSession, User } from "@/lib/auth";
import StudentLayout from "@/components/StudentLayout";

export default function StudentProfile() {
  const [session, setSession] = useState<User | null>(null);

  useEffect(() => {
    setSession(getSession());
  }, []);

  if (!session) return null;

  return (
    <StudentLayout activeNav="profile">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {/* Header Gradient */}
          <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600" />
          
          <div className="px-8 pb-8">
            {/* Avatar & Action Button */}
            <div className="relative flex justify-between items-end -mt-12 mb-8">
              <div className="w-24 h-24 rounded-3xl bg-white dark:bg-slate-900 p-1 shadow-lg">
                <div className="w-full h-full rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-3xl font-bold text-blue-600">
                  {session.name.charAt(0)}
                </div>
              </div>
              <button className="px-6 py-2.5 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-xl text-sm font-bold shadow-sm hover:opacity-90 transition-opacity">
                Edit Profile
              </button>
            </div>

            {/* Basic Info */}
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{session.name}</h3>
                <p className="text-sm text-slate-500 font-medium">BS Information Technology · ID: {session.studentId}</p>
              </div>

              {/* Stats/Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Email Address</label>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{session.email}</p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Year & Section</label>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">4th Year - IT401</p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Specialization</label>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Web Development</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Current Status</label>
                    <span className="px-2.5 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-md text-[10px] font-bold uppercase tracking-widest">
                      Deployed
                    </span>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Practicum Company</label>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Tech Corp</p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Skills Summary</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {["React", "TypeScript", "Node.js", "SQL"].map((skill) => (
                        <span key={skill} className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-md text-[10px] font-bold uppercase">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Emergency Contact Section */}
              <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  Emergency Contact
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Guardian Name</label>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Maria Dwayne</p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Contact Number</label>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">0912 345 6789</p>
                  </div>
                </div>
              </div>

              {/* Security Footer */}
              <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4">Account Security</h4>
                <button className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline">Change Password</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}

```
