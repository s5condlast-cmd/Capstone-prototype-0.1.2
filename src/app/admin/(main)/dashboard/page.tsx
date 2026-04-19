"use client"

import { useState, useEffect } from "react"
import { getSession, getUsers, User } from "@/lib/auth"
import AdminLayout from "@/components/AdminLayout"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Users,
  UserCheck,
  FileText,
  AlertCircle,
  ArrowUpRight,
  Plus,
  ArrowRight,
  BookOpen,
  BarChart3
} from "lucide-react"

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([])
  const [submissions, setSubmissions] = useState<any[]>([])

  useEffect(() => {
    const s = getSession()
    if (!s || s.role !== "admin") return
    setUsers(getUsers())
    setSubmissions(JSON.parse(localStorage.getItem("practicum_submissions") || "[]"))
  }, [])

  const students = users.filter(u => u.role === "student")
  const advisors = users.filter(u => u.role === "advisor")
  
  const stats = [
    { label: "Active Students", value: students.length, icon: Users, description: "Total enrolled in practicum", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
    { label: "Assigned Advisers", value: advisors.length, icon: UserCheck, description: "Faculties currently supervising", color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-900/20" },
    { label: "New Submissions", value: submissions.filter(s => s.status === "pending").length, icon: FileText, description: "Awaiting review and feedback", color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
    { label: "Needs Revision", value: submissions.filter(s => s.status === "revision").length, icon: AlertCircle, description: "Returned to students for edits", color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20" },
  ]

  return (
    <AdminLayout activeNav="dashboard">
      <div className="flex flex-col gap-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
            <p className="text-slate-500 mt-1 text-lg">Welcome back. Here's what's happening in your system today.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button className="rounded-full shadow-lg shadow-indigo-500/20">
              <Plus className="mr-2 h-4 w-4" /> New Batch
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="overflow-hidden border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                  {stat.label}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                  <stat.icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
                <p className="text-xs text-slate-500 mt-2 flex items-center">
                  <ArrowUpRight className="mr-1 h-3 w-3 text-emerald-500" />
                  <span className="text-emerald-500 font-medium">+12%</span> from last term
                </p>
                <CardDescription className="mt-3 text-xs leading-relaxed">
                  {stat.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-7">
          {/* Recent Submissions */}
          <Card className="lg:col-span-4 border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest student submissions across all programs.</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/monitoring" className="text-indigo-600">View All <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {submissions.length === 0 ? (
                  <div className="p-10 text-center text-slate-500">No recent submissions found.</div>
                ) : submissions.slice(0, 5).map((sub: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-600">
                        {sub.studentName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{sub.title}</p>
                        <p className="text-xs text-slate-500">{sub.studentName} • {sub.type?.toUpperCase()}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant={sub.status === "approved" ? "default" : sub.status === "rejected" ? "destructive" : sub.status === "revision" ? "outline" : "secondary"} className="capitalize">
                        {sub.status}
                      </Badge>
                      <span className="text-[10px] text-slate-400">2 hours ago</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Program Distribution */}
          <Card className="lg:col-span-3 border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
            <CardHeader>
              <CardTitle>Quick Access</CardTitle>
              <CardDescription>Common administrative tasks.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {[
                { name: "User Directory", desc: "Manage accounts and permissions", icon: Users, href: "/admin/users", color: "bg-blue-50 text-blue-600" },
                { name: "Academic Batches", desc: "Setup terms and programs", icon: BookOpen, href: "/admin/batches", color: "bg-orange-50 text-orange-600" },
                { name: "Reports Export", desc: "Generate compliance PDF/CSV", icon: BarChart3, href: "/admin/reports", color: "bg-emerald-50 text-emerald-600" },
              ].map((item) => (
                <Link 
                  key={item.name} 
                  href={item.href}
                  className="flex items-center p-4 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-900 hover:shadow-sm transition-all group"
                >
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center mr-4 ${item.color} dark:bg-opacity-10`}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold group-hover:text-indigo-600 transition-colors">{item.name}</p>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
