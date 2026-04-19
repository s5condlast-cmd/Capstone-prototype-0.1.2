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
