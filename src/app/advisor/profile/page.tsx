"use client";

import { useState, useEffect } from "react";
import { getSession } from "@/lib/auth";
import AdvisorLayout from "@/components/AdvisorLayout";

export default function AdvisorProfile() {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    setSession(getSession());
  }, []);

  if (!session) return null;

  return (
    <AdvisorLayout activeNav="profile">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600" />
          <div className="px-8 pb-8">
            <div className="relative flex justify-between items-end -mt-12 mb-8">
              <div className="w-24 h-24 rounded-3xl bg-white dark:bg-slate-900 p-1 shadow-lg">
                <div className="w-full h-full rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-3xl font-bold text-blue-600">
                  {session.name.charAt(0)}
                </div>
              </div>
              <button className="px-6 py-2.5 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-xl text-sm font-bold shadow-sm hover:opacity-90 transition-opacity">Edit Profile</button>
            </div>

            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{session.name}</h3>
                <p className="text-sm text-slate-500 font-medium">Practicum Advisor · ID: {session.studentId}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Email Address</label>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{session.email}</p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Department</label>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">College of Science / BSIT</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Assigned Students</label>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">26 Total Students</p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Account Role</label>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-md text-[10px] font-bold uppercase tracking-widest">
                      {session.role}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4">Security</h4>
                <button className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline">Change Password</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdvisorLayout>
  );
}
