"use client";

import { useState, useEffect } from "react";
import { getSession, User } from "@/lib/auth";
import { Mail, ShieldCheck, UserRound } from "lucide-react";

export default function StudentProfile() {
  const [session, setSession] = useState<User | null>(null);

  useEffect(() => {
    setSession(getSession());
  }, []);

  if (!session) return null;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600" />

        <div className="px-8 pb-8">
          <div className="relative flex flex-col sm:flex-row sm:justify-between sm:items-end gap-5 -mt-12 mb-8">
            <div className="w-24 h-24 rounded-3xl bg-card p-1 shadow-lg border border-border">
              <div className="w-full h-full rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-3xl font-bold text-blue-600 dark:text-blue-400">
                {session.name.charAt(0)}
              </div>
            </div>
            <button className="px-6 py-2.5 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-xl text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity">
              Edit Profile
            </button>
          </div>

          <div className="space-y-8">
            <div>
              <h3 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">{session.name}</h3>
              <p className="text-sm text-slate-500 font-medium mt-2">BS Information Technology · ID: {session.studentId}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 p-6 space-y-6">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-[0.18em] mb-2">Email address</label>
                  <div className="flex items-center gap-3 text-sm font-medium text-slate-800 dark:text-slate-200">
                    <Mail className="w-4 h-4 text-slate-400" />
                    {session.email}
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-[0.18em] mb-2">Year & section</label>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">4th Year - IT401</p>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-[0.18em] mb-2">Specialization</label>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Web Development</p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 p-6 space-y-6">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-[0.18em] mb-2">Current status</label>
                  <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-[10px] font-semibold uppercase tracking-[0.18em]">
                    Deployed
                  </span>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-[0.18em] mb-2">Practicum company</label>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Tech Corp</p>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-[0.18em] mb-2">Skills summary</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {["React", "TypeScript", "Node.js", "SQL"].map((skill) => (
                      <span key={skill} className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-semibold uppercase tracking-[0.12em]">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                <UserRound className="w-4 h-4 text-slate-400" />
                Emergency Contact
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 p-6">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-[0.18em] mb-2">Guardian name</label>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Maria Dwayne</p>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-[0.18em] mb-2">Contact number</label>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">0912 345 6789</p>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-slate-400" />
                Account Security
              </h4>
              <button className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">Change Password</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
