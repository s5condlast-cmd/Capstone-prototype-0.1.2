"use client";

import { useState, useEffect } from "react";
import { getSession, getUsers } from "@/lib/auth";
import AdvisorLayout from "@/components/AdvisorLayout";
import Link from "next/link";

interface Submission {
  id: string;
  type: string;
  studentName: string;
  studentId: string;
  title: string;
  status: string;
  submittedAt: string;
}

export default function AdvisorStudents() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const s = getSession();
    if (!s || s.role !== "advisor") return;
    
    const allUsers = getUsers();
    const studentUsers = allUsers.filter(u => u.role === "student");
    
    const subs: Submission[] = JSON.parse(localStorage.getItem("practicum_submissions") || "[]");
    setSubmissions(subs);

    const studentStats = studentUsers.map(student => {
      const studentSubs = subs.filter(s => s.studentId === student.studentId);
      const approved = studentSubs.filter(s => s.status === 'approved').length;
      const pending = studentSubs.filter(s => s.status === 'pending').length;
      // Define at risk as less than 2 approved documents after initial phase
      const isAtRisk = approved < 2;
      return { ...student, approved, pending, isAtRisk };
    });

    setStudents(studentStats);
  }, []);

  const filtered = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.studentId.includes(search);
    const matchesFilter = filter === 'all' || (filter === 'at-risk' && s.isAtRisk) || (filter === 'completed' && s.approved >= 4);
    return matchesSearch && matchesFilter;
  });

  return (
    <AdvisorLayout activeNav="students">
      <div className="max-w-[1600px] mx-auto space-y-6">
        
        {/* Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex-1 relative max-w-md">
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input 
              type="text" 
              placeholder="Search by name or student ID..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            {['all', 'at-risk', 'completed'].map(f => (
              <button 
                key={f} 
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${filter === f ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Student Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.length === 0 ? (
            <div className="col-span-full py-20 text-center text-slate-500 italic">No students found matching your criteria.</div>
          ) : filtered.map(student => (
            <Link 
              key={student.studentId} 
              href={`/advisor/students/${student.studentId}`}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden"
            >
              {student.isAtRisk && <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/10 -mr-8 -mt-8 rounded-full" />}
              
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold ${student.isAtRisk ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                  {student.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 transition-colors">{student.name}</h4>
                  <p className="text-xs text-slate-500">{student.studentId}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Progress</p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{Math.round((student.approved / 4) * 100)}%</span>
                      <span className="text-[10px] text-slate-500">({student.approved}/4 Approved)</span>
                    </div>
                  </div>
                  {student.pending > 0 && (
                    <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded-md text-[10px] font-bold">
                      {student.pending} PENDING
                    </span>
                  )}
                </div>
                
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${student.isAtRisk ? 'bg-red-500' : 'bg-blue-600'}`} 
                    style={{ width: `${Math.min(100, (student.approved / 4) * 100)}%` }} 
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Company: Tech Corp</span>
                  <div className="flex -space-x-2">
                    {[1,2,3].map(i => <div key={i} className="w-5 h-5 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200" />)}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </AdvisorLayout>
  );
}
