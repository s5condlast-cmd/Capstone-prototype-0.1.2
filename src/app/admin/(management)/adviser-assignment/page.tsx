"use client"

import { useState, useEffect } from "react"
import { getSession, getUsers, User } from "@/lib/auth"
import AdminLayout from "@/components/AdminLayout"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "sonner"
import { Search, Users, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface StudentAdviser { studentId: string; adviserId: string; }

export default function AdminAdviserAssignment() {
  const [users, setUsers] = useState<User[]>([])
  const [assignments, setAssignments] = useState<StudentAdviser[]>([])
  const [pendingAssignments, setPendingAssignments] = useState<Record<string, string>>({})
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const s = getSession()
    if (!s || s.role !== "admin") return
    setUsers(getUsers())
    setAssignments(JSON.parse(localStorage.getItem("practicum_adviser_assignments") || "[]"))
  }, [])

  const students = users.filter(u => u.role === "student")
  const advisors = users.filter(u => u.role === "advisor")

  const handleAssign = (studentId: string, studentName: string) => {
    const adviserId = pendingAssignments[studentId]
    if (!adviserId) return
    const adviserName = advisors.find(a => a.id === adviserId)?.name
    const existing = assignments.find(a => a.studentId === studentId)
    let updated: StudentAdviser[]
    if (existing) {
      updated = assignments.map(a => a.studentId === studentId ? { ...a, adviserId } : a)
    } else {
      updated = [...assignments, { studentId, adviserId }]
    }
    setAssignments(updated)
    localStorage.setItem("practicum_adviser_assignments", JSON.stringify(updated))
    setPendingAssignments(prev => { const next = { ...prev }; delete next[studentId]; return next })
    toast.success(`${studentName} assigned to ${adviserName}`)
  }

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.studentId.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const assignedCount = assignments.length
  const remainingCount = students.length - assignedCount
  const progress = students.length > 0 ? Math.round((assignedCount / students.length) * 100) : 0

  return (
    <AdminLayout activeNav="adviser-assignment">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-[28px] font-bold tracking-tight">Adviser Assignments</h1>
            <p className="text-[13px] text-[hsl(var(--muted-foreground))] mt-1">Pair students with their academic supervisors.</p>
          </div>
          <div className="flex items-center gap-4 px-4 py-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
            <div className="text-center">
              <div className="text-[18px] font-bold tabular-nums">{assignedCount}/{students.length}</div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Assigned</div>
            </div>
            <div className="h-8 w-px bg-[hsl(var(--border))]" />
            <div className="text-center">
              <div className="text-[18px] font-bold tabular-nums text-sti-blue">{remainingCount}</div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Remaining</div>
            </div>
            <div className="h-8 w-px bg-[hsl(var(--border))]" />
            <div className="w-24">
              <div className="text-[11px] font-semibold text-right mb-1.5 text-[hsl(var(--muted-foreground))]">{progress}%</div>
              <div className="h-1.5 w-full bg-[hsl(var(--muted))] rounded-full overflow-hidden">
                <div className="h-full bg-[hsl(var(--foreground))] rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
          <input 
            placeholder="Search students..." 
            className="w-full h-9 pl-10 pr-4 rounded-lg bg-[hsl(var(--muted))] text-[13px] font-medium placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--foreground))]/10 transition-all"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Assignment Table */}
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))] h-11 pl-5">Student</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))] h-11">Current Adviser</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))] h-11">Assign Adviser</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-[hsl(var(--muted-foreground))] text-[13px]">
                    No students found.
                  </TableCell>
                </TableRow>
              ) : filteredStudents.map(student => {
                const assignment = assignments.find(a => a.studentId === student.studentId)
                const adviser = assignment ? advisors.find(a => a.id === assignment.adviserId) : null
                const selectedId = pendingAssignments[student.studentId] !== undefined ? pendingAssignments[student.studentId] : (assignment?.adviserId || "")
                const isModified = pendingAssignments[student.studentId] !== undefined && pendingAssignments[student.studentId] !== (assignment?.adviserId || "")
                
                return (
                  <TableRow key={student.id} className="group hover:bg-[hsl(var(--muted))]/50 transition-colors">
                    <TableCell className="pl-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 rounded-lg">
                          <AvatarFallback className="bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] font-bold text-[11px] rounded-lg">
                            {student.name?.charAt(0) || "S"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <span className="text-[13px] font-semibold block">{student.name}</span>
                          <span className="text-[11px] text-[hsl(var(--muted-foreground))]">{student.studentId}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {adviser ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-[hsl(var(--foreground))]" />
                          <span className="text-[13px] font-medium">{adviser.name}</span>
                        </div>
                      ) : (
                        <span className="text-[12px] font-medium text-[hsl(var(--muted-foreground))] italic">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <select 
                        value={selectedId} 
                        onChange={e => setPendingAssignments(prev => ({ ...prev, [student.studentId]: e.target.value }))} 
                        className="h-9 w-[220px] rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--foreground))]/10"
                      >
                        <option value="">Select adviser...</option>
                        {advisors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                      </select>
                    </TableCell>
                    <TableCell>
                      <button 
                        disabled={!isModified}
                        onClick={() => handleAssign(student.studentId, student.name)}
                        className={cn(
                          "h-8 px-4 rounded-lg text-[12px] font-semibold transition-all",
                          isModified 
                            ? "bg-[hsl(var(--foreground))] text-[hsl(var(--background))] hover:opacity-90" 
                            : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] cursor-not-allowed"
                        )}
                      >
                        Save
                      </button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  )
}
