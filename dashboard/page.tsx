"use client";

import { useState, useEffect } from "react";
import { getSession, getUsers, User } from "@/lib/auth";
import AdminLayout from "@/components/AdminLayout";
import Link from "next/link";

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);

  useEffect(() => {
    const s = getSession();
    if (!s || s.role !== "admin") return;
    setUsers(getUsers());
    setSubmissions(JSON.parse(localStorage.getItem("practicum_submissions") || "[]"));
  }, []);

  const students = users.filter(u => u.role === "student");
  const advisors = users.filter(u => u.role === "advisor");
  const statusDist = {
    approved: submissions.filter(s => s.status === "approved").length,
    pending: submissions.filter(s => s.status === "pending").length,
    rejected: submissions.filter(s => s.status === "rejected").length,
    revision: submissions.filter(s => s.status === "revision").length,
  };
  const approvalRate = submissions.length > 0 ? Math.round((statusDist.approved / submissions.length) * 100) : 0;
  const activeStudentRate = students.length > 0 ? Math.round((new Set(submissions.map(s => s.studentName)).size / students.length) * 100) : 0;
  const avgSubs = students.length > 0 ? (submissions.length / students.length).toFixed(1) : "0.0";

  return (
    <AdminLayout activeNav="dashboard">
      <div className="max-w-[1600px] mx-auto space-y-6 md:space-y-8">
        
        {/* Stats */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            { label: "Total Users", value: users.length, icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z", color: "blue" },
            { label: "Students", value: students.length, icon: "M5 13l4 4L19 7", color: "green" },
            { label: "Advisers", value: advisors.length, icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z", color: "amber" },
            { label: "Submissions", value: submissions.length, icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", color: "purple" },
          ].map(card => (
            <div key={card.label} className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-${card.color}-50 dark:bg-${card.color}-900/30 text-${card.color}-600 dark:text-${card.color}-400 flex items-center justify-center`}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} /></svg>
                </div>
                <span className="text-3xl font-bold text-slate-900 dark:text-white leading-none">{card.value}</span>
              </div>
              <span className="text-xs font-medium text-slate-500">{card.label}</span>
            </div>
          ))}
        </div>

        {/* Recent Submissions + Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Recent Submissions</h3>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {submissions.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">No submissions yet.</div>
              ) : submissions.slice(0, 5).map((sub: any, i: number) => (
                <div key={i} className="px-6 py-3.5 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{sub.title}</div>
                    <div className="text-xs text-slate-500">{sub.studentName}</div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-md text-xs font-semibold uppercase ${sub.status === "approved" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : sub.status === "rejected" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : sub.status === "revision" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"}`}>{sub.status}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Manage Users", href: "/admin/users", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
                { label: "Batch Setup", href: "/admin/batches", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
                { label: "Templates", href: "/admin/templates", icon: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z" },
                { label: "View Reports", href: "/admin/reports", icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
              ].map(a => (
                <Link key={a.href} href={a.href} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-700/50 transition-colors group">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-2 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={a.icon} /></svg>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{a.label}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Performance Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4">Performance Metrics</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50"><span className="text-sm text-slate-500">Approval Rate</span><span className="text-sm font-bold text-green-600">{approvalRate}%</span></div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50"><span className="text-sm text-slate-500">Active Student Rate</span><span className="text-sm font-bold text-blue-600">{activeStudentRate}%</span></div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50"><span className="text-sm text-slate-500">Avg. Subs / Student</span><span className="text-sm font-bold text-purple-600">{avgSubs}</span></div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4">Submission Status</h3>
            <div className="space-y-4">
              {Object.entries(statusDist).map(([status, count]) => (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm capitalize text-slate-600 dark:text-slate-400">{status}</span>
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{count}</span>
                  </div>
                  <div className="w-full h-2 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <div className="h-full rounded-full" style={{ width: `${submissions.length ? (count / submissions.length) * 100 : 0}%`, backgroundColor: status === "approved" ? "#16A34A" : status === "pending" ? "#D97706" : status === "revision" ? "#2563EB" : "#DC2626" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4">Activity Logs</h3>
            <div className="space-y-3">
              {submissions.length === 0 ? (
                <p className="text-sm text-slate-500">No activity yet.</p>
              ) : submissions.slice(0, 4).map((sub: any, i: number) => (
                <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{sub.studentName} submitted {sub.title}</p>
                  <p className="text-xs text-slate-500">{sub.type?.toUpperCase()} · {sub.status}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
