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
