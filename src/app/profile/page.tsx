"use client";

import { useState, useEffect } from "react";
import { getSession, User } from "@/lib/auth";
import StudentLayout from "@/components/StudentLayout";

export default function StudentProfile() {
  const [session, setSession] = useState<User | null>(null);

  useEffect(() => {
    setSession(getSession());
  }, []);

  if (!session) return null;

  return (
    <StudentLayout activeNav="profile">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {/* Header Gradient */}
          <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600" />
          
          <div className="px-8 pb-8">
            {/* Avatar & Action Button */}
            <div className="relative flex justify-between items-end -mt-12 mb-8">
              <div className="w-24 h-24 rounded-3xl bg-white dark:bg-slate-900 p-1 shadow-lg">
                <div className="w-full h-full rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-3xl font-bold text-blue-600">
                  {session.name.charAt(0)}
                </div>
              </div>
              <button className="px-6 py-2.5 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-xl text-sm font-bold shadow-sm hover:opacity-90 transition-opacity">
                Edit Profile
              </button>
            </div>

            {/* Basic Info */}
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{session.name}</h3>
                <p className="text-sm text-slate-500 font-medium">BS Information Technology · ID: {session.studentId}</p>
              </div>

              {/* Stats/Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Email Address</label>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{session.email}</p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Year & Section</label>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">4th Year - IT401</p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Specialization</label>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Web Development</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Current Status</label>
                    <span className="px-2.5 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-md text-[10px] font-bold uppercase tracking-widest">
                      Deployed
                    </span>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Practicum Company</label>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Tech Corp</p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Skills Summary</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {["React", "TypeScript", "Node.js", "SQL"].map((skill) => (
                        <span key={skill} className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-md text-[10px] font-bold uppercase">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Emergency Contact Section */}
              <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  Emergency Contact
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Guardian Name</label>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Maria Dwayne</p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Contact Number</label>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">0912 345 6789</p>
                  </div>
                </div>
              </div>

              {/* Security Footer */}
              <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4">Account Security</h4>
                <button className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline">Change Password</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
