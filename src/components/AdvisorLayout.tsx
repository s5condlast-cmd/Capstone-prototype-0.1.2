"use client"

import { useState, useEffect, ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { getSession, logout, User } from "@/lib/auth"
import { useTheme } from "@/lib/ThemeContext"
import Link from "next/link"
import { 
  LayoutDashboard,
  Users,
  FileText,
  CheckSquare,
  BarChart3,
  Bell,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Moon,
  Sun,
  User as UserIcon,
  Menu,
  Settings,
  Search,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const navItems = [
  { label: "Search(working)", href: "/advisor/dashboard", icon: LayoutDashboard },
  { label: "Students", href: "/advisor/students", icon: Users },
  { label: "Documents", href: "/advisor/documents", icon: FileText },
  { label: "Approvals", href: "/advisor/approvals", icon: CheckSquare },
  { label: "Reports", href: "/advisor/reports", icon: BarChart3 },
]

export default function AdvisorLayout({ children, activeNav }: { children: ReactNode; activeNav: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const { darkMode, setDarkMode } = useTheme()
  const [session, setSession] = useState<User | null>(null)
  const [mounted, setMounted] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
    const s = getSession()
    if (!s || s.role !== "advisor") {
      router.push("/login")
      return
    }
    setSession(s)
  }, [router])

  useEffect(() => {
    if (pathname === "/advisor/approvals") {
      setCollapsed(true)
    }
  }, [pathname])

  if (!mounted || !session) return null

  const handleLogout = () => {
    logout()
    toast.success("Signed out successfully")
    router.push("/login")
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      {mobileOpen && <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={() => setMobileOpen(false)} />}
      <aside className={cn("fixed inset-y-0 left-0 z-50 flex flex-col border-r border-[hsl(var(--border))] bg-[hsl(var(--card))] transition-all duration-300 shrink-0 md:static md:z-auto", collapsed ? "w-[72px]" : "w-[260px]", mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0")}>
        <div className={cn("h-16 flex items-center border-b border-[hsl(var(--border))] px-5 shrink-0", collapsed && "justify-center px-0")}>
          <div className="h-8 w-8 rounded-lg bg-[hsl(var(--foreground))] flex items-center justify-center shrink-0">
            <span className="text-[hsl(var(--background))] font-black text-[11px]">AIP</span>
          </div>
          {!collapsed && (
            <div className="ml-3">
              <div className="text-[13px] font-bold tracking-tight">Advisor Portal</div>
              <div className="text-[10px] font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Web-based AI System</div>
            </div>
          )}
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  setCollapsed(true)
                  setMobileOpen(false)
                }}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all",
                  collapsed && "justify-center px-0",
                  active
                    ? "bg-[hsl(var(--foreground))] text-[hsl(var(--background))]"
                    : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
                )}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="h-[18px] w-[18px] shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-[hsl(var(--border))] p-3 space-y-1">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn("flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-[13px] font-medium text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] transition-colors", collapsed && "justify-center px-0")}
          >
            {collapsed ? <ChevronRight className="h-[18px] w-[18px]" /> : <ChevronLeft className="h-[18px] w-[18px]" />}
            {!collapsed && <span>Collapse</span>}
          </button>
          <button
            onClick={handleLogout}
            className={cn("flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-[13px] font-medium text-[hsl(var(--destructive))] hover:bg-red-500/10 transition-colors", collapsed && "justify-center px-0")}
          >
            <LogOut className="h-[18px] w-[18px]" />
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="h-16 flex items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] px-6 shrink-0">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="md:hidden h-9 w-9" onClick={() => setMobileOpen(true)}>
              <Menu className="h-4 w-4" />
            </Button>
            <div>
              <h2 className="text-[13px] font-semibold uppercase tracking-[0.18em] text-[hsl(var(--muted-foreground))]">
                {navItems.find(item => item.href === pathname)?.label || activeNav}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="relative h-9 w-9 rounded-lg flex items-center justify-center hover:bg-[hsl(var(--muted))] transition-colors">
              <Bell className="h-4 w-4" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-sti-blue" />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-[hsl(var(--muted))] transition-colors outline-none">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarFallback className="bg-[hsl(var(--foreground))] text-[hsl(var(--background))] font-bold text-[11px] rounded-lg">
                    {session.name?.charAt(0) || "A"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:flex flex-col items-start leading-tight">
                  <span className="text-[13px] font-semibold">{session.name}</span>
                  <span className="text-[10px] font-medium text-[hsl(var(--muted-foreground))] uppercase">Advisor</span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-52" align="end" sideOffset={8}>
                {/* Header */}
                <div className="px-3 py-2.5 border-b border-[hsl(var(--border))]">
                  <p className="text-[13px] font-semibold leading-none">{session.name}</p>
                  <p className="text-[11px] text-[hsl(var(--muted-foreground))] mt-1 uppercase tracking-wider">Advisor</p>
                </div>
                <div className="py-1">
                  <DropdownMenuItem
                    className="flex items-center gap-2.5 px-3 py-2 cursor-pointer text-[13px] rounded-md"
                    onClick={() => setDarkMode(!darkMode)}
                  >
                    {darkMode ? <Sun className="h-4 w-4 shrink-0" /> : <Moon className="h-4 w-4 shrink-0" />}
                    <span>Dark Mode</span>
                    <span className="ml-auto text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                      {darkMode ? "On" : "Off"}
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex items-center gap-2.5 px-3 py-2 cursor-pointer text-[13px] rounded-md"
                    onClick={() => router.push("/advisor/profile")}
                  >
                    <UserIcon className="h-4 w-4 shrink-0" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex items-center gap-2.5 px-3 py-2 cursor-pointer text-[13px] rounded-md"
                    onClick={() => toast.info("Settings coming soon.")}
                  >
                    <Settings className="h-4 w-4 shrink-0" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                </div>
                <div className="border-t border-[hsl(var(--border))] py-1">
                  <DropdownMenuItem
                    className="flex items-center gap-2.5 px-3 py-2 cursor-pointer text-[13px] rounded-md text-[hsl(var(--destructive))] focus:text-[hsl(var(--destructive))]"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 shrink-0" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10">
          <div className="mx-auto w-full max-w-[1400px]">{children}</div>
        </main>
      </div>
    </div>
  )
}
