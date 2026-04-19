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
