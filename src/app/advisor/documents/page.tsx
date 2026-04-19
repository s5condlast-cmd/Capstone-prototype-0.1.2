"use client";

import { useState, useEffect } from "react";
import { getSession } from "@/lib/auth";
import AdvisorLayout from "@/components/AdvisorLayout";

interface Submission {
  id: string;
  type: string;
  studentName: string;
  studentId: string;
  title: string;
  status: "pending" | "approved" | "rejected" | "revision";
  submittedAt: string;
}

export default function AdvisorDocuments() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filter, setFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    const s = getSession();
    if (!s || s.role !== "advisor") return;
    const subs: Submission[] = JSON.parse(localStorage.getItem("practicum_submissions") || "[]");
    setSubmissions(subs);
  }, []);

  const filtered = submissions.filter(s => {
    const matchesStatus = filter === "all" || s.status === filter;
    const matchesType = typeFilter === "all" || s.type === typeFilter;
    return matchesStatus && matchesType;
  });

  const categories = ["journal", "dtr", "moa", "evaluation"];

  return (
    <AdvisorLayout activeNav="documents">
      <div className="max-w-[1600px] mx-auto space-y-6">
        
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Document Repository</h3>
            <p className="text-sm text-slate-500">Access all student submissions from one place</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select 
              value={typeFilter} 
              onChange={e => setTypeFilter(e.target.value)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              {categories.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
            </select>
            <select 
              value={filter} 
              onChange={e => setFilter(e.target.value)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="revision">Revision</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                  <th className="text-left py-4 px-6 text-xs font-semibold text-slate-500 uppercase">Document</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-slate-500 uppercase">Student</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-slate-500 uppercase">Type</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-slate-500 uppercase">Date</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-slate-500 uppercase">Status</th>
                  <th className="text-right py-4 px-6 text-xs font-semibold text-slate-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="py-12 text-center text-slate-500">No documents match the filters.</td></tr>
                ) : filtered.map(sub => (
                  <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-6 text-sm font-semibold text-slate-800 dark:text-slate-200">{sub.title || "Untitled"}</td>
                    <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-400">{sub.studentName}</td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold uppercase">{sub.type}</span>
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-500">{new Date(sub.submittedAt).toLocaleDateString()}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${
                        sub.status === 'approved' ? 'bg-green-100 text-green-700' :
                        sub.status === 'pending' ? 'bg-blue-100 text-blue-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button className="text-xs font-bold text-blue-600 hover:underline">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AdvisorLayout>
  );
}
