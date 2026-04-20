"use client";

import { useState } from "react";
import { getSession } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileBarChart, UploadCloud, FileCheck, Download, Star, Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function EvaluationPage() {
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
    const entry = {
      id: Date.now().toString(),
      type: "evaluation",
      studentId: s?.studentId || "",
      title: `Evaluation Submission - ${fileName}`,
      fileName,
      status: "pending",
      submittedAt: new Date().toISOString(),
    };
    const prev = JSON.parse(localStorage.getItem("practicum_submissions") || "[]");
    localStorage.setItem("practicum_submissions", JSON.stringify([entry, ...prev]));
    toast.success("Evaluation Uploaded", { description: "Your final assessment has been recorded." });
    setUploadedFile(null);
    setFileName("");
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[13px] text-[hsl(var(--muted-foreground))]">Practicum</p>
          <h1 className="text-[28px] font-bold tracking-tight mt-1">Final Evaluation</h1>
        </div>
        <Badge variant="outline" className="text-[10px] font-semibold uppercase tracking-[0.18em] px-3 py-1.5 self-start sm:self-auto border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]">
          Academic Result
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        {/* Upload Card */}
        <Card className="border border-[hsl(var(--border))] shadow-sm bg-[hsl(var(--card))] overflow-hidden">
          <CardHeader className="border-b border-[hsl(var(--border))]">
            <div className="flex items-center gap-4">
              <div className="h-9 w-9 rounded-lg bg-[hsl(var(--muted))] flex items-center justify-center">
                <FileBarChart className="h-[18px] w-[18px] text-[hsl(var(--muted-foreground))]" />
              </div>
              <div>
                <CardTitle className="text-[15px]">Evaluation Upload</CardTitle>
                <CardDescription className="text-[13px]">Upload your supervisor&apos;s performance review.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Drop Zone */}
            <div className="relative group cursor-pointer">
              <input type="file" accept=".pdf" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer" />
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
                  <p className="text-[14px] font-semibold">{fileName || "Click to upload Evaluation"}</p>
                  <p className="text-[12px] text-[hsl(var(--muted-foreground))] mt-1">PDF format — max 5 MB</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[hsl(var(--border))]">
              <div className="flex items-center gap-2 text-[hsl(var(--muted-foreground))]">
                <Star className="h-4 w-4 shrink-0" />
                <span className="text-[12px]">Make sure all grading criteria are clearly legible.</span>
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
              <CardTitle className="text-[15px]">Evaluation Example</CardTitle>
              <CardDescription className="text-[13px]">Download the sample form only.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-[12px] text-[hsl(var(--muted-foreground))] leading-relaxed">
                This file is only an example, similar to the MOA and DTR sample documents.
              </p>
              <Button
                variant="outline"
                onClick={() => toast.success("Template ready", { description: "Assessment_Form.pdf downloaded in demo mode." })}
                className="w-full h-10 rounded-lg font-semibold text-[12px] uppercase tracking-widest border-[hsl(var(--border))]"
              >
                <Download className="mr-2 h-4 w-4" />
                Assessment_Form.pdf
              </Button>
            </CardContent>
          </Card>

          <Card className="border border-[hsl(var(--border))] shadow-sm bg-[hsl(var(--card))]">
            <CardHeader>
              <CardTitle className="text-[15px]">Requirements</CardTitle>
              <CardDescription className="text-[13px]">Before you submit.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
              {[
                "Supervisor must complete the evaluation.",
                "All rating fields should be readable.",
                "Signature section must be completed.",
                "Upload the final signed PDF only.",
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border border-transparent px-3 py-2.5 hover:border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] transition-all">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-[hsl(var(--muted-foreground))] shrink-0" />
                    <span className="text-[13px] font-semibold">{item}</span>
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
