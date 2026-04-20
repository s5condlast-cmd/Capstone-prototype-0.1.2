"use client"

import { useState, useEffect } from "react"
import { getSession, getUsers, User } from "@/lib/auth"
import AdminLayout from "@/components/AdminLayout"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  UserCheck,
  FileText,
  Clock,
  ArrowRight,
  TrendingUp,
  ChevronRight,
  Activity,
  Plus,
  Calendar
} from "lucide-react"

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([])
  const [submissions, setSubmissions] = useState<any[]>([])
  const [session, setSession] = useState<User | null>(null)

  useEffect(() => {
    const s = getSession()
    setSession(s)
    if (!s || s.role !== "admin") return
    setUsers(getUsers())
    setSubmissions(JSON.parse(localStorage.getItem("practicum_submissions") || "[]"))
  }, [])

  const students = users.filter(u => u.role === "student")
  const advisors = users.filter(u => u.role === "advisor")
  const pendingCount = submissions.filter(s => s.status === "pending").length
  const approvedCount = submissions.filter(s => s.status === "approved").length
  const completionRate = submissions.length > 0 ? Math.round((approvedCount / submissions.length) * 100) : 0

  const stats = [
    { label: "Total Students", value: students.length, icon: Users, change: "+12%", up: true },
    { label: "Faculty Advisers", value: advisors.length, icon: UserCheck, change: "+2", up: true },
    { label: "Pending Reviews", value: pendingCount, icon: Clock, change: "—", up: false },
    { label: "Completion Rate", value: `${completionRate}%`, icon: TrendingUp, change: "+5%", up: true },
  ]

  const quickLinks = [
    { label: "Manage Users", href: "/admin/users", desc: "Add or remove system accounts" },
    { label: "Adviser Assignment", href: "/admin/adviser-assignment", desc: "Pair students and advisers" },
    { label: "Batch Management", href: "/admin/batches", desc: "Configure academic cohorts" },
    { label: "Template Editor", href: "/admin/templates", desc: "Edit document structures" },
    { label: "Access Control", href: "/admin/access-control", desc: "Role permissions & policies" },
  ]

  return (
    <AdminLayout activeNav="dashboard">
      <div className="flex flex-col gap-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
          <p className="text-[13px] text-[hsl(var(--muted-foreground))]">Hello, Student User</p>
            <h1 className="text-[28px] font-bold tracking-tight mt-1">Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin/batches" className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-[hsl(var(--foreground))] text-[hsl(var(--background))] text-[13px] font-semibold hover:opacity-90 transition-opacity">
              <Plus className="h-4 w-4" /> New Batch
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="h-9 w-9 rounded-lg bg-[hsl(var(--muted))] flex items-center justify-center">
                  <stat.icon className="h-[18px] w-[18px] text-[hsl(var(--muted-foreground))]" />
                </div>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-[11px] font-semibold text-[hsl(var(--muted-foreground))]">
                  {stat.change}
                </span>
              </div>
              <div className="text-[28px] font-bold tracking-tight tabular-nums">{stat.value}</div>
              <p className="text-[12px] font-medium text-[hsl(var(--muted-foreground))] mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          
          {/* Activity Feed */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                <h2 className="text-[15px] font-semibold">Recent Activity</h2>
              </div>
              <Link href="/admin/monitoring" className="text-clickable text-[12px] font-semibold">
                View all
              </Link>
            </div>
            
            <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden">
              {submissions.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center gap-3 text-[hsl(var(--muted-foreground))]">
                  <FileText className="h-10 w-10 opacity-30" />
                  <p className="text-[13px] font-medium">No submissions yet</p>
                  <p className="text-[12px] opacity-60">Activity will appear here when students submit work</p>
                </div>
              ) : (
                <div>
                  {submissions.slice(0, 6).map((sub, i) => (
                    <div key={i} className="flex items-center justify-between px-5 py-4 border-b border-[hsl(var(--border))] last:border-b-0 hover:bg-[hsl(var(--muted))]/50 transition-colors group">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="h-9 w-9 rounded-lg bg-[hsl(var(--muted))] flex items-center justify-center shrink-0 text-[12px] font-bold text-[hsl(var(--muted-foreground))]">
                          {String(i + 1).padStart(2, '0')}
                        </div>
                        <div className="min-w-0">
                          <p className="text-clickable text-[13px] font-semibold truncate">{sub.title}</p>
                          <p className="text-[11px] text-[hsl(var(--muted-foreground))] mt-0.5">
                            {sub.studentName} · <span className="uppercase">{sub.type}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <Badge variant="outline" className="text-[10px] font-semibold uppercase h-5 px-2">
                          {sub.status}
                        </Badge>
                        <ChevronRight className="h-4 w-4 text-[hsl(var(--muted-foreground))] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="flex flex-col gap-6">
            {/* Quick Links */}
            <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden">
              <div className="px-5 py-4 border-b border-[hsl(var(--border))]">
                <h2 className="text-[13px] font-semibold">Quick Access</h2>
                <p className="text-[12px] text-[hsl(var(--muted-foreground))] mt-0.5">Jump to any section instantly.</p>
              </div>
              <div className="p-2">
                {quickLinks.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center justify-between px-3 py-3 rounded-lg border border-transparent hover:border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] transition-all group"
                  >
                    <div className="min-w-0">
                      <span className="text-[13px] font-semibold block">{item.label}</span>
                      <span className="text-[11px] text-[hsl(var(--muted-foreground))]">{item.desc}</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-[hsl(var(--muted-foreground))] shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                ))}
              </div>
            </div>



            {/* Calendar Preview */}
            <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                <h3 className="text-[13px] font-semibold">Upcoming</h3>
              </div>
              <div className="space-y-3">
                {[
                  { date: "Apr 21", title: "DTR Submission Deadline" },
                  { date: "Apr 25", title: "Midterm Evaluation" },
                  { date: "May 02", title: "Progress Report Due" },
                ].map((event) => (
                  <div key={event.title} className="flex items-start gap-3">
                    <span className="text-[11px] font-bold text-[hsl(var(--muted-foreground))] w-12 shrink-0 pt-0.5">{event.date}</span>
                    <span className="text-[12px] font-medium">{event.title}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Login & Logout Info */}
            <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 space-y-4">
              <div>
                <h3 className="text-[13px] font-semibold">Login & Logout</h3>
                <p className="text-[12px] text-[hsl(var(--muted-foreground))] mt-1">
                  Quick account access details for the current admin session.
                </p>
              </div>

              <div className="rounded-lg bg-[hsl(var(--muted))] px-4 py-3 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[11px] font-medium text-[hsl(var(--muted-foreground))]">Logged in as</span>
                  <Badge variant="outline" className="text-[10px] font-semibold uppercase h-5 px-2">
                    {session?.role || "admin"}
                  </Badge>
                </div>
                <p className="text-[13px] font-semibold">{session?.name || "Administrator"}</p>
                <p className="text-[11px] text-[hsl(var(--muted-foreground))] break-all">
                  {session?.email || "admin@sti.edu.ph"}
                </p>
              </div>


            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
