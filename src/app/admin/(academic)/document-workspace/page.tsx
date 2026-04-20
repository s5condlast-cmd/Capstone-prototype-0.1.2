"use client"

import { useMemo, useRef, useState } from "react"
import AdminLayout from "@/components/AdminLayout"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
  Bot,
  FileScan,
  Files,
  Mic,
  MicOff,
  Save,
  Sparkles,
  Wand2,
} from "lucide-react"

type SubmissionStatus = "pending" | "approved" | "rejected" | "revision"

type Submission = {
  id: string
  type: string
  studentName?: string
  studentId?: string
  title: string
  status: SubmissionStatus
  submittedAt: string
  fileName?: string
  content?: string
  feedback?: string
}

declare global {
  interface Window {
    webkitSpeechRecognition?: new () => SpeechRecognition
    SpeechRecognition?: new () => SpeechRecognition
  }

  interface SpeechRecognition extends EventTarget {
    continuous: boolean
    interimResults: boolean
    lang: string
    start: () => void
    stop: () => void
    onresult: ((event: SpeechRecognitionEvent) => void) | null
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
    onend: (() => void) | null
  }

  interface SpeechRecognitionEvent {
    resultIndex: number
    results: {
      [key: number]: {
        [key: number]: {
          transcript: string
        }
        isFinal: boolean
        length: number
      }
      length: number
    }
  }

  interface SpeechRecognitionErrorEvent {
    error: string
  }
}

const statusTone: Record<SubmissionStatus, string> = {
  approved: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  pending: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  revision: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
}

function getStoredSubmissions(): Submission[] {
  if (typeof window === "undefined") return []
  return JSON.parse(localStorage.getItem("practicum_submissions") || "[]")
}

function getDefaultEditorContent(submission: Submission | null) {
  if (!submission) return ""

  return submission.content || [
    `Document Title: ${submission.title}`,
    `Student: ${submission.studentName || "Unknown Student"}`,
    `Student ID: ${submission.studentId || "N/A"}`,
    `File: ${submission.fileName || "No uploaded filename"}`,
    `Status: ${submission.status}`,
    "",
    "Admin Writing Workspace",
    "Use this space to prepare revisions, annotate clauses, or draft the official replacement document.",
  ].join("\n")
}

function getAiSuggestions(submission: Submission | null) {
  if (!submission) return []

  const type = submission.type?.toLowerCase()
  const suggestions = [
    "Check the student, company, and practicum period fields for completeness.",
    "Align names, dates, and signatures with the student profile and uploaded file metadata.",
  ]

  if (type === "moa") {
    suggestions.unshift("Verify if all three required signatories are represented in the agreement.")
  }

  if (type === "dtr") {
    suggestions.unshift("Review total rendered hours and validate missing time-in or time-out entries.")
  }

  if (type === "journal") {
    suggestions.unshift("Look for concise activity summaries, learning reflections, and adviser-visible progress notes.")
  }

  if (submission.status === "revision") {
    suggestions.unshift("This file was marked for revision. Compare it against the last feedback before finalizing edits.")
  }

  return suggestions.slice(0, 4)
}

export default function AdminDocumentWorkspace() {
  const [submissions] = useState<Submission[]>(() => getStoredSubmissions())
  const [selectedId, setSelectedId] = useState<string | null>(() => getStoredSubmissions()[0]?.id || null)
  const [editorContent, setEditorContent] = useState(() => getDefaultEditorContent(getStoredSubmissions()[0] || null))
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  const selectedSubmission = useMemo(
    () => submissions.find((item) => item.id === selectedId) || null,
    [submissions, selectedId]
  )

  const handleSelectSubmission = (submission: Submission) => {
    setSelectedId(submission.id)
    setEditorContent(getDefaultEditorContent(submission))
  }

  const handleSave = () => {
    if (!selectedSubmission) {
      toast.error("Select a student document first.")
      return
    }

    localStorage.setItem(
      `admin_workspace_${selectedSubmission.id}`,
      JSON.stringify({ content: editorContent, updatedAt: new Date().toISOString() })
    )
    toast.success("Workspace draft saved")
  }

  const toggleSpeechToText = () => {
    const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognitionCtor) {
      toast.error("Speech-to-text is not supported in this browser.")
      return
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop()
      return
    }

    const recognition = new SpeechRecognitionCtor()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = "en-US"

    recognition.onresult = (event) => {
      let transcript = ""
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript
      }

      setEditorContent((current) => `${current}${current.endsWith("\n") || current.length === 0 ? "" : " "}${transcript}`)
    }

    recognition.onerror = () => {
      setIsListening(false)
      toast.error("Speech recognition stopped unexpectedly.")
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition
    recognition.start()
    setIsListening(true)
    toast.success("Speech-to-text started")
  }

  const aiSuggestions = getAiSuggestions(selectedSubmission)

  const scanItems = selectedSubmission
    ? [
        { label: "Document type", value: selectedSubmission.type?.toUpperCase() || "Unknown" },
        { label: "Student record", value: selectedSubmission.studentName || "No linked student" },
        { label: "Uploaded file", value: selectedSubmission.fileName || "No file metadata" },
        { label: "Current status", value: selectedSubmission.status },
      ]
    : []

  return (
    <AdminLayout activeNav="student-docs">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-[13px] text-[hsl(var(--muted-foreground))]">Academic workspace</p>
            <h1 className="text-[28px] font-bold tracking-tight mt-1">Student Document Editor</h1>
            <p className="text-[13px] text-[hsl(var(--muted-foreground))] mt-1">
              Draft official document text, dictate with speech-to-text, and review adviser-submitted student files.
            </p>
          </div>
          <div className="flex items-center gap-3 text-[12px] text-[hsl(var(--muted-foreground))]">
            <Files className="h-4 w-4" />
            <span>{submissions.length} student document(s) available</span>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.45fr_0.85fr] min-h-[720px]">
          <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-[hsl(var(--border))] flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-[15px] font-semibold">Admin writing workspace</h2>
                <p className="text-[12px] text-[hsl(var(--muted-foreground))] mt-1">
                  {selectedSubmission
                    ? `Editing around ${selectedSubmission.title}`
                    : "Choose a student file from the right side to begin"}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={toggleSpeechToText}
                  className={`inline-flex items-center gap-2 h-9 px-4 rounded-lg text-[12px] font-semibold transition-colors ${
                    isListening
                      ? "bg-red-500 text-white hover:bg-red-600"
                      : "bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))]"
                  }`}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  {isListening ? "Stop Dictation" : "Speech to Text"}
                </button>
                <button
                  onClick={handleSave}
                  className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-[hsl(var(--foreground))] text-[hsl(var(--background))] text-[12px] font-semibold hover:opacity-90 transition-opacity"
                >
                  <Save className="h-4 w-4" /> Save Draft
                </button>
              </div>
            </div>

            <div className="flex-1 p-4 md:p-5 bg-[hsl(var(--muted))]/30">
              <textarea
                value={editorContent}
                onChange={(e) => setEditorContent(e.target.value)}
                placeholder="Write the official student document here or use speech-to-text."
                className="w-full h-full min-h-[560px] rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-5 text-[13px] leading-relaxed outline-none resize-none focus:ring-2 focus:ring-[hsl(var(--foreground))]/10"
                spellCheck={false}
              />
            </div>
          </section>

          <div className="flex flex-col gap-6">
            <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden">
              <div className="px-5 py-4 border-b border-[hsl(var(--border))]">
                <h2 className="text-[15px] font-semibold">Student docs to edit</h2>
                <p className="text-[12px] text-[hsl(var(--muted-foreground))] mt-1">
                  Files surfaced from adviser-visible student submissions.
                </p>
              </div>

              <div className="max-h-[360px] overflow-y-auto">
                {submissions.length === 0 ? (
                  <div className="px-5 py-16 text-center text-[12px] text-[hsl(var(--muted-foreground))]">
                    No student submissions found yet.
                  </div>
                ) : (
                  submissions.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelectSubmission(item)}
                      className={`w-full text-left px-5 py-4 border-b border-[hsl(var(--border))] last:border-b-0 transition-colors ${
                        selectedId === item.id ? "bg-[hsl(var(--muted))]" : "hover:bg-[hsl(var(--muted))]/60"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold truncate">{item.title}</p>
                          <p className="text-[11px] text-[hsl(var(--muted-foreground))] mt-1">
                            {item.studentName || "Unknown student"} • {item.studentId || "No ID"}
                          </p>
                          <p className="text-[11px] text-[hsl(var(--muted-foreground))] mt-1 truncate">
                            {item.fileName || "No uploaded filename"}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-[10px] font-semibold uppercase h-5 px-2 shrink-0">
                          {item.type}
                        </Badge>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden">
              <div className="px-5 py-4 border-b border-[hsl(var(--border))] flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                <h2 className="text-[15px] font-semibold">AI recommendations & scan</h2>
              </div>

              <div className="p-5 space-y-5">
                <div className="rounded-xl bg-[hsl(var(--muted))] p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                    <h3 className="text-[13px] font-semibold">Recommended actions</h3>
                  </div>
                  {selectedSubmission ? (
                    <ul className="space-y-2">
                      {aiSuggestions.map((tip) => (
                        <li key={tip} className="flex items-start gap-2 text-[12px] text-[hsl(var(--muted-foreground))]">
                          <Wand2 className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-[12px] text-[hsl(var(--muted-foreground))]">Select a file to generate guidance.</p>
                  )}
                </div>

                <div className="rounded-xl border border-[hsl(var(--border))] p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <FileScan className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                    <h3 className="text-[13px] font-semibold">Scanned file details</h3>
                  </div>

                  {selectedSubmission ? (
                    <div className="space-y-2">
                      {scanItems.map((item) => (
                        <div key={item.label} className="flex items-center justify-between gap-3 rounded-lg bg-[hsl(var(--muted))]/50 px-3 py-2">
                          <span className="text-[11px] font-medium text-[hsl(var(--muted-foreground))]">{item.label}</span>
                          <span className="text-[11px] font-semibold text-right max-w-[60%] break-words">{item.value}</span>
                        </div>
                      ))}

                      <div className="pt-1">
                        <span className={`inline-flex rounded-md px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${statusTone[selectedSubmission.status]}`}>
                          {selectedSubmission.status}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[12px] text-[hsl(var(--muted-foreground))]">No file selected for scanning.</p>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
