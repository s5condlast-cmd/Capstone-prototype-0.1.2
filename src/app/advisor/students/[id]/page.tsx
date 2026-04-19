"use client";

import { useState, useEffect, use } from "react";
import { getSession, getUsers } from "@/lib/auth";
import AdvisorLayout from "@/components/AdvisorLayout";
import Link from "next/link";

export default function StudentProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [student, setStudent] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);

  useEffect(() => {
    const allUsers = getUsers();
    const s = allUsers.find(u => u.studentId === id);
    setStudent(s);

    const allSubs = JSON.parse(localStorage.getItem("practicum_submissions") || "[]");
    setSubmissions(allSubs.filter((sub: any) => sub.studentId === id));
  }, [id]);

  if (!student) return <AdvisorLayout activeNav="students"><div className="p-20 text-center">Student not found</div></AdvisorLayout>;

  const approved = submissions.filter(s => s.status === 'approved').length;
  const totalRequired = 4;
  const progress = Math.round((approved / totalRequired) * 100);

  return (
    <AdvisorLayout activeNav="students">
      <div className="max-w-[1600px] mx-auto space-y-6">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
          <Link href="/advisor/students" className="hover:text-blue-600 transition-colors">Students</Link>
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
          <span className="text-slate-800 dark:text-slate-100">{student.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          
          {/* Left: Info & Progress */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-3xl font-bold text-blue-600">
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{student.name}</h3>
                    <p className="text-sm text-slate-500 font-medium">BSIT · {student.studentId} · Tech Corp</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-blue-700 transition-colors">Message</button>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-700/50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-100">Overall Progress</span>
                  <span className="text-sm font-bold text-blue-600">{progress}%</span>
                </div>
                <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-3">{approved} of {totalRequired} core requirements approved</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Submission History</h3>
                <span className="text-xs font-bold text-slate-400 tracking-widest uppercase">{submissions.length} Total</span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {submissions.length === 0 ? (
                  <div className="p-12 text-center text-slate-500 italic">No submissions yet.</div>
                ) : submissions.map(sub => (
                  <div key={sub.id} className="px-6 py-4 flex items-center justify-between group hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{sub.title}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{sub.type} · {new Date(sub.submittedAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                        sub.status === 'approved' ? 'bg-green-100 text-green-700' :
                        sub.status === 'pending' ? 'bg-blue-100 text-blue-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {sub.status}
                      </span>
                      <Link href="/advisor/approvals" className="p-2 opacity-0 group-hover:opacity-100 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-400 hover:text-blue-600 transition-all">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Checklist & Notes */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-widest mb-4">Requirements Checklist</h3>
              <div className="space-y-3">
                {['MOA', 'Journal', 'DTR', 'Evaluation'].map(req => {
                  const sub = submissions.find(s => s.type.toLowerCase() === req.toLowerCase());
                  const isDone = sub?.status === 'approved';
                  return (
                    <div key={req} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded flex items-center justify-center border ${isDone ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300 dark:border-slate-600'}`}>
                          {isDone && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                        </div>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{req}</span>
                      </div>
                      {!isDone && <span className="text-[10px] font-bold text-slate-400 uppercase italic">Missing</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-widest mb-4">Advisor Notes</h3>
              <textarea 
                placeholder="Add private notes about this student..."
                rows={4}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-3"
              />
              <button className="w-full py-2 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors">Save Notes</button>
            </div>
          </div>

        </div>

      </div>
    </AdvisorLayout>
  );
}
