"use client";

import { useState } from "react";
import AdvisorLayout from "@/components/AdvisorLayout";
import { Bell, Clock3, FileText, Info, RotateCcw } from "lucide-react";

export default function AdvisorNotifications() {
  const [notifications] = useState([
    { id: 1, type: "submission", title: "New Submission", message: "Demo Student 1 submitted DTR Week 12", time: "2 hours ago", unread: true },
    { id: 2, type: "revision", title: "Revision Received", message: "Demo Student 2 resubmitted MOA", time: "5 hours ago", unread: true },
    { id: 3, type: "deadline", title: "Approaching Deadline", message: "Monthly reports are due in 2 days", time: "1 day ago", unread: false },
    { id: 4, type: "system", title: "System Update", message: "Practicum Management System updated to v2.1", time: "3 days ago", unread: false },
  ]);

  const unreadCount = notifications.filter((notif) => notif.unread).length;

  return (
    <AdvisorLayout activeNav="notifications">
      <div className="mx-auto flex max-w-[1100px] flex-col gap-8">
        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                <Bell className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Inbox</span>
            </div>
            <div className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{notifications.length}</div>
            <p className="mt-1 text-sm text-slate-500">Total adviser notifications across submissions, revisions, deadlines, and updates.</p>
          </div>
          <div className="rounded-2xl bg-slate-900 p-6 text-white shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Unread items</p>
            <p className="mt-4 text-4xl font-bold tracking-tight">{unreadCount}</p>
            <p className="mt-2 text-sm text-slate-300">Items that still need acknowledgement or action.</p>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-800">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Notification feed</h2>
              <p className="text-sm text-slate-500">Recent updates related to your practicum review workflow.</p>
            </div>
            <button className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 hover:underline dark:text-blue-400">
              Mark all as read
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {notifications.map((notif) => {
              const icon =
                notif.type === "submission"
                  ? FileText
                  : notif.type === "revision"
                    ? RotateCcw
                    : notif.type === "deadline"
                      ? Clock3
                      : Info;

              const iconStyle =
                notif.type === "submission"
                  ? "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                  : notif.type === "revision"
                    ? "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                    : notif.type === "deadline"
                      ? "bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";

              const Icon = icon;

              return (
                <div key={notif.id} className={`flex gap-4 px-6 py-5 transition hover:bg-slate-50 dark:hover:bg-slate-800/30 ${notif.unread ? "bg-blue-50/30 dark:bg-blue-900/10" : ""}`}>
                  <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl ${iconStyle}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center justify-between gap-4">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{notif.title}</h3>
                      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{notif.time}</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{notif.message}</p>
                    {notif.unread && <span className="mt-3 inline-flex rounded-full bg-blue-600 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white">Unread</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </AdvisorLayout>
  );
}
