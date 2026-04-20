"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Clock, Download, Briefcase, FileBarChart, FolderOpen } from "lucide-react";
import { toast } from "sonner";

const TEMPLATES = [
  {
    id: 1,
    title: "Daily Time Record",
    file: "DTR_2026.pdf",
    type: "PDF",
    size: "245 KB",
    icon: Clock,
    description: "Official university DTR template for logging your daily work hours.",
  },
  {
    id: 2,
    title: "Memorandum of Agreement",
    file: "MOA_Legal_2026.docx",
    type: "DOCX",
    size: "1.2 MB",
    icon: Briefcase,
    description: "Tripartite agreement between student, university, and host company.",
  },
  {
    id: 3,
    title: "Final Evaluation Form",
    file: "Assessment_Form.pdf",
    type: "PDF",
    size: "450 KB",
    icon: FileBarChart,
    description: "Performance assessment form to be completed by your supervisor.",
  },
  {
    id: 4,
    title: "Journal Cover Template",
    file: "Journal_Cover.docx",
    type: "DOCX",
    size: "105 KB",
    icon: FileText,
    description: "Standard cover page template for your practicum journal.",
  },
  {
    id: 5,
    title: "Endorsement Letter",
    file: "Endorsement_Letter.docx",
    type: "DOCX",
    size: "88 KB",
    icon: FolderOpen,
    description: "Official letter from the university endorsing your deployment.",
  },
];

export default function TemplatesPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[13px] text-[hsl(var(--muted-foreground))]">Practicum</p>
          <h1 className="text-[28px] font-bold tracking-tight mt-1">Document Repository</h1>
        </div>
        <span className="text-[13px] text-[hsl(var(--muted-foreground))] self-start sm:self-auto">
          {TEMPLATES.length} templates available
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TEMPLATES.map((t) => (
          <Card
            key={t.id}
            className="border border-[hsl(var(--border))] shadow-sm bg-[hsl(var(--card))] hover:shadow-md transition-shadow flex flex-col"
          >
            <CardHeader>
              <div className="flex items-start justify-between gap-3 mb-1">
                <div className="h-9 w-9 rounded-lg bg-[hsl(var(--muted))] flex items-center justify-center">
                  <t.icon className="h-[18px] w-[18px] text-[hsl(var(--muted-foreground))]" />
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]">
                  {t.type}
                </span>
              </div>
              <CardTitle className="text-[15px]">{t.title}</CardTitle>
              <CardDescription className="text-[13px]">{t.description}</CardDescription>
            </CardHeader>

            <CardContent className="mt-auto pt-4 border-t border-[hsl(var(--border))]">
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-[hsl(var(--muted-foreground))] font-semibold">{t.size}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toast.success("Template ready", { description: `${t.file} downloaded in demo mode.` })}
                  className="h-9 px-4 rounded-lg font-semibold text-[12px] uppercase tracking-widest hover:bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]"
                >
                  <Download className="mr-1.5 h-4 w-4" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-center text-[12px] text-[hsl(var(--muted-foreground))]">
        All templates are official university documents. Contact your coordinator for the latest versions.
      </p>
    </div>
  );
}
