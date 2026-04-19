"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Home, 
  Users, 
  UserPlus, 
  GraduationCap, 
  FileStack, 
  BarChart3, 
  Monitor, 
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Command
} from "lucide-react"

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const routes = [
    { label: "Dashboard", icon: Home, href: "/admin/dashboard", color: "text-sky-500" },
    { label: "Users", icon: Users, href: "/admin/users", color: "text-violet-500" },
    { label: "Assignments", icon: UserPlus, href: "/admin/adviser-assignment", color: "text-pink-700" },
    { label: "Batches", icon: GraduationCap, href: "/admin/batches", color: "text-orange-700" },
    { label: "Templates", icon: FileStack, href: "/admin/templates", color: "text-emerald-500" },
    { label: "Analytics", icon: BarChart3, href: "/admin/reports", color: "text-blue-600" },
    { label: "Monitoring", icon: Monitor, href: "/admin/monitoring", color: "text-amber-600" },
    { label: "Access Control", icon: ShieldCheck, href: "/admin/access-control", color: "text-red-600" },
  ]

  return (
    <div className={cn(
      "relative flex flex-col h-full border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 transition-all duration-300",
      isCollapsed ? "w-20" : "w-64",
      className
    )}>
      {/* Collapse Toggle */}
      <Button
        onClick={() => setIsCollapsed(!isCollapsed)}
        variant="secondary"
        className="absolute -right-3 top-10 h-6 w-6 rounded-full p-0 shadow-md border border-slate-200 dark:border-slate-800"
      >
        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </Button>

      <div className="p-6 flex items-center gap-3 overflow-hidden whitespace-nowrap">
        <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
          <Command className="h-5 w-5 text-white" />
        </div>
        {!isCollapsed && (
          <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">PRACTICUM</h1>
        )}
      </div>

      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1 py-2">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-slate-900 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-slate-800/50 rounded-lg transition-all",
                pathname === route.href ? "text-slate-900 bg-slate-100 dark:text-white dark:bg-slate-800" : "text-slate-500 dark:text-slate-400",
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3 shrink-0", route.color)} />
                {!isCollapsed && <span>{route.label}</span>}
              </div>
            </Link>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
