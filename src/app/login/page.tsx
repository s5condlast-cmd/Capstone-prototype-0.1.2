"use client"

import { FormEvent, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getSession, initializeUsers, login, UserRole } from "@/lib/auth"
import { ArrowRight, Loader2 } from "lucide-react"
import { toast } from "sonner"

function routeByRole(role: UserRole, router: ReturnType<typeof useRouter>) {
  if (role === "admin") router.push("/admin")
  else if (role === "advisor") router.push("/advisor")
  else router.push("/dashboard")
}

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [loginForm, setLoginForm] = useState({ identifier: "", password: "" })

  useEffect(() => {
    initializeUsers()
    const session = getSession()
    if (session) routeByRole(session.role, router)
  }, [router])

  const handleLogin = (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const session = login(loginForm.identifier, loginForm.password)
    if (!session) {
      setIsLoading(false)
      toast.error("Invalid credentials", { description: "Please check your username and password." })
      return
    }

    toast.success(`Welcome back, ${session.name}`)
    routeByRole(session.role, router)
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] px-4 py-6 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-xl p-6 sm:p-8">
          <div className="mb-8 text-center">
            <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--foreground))]">
              <span className="text-[hsl(var(--background))] font-black text-[13px] tracking-tight">AIP</span>
            </div>
            <h1 className="text-[22px] font-bold tracking-tight sm:text-[26px]">AIP Practicum System</h1>
            <p className="mt-2 text-[13px] text-[hsl(var(--muted-foreground))] sm:text-[14px]">
              Sign in to your account
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[hsl(var(--muted-foreground))]">Username or Email</label>
              <input
                value={loginForm.identifier}
                onChange={(e) => setLoginForm((current) => ({ ...current, identifier: e.target.value }))}
                placeholder="Enter username or email"
                className="h-11 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 text-[14px] outline-none transition focus:ring-2 focus:ring-[hsl(var(--foreground))]/10"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[hsl(var(--muted-foreground))]">Password</label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm((current) => ({ ...current, password: e.target.value }))}
                placeholder="Enter password"
                className="h-11 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 text-[14px] outline-none transition focus:ring-2 focus:ring-[hsl(var(--foreground))]/10"
              />
            </div>
            <button type="submit" disabled={isLoading} className="inline-flex items-center justify-center h-11 w-full rounded-xl text-[13px] font-semibold uppercase tracking-[0.18em] bg-[hsl(var(--foreground))] text-[hsl(var(--background))] hover:opacity-90 transition disabled:opacity-50">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
