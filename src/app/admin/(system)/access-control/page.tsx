"use client"

import AdminLayout from "@/components/AdminLayout"
import { 
  ShieldCheck, 
  Lock,
  History,
  Eye,
  Edit3
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function AdminAccessControl() {
  const roles = [
    { 
      name: "Super Administrator", 
      desc: "Full system access including security, data management, and user control.", 
      perms: ["read:all", "write:all", "delete:all", "sys:admin"],
      level: "Critical"
    },
    { 
      name: "Academic Adviser", 
      desc: "Supervise student progress, review submissions, and provide feedback.", 
      perms: ["read:students", "write:feedback", "read:docs"],
      level: "Standard"
    },
    { 
      name: "Practicum Student", 
      desc: "Submit requirements, view evaluations, and maintain activity logs.", 
      perms: ["write:submissions", "read:feedback", "read:own"],
      level: "Basic"
    },
  ]

  const auditLog = [
    { action: "Role 'Admin' permissions updated", time: "14 Apr 2026, 09:32 AM" },
    { action: "New adviser account provisioned", time: "13 Apr 2026, 02:15 PM" },
    { action: "Session timeout policy changed to 30m", time: "12 Apr 2026, 11:48 AM" },
  ]

  const policies = [
    { label: "2FA Enforcement", value: "Active", active: true },
    { label: "Session Timeout", value: "30 min", active: false },
    { label: "IP Restriction", value: "None", active: false },
    { label: "Password Policy", value: "Strong", active: true },
  ]

  return (
    <AdminLayout activeNav="access-control">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-[28px] font-bold tracking-tight">Access Control</h1>
            <p className="text-[13px] text-[hsl(var(--muted-foreground))] mt-1">Role-based permissions and security policies.</p>
          </div>
          <button className="inline-flex items-center gap-2 h-9 px-4 rounded-lg border-2 border-[hsl(var(--destructive))] text-[hsl(var(--destructive))] text-[13px] font-semibold hover:bg-[hsl(var(--destructive))] hover:text-white transition-colors">
            <Lock className="h-4 w-4" /> Emergency Lockdown
          </button>
        </div>

        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          {/* Role Definitions */}
          <div className="flex flex-col gap-4">
            <h2 className="text-[15px] font-semibold px-1">Role Definitions</h2>
            <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden">
              {roles.map((role, i) => (
                <div key={role.name} className={cn(
                  "p-6 hover:bg-[hsl(var(--muted))]/30 transition-colors",
                  i < roles.length - 1 && "border-b border-[hsl(var(--border))]"
                )}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-[hsl(var(--muted))] flex items-center justify-center">
                        <ShieldCheck className="h-5 w-5 text-[hsl(var(--foreground))]" />
                      </div>
                      <div>
                        <h3 className="text-[15px] font-bold">{role.name}</h3>
                        <p className="text-[12px] text-[hsl(var(--muted-foreground))] mt-0.5">{role.desc}</p>
                      </div>
                    </div>
                    <button className="text-clickable text-[12px] font-semibold flex items-center gap-1 shrink-0 ml-4">
                      <Edit3 className="h-3 w-3" /> Edit
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-4 flex-wrap">
                    <span className={cn(
                      "inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                      role.level === "Critical" ? "bg-[hsl(var(--foreground))] text-[hsl(var(--background))]" :
                      role.level === "Standard" ? "bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]" :
                      "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
                    )}>
                      {role.level}
                    </span>
                    {role.perms.map(p => (
                      <span key={p} className="px-2 py-0.5 rounded bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] font-mono text-[10px]">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-6">
            {/* Audit Log */}
            <div className="flex flex-col gap-3">
              <h2 className="text-[12px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))] px-1">Security Audit</h2>
              <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 space-y-4">
                {auditLog.map((entry, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <History className="h-4 w-4 text-[hsl(var(--muted-foreground))] mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[12px] font-medium">{entry.action}</p>
                      <p className="text-[11px] text-[hsl(var(--muted-foreground))]">{entry.time}</p>
                    </div>
                  </div>
                ))}
                <div className="pt-3 border-t border-[hsl(var(--border))]">
                  <span className="text-clickable text-[12px] font-semibold">View full audit log →</span>
                </div>
              </div>
            </div>

            {/* Security Policies */}
            <div className="flex flex-col gap-3">
              <h2 className="text-[12px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))] px-1">Security Policies</h2>
              <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 space-y-3">
                {policies.map(p => (
                  <div key={p.label} className="flex items-center justify-between py-1">
                    <span className="text-[13px] font-medium">{p.label}</span>
                    <span className={cn(
                      "text-[12px] font-semibold tabular-nums",
                      p.active ? "text-[hsl(var(--foreground))]" : "text-[hsl(var(--muted-foreground))]"
                    )}>{p.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
