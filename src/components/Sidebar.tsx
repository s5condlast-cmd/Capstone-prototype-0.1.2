"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { logout, getSession, UserRole } from "@/lib/auth"
import { toast } from "sonner"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  GraduationCap, 
  FileText, 
  BarChart3, 
  Monitor, 
  ShieldCheck,
  PanelLeftClose,
  PanelLeft,
  LogOut,
  CheckSquare,
  Bell,
  UserCircle,
  Clock
} from "lucide-react"

const NAV_CONFIG: Record<UserRole, { title: string; sections: any[] }> = {
  admin: {
    title: "Admin Portal",
    sections: [
      {
        title: "Overview",
        items: [{ label: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" }],
      },
      {
        title: "Management",
        items: [
          { label: "Users", icon: Users, href: "/admin/users" },
          { label: "Assignments", icon: UserPlus, href: "/admin/adviser-assignment" },
          { label: "Batches", icon: GraduationCap, href: "/admin/batches" },
        ],
      },
      {
        title: "Academic",
        items: [
          { label: "Templates", icon: FileText, href: "/admin/templates" },
          { label: "Student Docs", icon: FileText, href: "/admin/document-workspace" },
        ],
      },
      {
        title: "System",
        items: [
          { label: "Analytics", icon: BarChart3, href: "/admin/reports" },
          { label: "Monitoring", icon: Monitor, href: "/admin/monitoring" },
          { label: "Access Control", icon: ShieldCheck, href: "/admin/access-control" },
        ],
      },
    ],
  },
  advisor: {
    title: "Advisor Portal",
    sections: [
      {
        title: "Overview",
        items: [{ label: "Dashboard", icon: LayoutDashboard, href: "/advisor/dashboard" }],
      },
      {
        title: "Academic",
        items: [
          { label: "Students", icon: Users, href: "/advisor/students" },
          { label: "Submissions", icon: CheckSquare, href: "/advisor/submissions" },
          { label: "Approvals", icon: ShieldCheck, href: "/advisor/approvals" },
          { label: "Requirements", icon: FileText, href: "/advisor/requirements" },
        ],
      },
      {
        title: "Personal",
        items: [
          { label: "Notifications", icon: Bell, href: "/advisor/notifications" },
          { label: "Profile", icon: UserCircle, href: "/advisor/profile" },
          { label: "Reports", icon: BarChart3, href: "/advisor/reports" },
        ],
      },
    ],
  },
  student: {
    title: "Student Portal",
    sections: [
      {
        title: "Overview",
        items: [{ label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" }],
      },
      {
        title: "Requirements",
        items: [
          { label: "Daily Journal", icon: FileText, href: "/journal" },
          { label: "Time Records", icon: Clock, href: "/dtr" },
          { label: "Agreement", icon: ShieldCheck, href: "/moa" },
          { label: "Evaluation", icon: CheckSquare, href: "/evaluation" },
        ],
      },
      {
        title: "Resources",
        items: [
          { label: "Documents", icon: FileText, href: "/documents" },
          { label: "Templates", icon: GraduationCap, href: "/templates" },
          { label: "Profile", icon: UserCircle, href: "/profile" },
        ],
      },
    ],
  },
};

export function Sidebar({ className, mobileOpen = false, onClose }: { className?: string; mobileOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  
  const session = getSession()
  const role = session?.role || 'student'
  const config = NAV_CONFIG[role]

  const handleLogout = () => {
    logout()
    toast.success("Signed out successfully")
    router.push("/login")
  }

  return (
    <aside className={cn(
      "fixed inset-y-0 left-0 flex flex-col h-full border-r border-[hsl(var(--border))] bg-[hsl(var(--card))] transition-all duration-300 z-50 shrink-0 md:static md:z-30",
      collapsed ? "w-[64px]" : "w-[220px]",
      mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
      className
    )}>
      {/* Logo */}
      <div className={cn("flex items-center gap-3 h-14 px-4 border-b border-[hsl(var(--border))] shrink-0", collapsed && "justify-center px-0")}>
        <div className="h-7 w-7 rounded-lg bg-[hsl(var(--foreground))] flex items-center justify-center shrink-0">
          <span className="text-[hsl(var(--background))] font-black text-[10px] tracking-tight">AIP</span>
        </div>
        {!collapsed && (
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold tracking-tight text-[hsl(var(--foreground))]">AIP Web-based System</span>
            <span className="text-[10px] font-medium text-[hsl(var(--muted-foreground))]">{config.title}</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <nav className="p-2 space-y-4">
          {config.sections.map((section) => (
            <div key={section.title} className="space-y-1">
              {!collapsed && (
                <p className="px-3 mb-1.5 text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                  {section.title}
                </p>
              )}
              {section.items.map((item: any) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-lg transition-all duration-200 text-sm font-medium",
                      collapsed ? "justify-center h-9 w-9 mx-auto" : "px-3 py-2",
                      isActive 
                        ? "bg-[hsl(var(--foreground))] text-[hsl(var(--background))] shadow-sm" 
                        : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))]"
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" strokeWidth={isActive ? 2.5 : 2} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-[hsl(var(--border))] p-2 space-y-1 shrink-0">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "flex items-center gap-3 rounded-lg text-sm font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] transition-all duration-200 w-full",
            collapsed ? "justify-center h-9" : "px-3 py-2"
          )}
        >
          {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          {!collapsed && <span>Collapse</span>}
        </button>
        <button
          onClick={() => {
            handleLogout()
            onClose?.()
          }}
          className={cn(
            "flex items-center gap-3 rounded-lg text-sm font-medium text-[hsl(var(--destructive))] hover:bg-red-500/10 transition-all duration-200 w-full",
            collapsed ? "justify-center h-9" : "px-3 py-2"
          )}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )
}
