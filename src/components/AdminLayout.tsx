"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getSession, logout, User } from "@/lib/auth"
import { Sidebar } from "@/components/Sidebar"
import { Bell, Search, LogOut, ChevronDown, User as UserIcon, Moon, Sun, Settings, Menu } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "sonner"
import { useTheme } from "@/lib/ThemeContext"

export default function AdminLayout({ children, activeNav }: { children: React.ReactNode; activeNav: string }) {
  const router = useRouter()
  const { darkMode, setDarkMode } = useTheme()
  const [session, setSession] = useState<User | null>(null)
  const [mounted, setMounted] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
    const s = getSession()
    if (!s || s.role !== "admin") {
      router.push("/login")
      return
    }
    setSession(s)
  }, [router])

  if (!mounted || !session) return null

  const handleLogout = () => {
    logout()
    toast.success("Signed out successfully")
    router.push("/login")
  }

  return (
    <div className="flex h-screen w-full bg-[hsl(var(--background))] font-sans antialiased text-[hsl(var(--foreground))] overflow-hidden">
      {mobileOpen && <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={() => setMobileOpen(false)} />}
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] shrink-0 z-20">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <button className="md:hidden h-9 w-9 rounded-lg flex items-center justify-center hover:bg-[hsl(var(--muted))] transition-colors shrink-0" onClick={() => setMobileOpen(true)}>
              <Menu className="h-4 w-4" />
            </button>
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
              <input 
                placeholder="Search anything..." 
                className="w-full h-9 pl-10 pr-4 rounded-lg bg-[hsl(var(--muted))] border-none text-[13px] font-medium text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--foreground))]/10 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Notifications */}
            <button className="relative h-9 w-9 rounded-lg flex items-center justify-center hover:bg-[hsl(var(--muted))] transition-colors">
              <Bell className="h-[18px] w-[18px] text-[hsl(var(--muted-foreground))]" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-sti-blue" />
            </button>

            <div className="h-6 w-px bg-[hsl(var(--border))] mx-2" />
            
            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-3 p-1.5 pr-3 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors outline-none">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarFallback className="bg-[hsl(var(--foreground))] text-[hsl(var(--background))] font-bold text-[11px] rounded-lg">
                    {session.name?.charAt(0) || "A"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:flex flex-col items-start text-left">
                  <span className="text-[13px] font-semibold leading-tight">{session.name}</span>
                  <span className="text-[10px] font-medium text-[hsl(var(--muted-foreground))]">Administrator</span>
                </div>
                <ChevronDown className="hidden sm:block h-3.5 w-3.5 text-[hsl(var(--muted-foreground))] ml-1" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-52" align="end" sideOffset={8}>
                {/* Header */}
                <div className="px-3 py-2.5 border-b border-[hsl(var(--border))]">
                  <p className="text-[13px] font-semibold leading-none">{session.name}</p>
                  <p className="text-[11px] text-[hsl(var(--muted-foreground))] mt-1 uppercase tracking-wider">Administrator</p>
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
                    onClick={() => router.push("/admin/profile")}
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

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto p-6 md:p-8 lg:p-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
