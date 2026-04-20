"use client"

import { useState, useEffect } from "react"
import { getSession } from "@/lib/auth"
import AdvisorLayout from "@/components/AdvisorLayout"
import { Lock, Mail, Users } from "lucide-react"

export default function AdvisorProfile() {
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    setSession(getSession())
  }, [])

  if (!session) return null

  return (
    <AdvisorLayout activeNav="profile">
      <div className="max-w-4xl mx-auto">
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
          <div className="h-32 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-800 dark:to-slate-900" />

          <div className="px-8 pb-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 -mt-12 mb-8">
              <div className="h-24 w-24 rounded-3xl bg-white dark:bg-slate-900 p-1 shadow-lg border border-slate-200 dark:border-slate-800">
                <div className="h-full w-full rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white text-3xl font-bold">
                  {session.name?.charAt(0) || "A"}
                </div>
              </div>
              <button className="h-11 px-5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-semibold hover:opacity-90 transition-opacity">
                Edit Profile
              </button>
            </div>

            <div className="space-y-8">
              <div>
                <h3 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{session.name}</h3>
                <p className="text-sm text-slate-500 mt-2">Practicum Adviser · ID: {session.studentId}</p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 p-6 space-y-5">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 mb-2">Email address</label>
                    <div className="flex items-center gap-3 text-sm font-medium text-slate-800 dark:text-slate-200">
                      <Mail className="h-4 w-4 text-slate-400" />
                      {session.email}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 mb-2">Department</label>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">College of Information Technology</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 p-6 space-y-5">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 mb-2">Assigned students</label>
                    <div className="flex items-center gap-3 text-sm font-medium text-slate-800 dark:text-slate-200">
                      <Users className="h-4 w-4 text-slate-400" />
                      26 total students
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 mb-2">Account role</label>
                    <span className="inline-flex px-3 py-1 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[10px] font-semibold uppercase tracking-[0.18em]">
                      {session.role}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-base font-semibold mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
                  <Lock className="h-4 w-4 text-slate-400" /> Security
                </h4>
                <button className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">Change Password</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdvisorLayout>
  )
}
