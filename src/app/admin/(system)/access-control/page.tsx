"use client";

import AdminLayout from "@/components/AdminLayout";
import { 
  ShieldAlert, 
  ShieldCheck, 
  UserSquare2, 
  Settings2,
  Lock,
  Eye,
  Edit3,
  History
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function AdminAccessControl() {
  const roles = [
    { name: "Super Administrator", desc: "Unrestricted system access including security logs and data backups.", perms: ["read:all", "write:all", "delete:all", "sys:admin"], color: "text-red-600 bg-red-50 border-red-100" },
    { name: "Academic Adviser", desc: "Supervise student progress, review journals, and provide feedback.", perms: ["read:students", "write:feedback", "read:docs"], color: "text-amber-600 bg-amber-50 border-amber-100" },
    { name: "Practicum Student", desc: "Submit requirements, view evaluations, and maintain logbooks.", perms: ["write:submissions", "read:feedback", "read:own"], color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
  ];

  return (
    <AdminLayout activeNav="access-control">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Access Control</h2>
            <p className="text-slate-500 mt-1 text-lg">Define role-based permissions and system security policies.</p>
          </div>
          <Button className="bg-slate-900 dark:bg-white dark:text-slate-900 font-bold">
            <Lock className="mr-2 h-4 w-4" /> Global Lockdown
          </Button>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
              <CardHeader>
                <CardTitle>Role Definition</CardTitle>
                <CardDescription>Configure granular permissions for each user classification.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                 <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {roles.map(role => (
                      <div key={role.name} className="p-8 flex flex-col gap-6 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                           <div className="flex items-center gap-4">
                              <div className={`p-3 rounded-xl border ${role.color} dark:bg-opacity-10`}>
                                 <ShieldCheck className="h-6 w-6" />
                              </div>
                              <div>
                                 <h4 className="font-bold text-lg">{role.name}</h4>
                                 <p className="text-sm text-slate-500 max-w-md mt-1">{role.desc}</p>
                              </div>
                           </div>
                           <Button variant="outline" size="sm" className="h-9">
                              <Settings2 className="mr-2 h-3.5 w-3.5" /> Configure
                           </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                           {role.perms.map(p => (
                             <Badge key={p} variant="secondary" className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 font-mono text-[10px] lowercase">
                               {p}
                             </Badge>
                           ))}
                        </div>
                      </div>
                    ))}
                 </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
             <Card className="border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 bg-slate-900 text-white overflow-hidden">
                <CardHeader className="pb-4">
                   <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center mb-2">
                      <ShieldAlert className="h-5 w-5 text-red-400" />
                   </div>
                   <CardTitle className="text-white">Security Audit</CardTitle>
                   <CardDescription className="text-slate-400">Recent security-related events.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                   {[1, 2, 3].map(i => (
                     <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors cursor-default">
                        <History className="h-4 w-4 text-slate-500 mt-0.5 shrink-0" />
                        <div>
                           <p className="text-xs font-medium">Role 'Admin' updated by Superuser</p>
                           <p className="text-[10px] text-slate-500 mt-1">14 Apr 2026, 09:32 AM</p>
                        </div>
                     </div>
                   ))}
                   <Separator className="bg-white/10" />
                   <Button variant="ghost" className="w-full text-xs font-bold hover:bg-white/10 hover:text-white">View Full Audit Log</Button>
                </CardContent>
             </Card>

             <Card className="border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
                <CardHeader>
                   <CardTitle className="text-sm uppercase tracking-widest text-slate-500">Quick Policies</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                   <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Two-Factor Auth</span>
                      <Badge className="bg-blue-600">Enforced</Badge>
                   </div>
                   <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Session Timeout</span>
                      <span className="text-sm text-slate-500">30 Mins</span>
                   </div>
                   <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Auto-Archive</span>
                      <span className="text-sm text-slate-500">Disabled</span>
                   </div>
                </CardContent>
             </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
