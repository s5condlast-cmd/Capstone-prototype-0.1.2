"use client"

import { useState, useEffect } from "react"
import { getSession, getUsers } from "@/lib/auth"
import AdminLayout from "@/components/AdminLayout"
import { 
  TrendingUp, 
  Download, 
  FileBarChart,
  PieChart,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw
} from "lucide-react"
import { toast } from "sonner"

export default function AdminReports() {
  const [submissions, setSubmissions] = useState<any[]>([])
  const [studentCount, setStudentCount] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    const s = getSession()
    if (!s || s.role !== "admin") return
    const users = getUsers()
    setStudentCount(users.filter(u => u.role === "student").length)
    setSubmissions(JSON.parse(localStorage.getItem("practicum_submissions") || "[]"))
  }, [])

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
      toast.success("Data refreshed")
    }, 800)
  }

  const statusDist = {
    approved: submissions.filter(s => s.status === "approved").length,
    pending: submissions.filter(s => s.status === "pending").length,
    rejected: submissions.filter(s => s.status === "rejected").length,
    revision: submissions.filter(s => s.status === "revision").length,
  }
  
  const approvalRate = submissions.length > 0 ? Math.round((statusDist.approved / submissions.length) * 100) : 0
  const activeStudentRate = studentCount > 0 ? Math.round((new Set(submissions.map(s => s.studentName)).size / studentCount) * 100) : 0
  const avgSubs = studentCount > 0 ? (submissions.length / studentCount).toFixed(1) : "0.0"

  const stats = [
    { val: `${approvalRate}%`, label: "Approval Rate", icon: TrendingUp },
    { val: `${activeStudentRate}%`, label: "Participation", icon: PieChart },
    { val: avgSubs, label: "Avg. per Student", icon: FileBarChart },
    { val: statusDist.pending + statusDist.revision, label: "In Queue", icon: Calendar },
  ]

  const programs = [
    { name: "BSIT", subs: 24, pct: 45 },
    { name: "BSCS", subs: 18, pct: 34 },
  ]

  return (
    <AdminLayout activeNav="reports">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-[28px] font-bold tracking-tight">Analytics</h1>
            <p className="text-[13px] text-[hsl(var(--muted-foreground))] mt-1">Performance metrics and system-wide trends.</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleRefresh} 
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 h-9 px-4 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[13px] font-medium hover:bg-[hsl(var(--muted))] transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} /> Refresh
            </button>

          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <div key={i} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="h-9 w-9 rounded-lg bg-[hsl(var(--muted))] flex items-center justify-center">
                  <stat.icon className="h-[18px] w-[18px] text-[hsl(var(--muted-foreground))]" />
                </div>
              </div>
              <div className="text-[28px] font-bold tracking-tight tabular-nums">{stat.val}</div>
              <p className="text-[12px] font-medium text-[hsl(var(--muted-foreground))] mt-1">{stat.label}</p>
              <div className="h-1.5 w-full bg-[hsl(var(--muted))] rounded-full overflow-hidden mt-4">
                <div 
                  className="h-full bg-[hsl(var(--foreground))] rounded-full transition-all duration-700" 
                  style={{ width: typeof stat.val === 'string' && stat.val.includes('%') ? stat.val : '50%' }} 
                />
              </div>
            </div>
          ))}
        </div>

        {/* Charts Area */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Program Distribution */}
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 space-y-5">
            <h2 className="text-[15px] font-semibold">Program Distribution</h2>
            <div className="space-y-4">
              {programs.map(program => (
                <div key={program.name} className="space-y-2">
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="font-medium">{program.name}</span>
                    <span className="text-[hsl(var(--muted-foreground))] tabular-nums">{program.subs} submissions</span>
                  </div>
                  <div className="h-2 w-full bg-[hsl(var(--muted))] rounded-full overflow-hidden">
                    <div className="h-full bg-[hsl(var(--foreground))] rounded-full transition-all duration-700" style={{ width: `${program.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Insights */}
          <div className="flex flex-col gap-4">
            <h2 className="text-[15px] font-semibold px-1">Insights</h2>
            <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 flex items-start gap-4">
              <div className="h-9 w-9 rounded-lg bg-[hsl(var(--muted))] flex items-center justify-center shrink-0">
                <ArrowUpRight className="h-[18px] w-[18px] text-[hsl(var(--foreground))]" />
              </div>
              <div>
                <p className="text-[13px] font-semibold">Healthy Participation</p>
                <p className="text-[12px] text-[hsl(var(--muted-foreground))] mt-1 leading-relaxed">
                  Student activity is up 14% this week. Participation is currently at optimal levels across all programs.
                </p>
              </div>
            </div>
            <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 flex items-start gap-4">
              <div className="h-9 w-9 rounded-lg bg-[hsl(var(--muted))] flex items-center justify-center shrink-0">
                <ArrowDownRight className="h-[18px] w-[18px] text-[hsl(var(--muted-foreground))]" />
              </div>
              <div>
                <p className="text-[13px] font-semibold">Review Bottleneck</p>
                <p className="text-[12px] text-[hsl(var(--muted-foreground))] mt-1 leading-relaxed">
                  Average review time has increased. Consider flagging pending items to available supervisors.
                </p>
              </div>
            </div>
            <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 flex items-start gap-4">
              <div className="h-9 w-9 rounded-lg bg-[hsl(var(--muted))] flex items-center justify-center shrink-0">
                <TrendingUp className="h-[18px] w-[18px] text-[hsl(var(--foreground))]" />
              </div>
              <div>
                <p className="text-[13px] font-semibold">Completion Forecast</p>
                <p className="text-[12px] text-[hsl(var(--muted-foreground))] mt-1 leading-relaxed">
                  At the current rate, 92% of students are projected to complete their practicum on schedule.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
