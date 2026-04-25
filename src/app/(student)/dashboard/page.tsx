"use client";

import { useState, useEffect } from "react";
import { getSession } from "@/lib/auth";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DashboardSkeleton } from "@/components/ui/dashboard-skeleton";
import {
  FileText,
  Clock,
  CheckCircle2,
  ArrowRight,
  LayoutGrid,
  History,
  ArrowUpRight,
} from "lucide-react";

interface Submission {
  id: string;
  title: string;
  type: string;
  status: string;
  studentId?: string;
  date?: string;
  createdAt?: string;
}

export default function StudentDashboard() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const REQUIRED_TYPES = ["journal", "dtr", "moa", "evaluation"] as const;

  useEffect(() => {
    const s = getSession();
    if (!s || s.role !== "student") {
      setIsLoading(false);
      return;
    }
    setSession(s);
    const rawSubs: Submission[] = JSON.parse(localStorage.getItem("practicum_submissions") || "[]");
    setSubmissions(rawSubs.filter((sub) => sub.studentId === s.studentId));
    setIsLoading(false);
  }, []);

  if (isLoading) return <DashboardSkeleton />;
  if (!session) return null;

  const submittedTypes = [...new Set(submissions.map((sub) => sub.type?.toLowerCase()))];
  const completionPct = Math.round((submittedTypes.length / REQUIRED_TYPES.length) * 100);

  const stats = [
    { label: "Hours Rendered", value: "320", icon: Clock },
    { label: "Approved", value: submissions.filter((s) => s.status === "approved").length, icon: CheckCircle2 },
    { label: "Pending", value: submissions.filter((s) => s.status === "pending").length, icon: History },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">Hello, <span className="text-clickable font-semibold">Student User</span></p>
          <h1 className="text-3xl font-bold tracking-tight mt-1">Student Dashboard</h1>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
          <div className="flex flex-col items-end leading-tight">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Global Status</span>
            <span className="text-xs font-semibold uppercase text-sti-blue mt-1">In Progress</span>
          </div>
          <div className="h-8 w-8 rounded-full border-2 border-sti-blue border-t-transparent animate-spin" />
        </div>
      </div>

      <Card className="overflow-hidden border border-[hsl(var(--border))] shadow-sm bg-[hsl(var(--card))]">
        <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[hsl(var(--muted))] text-xs font-semibold uppercase tracking-wider text-[hsl(var(--foreground))]">
              Overall Completion
            </div>
            <h3 className="text-2xl md:text-3xl font-bold tracking-tight">You’ve completed {completionPct}% of your required documents</h3>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">You have {REQUIRED_TYPES.length - submittedTypes.length} requirement type(s) left to submit.</p>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold tracking-tight tabular-nums leading-none">{completionPct}%</div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))] mt-2">Finalized</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="border border-[hsl(var(--border))] shadow-sm bg-[hsl(var(--card))] hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="h-9 w-9 rounded-lg bg-[hsl(var(--muted))] flex items-center justify-center">
                  <stat.icon className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-sti-blue" />
              </div>
              <div className="text-3xl font-bold tracking-tight tabular-nums">{stat.value}</div>
              <p className="text-sm font-medium text-[hsl(var(--muted-foreground))] mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <Card className="border border-[hsl(var(--border))] shadow-sm bg-[hsl(var(--card))] overflow-hidden">
          <CardHeader className="border-b border-[hsl(var(--border))]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle className="text-sm">Submission Timeline</CardTitle>
                <CardDescription className="text-sm">Track recent uploads and status updates.</CardDescription>
              </div>
              <Link href="/documents" className="text-clickable text-xs font-semibold">
                Manage files →
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {submissions.length === 0 ? (
              <div className="py-20 text-center text-sm text-[hsl(var(--muted-foreground))]">No submissions yet. Start with the quick actions.</div>
            ) : (
              <div className="divide-y divide-[hsl(var(--border))]">
                {submissions.slice(0, 5).map((sub, i) => (
                  <div key={i} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-[hsl(var(--muted))]/50 transition-colors group">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="h-9 w-9 rounded-lg bg-[hsl(var(--muted))] flex items-center justify-center shrink-0">
                        <FileText className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{sub.title}</p>
                        <p className="text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wider mt-0.5">{sub.type} • {sub.date || "No date"}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs font-semibold uppercase tracking-wider h-5 px-2 shrink-0">
                      {sub.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card className="border border-[hsl(var(--border))] shadow-sm bg-[hsl(var(--card))]">
            <CardHeader>
              <CardTitle className="text-sm">Quick Actions</CardTitle>
              <CardDescription className="text-sm">Jump straight to the next task.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
              {[
                { name: "Daily Journal", href: "/journal" },
                { name: "Time Records", href: "/dtr" },
                { name: "Agreement", href: "/moa" },
                { name: "Evaluation", href: "/evaluation" },
              ].map((item) => (
                <Link key={item.name} href={item.href} className="flex items-center justify-between rounded-lg border border-transparent px-3 py-3 hover:border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] transition-all group">
                  <span className="text-clickable text-sm font-semibold">{item.name}</span>
                  <ArrowRight className="h-4 w-4 text-[hsl(var(--muted-foreground))] group-hover:translate-x-0.5 transition-transform" />
                </Link>
              ))}
            </CardContent>
          </Card>

          <div className="rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Need a Template?</h4>
              <LayoutGrid className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
            </div>
            <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">Browse official forms and downloadable templates for your practicum requirements.</p>
            <Link href="/templates" className="block text-center h-9 leading-9 rounded-lg bg-[hsl(var(--foreground))] text-[hsl(var(--background))] text-xs font-semibold hover:opacity-90 transition-opacity">
              Open Templates
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
