"use client";

import { useState } from "react";
import AdvisorLayout from "@/components/AdvisorLayout";

export default function AdvisorNotifications() {
  const [notifications] = useState([
    { id: 1, type: "submission", title: "New Submission", message: "Demo Student 1 submitted DTR Week 12", time: "2 hours ago", unread: true },
    { id: 2, type: "revision", title: "Revision Received", message: "Demo Student 2 resubmitted MOA", time: "5 hours ago", unread: true },
    { id: 3, type: "deadline", title: "Approaching Deadline", message: "Monthly reports are due in 2 days", time: "1 day ago", unread: false },
    { id: 4, type: "system", title: "System Update", message: "Practicum Management System updated to v2.1", time: "3 days ago", unread: false },
  ]);

  return (
    <AdvisorLayout activeNav="notifications">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Notifications</h3>
          <button className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">Mark all as read</button>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/50">
          {notifications.map(notif => (
            <div key={notif.id} className={`p-6 flex gap-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${notif.unread ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                notif.type === 'submission' ? 'bg-blue-100 text-blue-600' :
                notif.type === 'revision' ? 'bg-green-100 text-green-600' :
                notif.type === 'deadline' ? 'bg-amber-100 text-amber-600' :
                'bg-slate-100 text-slate-600'
              }`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {notif.type === 'submission' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />}
                  {notif.type === 'revision' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />}
                  {notif.type === 'deadline' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />}
                  {notif.type === 'system' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />}
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">{notif.title}</h4>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{notif.time}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{notif.message}</p>
                {notif.unread && <div className="mt-2 w-2 h-2 bg-blue-600 rounded-full" />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdvisorLayout>
  );
}
