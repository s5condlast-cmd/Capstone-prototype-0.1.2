"use client";

import { useState, useEffect } from "react";
import { getSession, getUsers } from "@/lib/auth";
import AdminLayout from "@/components/AdminLayout";

export default function AdminReports() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [studentCount, setStudentCount] = useState(0);

  useEffect(() => {
    const s = getSession();
    if (!s || s.role !== "admin") return;
    const users = getUsers();
    setStudentCount(users.filter(u => u.role === "student").length);
    setSubmissions(JSON.parse(localStorage.getItem("practicum_submissions") || "[]"));
  }, []);

  const statusDist = {
    approved: submissions.filter(s => s.status === "approved").length,
    pending: submissions.filter(s => s.status === "pending").length,
    rejected: submissions.filter(s => s.status === "rejected").length,
    revision: submissions.filter(s => s.status === "revision").length,
  };
  const approvalRate = submissions.length > 0 ? Math.round((statusDist.approved / submissions.length) * 100) : 0;
  const activeStudentRate = studentCount > 0 ? Math.round((new Set(submissions.map(s => s.studentName)).size / studentCount) * 100) : 0;
  const avgSubs = studentCount > 0 ? (submissions.length / studentCount).toFixed(1) : "0.0";

  return (
    <AdminLayout activeNav="reports">
      <div className="max-w-[1600px] mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Analytics & Reports</h2>
          <div className="flex flex-wrap items-center gap-3">
            <select className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-sm outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>This Semester</option>
              <option>All Time</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm font-semibold">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              Refresh
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors text-sm font-semibold">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Export PDF
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1">Student Compliance</h3>
            <p className="text-xs text-slate-500 mb-4">Students with at least one submission.</p>
            <p className="text-4xl font-bold text-blue-600">{activeStudentRate}%</p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1">Approval Efficiency</h3>
            <p className="text-xs text-slate-500 mb-4">Share of submissions marked approved.</p>
            <p className="text-4xl font-bold text-green-600">{approvalRate}%</p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1">Avg. Volume</h3>
            <p className="text-xs text-slate-500 mb-4">Average submissions per student.</p>
            <p className="text-4xl font-bold text-purple-600">{avgSubs}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4">Performance Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <p className="text-sm text-slate-500 mb-2">Pending Workload</p>
              <p className="text-2xl font-bold text-amber-600">{statusDist.pending + statusDist.revision}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <p className="text-sm text-slate-500 mb-2">Rejected Submissions</p>
              <p className="text-2xl font-bold text-red-600">{statusDist.rejected}</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
