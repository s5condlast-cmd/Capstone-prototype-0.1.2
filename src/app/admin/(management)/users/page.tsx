"use client"

import { useState, useEffect } from "react"
import { getSession, getUsers, createUser, deleteUser, User, UserRole } from "@/lib/auth"
import AdminLayout from "@/components/AdminLayout"
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  UserPlus, 
  Mail, 
  Shield, 
  Trash2,
  Filter,
  Download
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
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

  const UserTable = ({ data }: { data: User[] }) => (
    <Table>
      <TableHeader>
        <TableRow className="bg-slate-50/50 dark:bg-slate-900/50">
          <TableHead className="w-[80px]">User</TableHead>
          <TableHead>Account Details</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="h-32 text-center text-slate-500">
              No accounts found in this category.
            </TableCell>
          </TableRow>
        ) : data.map(user => (
          <TableRow key={user.id} className="group transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
            <TableCell>
              <Avatar className="h-9 w-9 ring-2 ring-white dark:ring-slate-900">
                <AvatarFallback className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 font-bold text-xs">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </TableCell>
            <TableCell>
              <div className="flex flex-col">
                <span className="font-semibold text-sm">{user.name}</span>
                <span className="text-xs text-slate-500">{user.email} • {user.studentId}</span>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline" className="font-medium capitalize border-slate-200 dark:border-slate-800">
                {user.role}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Active</span>
              </div>
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer">
                    <Mail className="mr-2 h-4 w-4" /> Send Email
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <Shield className="mr-2 h-4 w-4" /> Edit Role
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-red-600 dark:text-red-400 cursor-pointer"
                    onClick={() => handleDelete(user.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )

  return (
    <AdminLayout activeNav="users">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">User Directory</h2>
            <p className="text-slate-500 mt-1 text-lg">Central management for all system participants.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="hidden sm:flex">
              <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
            <Dialog open={showModal} onOpenChange={setShowModal}>
              <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 dark:shadow-none">
                  <UserPlus className="mr-2 h-4 w-4" /> Add Member
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add New Member</DialogTitle>
                  <DialogDescription>
                    Manually create an account for a student, adviser, or administrator.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreate} className="grid gap-6 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label className="text-right text-sm font-medium">Full Name</label>
                    <Input 
                      className="col-span-3" 
                      placeholder="e.g. Michael Scott" 
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})} 
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label className="text-right text-sm font-medium">ID Number</label>
                    <Input 
                      className="col-span-3" 
                      placeholder="e.g. 2024-0001" 
                      value={formData.studentId} 
                      onChange={e => setFormData({...formData, studentId: e.target.value})} 
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label className="text-right text-sm font-medium">Email</label>
                    <Input 
                      className="col-span-3" 
                      type="email" 
                      placeholder="email@university.edu" 
                      value={formData.email} 
                      onChange={e => setFormData({...formData, email: e.target.value})} 
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label className="text-right text-sm font-medium">Role</label>
                    <select 
                      className="col-span-3 flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950"
                      value={formData.role}
                      onChange={e => setFormData({...formData, role: e.target.value as UserRole})}
                    >
                      <option value="student">Student</option>
                      <option value="advisor">Adviser</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label className="text-right text-sm font-medium">Password</label>
                    <Input 
                      className="col-span-3" 
                      type="password" 
                      placeholder="Temporary password" 
                      value={formData.password} 
                      onChange={e => setFormData({...formData, password: e.target.value})} 
                    />
                  </div>
                  <DialogFooter className="pt-4 border-t">
                    <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                    <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">Create Account</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card className="border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden">
          <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 pb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Search by name, email, or ID..." 
                  className="pl-10 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-lg shadow-sm"
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-10 border-dashed">
                  <Filter className="mr-2 h-4 w-4" /> Filter
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs defaultValue="all" className="w-full">
              <div className="px-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <TabsList className="bg-transparent h-12 p-0 gap-8">
                  <TabsTrigger value="all" className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent shadow-none px-1 h-full font-semibold">All Members</TabsTrigger>
                  <TabsTrigger value="student" className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent shadow-none px-1 h-full font-semibold">Students</TabsTrigger>
                  <TabsTrigger value="advisor" className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent shadow-none px-1 h-full font-semibold">Advisers</TabsTrigger>
                  <TabsTrigger value="admin" className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent shadow-none px-1 h-full font-semibold">Admins</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="all" className="m-0">
                <UserTable data={filtered} />
              </TabsContent>
              <TabsContent value="student" className="m-0">
                <UserTable data={filtered.filter(u => u.role === "student")} />
              </TabsContent>
              <TabsContent value="advisor" className="m-0">
                <UserTable data={filtered.filter(u => u.role === "advisor")} />
              </TabsContent>
              <TabsContent value="admin" className="m-0">
                <UserTable data={filtered.filter(u => u.role === "admin")} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
