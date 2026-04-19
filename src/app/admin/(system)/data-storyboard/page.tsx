"use client";

import AdminLayout from "@/components/AdminLayout";

export default function AdminDataStoryboard() {
  const storyboardEvents = [
    { id: 1, action: "System Backup Initiated", user: "Admin", time: "10 mins ago", type: "system", icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" },
    { id: 2, action: "Assigned Adviser 'Dr. Smith' to 'John Doe'", user: "Admin", time: "2 hours ago", type: "management", icon: "M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" },
    { id: 3, action: "Student submitted DTR for Week 4", user: "Jane Student", time: "5 hours ago", type: "academic", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
    { id: 4, action: "Batch 2025-2026 Created", user: "Admin", time: "1 day ago", type: "management", icon: "M12 6v6m0 0v6m0-6h6m-6 0H6" }
  ];

  return (
    <AdminLayout activeNav="data-storyboard">
      <div className="max-w-[1600px] mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Data Management & Storyboard</h2>
          <p className="text-sm text-slate-500 mt-1">Backup system records and monitor chronological activity trails.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Backup Controls */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Safe Zone */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-2">Manual Backups</h3>
              <p className="text-sm text-slate-500 mb-6">Download your entire practicum dataset instantly for external safekeeping.</p>
              
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Export All Users</p>
                      <p className="text-xs text-slate-500">JSON Format</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">Download</span>
                </button>

                <button className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-600">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Export Submissions</p>
                      <p className="text-xs text-slate-500">CSV Archive</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-green-600 opacity-0 group-hover:opacity-100 transition-opacity">Download</span>
                </button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50 dark:bg-red-900/10 rounded-2xl p-6 border border-red-200 dark:border-red-900/50 shadow-sm">
              <h3 className="text-base font-bold text-red-800 dark:text-red-400 mb-2">Danger Zone</h3>
              <p className="text-sm text-red-600/80 dark:text-red-400/80 mb-4">Actions here are permanent and will completely clear current academic records.</p>
              <button className="w-full py-2.5 rounded-xl border border-red-200 dark:border-red-800 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors">
                Archive & Purge Semester Data
              </button>
            </div>
          </div>

          {/* Right Column: Storyboard */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm h-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">System Storyboard</h3>
                <button className="text-sm font-semibold text-blue-600 hover:underline">View All Logs</button>
              </div>

              {/* Timeline */}
              <div className="relative border-l-2 border-slate-100 dark:border-slate-800 ml-4 space-y-8">
                {storyboardEvents.map((event) => (
                  <div key={event.id} className="relative pl-6">
                    {/* Dot */}
                    <div className="absolute -left-[17px] top-1 p-1.5 rounded-full bg-white dark:bg-slate-900 border-2 border-blue-500 text-blue-500">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={event.icon} /></svg>
                    </div>
                    {/* Content */}
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{event.action}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">{event.user}</span>
                        <span className="text-xs text-slate-400">• {event.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
            </div>
          </div>

        </div>
      </div>
    </AdminLayout>
  );
}