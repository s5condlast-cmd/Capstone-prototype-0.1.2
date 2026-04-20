"use client"

import { ChangeEvent, useRef, useState } from "react"
import AdminLayout from "@/components/AdminLayout"
import { 
  FileEdit, 
  Save, 
  FileText,
  ChevronRight,
  Upload,
  FileBarChart,
  Briefcase,
  Clock,
  FolderOpen
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type TemplateItem = {
  id: string
  label: string
  category: string
  desc: string
  fileType: string
  icon: typeof FileText
  content: string
}

export default function AdminTemplates() {
  const [editorContent, setEditorContent] = useState("")
  const [activeTemplate, setActiveTemplate] = useState<TemplateItem | null>(null)
  const [templates, setTemplates] = useState<TemplateItem[]>([
    { id: "dtr", label: "DTR Template", category: "Attendance", desc: "Daily Time Record logging structure", fileType: "PDF", icon: Clock, content: "DAILY TIME RECORD\n\nStudent: _______________\nDate: _______________\n\nTime In: ________ AM\nTime Out: ________ PM\nTotal Hours: ________\n\nSignature: _______________\n\nNotes:\n" },
    { id: "moa", label: "MOA Template", category: "Legal", desc: "Memorandum of Agreement with partner companies", fileType: "DOCX", icon: Briefcase, content: "MEMORANDUM OF AGREEMENT\n\nThis Memorandum of Agreement is made and entered into between\n_______________  (Company) located at _______________\nand _______________  (Student) of _______________  (School)\nfor the purpose of _______________.\n\nThe Company agrees to provide training and supervision to the Student\nduring the practicum period of _______________.\n\nThe Company shall evaluate the Student's performance and submit an\nEvaluation Form to the school monthly.\n\nThe Student agrees to follow all company rules, complete the required\nhours, and submit daily logs throughout the practicum.\n\nThis agreement shall remain in effect for a period of _______________\nbeginning from _______________.\n\nSigned by:\n\n_______________          _______________\nCompany Representative    Student\n\nDate: _______________\n" },
    { id: "evaluation", label: "Evaluation Form", category: "Performance", desc: "Student performance assessment template", fileType: "PDF", icon: FileBarChart, content: "STUDENT EVALUATION FORM\n\nStudent Name: _______________\nCompany: _______________\nEvaluation Period: _______________\n\nRating Scale: 1 (Poor) - 5 (Excellent)\n\nPerformance Areas:\n1. Technical Skills:    [ ]\n2. Communication:       [ ]\n3. Work Ethic:          [ ]\n4. Teamwork:            [ ]\n5. Initiative:          [ ]\n\nOverall Rating: [ ] / 5\n\nComments:\n_______________________________________________\n_______________________________________________\n\nEvaluator: _______________\nSignature: _______________\nDate: _______________\n" },
    { id: "journal-cover", label: "Journal Cover Template", category: "Documentation", desc: "Standard cover page template for practicum journals", fileType: "DOCX", icon: FileText, content: "PRACTICUM JOURNAL COVER\n\nStudent Name: _______________\nProgram: _______________\nCompany: _______________\nDepartment: _______________\nAcademic Term: _______________\n\nSubmitted to:\n_______________\nPracticum Coordinator\n\nDate Submitted: _______________\n" },
    { id: "endorsement", label: "Endorsement Letter", category: "Correspondence", desc: "Official deployment endorsement letter template", fileType: "DOCX", icon: FolderOpen, content: "ENDORSEMENT LETTER\n\nDate: _______________\n\nTo Whom It May Concern,\n\nGreetings!\n\nThis letter serves as an endorsement for _______________, a student of _______________, who is required to complete practicum hours as part of the academic curriculum.\n\nWe respectfully request your office to consider the student for placement and training relevant to the program outcomes.\n\nThank you for your support and cooperation.\n\nSincerely,\n\n_______________\nPracticum Coordinator\n" },
  ])
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleLoad = (t: TemplateItem) => {
    setActiveTemplate(t)
    setEditorContent(t.content)
    toast.info(`Template "${t.label}" loaded`)
  }

  const handleSave = () => {
    if (!activeTemplate) return

    setTemplates((current) =>
      current.map((template) =>
        template.id === activeTemplate.id
          ? { ...template, content: editorContent }
          : template
      )
    )

    setActiveTemplate((current) => current ? { ...current, content: editorContent } : current)
    toast.success(`Template "${activeTemplate?.label}" saved successfully`)
  }

  const handleImport = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const extension = file.name.split(".").pop()?.toLowerCase()
    if (!["docx", "pdf"].includes(extension || "")) {
      toast.error("Only DOCX and PDF files can be imported.")
      event.target.value = ""
      return
    }

    const importedTemplate = {
      id: `imported-${Date.now()}`,
      label: file.name.replace(/\.[^/.]+$/, ""),
      category: "Imported",
      desc: `Imported ${extension?.toUpperCase()} file ready for template tracking`,
      fileType: extension?.toUpperCase() || "FILE",
      icon: extension === "pdf" ? FileBarChart : FileText,
      content:
        `IMPORTED TEMPLATE\n\nFile Name: ${file.name}\nFile Type: ${extension?.toUpperCase()}\nFile Size: ${(file.size / 1024).toFixed(1)} KB\n\nNote:\nThis file was imported into the template library. Binary ${extension?.toUpperCase()} preview is not available in the text editor, but the item is now listed in the admin library for tracking and replacement.`,
    }

    setTemplates((current) => [importedTemplate, ...current])
    setActiveTemplate(importedTemplate)
    setEditorContent(importedTemplate.content)
    toast.success(`${file.name} imported successfully`)
    event.target.value = ""
  }

  return (
    <AdminLayout activeNav="templates">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-[28px] font-bold tracking-tight">Templates</h1>
            <p className="text-[13px] text-[hsl(var(--muted-foreground))] mt-1">Edit and manage document templates for practicum requirements.</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".docx,.pdf,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
              onChange={handleImport}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-[hsl(var(--foreground))] text-[hsl(var(--background))] text-[13px] font-semibold hover:opacity-90 transition-opacity"
            >
              <Upload className="h-4 w-4" /> Import DOCX / PDF
            </button>
          </div>
        </div>

        {/* Split Layout */}
        <div className="grid gap-6 lg:grid-cols-[320px_1fr] min-h-[600px]">
          
          {/* Template Library */}
          <div className="flex flex-col gap-3">
            <h2 className="text-[12px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))] px-1">Template Library</h2>
            <div className="flex flex-col gap-2">
              {templates.map(t => (
                <button 
                  key={t.id}
                  onClick={() => handleLoad(t)}
                  className={cn(
                    "w-full text-left p-4 rounded-xl border transition-all group",
                    activeTemplate?.id === t.id 
                      ? "border-[hsl(var(--foreground))] bg-[hsl(var(--foreground))] text-[hsl(var(--background))]" 
                      : "border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-[hsl(var(--foreground))]/20 hover:shadow-sm"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={cn(
                      "text-[10px] font-semibold uppercase tracking-wider",
                      activeTemplate?.id === t.id ? "opacity-60" : "text-[hsl(var(--muted-foreground))]"
                    )}>{t.category}</span>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-[10px] font-semibold uppercase tracking-wider",
                        activeTemplate?.id === t.id ? "opacity-70" : "text-[hsl(var(--muted-foreground))]"
                      )}>{t.fileType}</span>
                      <t.icon className="h-4 w-4 opacity-40" />
                    </div>
                  </div>
                  <h3 className="text-[14px] font-bold">{t.label}</h3>
                  <p className={cn(
                    "text-[11px] mt-1",
                    activeTemplate?.id === t.id ? "opacity-60" : "text-[hsl(var(--muted-foreground))]"
                  )}>{t.desc}</p>
                  <div className={cn(
                    "flex items-center gap-1 mt-3 text-[11px] font-semibold",
                    activeTemplate?.id === t.id ? "opacity-80" : "text-clickable"
                  )}>
                    Edit template <ChevronRight className="h-3 w-3" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Editor */}
          <div className="flex flex-col rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden">
            {/* Editor Toolbar */}
            <div className="h-12 flex items-center justify-between px-5 border-b border-[hsl(var(--border))] shrink-0">
              <div className="flex items-center gap-3">
                <div className={cn("h-2 w-2 rounded-full", activeTemplate ? "bg-sti-blue" : "bg-[hsl(var(--muted-foreground))]/30")} />
                <span className="text-[12px] font-semibold text-[hsl(var(--muted-foreground))]">
                  {activeTemplate ? activeTemplate.label : "Select a template to begin editing"}
                </span>
              </div>
              {activeTemplate && (
                <button onClick={handleSave} className="inline-flex items-center gap-1.5 h-8 px-4 rounded-lg bg-[hsl(var(--foreground))] text-[hsl(var(--background))] text-[12px] font-semibold hover:opacity-90 transition-opacity">
                  <Save className="h-3.5 w-3.5" /> Save
                </button>
              )}
            </div>
            
            {/* Editor Content */}
            <div className="flex-1 relative">
              {activeTemplate ? (
                <textarea 
                  value={editorContent}
                  onChange={(e) => setEditorContent(e.target.value)}
                  className="w-full h-full p-6 bg-transparent font-mono text-[13px] leading-relaxed outline-none resize-none"
                  spellCheck={false}
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-[hsl(var(--muted-foreground))]">
                  <FileEdit className="h-12 w-12 opacity-20" />
                  <p className="text-[13px] font-medium">No template selected</p>
                  <p className="text-[12px] opacity-60">Choose a template from the library to start editing</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
