"use client";

import { useState, useRef } from "react";
import { getSession } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, UploadCloud, FileCheck, Download, CheckCircle2, Lock, Send } from "lucide-react";
import { toast } from "sonner";

export default function MOAPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    toast.success("File selected", { description: file.name });
    const reader = new FileReader();
    reader.onload = (ev) => setUploadedFile(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!uploadedFile) return;
    const s = getSession();
    if (!s) { toast.error("Session expired"); return; }
    const entry = {
      id: Date.now().toString(),
      type: "moa",
      studentId: s.studentId,
      title: `MOA Submission - ${fileName}`,
      fileName,
      status: "pending",
      submittedAt: new Date().toISOString(),
    };
    const prev = JSON.parse(localStorage.getItem("practicum_submissions") || "[]");
    localStorage.setItem("practicum_submissions", JSON.stringify([entry, ...prev]));
    toast.success("MOA Submitted", { description: "Your agreement has been sent for legal review." });
    setUploadedFile(null);
    setFileName("");
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[13px] text-[hsl(var(--muted-foreground))]">Practicum</p>
          <h1 className="text-[28px] font-bold tracking-tight mt-1">Memorandum of Agreement</h1>
        </div>
        <Badge variant="outline" className="text-[10px] font-semibold uppercase tracking-[0.18em] px-3 py-1.5 self-start sm:self-auto border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]">
          Legal Document
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        {/* Upload Card */}
        <Card className="border border-[hsl(var(--border))] shadow-sm bg-[hsl(var(--card))] overflow-hidden">
          <CardHeader className="border-b border-[hsl(var(--border))]">
            <div className="flex items-center gap-4">
              <div className="h-9 w-9 rounded-lg bg-[hsl(var(--muted))] flex items-center justify-center">
                <Briefcase className="h-[18px] w-[18px] text-[hsl(var(--muted-foreground))]" />
              </div>
              <div>
                <CardTitle className="text-[15px]">Agreement Upload</CardTitle>
                <CardDescription className="text-[13px]">Uploading is required</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Drop Zone */}
            <div className="group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" />
              <div className={`rounded-xl border-2 border-dashed py-16 flex flex-col items-center justify-center gap-4 transition-all duration-200 ${
                fileName
                  ? "bg-[hsl(var(--muted))] border-[hsl(var(--foreground))]/30"
                  : "bg-[hsl(var(--muted))]/50 border-[hsl(var(--border))] group-hover:border-[hsl(var(--foreground))]/30 group-hover:bg-[hsl(var(--muted))]"
              }`}>
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110 ${
                  fileName ? "bg-[hsl(var(--foreground))]" : "bg-[hsl(var(--card))]"
                }`}>
                  {fileName
                    ? <FileCheck className="h-6 w-6 text-[hsl(var(--background))]" />
                    : <UploadCloud className="h-6 w-6 text-[hsl(var(--muted-foreground))]" />}
                </div>
                <div className="text-center px-4">
                  <p className="text-[14px] font-semibold">{fileName || "Click to upload MOA"}</p>
                  <p className="text-[12px] text-[hsl(var(--muted-foreground))] mt-1">PDF format required — max 15 MB</p>
                </div>
                {fileName && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setFileName(""); setUploadedFile(null); }}
                    className="text-[11px] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] font-semibold underline"
                  >
                    Remove file
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[hsl(var(--border))]">
              <div className="flex items-center gap-2 text-[hsl(var(--muted-foreground))]">
                <Lock className="h-4 w-4 shrink-0" />
                <span className="text-[12px]">Your document is encrypted and securely stored.</span>
              </div>
              <Button
                onClick={handleSubmit}
                disabled={!uploadedFile}
                className="h-10 px-7 bg-[hsl(var(--foreground))] hover:opacity-90 text-[hsl(var(--background))] font-semibold text-[12px] uppercase tracking-widest rounded-lg disabled:opacity-40"
              >
                <Send className="mr-2 h-4 w-4" />
                Submit
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="flex flex-col gap-6">
          <Card className="border border-[hsl(var(--border))] shadow-sm bg-[hsl(var(--card))]">
            <CardHeader>
              <CardTitle className="text-[15px]">MOA Template</CardTitle>
              <CardDescription className="text-[13px]">Download the current year version.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-[12px] text-[hsl(var(--muted-foreground))] leading-relaxed italic">
                Download the current year version. Ensure you use the current year version of the MOA before having it signed. 
              </p>
              <p className="text-[12px] text-amber-600 dark:text-amber-400 font-medium italic">
                * This is a sample only, not the real one. It will be replaced once the advisor provides the official copy.
              </p>
              <Button
                variant="outline"
                onClick={() => toast.success("Template ready", { description: "MOA_Template_SAMPLE.pdf downloaded." })}
                className="w-full h-10 rounded-lg font-semibold text-[12px] uppercase tracking-widest border-[hsl(var(--border))]"
              >
                <Download className="mr-2 h-4 w-4" />
                MOA_Template_SAMPLE.pdf
              </Button>
            </CardContent>
          </Card>

          <Card className="border border-[hsl(var(--border))] shadow-sm bg-[hsl(var(--card))]">
            <CardHeader>
              <CardTitle className="text-[15px]">Requirements</CardTitle>
              <CardDescription className="text-[13px]">Before you submit.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
              {["Signed by Supervisor.", "Signed by Student.", "Signed by Practicum Coordinator.", "Authenticated company stamp."].map((g, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border border-transparent px-3 py-2.5 hover:border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] transition-all">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-[hsl(var(--muted-foreground))] shrink-0" />
                    <span className="text-[13px] font-semibold">{g}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
