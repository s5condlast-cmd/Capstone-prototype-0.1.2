"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import StudentLayout from "@/components/StudentLayout";
import { getSession } from "@/lib/auth";

interface Submission {
  id: string;
  type: string;
  title: string;
  studentId?: string;
  status: string;
  submittedAt: string;
  isUrgent?: boolean;
  fileName?: string;
  feedback?: string;
}

export default function DocumentsPage() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const s = getSession();
    if (!s || s.role !== "student") router.push("/login");

    let rawSubs: Submission[] = JSON.parse(localStorage.getItem("practicum_submissions") || "[]");
    let mySubs = rawSubs.filter((sub) => sub.studentId === s?.studentId);
    
    // Add examples if the student has no submissions yet
    if (mySubs.length === 0 && s) {
      const now = Date.now();
      const samples: Submission[] = [
        {
          id: `sample-1-${now}`,
          type: "journal",
          title: "Journal Entry - Week 1",
          status: "approved",
          submittedAt: new Date(now - 86400000 * 5).toISOString(), // 5 days ago
          studentId: s.studentId,
        },
        {
          id: `sample-2-${now}`,
          type: "dtr",
          title: "DTR Submission - March",
          fileName: "DTR_March_Signed.pdf",
          status: "pending",
          submittedAt: new Date(now - 86400000 * 2).toISOString(), // 2 days ago
          studentId: s.studentId,
        },
        {
          id: `sample-3-${now}`,
          type: "moa",
          title: "MOA Submission",
          fileName: "Signed_MOA_TechCorp.pdf",
          status: "rejected",
          feedback: "The company representative signature is missing on page 2. Please have them sign it and re-upload.",
          submittedAt: new Date(now - 86400000 * 4).toISOString(), // 4 days ago
          studentId: s.studentId,
        },
        {
          id: `sample-4-${now}`,
          type: "evaluation",
          title: "Mid-term Evaluation Form",
          fileName: "Midterm_Eval_Supervisor.docx",
          status: "revision",
          feedback: "Please make sure your supervisor fills out the comments section completely at the bottom of the form.",
          submittedAt: new Date(now - 86400000 * 1).toISOString(), // 1 day ago
          studentId: s.studentId,
        }
      ];
      
      // Save samples to local storage so they show up everywhere
      rawSubs = [...rawSubs, ...samples];
      localStorage.setItem("practicum_submissions", JSON.stringify(rawSubs));
      mySubs = samples;
    }

    setSubmissions(mySubs.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()));
  }, [router]);

  const filtered = submissions.filter(s => filter === "all" || s.status === filter);

  return (
    <StudentLayout activeNav="documents">
      <div className="max-w-[1600px] mx-auto space-y-6 md:space-y-8">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">My Submissions</h2>
          
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            {["all", "pending", "approved", "rejected", "revision"].map(f => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                  filter === f 
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <svg className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              No documents found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Document</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date Submitted</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Feedback</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {filtered.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-800 dark:text-slate-200">{doc.title}</div>
                        {doc.fileName && <div className="text-xs text-slate-500">{doc.fileName}</div>}
                      </td>
                      <td className="px-6 py-4">
                        <span className="uppercase text-xs font-bold text-slate-500">{doc.type}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {new Date(doc.submittedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                          doc.status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          doc.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          doc.status === 'revision' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                          'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                          {doc.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {doc.feedback ? doc.feedback : <span className="text-slate-300 dark:text-slate-700">—</span>}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => alert(`Opening document viewer for: ${doc.fileName || doc.title}`)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-blue-400 rounded-lg text-xs font-semibold transition-all shadow-sm"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </StudentLayout>
  );
}
