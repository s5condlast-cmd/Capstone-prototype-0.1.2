"use client"

import { useState, useEffect } from "react"
import { getSession } from "@/lib/auth"
import AdminLayout from "@/components/AdminLayout"
import { 
  Plus, 
  Users, 
  MoreVertical, 
  Trash2,
  Settings,
  Grid,
  Calendar,
  GraduationCap
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { toast } from "sonner"

interface Batch { id: string; name: string; academicYear: string; term: string; program: string; createdAt: string; }

export default function AdminBatches() {
  const [batches, setBatches] = useState<Batch[]>([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: "", academicYear: "2025-2026", term: "1st Semester", program: "BSIT" })

  useEffect(() => {
    const s = getSession()
    if (!s || s.role !== "admin") return
    setBatches(JSON.parse(localStorage.getItem("practicum_batches") || "[]"))
  }, [])

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name) return
    const batch: Batch = { id: Date.now().toString(), name: form.name, academicYear: form.academicYear, term: form.term, program: form.program, createdAt: new Date().toISOString() }
    const updated = [...batches, batch]
    setBatches(updated)
    localStorage.setItem("practicum_batches", JSON.stringify(updated))
    setShowModal(false)
    toast.success(`Batch "${form.name}" created successfully`)
    setForm({ name: "", academicYear: "2025-2026", term: "1st Semester", program: "BSIT" })
  }

  const handleDelete = (id: string) => {
    const updated = batches.filter(b => b.id !== id)
    setBatches(updated)
    localStorage.setItem("practicum_batches", JSON.stringify(updated))
    toast.success("Batch archived")
  }

  return (
    <AdminLayout activeNav="batches">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-[28px] font-bold tracking-tight">Batches</h1>
            <p className="text-[13px] text-[hsl(var(--muted-foreground))] mt-1">Manage practicum cohorts and enrollment periods.</p>
          </div>
          <Dialog open={showModal} onOpenChange={setShowModal}>
            <DialogTrigger className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-[hsl(var(--foreground))] text-[hsl(var(--background))] text-[13px] font-semibold hover:opacity-90 transition-opacity">
                <Plus className="h-4 w-4" /> New Batch
            </DialogTrigger>
            <DialogContent className="sm:max-w-[440px]">
              <DialogHeader>
                <DialogTitle className="text-[18px] font-bold">Create New Batch</DialogTitle>
                <DialogDescription className="text-[13px] text-[hsl(var(--muted-foreground))]">Set the parameters for this academic cohort.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-[12px] font-semibold text-[hsl(var(--muted-foreground))]">Batch Name</label>
                  <input 
                    placeholder="e.g. BSIT 2026-A" 
                    value={form.name} 
                    onChange={e => setForm({...form, name: e.target.value})} 
                    className="w-full h-10 px-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[13px] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--foreground))]/10"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[12px] font-semibold text-[hsl(var(--muted-foreground))]">Academic Year</label>
                    <select className="w-full h-10 px-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[13px] focus:outline-none" value={form.academicYear} onChange={e => setForm({...form, academicYear: e.target.value})}>
                      <option>2025-2026</option>
                      <option>2026-2027</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[12px] font-semibold text-[hsl(var(--muted-foreground))]">Term</label>
                    <select className="w-full h-10 px-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[13px] focus:outline-none" value={form.term} onChange={e => setForm({...form, term: e.target.value})}>
                      <option>1st Semester</option>
                      <option>2nd Semester</option>
                      <option>Summer</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[12px] font-semibold text-[hsl(var(--muted-foreground))]">Program</label>
                  <select className="w-full h-10 px-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[13px] focus:outline-none" value={form.program} onChange={e => setForm({...form, program: e.target.value})}>
                    <option>BSIT</option>
                    <option>BSCS</option>
                  </select>
                </div>
                <DialogFooter className="pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="h-10 px-4 rounded-lg text-[13px] font-medium text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] transition-colors">Cancel</button>
                  <button type="submit" className="h-10 px-6 rounded-lg bg-[hsl(var(--foreground))] text-[hsl(var(--background))] text-[13px] font-semibold hover:opacity-90 transition-opacity">Create Batch</button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Batch Cards Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {batches.length === 0 ? (
            <div className="col-span-full py-20 flex flex-col items-center justify-center gap-3 text-[hsl(var(--muted-foreground))] rounded-xl border border-dashed border-[hsl(var(--border))]">
              <Grid className="h-10 w-10 opacity-30" />
              <p className="text-[13px] font-medium">No batches yet</p>
              <p className="text-[12px] opacity-60">Create your first batch to get started</p>
            </div>
          ) : batches.map((batch) => (
            <div key={batch.id} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 hover:shadow-md transition-shadow group">
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex px-2.5 py-0.5 rounded-md bg-[hsl(var(--muted))] text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                  {batch.program}
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger className="h-8 w-8 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-[hsl(var(--muted))] transition-all">
                      <MoreVertical className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem className="text-[13px] cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" /> Configure
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-[13px] cursor-pointer text-[hsl(var(--destructive))]" onClick={() => handleDelete(batch.id)}>
                      <Trash2 className="mr-2 h-4 w-4" /> Archive
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <h3 className="text-[17px] font-bold tracking-tight">{batch.name}</h3>
              <div className="flex items-center gap-2 mt-1.5 text-[12px] text-[hsl(var(--muted-foreground))]">
                <Calendar className="h-3.5 w-3.5" />
                <span>{batch.academicYear} · {batch.term}</span>
              </div>

              <div className="flex items-center gap-4 mt-5 pt-4 border-t border-[hsl(var(--border))]">
                <div className="flex items-center gap-2 text-[12px] text-[hsl(var(--muted-foreground))]">
                  <Users className="h-3.5 w-3.5" />
                  <span className="font-medium">0 Enrolled</span>
                </div>
                <div className="flex items-center gap-2 text-[12px] text-[hsl(var(--muted-foreground))]">
                  <GraduationCap className="h-3.5 w-3.5" />
                  <span className="font-medium">Active</span>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-medium">
                  <span className="text-[hsl(var(--muted-foreground))]">Progress</span>
                  <span>0%</span>
                </div>
                <div className="h-1.5 w-full bg-[hsl(var(--muted))] rounded-full overflow-hidden">
                  <div className="h-full w-0 bg-[hsl(var(--foreground))] rounded-full transition-all duration-700" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}
