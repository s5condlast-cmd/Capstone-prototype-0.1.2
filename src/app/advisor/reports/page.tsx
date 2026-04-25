"use client";

import { useEffect, useState } from "react";
import { getSession, getUsers } from "@/lib/auth";
import { BarChart3, CheckCircle2, Clock3, TrendingUp, TriangleAlert } from "lucide-react";

export default function AdvisorReports() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);

  useEffect(() => {
    const s = getSession();
    if (!s || s.role !== "advisor") return;
    const allUsers = getUsers();
    setStudents(allUsers.filter((u) => u.role === "student"));
    setSubmissions(JSON.parse(localStorage.getItem("practicum_submissions") || "[]"));
  }, []);

  const totalSubs = submissions.length;
  const approved = submissions.filter((s) => s.status === "approved").length;
  const pending = submissions.filter((s) => s.status === "pending").length;
  const revision = submissions.filter((s) => s.status === "revision").length;
  const rejected = submissions.filter((s) => s.status === "rejected").length;
  const approvalRate = totalSubs > 0 ? Math.round((approved / totalSubs) * 100) : 0;
  const compliance = students.length > 0 ? Math.round((students.filter((student) => submissions.some((sub) => sub.studentId === student.studentId)).length / students.length) * 100) : 0;

  const bars = [38, 60, 42, 74, 58, 28, 66];

  return (
      <div className="mx-auto flex max-w-[1400px] flex-col gap-8">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Approval rate", value: `${approvalRate}%`, icon: TrendingUp, note: "Based on processed submissions" },
            { label: "Pending queue", value: pending, icon: Clock3, note: "Items waiting for adviser action" },
            { label: "Revision load", value: revision, icon: TriangleAlert, note: "Returned items to monitor" },
            { label: "Student compliance", value: `${compliance}%`, icon: CheckCircle2, note: "Students with at least one record" },
          ].map((card) => (
            <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  <card.icon className="h-5 w-5" />
                </div>
                <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 dark:border-slate-700 dark:bg-slate-800/70">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Summary</span>
                </div>
              </div>
              <div className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{card.value}</div>
              <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-300">{card.label}</p>
              <p className="mt-2 text-xs text-slate-500">{card.note}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-800">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Weekly submission volume</h2>
                <p className="text-sm text-slate-500">Approximate activity over the last seven days.</p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                <BarChart3 className="h-3.5 w-3.5" />
                Last 7 days
              </div>
            </div>
            <div className="flex h-[310px] items-end gap-3 px-6 pb-6 pt-8">
              {bars.map((height, index) => (
                <div key={index} className="flex flex-1 flex-col items-center gap-3">
                  <div className="flex w-full items-end rounded-2xl bg-slate-100 p-1 dark:bg-slate-800/70">
                    <div
                      className="w-full rounded-xl bg-blue-600 transition-all duration-500 hover:bg-blue-700"
                      style={{ height: `${height * 2.4}px` }}
                    />
                  </div>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Status distribution</h2>
              <p className="mt-1 text-sm text-slate-500">Current breakdown of all tracked submissions.</p>
              <div className="mt-6 space-y-4">
                {[
                  ["Approved", approved, "bg-green-500"],
                  ["Pending", pending, "bg-blue-500"],
                  ["Revision", revision, "bg-amber-500"],
                  ["Rejected", rejected, "bg-red-500"],
                ].map(([label, value, color]) => {
                  const pct = totalSubs > 0 ? Math.round((Number(value) / totalSubs) * 100) : 0;
                  return (
                    <div key={String(label)}>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-medium text-slate-700 dark:text-slate-300">{label}</span>
                        <span className="text-slate-500">{String(value)} · {pct}%</span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl bg-slate-900 p-6 text-white shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Adviser insight</h2>
                <TrendingUp className="h-4 w-4 text-slate-400" />
              </div>
              <p className="mt-5 text-4xl font-bold tracking-tight">{approvalRate}%</p>
              <p className="mt-2 text-sm text-slate-300">Your approval efficiency is healthy. Focus next on pending and revision-heavy items to keep turnaround consistent.</p>
            </div>
          </div>
        </section>
      </div>
  );
}
