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
