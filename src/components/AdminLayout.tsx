"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getSession, logout, User } from "@/lib/auth"
import { useTheme } from "@/lib/ThemeContext"
import { Sidebar } from "@/components/Sidebar"
import { 
  Bell, 
  Search, 
  Settings, 
  LogOut, 
  User as UserIcon,
  Moon,
  Sun
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

export default function AdminLayout({ children, activeNav }: { children: React.ReactNode; activeNav: string }) {
  const router = useRouter()
  const { darkMode, setDarkMode } = useTheme()
  const [session, setSession] = useState<User | null>(null)
  const [mounted, setMounted] = useState(false)

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
    toast.success("Successfully logged out")
    router.push("/login")
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans antialiased text-slate-900 dark:text-slate-100">
      <Sidebar />
      
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
          <div className="flex-1 flex items-center">
            <div className="relative max-w-md w-full hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search anything... (CMD+K)" 
                className="pl-10 h-9 bg-slate-100 dark:bg-slate-900 border-none rounded-full"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full relative">
              <Bell className="h-5 w-5 text-slate-500" />
              <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-indigo-500 border-2 border-white dark:border-slate-950" />
            </Button>
            
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full ml-2">
                  <Avatar className="h-10 w-10 border border-slate-200 dark:border-slate-800">
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-violet-500 text-white font-bold">
                      {session.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{session.name}</p>
                    <p className="text-xs leading-none text-slate-500">{session.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600 dark:text-red-400 cursor-pointer" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8 lg:p-10">
          <div className="max-w-7xl mx-auto space-y-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
