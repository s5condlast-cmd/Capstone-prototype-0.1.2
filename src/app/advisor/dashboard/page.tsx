"use client"

import { useState, useEffect } from "react"
import { getSession, getUsers, User } from "@/lib/auth"
import AdvisorLayout from "@/components/AdvisorLayout"
import Link from "next/link"
import { 
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  FileText,
  BarChart3,
  ShieldCheck,
  ArrowUpRight,
  CircleAlert,
  Search
} from "lucide-react"

interface Submission {
  id: string
  type: string
  studentName: string
  studentId: string
  title: string
  status: "pending" | "approved" | "rejected" | "revision"
  submittedAt: string
  isUrgent: boolean
  content?: string
  feedback?: string
}

export default function AdvisorDashboard() {
  const [session, setSession] = useState<User | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [students, setStudents] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const s = getSession()
    if (!s || s.role !== "advisor") return
    setSession(s)
    const allUsers = getUsers()
    setStudents(allUsers.filter(u => u.role === "student"))
    setSubmissions(JSON.parse(localStorage.getItem("practicum_submissions") || "[]"))
  }, [])

  const pendingCount = submissions.filter(s => s.status === "pending").length
  const approvedCount = submissions.filter(s => s.status === "approved").length
  const revisionCount = submissions.filter(s => s.status === "revision").length
  const rejectedCount = submissions.filter(s => s.status === "rejected").length

  const priorityQueue = submissions
    .filter(s => s.status === "pending" || s.isUrgent)
    .filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()) || s.studentName.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => Number(b.isUrgent) - Number(a.isUrgent) || new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    .slice(0, 5)

  const atRiskStudents = students
    .map(student => {
      const studentSubs = submissions.filter(s => s.studentId === student.studentId)
      const approved = studentSubs.filter(s => s.status === "approved").length
      return { ...student, approvedCount: approved }
    })
    .filter(s => s.approvedCount < 2)
    .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.studentId.toLowerCase().includes(searchQuery.toLowerCase()))
    .slice(0, 3)

  const statCards = [
    {
      label: "Students",
      value: students.length,
      icon: Users,
      note: "Assigned advisees",
      detail: students.length > 0 ? `${students.length} student record(s) under your supervision.` : "No students assigned yet.",
    },
    {
      label: "Pending",
      value: pendingCount,
      icon: Clock,
      note: "Waiting for review",
      detail: pendingCount > 0 ? `${pendingCount} submission(s) need your action.` : "No pending submissions right now.",
    },
    {
      label: "Approved",
      value: approvedCount,
      icon: CheckCircle2,
      note: "Completed reviews",
      detail: approvedCount > 0 ? `${approvedCount} submission(s) have been approved.` : "No approved submissions yet.",
    },
    {
      label: "Alerts",
      value: revisionCount + rejectedCount,
      icon: AlertCircle,
      note: "Needs attention",
      detail: revisionCount + rejectedCount > 0 ? `${revisionCount + rejectedCount} item(s) were flagged for revision or rejection.` : "No active alerts at the moment.",
    },
  ]

  return (
    <AdvisorLayout activeNav="dashboard">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
          <p className="text-[13px] text-[hsl(var(--muted-foreground))]">Hello, {session?.name || "Advisor"}</p>
            <h1 className="text-[28px] font-bold tracking-tight mt-1">Dashboard</h1>
          </div>
          <Link href="/advisor/approvals" className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-[hsl(var(--foreground))] text-[hsl(var(--background))] text-[13px] font-semibold hover:opacity-90 transition-opacity">
            Review Queue <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Search Bar */}
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
          <input 
            placeholder="Search students, submissions..." 
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[13px] font-medium placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--foreground))]/10 transition-all"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map(card => (
            <div key={card.label} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 hover:shadow-md transition-shadow space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-9 w-9 rounded-lg bg-[hsl(var(--muted))] flex items-center justify-center">
                  <card.icon className="h-[18px] w-[18px] text-[hsl(var(--muted-foreground))]" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[hsl(var(--muted-foreground))]">{card.note}</span>
                  <div className="h-7 w-7 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))] flex items-center justify-center">
                    <ArrowUpRight className="h-4 w-4 text-sti-blue" />
                  </div>
                </div>
              </div>
              <div>
                <div className="text-[28px] font-bold tabular-nums">{card.value}</div>
                <p className="text-[12px] font-medium text-[hsl(var(--muted-foreground))] mt-1">{card.label}</p>
              </div>
              <p className="text-[11px] text-[hsl(var(--muted-foreground))] leading-relaxed">{card.detail}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-[15px] font-semibold">Priority Queue</h2>
              <Link href="/advisor/approvals" className="text-clickable text-[12px] font-semibold">View all</Link>
            </div>
            <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden">
              {priorityQueue.length === 0 ? (
                <div className="py-16 text-center text-[hsl(var(--muted-foreground))] text-[13px]">No priority items right now.</div>
              ) : priorityQueue.map(sub => (
                <Link key={sub.id} href="/advisor/approvals" className="flex items-center justify-between gap-4 px-5 py-4 border-b border-[hsl(var(--border))] last:border-b-0 hover:bg-[hsl(var(--muted))]/50 transition-colors group">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="h-9 w-9 rounded-lg bg-[hsl(var(--muted))] flex items-center justify-center shrink-0 font-bold text-[12px]">
                      {(sub.studentName || "S").charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold truncate">{sub.title || "Untitled"}</p>
                      <p className="text-[11px] text-[hsl(var(--muted-foreground))]">{sub.studentName} · {(sub.type || "doc").toUpperCase()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {sub.isUrgent && <span className="h-2 w-2 rounded-full bg-sti-blue" />}
                    <span className="text-[11px] font-semibold uppercase text-[hsl(var(--muted-foreground))]">{sub.status}</span>
                    <ArrowRight className="h-4 w-4 text-[hsl(var(--muted-foreground))] group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[15px] font-semibold">At Risk Students</h2>
                <CircleAlert className="h-4 w-4 text-sti-blue" />
              </div>
              <div className="space-y-3">
                {atRiskStudents.length === 0 ? (
                  <div className="py-8 text-center text-[13px] text-[hsl(var(--muted-foreground))]">All students are on track.</div>
                ) : atRiskStudents.map(student => (
                  <Link key={student.studentId} href={`/advisor/students/${student.studentId}`} className="flex items-center justify-between rounded-lg p-3 hover:bg-[hsl(var(--muted))]/50 transition-colors">
                    <div>
                      <p className="text-[13px] font-semibold">{student.name}</p>
                      <p className="text-[11px] text-[hsl(var(--muted-foreground))]">{student.approvedCount} approved docs</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-xl bg-[hsl(var(--foreground))] text-[hsl(var(--background))] p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-[12px] font-semibold uppercase tracking-[0.18em] opacity-60">System Summary</h2>
                <ShieldCheck className="h-4 w-4 opacity-80" />
              </div>
              <div>
                <div className="text-[40px] font-bold tracking-tight tabular-nums leading-none">84%</div>
                <p className="text-[12px] mt-2 opacity-60">Review throughput is healthy. Continue monitoring pending submissions.</p>
              </div>
              <Link href="/advisor/reports" className="block text-center text-[12px] font-semibold py-2.5 rounded-lg bg-[hsl(var(--background))] text-[hsl(var(--foreground))] hover:opacity-90 transition-opacity">
                Open Reports
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AdvisorLayout>
  )
}
