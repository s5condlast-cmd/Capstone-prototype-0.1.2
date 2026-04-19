"use client"

import { useState, useEffect } from "react"
import { getSession } from "@/lib/auth"
import AdminLayout from "@/components/AdminLayout"
import { 
  Plus, 
  Calendar, 
  BookOpen, 
  Users, 
  MoreVertical, 
  Trash2,
  Settings,
  Grid
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
    toast.success(`Batch ${form.name} initialized.`)
    setForm({ name: "", academicYear: "2025-2026", term: "1st Semester", program: "BSIT" })
  }

  const handleDelete = (id: string) => {
    const updated = batches.filter(b => b.id !== id)
    setBatches(updated)
    localStorage.setItem("practicum_batches", JSON.stringify(updated))
    toast.success("Batch archived.")
  }

  return (
    <AdminLayout activeNav="batches">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Academic Batches</h2>
            <p className="text-slate-500 mt-1 text-lg">Manage practicum cohorts and enrollment periods.</p>
          </div>
          <Dialog open={showModal} onOpenChange={setShowModal}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20">
                <Plus className="mr-2 h-4 w-4" /> Initialize Batch
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Setup New Batch</DialogTitle>
                <DialogDescription>Define the academic parameters for this cohort.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate} className="grid gap-6 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Batch Alias</label>
                  <Input 
                    placeholder="e.g. BSIT Block 2026" 
                    value={form.name} 
                    onChange={e => setForm({...form, name: e.target.value})} 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Academic Year</label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950"
                      value={form.academicYear}
                      onChange={e => setForm({...form, academicYear: e.target.value})}
                    >
                      <option>2025-2026</option>
                      <option>2026-2027</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Semester</label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950"
                      value={form.term}
                      onChange={e => setForm({...form, term: e.target.value})}
                    >
                      <option>1st Semester</option>
                      <option>2nd Semester</option>
                      <option>Summer</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Degree Program</label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950"
                    value={form.program}
                    onChange={e => setForm({...form, program: e.target.value})}
                  >
                    <option>BSIT</option>
                    <option>BSCS</option>
                    <option>BSIS</option>
                  </select>
                </div>
                <DialogFooter className="pt-4 border-t">
                  <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 w-full">Initialize</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {batches.length === 0 ? (
            <div className="col-span-full h-64 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-400 gap-2">
              <Grid className="h-10 w-10 opacity-20" />
              <p>No academic batches have been initialized yet.</p>
            </div>
          ) : batches.map((batch) => (
            <Card key={batch.id} className="group relative overflow-hidden border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 transition-all hover:ring-indigo-500/50">
              <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 font-bold">
                    {batch.program}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" /> Configure
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600 dark:text-red-400 cursor-pointer"
                        onClick={() => handleDelete(batch.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Archive
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardTitle className="mt-4 text-xl">{batch.name}</CardTitle>
                <CardDescription>{batch.academicYear} • {batch.term}</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span className="text-xs text-slate-500 font-medium">Started Jan 2026</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-slate-400" />
                    <span className="text-xs text-slate-500 font-medium">42 Students</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-slate-400" />
                    <span className="text-xs text-slate-500 font-medium">12 Documents</span>
                  </div>
                </div>
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Term Completion</span>
                    <span className="text-[10px] font-bold text-indigo-600">65%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full w-[65%] bg-indigo-500 rounded-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}
