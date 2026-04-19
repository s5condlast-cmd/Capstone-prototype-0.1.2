"use client";

import { useState, useEffect } from "react";
import { getSession, getUsers } from "@/lib/auth";
import AdvisorLayout from "@/components/AdvisorLayout";

export default function AdvisorReports() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);

  useEffect(() => {
    const s = getSession();
    if (!s || s.role !== "advisor") return;
    const allUsers = getUsers();
    setStudents(allUsers.filter(u => u.role === "student"));
    setSubmissions(JSON.parse(localStorage.getItem("practicum_submissions") || "[]"));
  }, []);

  const totalSubs = submissions.length;
  const approved = submissions.filter(s => s.status === 'approved').length;
  const pending = submissions.filter(s => s.status === 'pending').length;
  const revision = submissions.filter(s => s.status === 'revision').length;

  const approvalRate = totalSubs > 0 ? Math.round((approved / totalSubs) * 100) : 0;

  return (
    <AdvisorLayout activeNav="reports">
      <div className="max-w-[1600px] mx-auto space-y-6">
        
        {/* Performance Header */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold text-slate-500 mb-1">Approval Efficiency</h3>
            <div className="flex items-end gap-3">
              <span className="text-4xl font-bold text-slate-800 dark:text-slate-100">{approvalRate}%</span>
              <span className="text-xs text-green-500 font-bold mb-1">↑ 12% vs last week</span>
            </div>
            <div className="mt-4 w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full" style={{ width: `${approvalRate}%` }} />
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold text-slate-500 mb-1">Queue Health</h3>
            <div className="flex items-end gap-3">
              <span className="text-4xl font-bold text-slate-800 dark:text-slate-100">{pending}</span>
              <span className="text-xs text-slate-500 font-bold mb-1">Pending items</span>
            </div>
            <p className="mt-4 text-xs text-slate-500">Average review time: <span className="font-bold text-blue-600">1.4 days</span></p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-white bg-gradient-to-br from-indigo-600 to-blue-600 border-none">
            <h3 className="text-sm font-bold opacity-80 mb-1">Student Compliance</h3>
            <div className="flex items-end gap-3">
              <span className="text-4xl font-bold">92%</span>
            </div>
            <p className="mt-4 text-xs opacity-80">24 of 26 students have submitted all core documents.</p>
          </div>
        </div>

        {/* Charts Mockup / Stats Table */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Weekly Submission Volume</h3>
              <select className="text-xs border-none bg-slate-50 dark:bg-slate-800 rounded-lg font-bold">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
              </select>
            </div>
            <div className="p-6 h-64 flex items-end gap-2">
              {[40, 70, 45, 90, 65, 30, 80].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="w-full bg-blue-100 dark:bg-blue-900/30 rounded-t-lg relative group-hover:bg-blue-600 transition-colors" style={{ height: `${h}%` }}>
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">{Math.round(h/2)}</div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold">M T W T F S S"[i]</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Status Distribution</h3>
            </div>
            <div className="flex-1 p-8 flex items-center justify-center">
              <div className="relative w-48 h-48 rounded-full border-[16px] border-slate-100 dark:border-slate-800 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{totalSubs}</p>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Total Items</p>
                </div>
                {/* Visual representation of a donut chart using multiple borders or SVGs is complex here, keeping it simple */}
              </div>
              <div className="ml-8 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Approved: {approved}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Pending: {pending}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Revision: {revision}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </AdvisorLayout>
  );
}
