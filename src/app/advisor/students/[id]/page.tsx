"use client";

import { use, useEffect, useState } from "react";
import { getUsers } from "@/lib/auth";
import AdvisorLayout from "@/components/AdvisorLayout";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock3, FileText, MessageSquare } from "lucide-react";

export default function StudentProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [student, setStudent] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);

  useEffect(() => {
    const allUsers = getUsers();
    const found = allUsers.find((u) => u.studentId === id);
    setStudent(found);

    const allSubs = JSON.parse(localStorage.getItem("practicum_submissions") || "[]");
    setSubmissions(allSubs.filter((sub: any) => sub.studentId === id));
  }, [id]);

  if (!student) {
    return (
      <AdvisorLayout activeNav="students">
        <div className="mx-auto max-w-[1200px] rounded-2xl border border-dashed border-slate-300 px-6 py-20 text-center text-sm text-slate-500 dark:border-slate-700">
          Student record not found.
        </div>
      </AdvisorLayout>
    );
  }

  const approved = submissions.filter((s) => s.status === "approved").length;
  const pending = submissions.filter((s) => s.status === "pending").length;
  const revision = submissions.filter((s) => s.status === "revision").length;
  const totalRequired = 4;
  const progress = Math.round((approved / totalRequired) * 100);

  return (
    <AdvisorLayout activeNav="students">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-8">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <Link href="/advisor/students" className="inline-flex items-center gap-2 font-medium hover:text-blue-600 dark:hover:text-blue-400">
            <ArrowLeft className="h-4 w-4" />
            Back to students
          </Link>
        </div>

        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-5">
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 text-3xl font-bold text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                  {student.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{student.name}</h2>
                  <p className="mt-1 text-sm text-slate-500">BSIT · {student.studentId} · Tech Corp</p>
                </div>
              </div>
              <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700">
                <MessageSquare className="h-4 w-4" />
                Message student
              </button>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-800/40">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Core requirement progress</span>
                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{progress}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <div className="h-full rounded-full bg-blue-600" style={{ width: `${progress}%` }} />
              </div>
              <p className="mt-3 text-xs text-slate-500">{approved} of {totalRequired} core requirements approved.</p>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                { label: "Approved", value: approved, Icon: CheckCircle2 },
                { label: "Pending", value: pending, Icon: Clock3 },
                { label: "Revision", value: revision, Icon: FileText },
              ].map(({ label, value, Icon }) => (
                <div key={label} className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">{value}</div>
                  <p className="mt-1 text-sm text-slate-500">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Requirements checklist</h3>
              <div className="mt-5 space-y-3">
                {["MOA", "Journal", "DTR", "Evaluation"].map((req) => {
                  const sub = submissions.find((s) => s.type?.toLowerCase() === req.toLowerCase());
                  const isDone = sub?.status === "approved";
                  return (
                    <div key={req} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/40">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-5 w-5 items-center justify-center rounded-md border ${isDone ? "border-green-500 bg-green-500 text-white" : "border-slate-300 dark:border-slate-600"}`}>
                          {isDone && <CheckCircle2 className="h-3.5 w-3.5" />}
                        </div>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{req}</span>
                      </div>
                      <span className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${isDone ? "text-green-600 dark:text-green-400" : "text-slate-400"}`}>
                        {isDone ? "Approved" : "Missing"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Advisor notes</h3>
              <textarea
                placeholder="Add private notes about this student..."
                rows={5}
                className="mt-4 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none transition focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800/60"
              />
              <button className="mt-4 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200">
                Save notes
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-800">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Submission history</h3>
              <p className="text-sm text-slate-500">Full timeline of submitted practicum requirements.</p>
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{submissions.length} total</span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {submissions.length === 0 ? (
              <div className="px-6 py-16 text-center text-sm text-slate-500">No submissions recorded for this student yet.</div>
            ) : (
              submissions.map((sub) => (
                <div key={sub.id} className="flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{sub.title}</p>
                    <p className="mt-1 text-xs text-slate-500 uppercase tracking-[0.18em]">{sub.type} · {new Date(sub.submittedAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-md px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${sub.status === "approved" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : sub.status === "pending" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : sub.status === "revision" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
                      {sub.status}
                    </span>
                    <Link href="/advisor/approvals" className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-blue-700 dark:hover:text-blue-400">
                      Open review
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </AdvisorLayout>
  );
}
