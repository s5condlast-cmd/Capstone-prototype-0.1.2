"use client";

import { useState, useEffect } from "react";
import { getSession } from "@/lib/auth";
import { getUsers, User } from "@/lib/auth";
import AdvisorLayout from "@/components/AdvisorLayout";
import Link from "next/link";

interface Submission {
  id: string;
  type: string;
  studentName: string;
  studentId: string;
  title: string;
  status: "pending" | "approved" | "rejected" | "revision";
  submittedAt: string;
  isUrgent: boolean;
  content?: string;
  feedback?: string;
}

export default function AdvisorDashboard() {
  const [session, setSession] = useState<User | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [students, setStudents] = useState<User[]>([]);

  useEffect(() => {
    const s = getSession();
    if (!s || s.role !== "advisor") return;
    setSession(s);

    const allUsers = getUsers();
    setStudents(allUsers.filter(u => u.role === "student"));

    let subs: Submission[] = JSON.parse(localStorage.getItem("practicum_submissions") || "[]");
    setSubmissions(subs);
  }, []);

  const pendingCount = submissions.filter(s => s.status === "pending").length;
  const approvedCount = submissions.filter(s => s.status === "approved").length;
  const rejectedCount = submissions.filter(s => s.status === "rejected").length;
  const revisionCount = submissions.filter(s => s.status === "revision").length;

  const priorityQueue = submissions
    .filter(s => s.status === "pending" || s.isUrgent)
    .sort((a, b) => {
      if (a.isUrgent && !b.isUrgent) return -1;
      if (!a.isUrgent && b.isUrgent) return 1;
      return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
    })
    .slice(0, 5);

  const studentsAtRisk = students.map(student => {
    const studentSubs = submissions.filter(s => s.studentId === student.studentId);
    const approved = studentSubs.filter(s => s.status === "approved").length;
    // Simple logic: if less than 1 approved doc, they are at risk
    return { ...student, approvedCount: approved };
  }).filter(s => s.approvedCount < 2).slice(0, 3);

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      approved: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      revision: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
      pending: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    };
    return <span className={`px-2.5 py-1 rounded-md text-xs font-semibold uppercase ${styles[status] || styles.pending}`}>{status}</span>;
  };

  return (
    <AdvisorLayout activeNav="dashboard">
      <div className="max-w-[1600px] mx-auto space-y-6 md:space-y-8">
        
        {/* Welcome Header */}
        <section className="bg-gradient-to-r from-blue-700 to-indigo-600 rounded-2xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-10 pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Welcome, {session?.name}! 👋</h2>
              <p className="text-blue-100 text-sm md:text-base">You have {pendingCount} pending submissions to review today.</p>
            </div>
            <div className="flex gap-3">
              <Link href="/advisor/approvals" className="px-5 py-2.5 bg-white text-blue-600 rounded-xl font-bold text-sm shadow-sm hover:bg-blue-50 transition-colors">Review Submissions</Link>
            </div>
          </div>
        </section>

        {/* Stats */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-32">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              </div>
              <span className="text-3xl font-bold text-slate-900 dark:text-white">{students.length}</span>
            </div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Students</span>
          </div>
          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-32">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <span className="text-3xl font-bold text-slate-900 dark:text-white">{pendingCount}</span>
            </div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Pending Review</span>
          </div>
          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-32">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <span className="text-3xl font-bold text-slate-900 dark:text-white">{approvedCount}</span>
            </div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Approved Items</span>
          </div>
          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-32">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </div>
              <span className="text-3xl font-bold text-slate-900 dark:text-white">{revisionCount + rejectedCount}</span>
            </div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Revision/Rejected</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          
          {/* Priority Queue (Main Column) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Priority Queue</h3>
                <Link href="/advisor/approvals" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">View All</Link>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {priorityQueue.length === 0 ? (
                  <div className="p-12 text-center text-slate-500">No priority items found.</div>
                ) : priorityQueue.map(sub => (
                  <Link key={sub.id} href="/advisor/approvals" className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 font-bold text-sm">{(sub.studentName || "S").charAt(0)}</div>
                      <div>
                        <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                          {sub.title || "Untitled"}
                          {sub.isUrgent && <span className="bg-red-500 w-2 h-2 rounded-full animate-pulse" />}
                        </div>
                        <div className="text-xs text-slate-500">{sub.studentName || sub.studentId || "Unknown"} · {(sub.type || "doc").toUpperCase()}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-slate-400">{new Date(sub.submittedAt).toLocaleDateString()}</span>
                      {statusBadge(sub.status)}
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Recent Activity</h3>
              </div>
              <div className="p-6 space-y-6">
                {submissions.slice(0, 4).map((sub, i) => (
                  <div key={i} className="flex gap-4">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${sub.status === 'approved' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sub.status === 'approved' ? "M5 13l4 4L19 7" : "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"} />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                        {sub.status === 'approved' ? `Approved ${sub.title} from ${sub.studentName}` : `${sub.studentName} submitted ${sub.title}`}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">{new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar (At Risk & AI) */}
          <div className="space-y-6 md:space-y-8">
            
            {/* Students At Risk */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Students At Risk</h3>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {studentsAtRisk.length === 0 ? (
                  <div className="p-6 text-center text-sm text-slate-500">All students are on track!</div>
                ) : studentsAtRisk.map(student => (
                  <div key={student.studentId} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center text-xs font-bold">{student.name.charAt(0)}</div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{student.name}</p>
                        <p className="text-[10px] text-slate-500">Only {student.approvedCount} approved documents</p>
                      </div>
                    </div>
                    <Link href={`/advisor/students/${student.studentId}`} className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
                      <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Suggestions */}
            <div className="bg-indigo-600 dark:bg-indigo-900 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <div>
                  <h3 className="text-base font-bold">AI Suggestions</h3>
                  <p className="text-[10px] text-indigo-100 opacity-80">Based on pending queue</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                  <p className="text-xs text-indigo-50 leading-relaxed font-medium">
                    You have 3 MOAs from the same batch. Reviewing them together might save time as the company terms are likely identical.
                  </p>
                </div>
                <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                  <p className="text-xs text-indigo-50 leading-relaxed font-medium">
                    Student STUDENT-001 has 4 journals pending. Consider bulk reviewing these to update their progress score.
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </AdvisorLayout>
  );
}
