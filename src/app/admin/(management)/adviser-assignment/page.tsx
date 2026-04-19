"use client"

import { useState, useEffect } from "react"
import { getSession, getUsers, User } from "@/lib/auth"
import AdminLayout from "@/components/AdminLayout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "sonner"
import { 
  UserPlus, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Search,
  Users
} from "lucide-react"
import { Input } from "@/components/ui/input"
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
    
    setPendingAssignments(prev => {
      const next = { ...prev }
      delete next[studentId]
      return next
    })

    toast.success(`Success`, {
      description: `${studentName} is now paired with ${adviserName}`
    })
  }

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.studentId.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <AdminLayout activeNav="adviser-assignment">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Adviser Pairing</h2>
            <p className="text-slate-500 mt-1 text-lg">Connect students with their academic supervisors.</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-full border border-indigo-100 dark:border-indigo-800">
            <ShieldCheck className="h-4 w-4 text-indigo-600" />
            <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-widest">Active Pairing Engine</span>
          </div>
        </div>

        <Card className="border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden">
          <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 px-8 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="relative max-w-md w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Filter student list..." 
                  className="pl-10 h-11 bg-white dark:bg-slate-950" 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-bold">{assignments.length} / {students.length}</span>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Paired</span>
                </div>
                <div className="h-10 w-[1px] bg-slate-200 dark:bg-slate-800" />
                <div className="flex flex-col items-end">
                  <span className="text-sm font-bold text-amber-600">{students.length - assignments.length}</span>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Unassigned</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="px-8 py-5">Student Information</TableHead>
                  <TableHead className="py-5">Current Connection</TableHead>
                  <TableHead className="px-8 py-5 text-right">Pairing Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-40 text-center text-slate-500">
                      No matching students found.
                    </TableCell>
                  </TableRow>
                ) : filteredStudents.map(student => {
                  const assignment = assignments.find(a => a.studentId === student.studentId);
                  const adviser = assignment ? advisors.find(a => a.id === assignment.adviserId) : null;
                  const selectedId = pendingAssignments[student.studentId] !== undefined ? pendingAssignments[student.studentId] : (assignment?.adviserId || "");
                  const isModified = pendingAssignments[student.studentId] !== undefined && pendingAssignments[student.studentId] !== (assignment?.adviserId || "");
                  
                  return (
                    <TableRow key={student.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                      <TableCell className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-slate-100 text-slate-600 font-bold text-xs">
                              {student.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-900 dark:text-white">{student.name}</span>
                            <span className="text-xs text-slate-500">{student.studentId} • BSIT</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-5">
                        {adviser ? (
                          <div className="flex items-center gap-2">
                            <div className="p-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                              <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{adviser.name}</span>
                          </div>
                        ) : (
                          <Badge variant="outline" className="text-slate-400 font-normal">Pending Assignment</Badge>
                        )}
                      </TableCell>
                      <TableCell className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <select 
                            value={selectedId} 
                            onChange={e => setPendingAssignments(prev => ({ ...prev, [student.studentId]: e.target.value }))} 
                            className="flex h-10 w-[240px] items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:focus:ring-indigo-400"
                          >
                            <option value="">Select an Academic Adviser...</option>
                            {advisors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                          </select>
                          
                          <Button 
                            size="icon" 
                            disabled={!isModified}
                            onClick={() => handleAssign(student.studentId, student.name)}
                            className={cn(
                              "h-10 w-10 transition-all rounded-lg shadow-sm",
                              isModified ? "bg-indigo-600 hover:bg-indigo-700 scale-110" : "bg-slate-100 text-slate-400 dark:bg-slate-800"
                            )}
                          >
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
