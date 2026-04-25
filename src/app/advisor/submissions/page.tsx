"use client";

import { useEffect, useMemo, useState } from "react";
import { getSession } from "@/lib/auth";

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

export default function AdvisorSubmissions() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [feedback, setFeedback] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const s = getSession();
    if (!s || s.role !== "advisor") return;
    const subs: Submission[] = JSON.parse(localStorage.getItem("practicum_submissions") || "[]");
    setSubmissions(subs);
    if (subs.length > 0) setSelectedSubmission(subs[0]);
  }, []);

  const handleAction = (id: string, action: "approved" | "rejected" | "revision") => {
    const updated = submissions.map((item) =>
      item.id === id ? { ...item, status: action, feedback: feedback || item.feedback } : item
    );
    setSubmissions(updated);
    localStorage.setItem("practicum_submissions", JSON.stringify(updated));
    const nextSelected = updated.find((item) => item.id === id) || null;
    setSelectedSubmission(nextSelected);
    setFeedback("");
  };

  const filtered = useMemo(
    () => submissions.filter((item) => filter === "all" || item.status === filter),
    [submissions, filter]
  );

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      approved: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      revision: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
      pending: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    };
    return (
      <span className={`inline-flex rounded-md px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${styles[status] || styles.pending}`}>
        {status}
      </span>
    );
  };

  return (
      <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-6 md:gap-8 items-start">
        <div className="flex-1 w-full space-y-6">
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm w-fit">
            {["all", "pending", "approved", "rejected", "revision"].map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-[0.18em] transition-colors ${
                  filter === item
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            {filtered.length === 0 ? (
              <div className="p-12 text-center text-slate-500">No submissions found.</div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {filtered.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedSubmission(sub)}
                    className={`w-full px-6 py-4 flex items-center justify-between text-left transition-colors ${
                      selectedSubmission?.id === sub.id
                        ? "bg-blue-50 dark:bg-blue-900/10"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/30"
                    }`}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 font-bold text-sm shrink-0">
                        {(sub.studentName || "S").charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{sub.title || "Untitled"}</div>
                        <div className="text-xs text-slate-500 truncate mt-1">
                          {sub.studentName || sub.studentId || "Unknown"} · {(sub.type || "doc").toUpperCase()} · {new Date(sub.submittedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-4">
                      {sub.isUrgent && (
                        <span className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-[10px] font-semibold uppercase tracking-[0.18em] px-2.5 py-1 rounded-md">
                          Urgent
                        </span>
                      )}
                      {statusBadge(sub.status)}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="w-full lg:w-80 xl:w-96 flex-shrink-0 space-y-6 lg:sticky lg:top-0">
          {selectedSubmission ? (
            <>
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-5">Submission details</h3>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between gap-4 py-2 border-b border-slate-100 dark:border-slate-800/50">
                    <span className="text-slate-500">Student</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200 text-right">{selectedSubmission.studentName || selectedSubmission.studentId || "Unknown"}</span>
                  </div>
                  <div className="flex justify-between gap-4 py-2 border-b border-slate-100 dark:border-slate-800/50">
                    <span className="text-slate-500">Type</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200 uppercase">{selectedSubmission.type || "doc"}</span>
                  </div>
                  <div className="flex justify-between gap-4 py-2 border-b border-slate-100 dark:border-slate-800/50">
                    <span className="text-slate-500">Submitted</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{new Date(selectedSubmission.submittedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between gap-4 py-2">
                    <span className="text-slate-500">Status</span>
                    {statusBadge(selectedSubmission.status)}
                  </div>
                </div>

                {selectedSubmission.content && (
                  <div className="mt-5 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 mb-2">Content</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{selectedSubmission.content}</p>
                  </div>
                )}

                {selectedSubmission.feedback && (
                  <div className="mt-5 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-400 mb-2">Previous feedback</p>
                    <p className="text-sm text-amber-800 dark:text-amber-300">{selectedSubmission.feedback}</p>
                  </div>
                )}
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-4">Review actions</h3>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Add feedback or comments..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-y mb-4"
                  rows={4}
                />
                <div className="flex flex-col gap-2">
                  <button onClick={() => handleAction(selectedSubmission.id, "approved")} className="w-full py-3 rounded-xl text-sm font-semibold bg-green-600 hover:bg-green-700 text-white transition-colors">
                    Approve submission
                  </button>
                  <button onClick={() => handleAction(selectedSubmission.id, "revision")} className="w-full py-3 rounded-xl text-sm font-semibold bg-amber-500 hover:bg-amber-600 text-white transition-colors">
                    Request revision
                  </button>
                  <button onClick={() => handleAction(selectedSubmission.id, "rejected")} className="w-full py-3 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors">
                    Reject submission
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Select a submission</p>
              <p className="text-xs text-slate-500 mt-1">Choose any item from the list to inspect it and take action.</p>
            </div>
          )}
        </div>
      </div>
  );
}
