"use client";

import { useState, useEffect } from "react";
import { getSession, getUsers } from "@/lib/auth";
import AdminLayout from "@/components/AdminLayout";

export default function AdminMonitoring() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [studentCount, setStudentCount] = useState(0);
  const [advisorCount, setAdvisorCount] = useState(0);

  useEffect(() => {
    const s = getSession();
    if (!s || s.role !== "admin") return;
    const users = getUsers();
    setStudentCount(users.filter(u => u.role === "student").length);
    setAdvisorCount(users.filter(u => u.role === "advisor").length);
    setSubmissions(JSON.parse(localStorage.getItem("practicum_submissions") || "[]"));
  }, []);

  const statusDist = {
    pending: submissions.filter(s => s.status === "pending").length,
    revision: submissions.filter(s => s.status === "revision").length,
  };
  const activeStudentRate = studentCount > 0 ? Math.round((new Set(submissions.map(s => s.studentName)).size / studentCount) * 100) : 0;

  const alerts = [
    statusDist.pending > 0 ? `${statusDist.pending} submission(s) still waiting for action.` : "No pending submissions in queue.",
    statusDist.revision > 0 ? `${statusDist.revision} submission(s) were returned for revision.` : "No revision backlog detected.",
    activeStudentRate < 100 ? `${100 - activeStudentRate}% of students have not submitted any requirement yet.` : "All students have at least one submission on record.",
  ];

  return (
    <AdminLayout activeNav="monitoring">
      <div className="max-w-[1600px] mx-auto space-y-6">
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            { label: "Total Students", value: studentCount, color: "text-slate-900 dark:text-white" },
            { label: "Total Advisors", value: advisorCount, color: "text-slate-900 dark:text-white" },
            { label: "Pending Submissions", value: statusDist.pending, color: "text-amber-600" },
            { label: "Total Submissions", value: submissions.length, color: "text-slate-900 dark:text-white" },
          ].map(card => (
            <div key={card.label} className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <p className="text-xs font-medium text-slate-500 mb-1">{card.label}</p>
              <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4">System Alerts</h3>
            <div className="space-y-3">
              {alerts.map((alert, i) => (
                <div key={i} className={`p-3 rounded-xl flex items-center justify-between ${i === 0 ? "bg-amber-50 dark:bg-amber-900/10 text-amber-800 dark:text-amber-300" : i === 1 ? "bg-blue-50 dark:bg-blue-900/10 text-blue-800 dark:text-blue-300" : "bg-red-50 dark:bg-red-900/10 text-red-800 dark:text-red-300"}`}>
                  <p className="text-sm font-medium">{alert}</p>
                  <div className="flex gap-2">
                    <button className={`px-2 py-1 rounded text-xs font-semibold ${i === 0 ? "bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400" : i === 1 ? "bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400" : "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"}`}>Resolve</button>
                    <button className={`px-2 py-1 rounded text-xs font-semibold ${i === 0 ? "bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400" : i === 1 ? "bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400" : "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"}`}>Assign Action</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {submissions.length === 0 ? (
                <p className="text-sm text-slate-500">No activity yet.</p>
              ) : submissions.slice(0, 5).map((sub: any, i: number) => (
                <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{sub.studentName} submitted {sub.title}</p>
                    <p className="text-xs text-slate-500">{sub.type?.toUpperCase()} · {sub.status}</p>
                  </div>
                  <button className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
