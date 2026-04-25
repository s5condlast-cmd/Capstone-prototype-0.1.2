"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { logout } from "@/lib/auth"
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
  LogOut
} from "lucide-react"

export function Sidebar({ className, mobileOpen = false, onClose }: { className?: string; mobileOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = () => {
    logout()
    toast.success("Signed out successfully")
    router.push("/login")
  }

  const sections = [
    {
      title: "Overview",
      items: [
        { label: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
      ]
    },
    {
      title: "Management",
      items: [
        { label: "Users", icon: Users, href: "/admin/users" },
        { label: "Assignments", icon: UserPlus, href: "/admin/adviser-assignment" },
        { label: "Batches", icon: GraduationCap, href: "/admin/batches" },
      ]
    },
    {
      title: "Academic",
      items: [
        { label: "Templates", icon: FileText, href: "/admin/templates" },
        { label: "Student Docs", icon: FileText, href: "/admin/document-workspace" },
      ]
    },
    {
      title: "System",
      items: [
        { label: "Analytics", icon: BarChart3, href: "/admin/reports" },
        { label: "Monitoring", icon: Monitor, href: "/admin/monitoring" },
        { label: "Access Control", icon: ShieldCheck, href: "/admin/access-control" },
      ]
    }
  ]

  return (
    <aside className={cn(
      "fixed inset-y-0 left-0 flex flex-col h-full border-r border-[hsl(var(--border))] bg-[hsl(var(--card))] transition-all duration-300 z-50 shrink-0 md:static md:z-30",
      collapsed ? "w-[64px]" : "w-[240px]",
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
            <span className="text-[12px] font-bold tracking-tight text-[hsl(var(--foreground))]">AIP Web-based System</span>
            <span className="text-[9px] font-medium text-[hsl(var(--muted-foreground))]">AI Practicum Portal</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <nav className="p-2 space-y-4">
          {sections.map((section) => (
            <div key={section.title} className="space-y-1">
              {!collapsed && (
                <p className="px-3 mb-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--muted-foreground))]">
                  {section.title}
                </p>
              )}
              {section.items.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-lg transition-all duration-200 text-[12px] font-medium",
                      collapsed ? "justify-center h-9 w-9 mx-auto" : "px-3 py-2",
                      isActive 
                        ? "bg-[hsl(var(--foreground))] text-[hsl(var(--background))] shadow-sm" 
                        : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))]"
                    )}
                  >
                    <item.icon className="h-[16px] w-[16px] shrink-0" strokeWidth={isActive ? 2.5 : 2} />
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
            "flex items-center gap-3 rounded-lg text-[12px] font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] transition-all duration-200 w-full",
            collapsed ? "justify-center h-9" : "px-3 py-2"
          )}
        >
          {collapsed ? <PanelLeft className="h-[16px] w-[16px]" /> : <PanelLeftClose className="h-[16px] w-[16px]" />}
          {!collapsed && <span>Collapse</span>}
        </button>
        <button
          onClick={() => {
            handleLogout()
            onClose?.()
          }}
          className={cn(
            "flex items-center gap-3 rounded-lg text-[12px] font-medium text-[hsl(var(--destructive))] hover:bg-red-500/10 transition-all duration-200 w-full",
            collapsed ? "justify-center h-9" : "px-3 py-2"
          )}
        >
          <LogOut className="h-[16px] w-[16px]" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )
}
