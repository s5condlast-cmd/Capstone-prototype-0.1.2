"use client"

import { useState, useEffect } from "react"
import { getSession, getUsers, createUser, deleteUser, User, UserRole } from "@/lib/auth"
import AdminLayout from "@/components/AdminLayout"
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Trash2,
  Filter,
  Download,
  UserPlus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "sonner"

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [showModal, setShowModal] = useState(false)
  const [userSearch, setUserSearch] = useState("")
  const [formData, setFormData] = useState({ studentId: "", name: "", email: "", password: "", role: "student" as UserRole })

  useEffect(() => {
    const s = getSession()
    if (!s || s.role !== "admin") return
    setUsers(getUsers())
  }, [])

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.studentId || !formData.name || !formData.email || !formData.password) {
      toast.error("Please complete all fields")
      return
    }
    const newUser = createUser(formData)
    if (!newUser) {
      toast.error("User ID already exists")
      return
    }
    setUsers(getUsers())
    setShowModal(false)
    toast.success("User account created successfully")
    setFormData({ studentId: "", name: "", email: "", password: "", role: "student" })
  }

  const handleDelete = (id: string) => {
    deleteUser(id)
    setUsers(getUsers())
    toast.success("User removed")
  }

  const filtered = users.filter(u => 
    u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.studentId.toLowerCase().includes(userSearch.toLowerCase())
  )

  const roleBadgeClass = (role: string) => {
    switch(role) {
      case "admin": return "bg-[hsl(var(--foreground))] text-[hsl(var(--background))]"
      case "advisor": return "bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]"
      default: return "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
    }
  }

  const UserTable = ({ data }: { data: User[] }) => (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))] h-11 pl-5">User</TableHead>
            <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))] h-11 text-center">Email</TableHead>
            <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))] h-11 text-center">Role</TableHead>
            <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))] h-11">Status</TableHead>
            <TableHead className="w-[60px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-32 text-center text-[hsl(var(--muted-foreground))] text-[13px]">
                No users found.
              </TableCell>
            </TableRow>
          ) : data.map(user => (
            <TableRow key={user.id} className="group hover:bg-[hsl(var(--muted))]/50 transition-colors">
              <TableCell className="pl-5 py-3.5">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarFallback className="bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] font-bold text-[11px] rounded-lg">
                      {user.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <span className="text-[13px] font-semibold block">{user.name}</span>
                    <span className="text-[11px] text-[hsl(var(--muted-foreground))]">{user.studentId}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <span className="text-[13px] text-[hsl(var(--muted-foreground))]">{user.email}</span>
              </TableCell>
              <TableCell className="text-center">
                <span className={`inline-flex px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${roleBadgeClass(user.role)}`}>
                  {user.role}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-sti-blue" />
                  <span className="text-[12px] font-medium text-[hsl(var(--muted-foreground))]">Active</span>
                </div>
              </TableCell>
              <TableCell className="text-right pr-4">
                <DropdownMenu>
                    <DropdownMenuTrigger className="h-8 w-8 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-[hsl(var(--muted))] transition-all">
                      <MoreHorizontal className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem className="text-[13px] cursor-pointer text-[hsl(var(--destructive))]" onClick={() => handleDelete(user.id)}>
                      <Trash2 className="mr-2 h-4 w-4" /> Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )

  return (
    <AdminLayout activeNav="users">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-[28px] font-bold tracking-tight">Users</h1>
            <p className="text-[13px] text-[hsl(var(--muted-foreground))] mt-1">Manage all system accounts and permissions.</p>
          </div>
          <div className="flex items-center gap-3">

            <Dialog open={showModal} onOpenChange={setShowModal}>
              <DialogTrigger className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-[hsl(var(--foreground))] text-[hsl(var(--background))] text-[13px] font-semibold hover:opacity-90 transition-opacity">
                  <UserPlus className="h-4 w-4" /> Add User
              </DialogTrigger>
              <DialogContent className="sm:max-w-[440px]">
                <DialogHeader>
                  <DialogTitle className="text-[18px] font-bold">Create New User</DialogTitle>
                  <DialogDescription className="text-[13px] text-[hsl(var(--muted-foreground))]">Fill in the details to add a new account.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreate} className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-[12px] font-semibold text-[hsl(var(--muted-foreground))]">Full Name</label>
                    <input placeholder="e.g. Juan dela Cruz" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full h-10 px-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[13px] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--foreground))]/10" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[12px] font-semibold text-[hsl(var(--muted-foreground))]">ID Number</label>
                    <input placeholder="e.g. 02000012345" value={formData.studentId} onChange={e => setFormData({...formData, studentId: e.target.value})} className="w-full h-10 px-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[13px] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--foreground))]/10" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[12px] font-semibold text-[hsl(var(--muted-foreground))]">Email</label>
                    <input type="email" placeholder="email@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full h-10 px-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[13px] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--foreground))]/10" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[12px] font-semibold text-[hsl(var(--muted-foreground))]">Role</label>
                    <select className="w-full h-10 px-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[13px] focus:outline-none" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as UserRole})}>
                      <option value="student">Student</option>
                      <option value="advisor">Adviser</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[12px] font-semibold text-[hsl(var(--muted-foreground))]">Password</label>
                    <input type="password" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full h-10 px-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[13px] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--foreground))]/10" />
                  </div>
                  <DialogFooter className="pt-4">
                    <button type="button" onClick={() => setShowModal(false)} className="h-10 px-4 rounded-lg text-[13px] font-medium text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] transition-colors">Cancel</button>
                    <button type="submit" className="h-10 px-6 rounded-lg bg-[hsl(var(--foreground))] text-[hsl(var(--background))] text-[13px] font-semibold hover:opacity-90 transition-opacity">Create User</button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
            <input 
              placeholder="Search by name, ID, or email..." 
              className="w-full h-9 pl-10 pr-4 rounded-lg bg-[hsl(var(--muted))] text-[13px] font-medium placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--foreground))]/10 transition-all"
              value={userSearch}
              onChange={e => setUserSearch(e.target.value)}
            />
          </div>
          <button className="text-clickable text-[12px] font-semibold flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5" /> Filters
          </button>
        </div>

        {/* Tabs + Table */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="bg-transparent h-10 p-0 gap-1 border-b border-[hsl(var(--border))] w-full justify-start rounded-none">
            {[
              { value: "all", label: `All (${filtered.length})` },
              { value: "student", label: `Students (${filtered.filter(u => u.role === "student").length})` },
              { value: "advisor", label: `Advisers (${filtered.filter(u => u.role === "advisor").length})` },
              { value: "admin", label: `Admins (${filtered.filter(u => u.role === "admin").length})` },
            ].map(tab => (
              <TabsTrigger 
                key={tab.value} 
                value={tab.value} 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[hsl(var(--foreground))] data-[state=active]:bg-transparent bg-transparent text-[hsl(var(--muted-foreground))] data-[state=active]:text-[hsl(var(--foreground))] px-4 h-10 text-[13px] font-medium transition-colors"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="mt-5">
            <TabsContent value="all" className="m-0"><UserTable data={filtered} /></TabsContent>
            <TabsContent value="student" className="m-0"><UserTable data={filtered.filter(u => u.role === "student")} /></TabsContent>
            <TabsContent value="advisor" className="m-0"><UserTable data={filtered.filter(u => u.role === "advisor")} /></TabsContent>
            <TabsContent value="admin" className="m-0"><UserTable data={filtered.filter(u => u.role === "admin")} /></TabsContent>
          </div>
        </Tabs>
      </div>
    </AdminLayout>
  )
}
