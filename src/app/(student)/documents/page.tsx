"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Filter, Eye, FileSearch } from "lucide-react";
import { Input } from "@/components/ui/input";
import { getSession } from "@/lib/auth";
import { toast } from "sonner";

interface Submission {
  id: string;
  type: string;
  title: string;
  studentId?: string;
  status: string;
  submittedAt: string;
  fileName?: string;
}

export default function DocumentsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [userSearch, setUserSearch] = useState("");

  useEffect(() => {
    const s = getSession();
    if (!s) return;
    const rawSubs: Submission[] = JSON.parse(localStorage.getItem("practicum_submissions") || "[]");
    setSubmissions(rawSubs.filter((sub) => sub.studentId === s.studentId));
  }, []);

  const filtered = submissions.filter(
    (s) =>
      s.title.toLowerCase().includes(userSearch.toLowerCase()) ||
      s.type.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full gap-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">File Management</h2>
          <p className="text-slate-500 text-base font-medium">Review and track your submitted practicum documentation.</p>
        </div>
      </div>

      <Card className="border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-900">
        <CardHeader className="bg-slate-50/60 dark:bg-slate-900/50 pb-8 px-8 border-b border-slate-100 dark:border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Filter by filename or type..."
                className="pl-10 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl shadow-sm h-11 font-medium"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              onClick={() => toast.info("Advanced filter is not available yet.")}
              className="h-11 px-4 font-semibold text-[11px] uppercase tracking-widest border-slate-200"
            >
              <Filter className="mr-2 h-4 w-4" /> Advanced Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table className="w-full table-fixed min-w-[900px] border-collapse">
            <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
              <TableRow>
                <TableHead className="w-[45%] text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 pl-8 h-12">Document Information</TableHead>
                <TableHead className="w-[15%] text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 h-12">Category</TableHead>
                <TableHead className="w-[15%] text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 h-12">Submission Date</TableHead>
                <TableHead className="w-[15%] text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 h-12">Approval Status</TableHead>
                <TableHead className="w-[10%] text-right text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 pr-8 h-12">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-40 text-center text-slate-400 italic">
                    No documents found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((doc) => (
                  <TableRow key={doc.id} className="group hover:bg-blue-50/30 dark:hover:bg-blue-500/5 transition-colors border-b border-slate-100 dark:border-slate-800/50 last:border-0">
                    <TableCell className="py-5 pl-8">
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 transition-colors shrink-0">
                          <FileSearch className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col justify-center gap-1 overflow-hidden">
                          <span className="font-semibold text-sm text-slate-900 dark:text-white leading-none tracking-tight">{doc.title}</span>
                          <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider opacity-80">{doc.fileName || "No attachment"}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-5 text-center">
                      <Badge variant="outline" className="font-semibold text-[9px] uppercase tracking-widest border-slate-200 dark:border-slate-800 px-2 py-0 h-5 bg-white dark:bg-slate-900">
                        {doc.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-5 text-center text-[11px] font-semibold text-slate-500">
                      {new Date(doc.submittedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="py-5 text-center">
                      <div className="flex justify-center">
                        <Badge
                          variant={doc.status === "approved" ? "default" : doc.status === "rejected" ? "destructive" : "secondary"}
                          className="text-[10px] font-semibold uppercase h-6 px-3"
                        >
                          {doc.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="py-5 text-right pr-8">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toast.info(doc.fileName ? `Preview unavailable for ${doc.fileName}` : "No attachment available for preview.")}
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-all rounded-full hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 shadow-sm"
                      >
                        <Eye className="h-4 w-4 text-slate-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
