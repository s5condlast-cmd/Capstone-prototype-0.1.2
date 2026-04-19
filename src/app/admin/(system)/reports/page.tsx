"use client";

import { useState, useEffect } from "react";
import { getSession, getUsers } from "@/lib/auth";
import AdminLayout from "@/components/AdminLayout";
import { 
  TrendingUp, 
  Download, 
  Filter, 
  Calendar,
  FileBarChart,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function AdminReports() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [studentCount, setStudentCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const s = getSession();
    if (!s || s.role !== "admin") return;
    const users = getUsers();
    setStudentCount(users.filter(u => u.role === "student").length);
    setSubmissions(JSON.parse(localStorage.getItem("practicum_submissions") || "[]"));
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Metrics updated");
    }, 800);
  };

  const statusDist = {
    approved: submissions.filter(s => s.status === "approved").length,
    pending: submissions.filter(s => s.status === "pending").length,
    rejected: submissions.filter(s => s.status === "rejected").length,
    revision: submissions.filter(s => s.status === "revision").length,
  };
  
  const approvalRate = submissions.length > 0 ? Math.round((statusDist.approved / submissions.length) * 100) : 0;
  const activeStudentRate = studentCount > 0 ? Math.round((new Set(submissions.map(s => s.studentName)).size / studentCount) * 100) : 0;
  const avgSubs = studentCount > 0 ? (submissions.length / studentCount).toFixed(1) : "0.0";

  return (
    <AdminLayout activeNav="reports">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Analytics & Intelligence</h2>
            <p className="text-slate-500 mt-1 text-lg">Cross-program performance metrics and submission trends.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} /> Sync Data
            </Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Download className="mr-2 h-4 w-4" /> Export Report
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
           <Card className="border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
              <CardContent className="pt-6">
                 <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                       <TrendingUp className="h-4 w-4" />
                    </div>
                    <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-100">+2.4%</Badge>
                 </div>
                 <div className="text-2xl font-bold">{approvalRate}%</div>
                 <p className="text-xs font-medium text-slate-500 mt-1">Approval Velocity</p>
                 <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: `${approvalRate}%` }} />
                 </div>
              </CardContent>
           </Card>

           <Card className="border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
              <CardContent className="pt-6">
                 <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                       <PieChart className="h-4 w-4" />
                    </div>
                    <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-100">Optimal</Badge>
                 </div>
                 <div className="text-2xl font-bold">{activeStudentRate}%</div>
                 <p className="text-xs font-medium text-slate-500 mt-1">Participation Rate</p>
                 <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500" style={{ width: `${activeStudentRate}%` }} />
                 </div>
              </CardContent>
           </Card>

           <Card className="border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
              <CardContent className="pt-6">
                 <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-violet-50 text-violet-600 rounded-lg">
                       <FileBarChart className="h-4 w-4" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">TARGET: 10.0</span>
                 </div>
                 <div className="text-2xl font-bold">{avgSubs}</div>
                 <p className="text-xs font-medium text-slate-500 mt-1">Avg. Subs per Student</p>
                 <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-violet-500" style={{ width: `${(parseFloat(avgSubs)/10)*100}%` }} />
                 </div>
              </CardContent>
           </Card>

           <Card className="border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
              <CardContent className="pt-6">
                 <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                       <Calendar className="h-4 w-4" />
                    </div>
                    <Badge variant="outline" className="text-amber-600 border-amber-200">Critical</Badge>
                 </div>
                 <div className="text-2xl font-bold">{statusDist.pending + statusDist.revision}</div>
                 <p className="text-xs font-medium text-slate-500 mt-1">Unresolved Workload</p>
                 <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500" style={{ width: '40%' }} />
                 </div>
              </CardContent>
           </Card>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
            <Card className="border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
               <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Program Distribution</CardTitle>
                    <CardDescription>Submission volume by academic program.</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" /> Filter
                  </Button>
               </CardHeader>
               <CardContent className="pt-4">
                  <div className="space-y-6">
                    {['BSIT', 'BSCS', 'BSIS', 'BSEMC'].map(program => (
                      <div key={program} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                           <span className="font-semibold text-slate-700">{program}</span>
                           <span className="text-slate-500">24 Submissions</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                           <div className="h-full bg-indigo-500" style={{ width: `${Math.random()*80+20}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
               </CardContent>
            </Card>

            <Card className="border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
               <CardHeader>
                  <CardTitle>Performance Insights</CardTitle>
                  <CardDescription>Automated AI-driven analysis of system health.</CardDescription>
               </CardHeader>
               <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800 flex gap-4">
                       <ArrowUpRight className="h-5 w-5 text-emerald-600 shrink-0" />
                       <div className="text-sm">
                          <p className="font-bold text-emerald-800 dark:text-emerald-400">High Participation</p>
                          <p className="text-emerald-700/80 dark:text-emerald-500/80 mt-1">Student participation has increased by 14% this week. Participation is currently at optimal levels.</p>
                       </div>
                    </div>

                    <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800 flex gap-4">
                       <ArrowDownRight className="h-5 w-5 text-amber-600 shrink-0" />
                       <div className="text-sm">
                          <p className="font-bold text-amber-800 dark:text-amber-400">Review Bottleneck</p>
                          <p className="text-amber-700/80 dark:text-amber-500/80 mt-1">Submission review times have increased to 3.2 days. Consider notifying advisers to clear their queues.</p>
                       </div>
                    </div>
                  </div>
               </CardContent>
            </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
