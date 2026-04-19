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
