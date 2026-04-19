"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StudentLayout from "@/components/StudentLayout";
import { getSession } from "@/lib/auth";

export default function TemplatesPage() {
  const router = useRouter();

  useEffect(() => {
    const s = getSession();
    if (!s || s.role !== "student") router.push("/login");
  }, [router]);

  const templates = [
    { id: 1, title: "Daily Time Record (DTR) Template", type: "PDF", size: "245 KB", icon: "clock" },
    { id: 2, title: "Memorandum of Agreement (MOA)", type: "DOCX", size: "1.2 MB", icon: "doc" },
    { id: 3, title: "Final Evaluation Form", type: "PDF", size: "450 KB", icon: "chart" },
    { id: 4, title: "Journal Cover Page", type: "DOCX", size: "105 KB", icon: "journal" },
  ];

  return (
    <StudentLayout activeNav="templates">
      <div className="max-w-[1600px] mx-auto space-y-6 md:space-y-8">
        
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Document Templates</h2>
            <p className="text-sm text-slate-500">Download the required forms and templates for your practicum.</p>
          </div>
          <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-900/50">
            <span className="text-sm font-semibold text-blue-700 dark:text-blue-400">{templates.length} Templates Available</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {templates.map(template => (
            <div key={template.id} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group">
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-blue-100 group-hover:text-blue-600 transition-all">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {template.icon === 'doc' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />}
                  {template.icon === 'clock' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />}
                  {template.icon === 'chart' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />}
                  {template.icon === 'journal' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />}
                </svg>
              </div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-1 leading-tight">{template.title}</h3>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500 uppercase tracking-wider mb-6">
                <span>{template.type}</span>
                <span>•</span>
                <span>{template.size}</span>
              </div>
              <button 
                onClick={() => alert(`Downloading ${template.title}...`)}
                className="w-full py-2.5 rounded-lg text-sm font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </button>
            </div>
          ))}
        </div>

      </div>
    </StudentLayout>
  );
}
