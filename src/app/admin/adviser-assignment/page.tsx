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
