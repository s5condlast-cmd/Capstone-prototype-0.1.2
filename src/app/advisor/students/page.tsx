"use client";

import { useEffect, useMemo, useState } from "react";
import { getSession, getUsers } from "@/lib/auth";
import AdvisorLayout from "@/components/AdvisorLayout";
import Link from "next/link";
import { Search, Users, TriangleAlert, CheckCircle2, ArrowRight } from "lucide-react";

interface Submission {
  id: string;
  type: string;
  studentName: string;
  studentId: string;
  title: string;
  status: string;
  submittedAt: string;
}

export default function AdvisorStudents() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const s = getSession();
    if (!s || s.role !== "advisor") return;

    const allUsers = getUsers();
    const studentUsers = allUsers.filter((u) => u.role === "student");
    const subs: Submission[] = JSON.parse(localStorage.getItem("practicum_submissions") || "[]");
    setSubmissions(subs);

    const studentStats = studentUsers.map((student) => {
      const studentSubs = subs.filter((item) => item.studentId === student.studentId);
      const approved = studentSubs.filter((item) => item.status === "approved").length;
      const pending = studentSubs.filter((item) => item.status === "pending").length;
      const revision = studentSubs.filter((item) => item.status === "revision").length;
      const isAtRisk = approved < 2;
      return { ...student, approved, pending, revision, isAtRisk };
    });

    setStudents(studentStats);
  }, []);

  const filtered = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch = student.name.toLowerCase().includes(search.toLowerCase()) || student.studentId.toLowerCase().includes(search.toLowerCase());
      const matchesFilter =
        filter === "all" ||
        (filter === "at-risk" && student.isAtRisk) ||
        (filter === "completed" && student.approved >= 4);
      return matchesSearch && matchesFilter;
    });
  }, [students, search, filter]);

  const stats = {
    total: students.length,
    atRisk: students.filter((student) => student.isAtRisk).length,
    completed: students.filter((student) => student.approved >= 4).length,
  };

  return (
    <AdvisorLayout activeNav="students">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-8">
        <section className="grid gap-4 md:grid-cols-3">
          {[
            { label: "Assigned students", value: stats.total, icon: Users },
            { label: "At risk", value: stats.atRisk, icon: TriangleAlert },
            { label: "Completed core docs", value: stats.completed, icon: CheckCircle2 },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  <stat.icon className="h-5 w-5" />
                </div>
                <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 dark:border-slate-700 dark:bg-slate-800/70">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Overview</span>
                </div>
              </div>
              <div className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{stat.value}</div>
              <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
            </div>
          ))}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name or student ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800/70"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {["all", "at-risk", "completed"].map((item) => (
                <button
                  key={item}
                  onClick={() => setFilter(item)}
                  className={`rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition ${
                    filter === item
                      ? "bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900"
                      : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filtered.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-dashed border-slate-300 px-6 py-16 text-center text-sm text-slate-500 dark:border-slate-700">
              No students matched your search and filter settings.
            </div>
          ) : (
            filtered.map((student) => {
              const progress = Math.min(100, Math.round((student.approved / 4) * 100));
              return (
                <Link
                  key={student.studentId}
                  href={`/advisor/students/${student.studentId}`}
                  className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="mb-6 flex items-center gap-4">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-bold ${student.isAtRisk ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400" : "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"}`}>
                      {student.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-semibold text-slate-900 transition group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">{student.name}</h3>
                      <p className="text-sm text-slate-500">{student.studentId}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Core progress</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{progress}%</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div className={`h-full rounded-full ${student.isAtRisk ? "bg-red-500" : "bg-blue-600"}`} style={{ width: `${progress}%` }} />
                    </div>

                    <div className="grid grid-cols-3 gap-3 pt-2">
                      <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Approved</p>
                        <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{student.approved}</p>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Pending</p>
                        <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{student.pending}</p>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Revision</p>
                        <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{student.revision}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                      <span className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${student.isAtRisk ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"}`}>
                        {student.isAtRisk ? "Needs attention" : "On track"}
                      </span>
                      <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-blue-600" />
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </section>
      </div>
    </AdvisorLayout>
  );
}
