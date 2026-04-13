"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { login, getSession, UserRole } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (session) {
      if (session.role === "admin") {
        router.push("/admin");
      } else if (session.role === "advisor") {
        router.push("/advisor");
      } else {
        router.push("/dashboard");
      }
    }
  }, []);

  const handleDemoLogin = (role: UserRole) => {
    setIsLoading(true);
    setTimeout(() => {
      login(role);
      if (role === "admin") {
        router.push("/admin");
      } else if (role === "advisor") {
        router.push("/advisor");
      } else {
        router.push("/dashboard");
      }
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute inset-0 opacity-20 dark:opacity-10" 
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #94A3B8 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}
        />
        <div 
          className="absolute top-0 left-0 w-full h-[40vh] bg-gradient-to-b from-blue-50 to-transparent dark:from-slate-900" 
        />
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 bg-blue-600 shadow-lg shadow-blue-500/20">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-extrabold mb-2 text-slate-900 dark:text-white tracking-tight">
              Practicum System
            </h1>
            <p className="text-slate-500 dark:text-slate-400">Select a demo account to continue</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => handleDemoLogin("admin")}
              disabled={isLoading}
              className="w-full py-3.5 text-white font-bold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-500/20"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Admin Demo
            </button>

            <button
              onClick={() => handleDemoLogin("advisor")}
              disabled={isLoading}
              className="w-full py-3.5 text-white font-bold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a4 4 0 11-8 0 4 4 0 018 0zM17 20a4 4 0 10-8 0 4 4 0 008 0z" />
              </svg>
              Advisor Demo
            </button>

            <button
              onClick={() => handleDemoLogin("student")}
              disabled={isLoading}
              className="w-full py-3.5 text-white font-bold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Student Demo
            </button>
          </div>

          <p className="text-xs text-center mt-6 text-slate-400 dark:text-slate-500">
            Demo accounts for testing the system
          </p>
        </div>
      </div>
    </div>
  );
}