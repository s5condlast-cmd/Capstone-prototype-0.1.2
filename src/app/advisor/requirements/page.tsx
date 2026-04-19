"use client";

import { useState } from "react";
import AdvisorLayout from "@/components/AdvisorLayout";

export default function AdvisorRequirements() {
  const [requirements, setRequirements] = useState([
    { id: "journal", label: "Daily Journal", required: true, deadline: "Weekly", weight: "20%", completion: "85%" },
    { id: "dtr", label: "Daily Time Record", required: true, deadline: "Monthly", weight: "30%", completion: "72%" },
    { id: "moa", label: "Memorandum of Agreement", required: true, deadline: "Pre-deployment", weight: "10%", completion: "98%" },
    { id: "evaluation", label: "Final Evaluation", required: true, deadline: "End-of-term", weight: "40%", completion: "5%" },
  ]);

  return (
    <AdvisorLayout activeNav="requirements">
      <div className="max-w-[1600px] mx-auto space-y-6">
        
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Practicum Requirements</h3>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-blue-700 transition-colors">Add New Requirement</button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-left">
                  <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase">Requirement</th>
                  <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase">Mandatory</th>
                  <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase">Deadline</th>
                  <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase">Grade Weight</th>
                  <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase">Avg. Completion</th>
                  <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase text-right">Settings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {requirements.map(req => (
                  <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-5 px-6">
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{req.label}</p>
                      <p className="text-[10px] text-slate-500 font-medium">TYPE: {req.id.toUpperCase()}</p>
                    </td>
                    <td className="py-5 px-6">
                      <div className={`w-10 h-5 rounded-full relative ${req.required ? 'bg-blue-600' : 'bg-slate-300'}`}>
                        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${req.required ? 'left-6' : 'left-1'}`} />
                      </div>
                    </td>
                    <td className="py-5 px-6 text-sm text-slate-600 dark:text-slate-400 font-medium">{req.deadline}</td>
                    <td className="py-5 px-6 text-sm font-bold text-slate-800 dark:text-slate-100">{req.weight}</td>
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 min-w-[100px] h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-600 rounded-full" style={{ width: req.completion }} />
                        </div>
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{req.completion}</span>
                      </div>
                    </td>
                    <td className="py-5 px-6 text-right">
                      <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-blue-600">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                      </button>
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
