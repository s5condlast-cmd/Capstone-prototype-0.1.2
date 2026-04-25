"use client";

import { useState } from "react";
import { CheckCircle2, ListChecks, Plus, SlidersHorizontal } from "lucide-react";

export default function AdvisorRequirements() {
  const [requirements] = useState([
    { id: "journal", label: "Daily Journal", required: true, deadline: "Weekly", weight: "20%", completion: "85%" },
    { id: "dtr", label: "Daily Time Record", required: true, deadline: "Monthly", weight: "30%", completion: "72%" },
    { id: "moa", label: "Memorandum of Agreement", required: true, deadline: "Pre-deployment", weight: "10%", completion: "98%" },
    { id: "evaluation", label: "Final Evaluation", required: true, deadline: "End-of-term", weight: "40%", completion: "5%" },
  ]);

  return (
      <div className="mx-auto flex max-w-[1400px] flex-col gap-8">
        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <ListChecks className="h-5 w-5" />
            </div>
            <div className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{requirements.length}</div>
            <p className="mt-1 text-sm text-slate-500">Active requirement rules in the adviser workflow.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">3</div>
            <p className="mt-1 text-sm text-slate-500">Requirements with strong completion rates this term.</p>
          </div>
          <div className="rounded-2xl bg-slate-900 p-6 text-white shadow-sm">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white">
              <SlidersHorizontal className="h-5 w-5" />
            </div>
            <div className="text-3xl font-bold tracking-tight">40%</div>
            <p className="mt-1 text-sm text-slate-300">Highest single requirement weight in the grading structure.</p>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 dark:border-slate-800 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Practicum requirements</h2>
              <p className="text-sm text-slate-500">Manage requirement rules, grade weight, and average student completion.</p>
            </div>
            <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              Add requirement
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-800/30">
                  <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Requirement</th>
                  <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Mandatory</th>
                  <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Deadline</th>
                  <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Weight</th>
                  <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Average completion</th>
                  <th className="px-6 py-4 text-right text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {requirements.map((req) => (
                  <tr key={req.id} className="transition hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="px-6 py-5">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{req.label}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">Type · {req.id}</p>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${req.required ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"}`}>
                        {req.required ? "Required" : "Optional"}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-600 dark:text-slate-300">{req.deadline}</td>
                    <td className="px-6 py-5 text-sm font-semibold text-slate-900 dark:text-white">{req.weight}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="h-2.5 min-w-[120px] flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                          <div className="h-full rounded-full bg-blue-600" style={{ width: req.completion }} />
                        </div>
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{req.completion}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-blue-700 dark:hover:text-blue-400">
                        Configure
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
  );
}
