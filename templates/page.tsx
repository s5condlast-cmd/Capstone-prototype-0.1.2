"use client";

import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";

export default function AdminTemplates() {
  const [editorContent, setEditorContent] = useState("");
  const [activeTemplateKey, setActiveTemplateKey] = useState<string | null>(null);
  const [expandedBoxes, setExpandedBoxes] = useState<Record<string, boolean>>({ dtr: false, moa: false, evaluation: false });

  const toggleBox = (box: string) => setExpandedBoxes(prev => ({ ...prev, [box]: !prev[box] }));

  const templates = [
    { key: "dtr", label: "DTR Template", badge: "DTR", badgeColor: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", desc: "Template for student daily attendance logging", content: "DAILY TIME RECORD\n\nStudent: Student Name\nDate: Date\n\nTime In: Time In AM\nTime Out: Time Out PM\nTotal Hours: Total Hours\n\nSignature: Signature\n\nNotes: " },
    { key: "moa", label: "MOA Template", badge: "MOA", badgeColor: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", desc: "Partnership agreement template with companies", content: "MEMORANDUM OF AGREEMENT\n\nThis Memorandum of Agreement is made and entered into between Company located at Address and Student of School for the purpose of Practicum Duration.\n\nThe Company agrees to provide training and supervision to the Student during the practicum period of Duration.\n\nThe Company shall evaluate the Student's performance and submit an Evaluation Form to the school monthly.\n\nThe Student agrees to follow all company rules, complete the required hours, and submit daily logs throughout the practicum.\n\nThis agreement shall remain in effect for a period of Duration beginning from Date.\n\nThis Memorandum of Agreement is signed by Company and Student on Date." },
    { key: "evaluation", label: "Evaluation Template", badge: "Evaluation", badgeColor: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400", desc: "Performance evaluation template for interns", content: "STUDENT EVALUATION FORM\n\nStudent Name: Student Name\nCompany: Company\nEvaluation Period: Date\n\nRating Scale: 1-5\n\nPerformance Areas:\n1. Technical Skills: Skills\n2. Communication: Performance\n3. Work Ethic: Performance\n4. Teamwork: Performance\n5. Initiative: Performance\n\nOverall Rating: Overall Rating\n\nComments: Comments\n\nEvaluator: Evaluator\n\nSignature: Signature" },
  ];

  return (
    <AdminLayout activeNav="templates">
      <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row gap-6 md:gap-8 items-start">
        {/* Editor */}
        <div className="flex-1 w-full">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Template Editor</h3>
              {activeTemplateKey && (
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 rounded-lg text-sm font-semibold border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors">Delete</button>
                  <button className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors">Save Template</button>
                </div>
              )}
            </div>
            {activeTemplateKey ? (
              <textarea 
                value={editorContent} 
                onChange={(e) => setEditorContent(e.target.value)}
                className="w-full flex-1 min-h-[500px] px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-sm whitespace-pre-wrap text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500 font-mono resize-y"
              />
            ) : (
              <div className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-sm min-h-[300px] text-slate-400 flex items-center justify-center">
                Click "Load Template" on the right side to load a template.
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar - template cards */}
        <div className="w-full lg:w-80 flex-shrink-0 space-y-4 lg:sticky lg:top-0">
          {templates.map(t => (
            <div key={t.key} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <button onClick={() => toggleBox(t.key)} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{t.label}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${t.badgeColor}`}>{t.badge}</span>
                </div>
                <svg className={`w-5 h-5 text-slate-400 transition-transform ${expandedBoxes[t.key] ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {expandedBoxes[t.key] && (
                <div className="px-4 pb-4">
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{t.label}</p>
                    <p className="text-xs text-slate-500 mt-1">{t.desc}</p>
                    <button onClick={() => { setEditorContent(t.content); setActiveTemplateKey(t.key); }} className="mt-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">Load Template</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
