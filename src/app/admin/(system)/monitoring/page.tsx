"use client"

import { useState, useEffect } from "react"
import { getSession, getUsers } from "@/lib/auth"
import AdminLayout from "@/components/AdminLayout"
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Users, 
  FileText,
  Search,
  Eye,
  AlertCircle
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function AdminMonitoring() {
  const [submissions, setSubmissions] = useState<any[]>([])
  const [studentCount, setStudentCount] = useState(0)
  const [advisorCount, setAdvisorCount] = useState(0)

  useEffect(() => {
    const s = getSession()
    if (!s || s.role !== "admin") return
    const users = getUsers()
    setStudentCount(users.filter(u => u.role === "student").length)
    setAdvisorCount(users.filter(u => u.role === "advisor").length)
    setSubmissions(JSON.parse(localStorage.getItem("practicum_submissions") || "[]"))
  }, [])

  const statusDist = {
    pending: submissions.filter(s => s.status === "pending").length,
    revision: submissions.filter(s => s.status === "revision").length,
  }
  const activeStudentRate = studentCount > 0 ? Math.round((new Set(submissions.map(s => s.studentName)).size / studentCount) * 100) : 0

  const alerts = [
    { type: "warning", message: `${statusDist.pending} submission(s) awaiting initial review`, icon: Clock },
    { type: "info", message: `${statusDist.revision} submission(s) pending student revision`, icon: Activity },
    { type: "error", message: `${100 - activeStudentRate}% of enrolled students have no submissions`, icon: AlertCircle },
  ]

  const stats = [
    { label: "Total Users", value: studentCount + advisorCount, icon: Users },
    { label: "Review Queue", value: statusDist.pending, icon: FileText },
    { label: "Active Rate", value: `${activeStudentRate}%`, icon: CheckCircle2 },
    { label: "Submissions", value: submissions.length, icon: Activity },
  ]

  return (
    <AdminLayout activeNav="monitoring">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-[28px] font-bold tracking-tight">Monitoring</h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-[13px] text-[hsl(var(--muted-foreground))]">System health and activity tracking</p>
              <div className="flex items-center gap-1.5 ml-2">
                <div className="h-1.5 w-1.5 rounded-full bg-sti-blue animate-pulse" />
                <span className="text-sti-blue text-[11px] font-semibold">Live</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(stat => (
            <div key={stat.label} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="h-9 w-9 rounded-lg bg-[hsl(var(--muted))] flex items-center justify-center">
                  <stat.icon className="h-[18px] w-[18px] text-[hsl(var(--muted-foreground))]" />
                </div>
              </div>
              <div className="text-[28px] font-bold tracking-tight tabular-nums">{stat.value}</div>
              <p className="text-[12px] font-medium text-[hsl(var(--muted-foreground))] mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Alerts + Activity */}
        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          {/* Alerts */}
          <div className="flex flex-col gap-4">
            <h2 className="text-[15px] font-semibold px-1">System Alerts</h2>
            <div className="flex flex-col gap-2">
              {alerts.map((alert, i) => (
                <div key={i} className={cn(
                  "flex items-start gap-3 p-4 rounded-xl border",
                  alert.type === "warning" ? "border-amber-200 bg-amber-50 dark:border-amber-900/30 dark:bg-amber-950/20" :
                  alert.type === "error" ? "border-red-200 bg-red-50 dark:border-red-900/30 dark:bg-red-950/20" :
                  "border-[hsl(var(--border))] bg-[hsl(var(--card))]"
                )}>
                  <alert.icon className={cn(
                    "h-4 w-4 mt-0.5 shrink-0",
                    alert.type === "warning" ? "text-amber-600 dark:text-amber-400" :
                    alert.type === "error" ? "text-red-600 dark:text-red-400" :
                    "text-sti-blue"
                  )} />
                  <p className="text-[12px] font-medium leading-relaxed text-[hsl(var(--foreground))]">{alert.message}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Stream */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-[15px] font-semibold">Activity Stream</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
                <input placeholder="Filter logs..." className="h-8 pl-9 pr-3 rounded-lg bg-[hsl(var(--muted))] text-[12px] font-medium w-48 placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none" />
              </div>
            </div>
            
            <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden">
              {submissions.length === 0 ? (
                <div className="py-16 text-center text-[hsl(var(--muted-foreground))] text-[13px]">No activity recorded yet.</div>
              ) : submissions.slice(0, 10).map((sub: any, i: number) => (
                <div key={i} className="flex items-center justify-between px-5 py-3.5 border-b border-[hsl(var(--border))] last:border-b-0 hover:bg-[hsl(var(--muted))]/50 transition-colors group">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-1.5 w-1.5 rounded-full bg-sti-blue shrink-0" />
                    <p className="text-[13px] truncate">
                      <span className="font-semibold">{sub.studentName}</span>
                      <span className="text-[hsl(var(--muted-foreground))]"> submitted </span>
                      <span className="text-clickable font-medium">{sub.title}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[11px] font-medium text-[hsl(var(--muted-foreground))] tabular-nums">just now</span>
                    <button className="h-7 w-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-[hsl(var(--muted))] transition-all">
                      <Eye className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
