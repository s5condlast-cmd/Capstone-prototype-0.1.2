# Admin Documentation

## Overview

The Practicum Management System provides administrators with tools to oversee the entire platform. This includes user management, adviser assignments, batch and template management, system monitoring, and reporting.

This document details the admin processes, features, and code implementations.

**Related Documentation:**
- [student.md](./student.md) - For student workflows.
- [advisor.md](./advisor.md) - For advisor workflows.

---

## Table of Contents

1. [Authentication & Authorization](#authentication--authorization)
2. [Admin Dashboard](#admin-dashboard)
3. [User Management](#user-management)
4. [Adviser Assignment](#adviser-assignment)
5. [Academic Batches](#academic-batches)
6. [Templates Management](#templates-management)
7. [System Monitoring](#system-monitoring)
8. [Reports](#reports)
9. [Access Control](#access-control)
10. [Admin Layout Component](#admin-layout-component)

---

## Authentication & Authorization

Administrators log in via `/login` and are redirected to `/admin`. All admin pages verify the session role to ensure only users with the `admin` role can access them.

### Auth Implementation
**File:** `src/lib/auth.ts`
```ts
"use client";

import {
  DEMO_ADMIN_EMAIL,
  DEMO_ADMIN_NAME,
  DEMO_ADVISOR_EMAIL,
  DEMO_ADVISOR_NAME,
  DEMO_STUDENT_EMAIL,
  DEMO_STUDENT_NAME,
} from "./config";

export interface User {
  id: string;
  studentId: string;
  name: string;
  email: string;
  role: "admin" | "advisor" | "student";
}

export type UserRole = "admin" | "advisor" | "student";

export const DEMO_USERS: Record<UserRole, User> = {
  admin: {
    id: "admin-001",
    studentId: "ADMIN001",
    name: DEMO_ADMIN_NAME,
    email: DEMO_ADMIN_EMAIL,
    role: "admin",
  },
  advisor: {
    id: "advisor-001",
    studentId: "ADVISOR001",
    name: DEMO_ADVISOR_NAME,
    email: DEMO_ADVISOR_EMAIL,
    role: "advisor",
  },
  student: {
    id: "student-001",
    studentId: "STUDENT-001",
    name: DEMO_STUDENT_NAME,
    email: DEMO_STUDENT_EMAIL,
    role: "student",
  },
};

export function getSession(): User | null {
  if (typeof window === "undefined") return null;
  const role = localStorage.getItem("demo_role") as UserRole | null;
  if (!role) return null;
  return DEMO_USERS[role] || null;
}

export function login(role: UserRole): User {
  if (typeof window !== "undefined") {
    localStorage.setItem("demo_role", role);
  }
  return DEMO_USERS[role];
}

export function logout(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("demo_role");
  }
}

export function getUsers(): User[] {
  return Object.values(DEMO_USERS);
}

export function createUser(data: {
  studentId: string;
  password: string;
  name: string;
  email: string;
  role: UserRole;
}): User | null {
  const existing = DEMO_USERS[data.role as UserRole];
  if (existing) return null;
  return {
    id: `${data.role}-${Date.now()}`,
    studentId: data.studentId,
    name: data.name,
    email: data.email,
    role: data.role,
  };
}

export function deleteUser(id: string): void {}

export function initializeUsers(): void {}
```

### Route Protection
**File:** `src/app/admin/page.tsx`
```tsx
"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
export default function AdminIndex() {
  const router = useRouter();
  useEffect(() => { router.replace("/admin/dashboard"); }, [router]);
  return null;
}

```

---

## Admin Dashboard

The dashboard provides a high-level summary of total users, students, advisers, and document submissions. It displays submission statuses (approved, pending, rejected, revision) and overall system metrics.

**File:** `src/app/admin/dashboard/page.tsx`
```tsx
"use client";

import { useState, useEffect } from "react";
import { getSession, getUsers, User } from "@/lib/auth";
import AdminLayout from "@/components/AdminLayout";
import Link from "next/link";

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);

  useEffect(() => {
    const s = getSession();
    if (!s || s.role !== "admin") return;
    setUsers(getUsers());
    setSubmissions(JSON.parse(localStorage.getItem("practicum_submissions") || "[]"));
  }, []);

  const students = users.filter(u => u.role === "student");
  const advisors = users.filter(u => u.role === "advisor");
  const statusDist = {
    approved: submissions.filter(s => s.status === "approved").length,
    pending: submissions.filter(s => s.status === "pending").length,
    rejected: submissions.filter(s => s.status === "rejected").length,
    revision: submissions.filter(s => s.status === "revision").length,
  };
  const approvalRate = submissions.length > 0 ? Math.round((statusDist.approved / submissions.length) * 100) : 0;
  const activeStudentRate = students.length > 0 ? Math.round((new Set(submissions.map(s => s.studentName)).size / students.length) * 100) : 0;
  const avgSubs = students.length > 0 ? (submissions.length / students.length).toFixed(1) : "0.0";

  return (
    <AdminLayout activeNav="dashboard">
      <div className="max-w-[1600px] mx-auto space-y-6 md:space-y-8">
        
        {/* Stats */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            { label: "Total Users", value: users.length, icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z", color: "blue" },
            { label: "Students", value: students.length, icon: "M5 13l4 4L19 7", color: "green" },
            { label: "Advisers", value: advisors.length, icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z", color: "amber" },
            { label: "Submissions", value: submissions.length, icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", color: "purple" },
          ].map(card => (
            <div key={card.label} className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-${card.color}-50 dark:bg-${card.color}-900/30 text-${card.color}-600 dark:text-${card.color}-400 flex items-center justify-center`}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} /></svg>
                </div>
                <span className="text-3xl font-bold text-slate-900 dark:text-white leading-none">{card.value}</span>
              </div>
              <span className="text-xs font-medium text-slate-500">{card.label}</span>
            </div>
          ))}
        </div>

        {/* Recent Submissions + Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Recent Submissions</h3>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {submissions.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">No submissions yet.</div>
              ) : submissions.slice(0, 5).map((sub: any, i: number) => (
                <div key={i} className="px-6 py-3.5 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{sub.title}</div>
                    <div className="text-xs text-slate-500">{sub.studentName}</div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-md text-xs font-semibold uppercase ${sub.status === "approved" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : sub.status === "rejected" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : sub.status === "revision" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"}`}>{sub.status}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Manage Users", href: "/admin/users", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
                { label: "Batch Setup", href: "/admin/batches", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
                { label: "Templates", href: "/admin/templates", icon: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z" },
                { label: "View Reports", href: "/admin/reports", icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
              ].map(a => (
                <Link key={a.href} href={a.href} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-700/50 transition-colors group">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-2 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={a.icon} /></svg>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{a.label}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Performance Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4">Performance Metrics</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50"><span className="text-sm text-slate-500">Approval Rate</span><span className="text-sm font-bold text-green-600">{approvalRate}%</span></div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50"><span className="text-sm text-slate-500">Active Student Rate</span><span className="text-sm font-bold text-blue-600">{activeStudentRate}%</span></div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50"><span className="text-sm text-slate-500">Avg. Subs / Student</span><span className="text-sm font-bold text-purple-600">{avgSubs}</span></div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4">Submission Status</h3>
            <div className="space-y-4">
              {Object.entries(statusDist).map(([status, count]) => (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm capitalize text-slate-600 dark:text-slate-400">{status}</span>
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{count}</span>
                  </div>
                  <div className="w-full h-2 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <div className="h-full rounded-full" style={{ width: `${submissions.length ? (count / submissions.length) * 100 : 0}%`, backgroundColor: status === "approved" ? "#16A34A" : status === "pending" ? "#D97706" : status === "revision" ? "#2563EB" : "#DC2626" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4">Activity Logs</h3>
            <div className="space-y-3">
              {submissions.length === 0 ? (
                <p className="text-sm text-slate-500">No activity yet.</p>
              ) : submissions.slice(0, 4).map((sub: any, i: number) => (
                <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{sub.studentName} submitted {sub.title}</p>
                  <p className="text-xs text-slate-500">{sub.type?.toUpperCase()} · {sub.status}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

```

---

## User Management

The User Management module allows administrators to view, create, search, and delete user accounts. Users are categorized by roles (Admin, Adviser, Student).

**File:** `src/app/admin/users/page.tsx`
```tsx
"use client";

import { useState, useEffect } from "react";
import { getSession, getUsers, createUser, deleteUser, User, UserRole } from "@/lib/auth";
import AdminLayout from "@/components/AdminLayout";

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ studentId: "", name: "", email: "", password: "", role: "student" as UserRole });

  useEffect(() => {
    const s = getSession();
    if (!s || s.role !== "admin") return;
    setUsers(getUsers());
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!formData.studentId || !formData.name || !formData.email || !formData.password) { setError("Please fill in all fields"); return; }
    const newUser = createUser({ studentId: formData.studentId, password: formData.password, name: formData.name, email: formData.email, role: formData.role });
    if (!newUser) { setError("Student ID already exists"); return; }
    setUsers(getUsers());
    setShowModal(false);
    setFormData({ studentId: "", name: "", email: "", password: "", role: "student" });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this user?")) { deleteUser(id); setUsers(getUsers()); }
  };

  const filtered = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase()) || u.studentId.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const roleBadge = (role: UserRole) => {
    const m: Record<string, string> = { admin: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", advisor: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", student: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" };
    return <span className={`px-2.5 py-1 rounded-md text-xs font-semibold capitalize ${m[role]}`}>{role}</span>;
  };

  return (
    <AdminLayout activeNav="users">
      <div className="max-w-[1600px] mx-auto space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">All Users</h3>
            <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Add User
            </button>
          </div>

          <div className="px-6 py-4 flex items-center gap-4 border-b border-slate-100 dark:border-slate-800/50">
            <div className="flex-1 relative">
              <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input type="text" placeholder="Search users..." value={userSearch} onChange={e => setUserSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-sm outline-none">
              <option value="all">All Roles</option>
              <option value="student">Student</option>
              <option value="advisor">Adviser</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="text-left py-3 px-6 text-xs font-semibold text-slate-500 uppercase">Student ID</th>
                  <th className="text-left py-3 px-6 text-xs font-semibold text-slate-500 uppercase">Name</th>
                  <th className="text-left py-3 px-6 text-xs font-semibold text-slate-500 uppercase">Email</th>
                  <th className="text-left py-3 px-6 text-xs font-semibold text-slate-500 uppercase">Role</th>
                  <th className="text-left py-3 px-6 text-xs font-semibold text-slate-500 uppercase">Status</th>
                  <th className="text-left py-3 px-6 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {filtered.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-6 text-sm font-medium text-slate-800 dark:text-slate-200">{user.studentId}</td>
                    <td className="py-3 px-6 text-sm text-slate-800 dark:text-slate-200">{user.name}</td>
                    <td className="py-3 px-6 text-sm text-slate-500">{user.email}</td>
                    <td className="py-3 px-6">{roleBadge(user.role)}</td>
                    <td className="py-3 px-6"><span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2.5 py-1 rounded-md text-xs font-semibold">Active</span></td>
                    <td className="py-3 px-6">
                      <button onClick={() => handleDelete(user.id)} className="text-sm font-semibold text-red-600 dark:text-red-400 hover:underline">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Add User</h3>
            {error && <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg mb-4">{error}</p>}
            <form onSubmit={handleCreate} className="space-y-4">
              <input type="text" placeholder="Student ID" value={formData.studentId} onChange={e => setFormData({ ...formData, studentId: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              <input type="text" placeholder="Full Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              <input type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              <input type="password" placeholder="Password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value as UserRole })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-sm outline-none">
                <option value="student">Student</option>
                <option value="advisor">Adviser</option>
                <option value="admin">Admin</option>
              </select>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

```

---

## Adviser Assignment

This module maps students to specific advisers. It tracks assignments and ensures students receive feedback from their designated advisor.

**File:** `src/app/admin/adviser-assignment/page.tsx`
```tsx
"use client";

import { useState, useEffect } from "react";
import { getSession, getUsers, User } from "@/lib/auth";
import AdminLayout from "@/components/AdminLayout";

interface StudentAdviser { studentId: string; adviserId: string; }

export default function AdminAdviserAssignment() {
  const [users, setUsers] = useState<User[]>([]);
  const [assignments, setAssignments] = useState<StudentAdviser[]>([]);

  useEffect(() => {
    const s = getSession();
    if (!s || s.role !== "admin") return;
    setUsers(getUsers());
    setAssignments(JSON.parse(localStorage.getItem("practicum_adviser_assignments") || "[]"));
  }, []);

  const students = users.filter(u => u.role === "student");
  const advisors = users.filter(u => u.role === "advisor");

  const handleAssign = (studentId: string, adviserId: string) => {
    const existing = assignments.find(a => a.studentId === studentId);
    let updated: StudentAdviser[];
    if (existing) {
      updated = assignments.map(a => a.studentId === studentId ? { ...a, adviserId } : a);
    } else {
      updated = [...assignments, { studentId, adviserId }];
    }
    setAssignments(updated);
    localStorage.setItem("practicum_adviser_assignments", JSON.stringify(updated));
  };

  return (
    <AdminLayout activeNav="adviser-assignment">
      <div className="max-w-[1600px] mx-auto space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Adviser Assignments</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="text-left py-3 px-6 text-xs font-semibold text-slate-500 uppercase">Student ID</th>
                  <th className="text-left py-3 px-6 text-xs font-semibold text-slate-500 uppercase">Student Name</th>
                  <th className="text-left py-3 px-6 text-xs font-semibold text-slate-500 uppercase">Assigned Adviser</th>
                  <th className="text-left py-3 px-6 text-xs font-semibold text-slate-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {students.map(student => {
                  const assignment = assignments.find(a => a.studentId === student.studentId);
                  const adviser = assignment ? advisors.find(a => a.id === assignment.adviserId) : null;
                  return (
                    <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-6 text-sm font-medium text-slate-800 dark:text-slate-200">{student.studentId}</td>
                      <td className="py-3 px-6 text-sm text-slate-800 dark:text-slate-200">{student.name}</td>
                      <td className="py-3 px-6">
                        {adviser ? (
                          <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2.5 py-1 rounded-md text-xs font-semibold">{adviser.name}</span>
                        ) : (
                          <span className="text-sm text-slate-400">Not Assigned</span>
                        )}
                      </td>
                      <td className="py-3 px-6">
                        <select value={assignment?.adviserId || ""} onChange={e => handleAssign(student.studentId, e.target.value)} className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-sm outline-none">
                          <option value="">Select Adviser</option>
                          {advisors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {students.length === 0 && <div className="p-8 text-center text-slate-500 text-sm">No students found.</div>}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

```

---

## Academic Batches

Admins can define academic batches, specifying the academic year, term, and program. This helps organize student practicum tracking.

**File:** `src/app/admin/batches/page.tsx`
```tsx
"use client";

import { useState, useEffect } from "react";
import { getSession } from "@/lib/auth";
import AdminLayout from "@/components/AdminLayout";

interface Batch { id: string; name: string; academicYear: string; term: string; program: string; createdAt: string; }

export default function AdminBatches() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", academicYear: "2025-2026", term: "1st Semester", program: "BSIT" });

  useEffect(() => {
    const s = getSession();
    if (!s || s.role !== "admin") return;
    setBatches(JSON.parse(localStorage.getItem("practicum_batches") || "[]"));
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;
    const batch: Batch = { id: Date.now().toString(), name: form.name, academicYear: form.academicYear, term: form.term, program: form.program, createdAt: new Date().toISOString() };
    const updated = [...batches, batch];
    setBatches(updated);
    localStorage.setItem("practicum_batches", JSON.stringify(updated));
    setShowModal(false);
    setForm({ name: "", academicYear: "2025-2026", term: "1st Semester", program: "BSIT" });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this batch?")) return;
    const updated = batches.filter(b => b.id !== id);
    setBatches(updated);
    localStorage.setItem("practicum_batches", JSON.stringify(updated));
  };

  return (
    <AdminLayout activeNav="batches">
      <div className="max-w-[1600px] mx-auto space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Batches & Academic Terms</h3>
            <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Add Batch
            </button>
          </div>
          {batches.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">No batches created yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800">
                    <th className="text-left py-3 px-6 text-xs font-semibold text-slate-500 uppercase">Batch Name</th>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-slate-500 uppercase">Academic Year</th>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-slate-500 uppercase">Term</th>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-slate-500 uppercase">Program</th>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {batches.map(batch => (
                    <tr key={batch.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-6 text-sm font-medium text-slate-800 dark:text-slate-200">{batch.name}</td>
                      <td className="py-3 px-6 text-sm text-slate-500">{batch.academicYear}</td>
                      <td className="py-3 px-6 text-sm text-slate-500">{batch.term}</td>
                      <td className="py-3 px-6 text-sm text-slate-500">{batch.program}</td>
                      <td className="py-3 px-6"><button onClick={() => handleDelete(batch.id)} className="text-sm font-semibold text-red-600 dark:text-red-400 hover:underline">Delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Add Batch</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <input type="text" placeholder="Batch Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              <select value={form.academicYear} onChange={e => setForm({ ...form, academicYear: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-sm outline-none">
                <option>2025-2026</option><option>2026-2027</option><option>2027-2028</option>
              </select>
              <select value={form.term} onChange={e => setForm({ ...form, term: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-sm outline-none">
                <option>1st Semester</option><option>2nd Semester</option><option>Summer</option>
              </select>
              <select value={form.program} onChange={e => setForm({ ...form, program: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-sm outline-none">
                <option>BSIT</option><option>BSCS</option><option>BSIS</option><option>BSEMC</option>
              </select>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

```

---

## Templates Management

Provides a repository of document templates (e.g., Weekly Reports, Final Reports) that students use for their submissions.

**File:** `src/app/admin/templates/page.tsx`
```tsx
"use client";

import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";

export default function AdminTemplates() {
  const [editorContent, setEditorContent] = useState("");
  const [expandedBoxes, setExpandedBoxes] = useState<Record<string, boolean>>({ dtr: false, moa: false, evaluation: false });

  const toggleBox = (box: string) => setExpandedBoxes(prev => ({ ...prev, [box]: !prev[box] }));

  const templates = [
    { key: "dtr", label: "DTR Template", badge: "DTR", badgeColor: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", desc: "Template for student daily attendance logging", content: "DAILY TIME RECORD\n\nStudent: Student Name\nDate: Date\n\nTime In: Time In AM\nTime Out: Time Out PM\nTotal Hours: Total Hours\n\nSignature: Signature\n\nNotes: " },
    { key: "moa", label: "MOA Template", badge: "MOA", badgeColor: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", desc: "Partnership agreement template with companies", content: "MEMORANDUM OF AGREEMENT\n\nThis Memorandum of Agreement is made and entered into between Company located at Address and Student of School for the purpose of Practicum Duration.\n\nThe Company agrees to provide training and supervision to the Student during the practicum period of Duration.\n\nThe Company shall evaluate the Student's performance and submit an Evaluation Form to the school monthly.\n\nThe Student agrees to follow all company rules, complete the required hours, and submit daily logs throughout the practicum.\n\nThis agreement shall remain in effect for a period of Duration beginning from Date.\n\nThis Memorandum of Agreement is signed by Company and Student on Date." },
    { key: "evaluation", label: "Evaluation Template", badge: "Evaluation", badgeColor: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400", desc: "Performance evaluation template for interns", content: "STUDENT EVALUATION FORM\n\nStudent Name: Student Name\nCompany: Company\nEvaluation Period: Date\n\nRating Scale: 1-5\n\nPerformance Areas:\n1. Technical Skills: Skills\n2. Communication: Performance\n3. Work Ethic: Performance\n4. Teamwork: Performance\n5. Initiative: Performance\n\nOverall Rating: Overall Rating\n\nComments: Comments\n\nEvaluator: Evaluator\n\nSignature: Signature" },
  ];

  return (
    <AdminLayout activeNav="templates">
      <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row gap-6 md:gap-8 items-start">
        {/* Editor */}
        <div className="flex-1 w-full">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4">Template Editor</h3>
            <div className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-sm whitespace-pre-wrap min-h-[300px] text-slate-800 dark:text-slate-200">
              {editorContent || <span className="text-slate-400">Click "Load Template" on the right side to load a template.</span>}
            </div>
          </div>
        </div>

        {/* Right sidebar - template cards */}
        <div className="w-full lg:w-80 flex-shrink-0 space-y-4 lg:sticky lg:top-0">
          {templates.map(t => (
            <div key={t.key} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <button onClick={() => toggleBox(t.key)} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{t.label}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${t.badgeColor}`}>{t.badge}</span>
                </div>
                <svg className={`w-5 h-5 text-slate-400 transition-transform ${expandedBoxes[t.key] ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {expandedBoxes[t.key] && (
                <div className="px-4 pb-4">
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{t.label}</p>
                    <p className="text-xs text-slate-500 mt-1">{t.desc}</p>
                    <button onClick={() => setEditorContent(t.content)} className="mt-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">Load Template</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}

```

---

## System Monitoring

Tracks active sessions, server status, database health, and active workflows in the system.

**File:** `src/app/admin/monitoring/page.tsx`
```tsx
"use client";

import { useState, useEffect } from "react";
import { getSession, getUsers } from "@/lib/auth";
import AdminLayout from "@/components/AdminLayout";

export default function AdminMonitoring() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [studentCount, setStudentCount] = useState(0);
  const [advisorCount, setAdvisorCount] = useState(0);

  useEffect(() => {
    const s = getSession();
    if (!s || s.role !== "admin") return;
    const users = getUsers();
    setStudentCount(users.filter(u => u.role === "student").length);
    setAdvisorCount(users.filter(u => u.role === "advisor").length);
    setSubmissions(JSON.parse(localStorage.getItem("practicum_submissions") || "[]"));
  }, []);

  const statusDist = {
    pending: submissions.filter(s => s.status === "pending").length,
    revision: submissions.filter(s => s.status === "revision").length,
  };
  const activeStudentRate = studentCount > 0 ? Math.round((new Set(submissions.map(s => s.studentName)).size / studentCount) * 100) : 0;

  const alerts = [
    statusDist.pending > 0 ? `${statusDist.pending} submission(s) still waiting for action.` : "No pending submissions in queue.",
    statusDist.revision > 0 ? `${statusDist.revision} submission(s) were returned for revision.` : "No revision backlog detected.",
    activeStudentRate < 100 ? `${100 - activeStudentRate}% of students have not submitted any requirement yet.` : "All students have at least one submission on record.",
  ];

  return (
    <AdminLayout activeNav="monitoring">
      <div className="max-w-[1600px] mx-auto space-y-6">
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            { label: "Total Students", value: studentCount, color: "text-slate-900 dark:text-white" },
            { label: "Total Advisors", value: advisorCount, color: "text-slate-900 dark:text-white" },
            { label: "Pending Submissions", value: statusDist.pending, color: "text-amber-600" },
            { label: "Total Submissions", value: submissions.length, color: "text-slate-900 dark:text-white" },
          ].map(card => (
            <div key={card.label} className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <p className="text-xs font-medium text-slate-500 mb-1">{card.label}</p>
              <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4">System Alerts</h3>
            <div className="space-y-3">
              {alerts.map((alert, i) => (
                <div key={i} className={`p-3 rounded-xl ${i === 0 ? "bg-amber-50 dark:bg-amber-900/10 text-amber-800 dark:text-amber-300" : i === 1 ? "bg-blue-50 dark:bg-blue-900/10 text-blue-800 dark:text-blue-300" : "bg-red-50 dark:bg-red-900/10 text-red-800 dark:text-red-300"}`}>
                  <p className="text-sm">{alert}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {submissions.length === 0 ? (
                <p className="text-sm text-slate-500">No activity yet.</p>
              ) : submissions.slice(0, 5).map((sub: any, i: number) => (
                <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{sub.studentName} submitted {sub.title}</p>
                  <p className="text-xs text-slate-500">{sub.type?.toUpperCase()} · {sub.status}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

```

---

## Reports

Generates system-wide analytics, including submission trends, approval rates, and performance statistics.

**File:** `src/app/admin/reports/page.tsx`
```tsx
"use client";

import { useState, useEffect } from "react";
import { getSession, getUsers } from "@/lib/auth";
import AdminLayout from "@/components/AdminLayout";

export default function AdminReports() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [studentCount, setStudentCount] = useState(0);

  useEffect(() => {
    const s = getSession();
    if (!s || s.role !== "admin") return;
    const users = getUsers();
    setStudentCount(users.filter(u => u.role === "student").length);
    setSubmissions(JSON.parse(localStorage.getItem("practicum_submissions") || "[]"));
  }, []);

  const statusDist = {
    approved: submissions.filter(s => s.status === "approved").length,
    pending: submissions.filter(s => s.status === "pending").length,
    rejected: submissions.filter(s => s.status === "rejected").length,
    revision: submissions.filter(s => s.status === "revision").length,
  };
  const approvalRate = submissions.length > 0 ? Math.round((statusDist.approved / submissions.length) * 100) : 0;
  const activeStudentRate = studentCount > 0 ? Math.round((new Set(submissions.map(s => s.studentName)).size / studentCount) * 100) : 0;
  const avgSubs = studentCount > 0 ? (submissions.length / studentCount).toFixed(1) : "0.0";

  return (
    <AdminLayout activeNav="reports">
      <div className="max-w-[1600px] mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1">Student Compliance</h3>
            <p className="text-xs text-slate-500 mb-4">Students with at least one submission.</p>
            <p className="text-4xl font-bold text-blue-600">{activeStudentRate}%</p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1">Approval Efficiency</h3>
            <p className="text-xs text-slate-500 mb-4">Share of submissions marked approved.</p>
            <p className="text-4xl font-bold text-green-600">{approvalRate}%</p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1">Avg. Volume</h3>
            <p className="text-xs text-slate-500 mb-4">Average submissions per student.</p>
            <p className="text-4xl font-bold text-purple-600">{avgSubs}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4">Performance Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <p className="text-sm text-slate-500 mb-2">Pending Workload</p>
              <p className="text-2xl font-bold text-amber-600">{statusDist.pending + statusDist.revision}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <p className="text-sm text-slate-500 mb-2">Rejected Submissions</p>
              <p className="text-2xl font-bold text-red-600">{statusDist.rejected}</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

```

---

## Access Control

Visualizes the different roles and their respective permissions in the system, along with system security logs.

**File:** `src/app/admin/access-control/page.tsx`
```tsx
"use client";

import AdminLayout from "@/components/AdminLayout";

export default function AdminAccessControl() {
  const roles = [
    { name: "Admin", desc: "Full system access", perms: "All Permissions", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
    { name: "Adviser", desc: "Student management, document review", perms: "View, Edit, Approve", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
    { name: "Student", desc: "Submit documents, view own data", perms: "View, Create", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  ];

  return (
    <AdminLayout activeNav="access-control">
      <div className="max-w-[1600px] mx-auto space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4">Role Management</h3>
          <div className="space-y-3">
            {roles.map(role => (
              <div key={role.name} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{role.name}</p>
                  <p className="text-xs text-slate-500">{role.desc}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${role.color}`}>{role.perms}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4">Security Logs</h3>
          <p className="text-sm text-slate-500">No security events recorded.</p>
        </div>
      </div>
    </AdminLayout>
  );
}

```

---

## Admin Layout Component

The Admin Layout component handles the navigation sidebar and top bar exclusively for the admin module, ensuring consistent design and routing.

**File:** `src/components/AdminLayout.tsx`
```tsx
"use client";

import { useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getSession, logout, User } from "@/lib/auth";
import { useTheme } from "@/lib/ThemeContext";
import Link from "next/link";

const navSections = [
  {
    label: "MAIN",
    items: [
      { label: "Dashboard", href: "/admin/dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    ],
  },
  {
    label: "MANAGEMENT",
    items: [
      { label: "User Management", href: "/admin/users", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
      { label: "Adviser Assignment", href: "/admin/adviser-assignment", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
    ],
  },
  {
    label: "ACADEMIC",
    items: [
      { label: "Practicum Setup", href: "/admin/batches", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
      { label: "Templates", href: "/admin/templates", icon: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z" },
    ],
  },
  {
    label: "REPORTS",
    items: [
      { label: "Reports", href: "/admin/reports", icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
    ],
  },
  {
    label: "SYSTEM",
    items: [
      { label: "System Monitoring", href: "/admin/monitoring", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
      { label: "Access Control", href: "/admin/access-control", icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" },
    ],
  },
];

export default function AdminLayout({ children, activeNav }: { children: ReactNode; activeNav: string }) {
  const router = useRouter();
  const { darkMode, setDarkMode } = useTheme();
  const [session, setSession] = useState<User | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const s = getSession();
    if (!s || s.role !== "admin") { router.push("/login"); return; }
    setSession(s);
  }, [router]);

  if (!session) return null;

  const activeLabel = navSections.flatMap(s => s.items).find(i => i.href.endsWith(activeNav))?.label || "Dashboard";

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-64 flex-shrink-0 hidden md:flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
        <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-tight leading-none text-slate-900 dark:text-white">PRACTICUM</h1>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Admin Panel</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {navSections.map(section => (
            <div key={section.label} className="mb-4">
              <div className="px-3 mb-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{section.label}</div>
              <div className="space-y-1">
                {section.items.map(item => {
                  const key = item.href.split("/").pop() || "";
                  const isActive = activeNav === key;
                  return (
                    <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"}`}>
                      <svg className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-400 dark:text-slate-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} /></svg>
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <button onClick={() => { logout(); router.push("/login"); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center justify-between px-6 lg:px-8 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-10">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">{activeLabel}</h2>
          <div className="flex items-center gap-4">
            {/* Notification Button next to name */}
            <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors relative">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900" />
            </button>

            <div className="relative">
              <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-700 dark:text-purple-300 font-bold text-sm">{session.name.charAt(0)}</div>
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">{session.name}</div>
                  <div className="text-xs text-slate-500 leading-tight">Admin</div>
                </div>
              </button>
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-2 z-50">
                  {/* Profile above darkmode */}
                  <Link href="/profile" onClick={() => setShowUserMenu(false)} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    <span>Profile Settings</span>
                  </Link>
                  <button onClick={() => setDarkMode(!darkMode)} className="w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <span className="text-slate-700 dark:text-slate-200">Dark Mode</span>
                    <div className={`w-8 h-4 rounded-full relative transition-colors ${darkMode ? "bg-blue-500" : "bg-slate-300"}`}><div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${darkMode ? "left-4" : "left-0.5"}`} /></div>
                  </button>
                  <div className="border-t border-slate-200 dark:border-slate-700 my-2" />
                  <button onClick={() => { logout(); router.push("/login"); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">Logout</button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50 dark:bg-slate-950">
          {children}
        </main>
      </div>
    </div>
  );
}

```
