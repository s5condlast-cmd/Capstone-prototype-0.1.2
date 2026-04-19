"use client";

import { useState, useEffect } from "react";
import { getSession, getUsers } from "@/lib/auth";
import AdminLayout from "@/components/AdminLayout";
import { 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Users, 
  FileText,
  Search,
  Filter,
  Eye
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminMonitoring() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [studentCount, setStudentCount] = useState(0);
  const [advisorCount, setAdvisorCount] = useState(0);

  useEffect(() => {
    const s = getSession();
    if (!s || s.role !== "admin") return;
    const users = getUsers();
    setStudentCount(users.filter(u => u.role === "student").length);
    setAdvisorCount(users.filter(u => u.role === "advisor").length);
    setSubmissions(JSON.parse(localStorage.getItem("practicum_submissions") || "[]"));
  }, []);

  const statusDist = {
    pending: submissions.filter(s => s.status === "pending").length,
    revision: submissions.filter(s => s.status === "revision").length,
  };
  const activeStudentRate = studentCount > 0 ? Math.round((new Set(submissions.map(s => s.studentName)).size / studentCount) * 100) : 0;

  const alerts = [
    { type: 'warning', message: `${statusDist.pending} submission(s) awaiting initial review.`, icon: Clock },
    { type: 'info', message: `${statusDist.revision} submission(s) pending student updates.`, icon: Activity },
    { type: 'error', message: `${100 - activeStudentRate}% of students are inactive this term.`, icon: AlertCircle },
  ];

  return (
    <AdminLayout activeNav="monitoring">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">System Monitoring</h2>
            <p className="text-slate-500 mt-1 text-lg">Real-time health status and queue tracking.</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-full border border-emerald-100 dark:border-emerald-800">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-widest">System Online</span>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Active Connections", value: studentCount + advisorCount, icon: Users, color: "text-blue-600" },
            { label: "Review Queue", value: statusDist.pending, icon: FileText, color: "text-amber-600" },
            { label: "Completion Rate", value: `${activeStudentRate}%`, icon: CheckCircle, color: "text-emerald-600" },
            { label: "Total Submissions", value: submissions.length, icon: Activity, color: "text-indigo-600" },
          ].map(card => (
            <Card key={card.label} className="border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{card.label}</p>
                  <card.icon className={`h-4 w-4 ${card.color}`} />
                </div>
                <p className="text-3xl font-bold mt-4">{card.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          <Card className="lg:col-span-5 border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
            <CardHeader>
              <CardTitle>System Alerts</CardTitle>
              <CardDescription>Critical status updates requiring attention.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {alerts.map((alert, i) => (
                <div key={i} className={`p-4 rounded-xl flex items-center gap-4 ${
                  alert.type === 'warning' ? 'bg-amber-50 text-amber-800 border border-amber-100' :
                  alert.type === 'error' ? 'bg-red-50 text-red-800 border border-red-100' :
                  'bg-blue-50 text-blue-800 border border-blue-100'
                } dark:bg-opacity-10 dark:border-opacity-20`}>
                  <alert.icon className="h-5 w-5 shrink-0" />
                  <p className="text-sm font-medium">{alert.message}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="lg:col-span-7 border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Global Activity Stream</CardTitle>
                <CardDescription>Chronological log of student and adviser actions.</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                 <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
                    <Input placeholder="Filter logs..." className="h-8 pl-7 text-xs w-40" />
                 </div>
                 <Button variant="outline" size="sm" className="h-8">
                    <Filter className="h-3 w-3" />
                 </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {submissions.length === 0 ? (
                  <div className="p-10 text-center text-slate-400">No activity logged.</div>
                ) : submissions.slice(0, 8).map((sub: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-indigo-400" />
                      <div className="text-sm">
                        <span className="font-bold">{sub.studentName}</span>
                        <span className="text-slate-500"> submitted </span>
                        <span className="font-medium text-indigo-600">{sub.title}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">14:02 PM</span>
                       <Button variant="ghost" size="icon" className="h-7 w-7">
                          <Eye className="h-3 w-3" />
                       </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
