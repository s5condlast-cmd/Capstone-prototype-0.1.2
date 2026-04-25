"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getSession } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  CheckCircle2,
  Clock,
  FileEdit,
  FileSearch,
  Mic,
  MicOff,
  Send,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    webkitSpeechRecognition?: new () => SpeechRecognition;
    SpeechRecognition?: new () => SpeechRecognition;
  }

  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start: () => void;
    stop: () => void;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
    onend: (() => void) | null;
  }

  interface SpeechRecognitionEvent {
    resultIndex: number;
    results: {
      [key: number]: {
        [key: number]: {
          transcript: string;
        };
        isFinal: boolean;
        length: number;
      };
      length: number;
    };
  }

  interface SpeechRecognitionErrorEvent {
    error: string;
  }
}

interface Submission {
  id: string;
  type: string;
  studentName: string;
  studentId: string;
  title: string;
  status: "pending" | "approved" | "rejected" | "revision";
  submittedAt: string;
  isUrgent?: boolean;
  content?: string;
  feedback?: string;
  fileName?: string;
}

function getStoredSubmissions(): Submission[] {
  if (typeof window === "undefined") return [];
  const session = getSession();
  if (!session || session.role !== "advisor") return [];

  const stored = JSON.parse(localStorage.getItem("practicum_submissions") || "[]");
  if (stored.length > 0) return stored;

  return [
    {
      id: "demo-journal-1",
      type: "journal",
      studentName: "Demo Student",
      studentId: "2024-0001",
      title: "Journal Entry - Sample Review",
      status: "pending",
      submittedAt: new Date().toISOString(),
      content: "Today I assisted with office encoding, organized practicum files, and learned how the document workflow is processed. I also encountered delays in validating some records and need to improve my summary details.",
      feedback: "Please make the journal entry more specific and include clearer learning outcomes.",
      fileName: "journal-sample.docx",
    },
    {
      id: "demo-moa-1",
      type: "moa",
      studentName: "Demo Student 2",
      studentId: "2024-0002",
      title: "MOA Submission - Sample Review",
      status: "revision",
      submittedAt: new Date().toISOString(),
      content: "Memorandum of Agreement between the company and student. Some signatory details and practicum duration fields are incomplete.",
      feedback: "Please complete the missing signatory names and practicum dates before resubmission.",
      fileName: "moa-sample.pdf",
    },
  ];
}

function getAutoInspection(submission: Submission | null) {
  if (!submission) {
    return {
      starterFeedback: "",
    };
  }

  const starterFeedbackByType: Record<string, string> = {
    journal: "Please revise the journal entry by adding clearer task details, learning outcomes, and progress updates.",
    moa: "Please review the MOA carefully and complete the missing names, signatures, and required agreement details.",
    dtr: "Please correct the DTR entries and make sure the hours, dates, and signatures are complete and readable.",
    evaluation: "Please update the evaluation form and ensure the rating fields, evaluator details, and signature section are complete.",
  };

  return {
    starterFeedback:
      submission.feedback?.trim() ||
      starterFeedbackByType[submission.type] ||
      "Please review the document and complete the missing details before resubmission.",
  };
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getWordSuggestions(word: string) {
  const cleaned = word.trim();
  if (!cleaned) return [];

  const lower = cleaned.toLowerCase();
  const suggestionMap: Record<string, string[]> = {
    revise: ["update", "improve", "correct"],
    revised: ["updated", "improved", "corrected"],
    wrong: ["incorrect", "unclear", "incomplete"],
    issue: ["concern", "problem", "requirement"],
    fix: ["correct", "update", "revise"],
    add: ["include", "provide", "insert"],
    make: ["ensure", "provide", "keep"],
    clear: ["specific", "detailed", "readable"],
    good: ["acceptable", "complete", "appropriate"],
    bad: ["incomplete", "unclear", "incorrect"],
  };

  return suggestionMap[lower] || [`${cleaned} update`, `${cleaned} revision`, `${cleaned} detail`];
}

export default function AdvisorApprovals() {
  const [submissions, setSubmissions] = useState<Submission[]>(() => getStoredSubmissions());
  const [selectedId, setSelectedId] = useState<string | null>(() => getStoredSubmissions()[0]?.id || null);
  const [feedback, setFeedback] = useState("");
  const [filter, setFilter] = useState("all");
  const [lastAction, setLastAction] = useState<"approved" | "rejected" | "revision" | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [selectedWord, setSelectedWord] = useState("");
  const [replacementDraft, setReplacementDraft] = useState("");
  const [isSidePanelCollapsed, setIsSidePanelCollapsed] = useState(false);
  const [selectionPopup, setSelectionPopup] = useState<{ top: number; left: number } | null>(null);
  const editorRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const filtered = useMemo(
    () => submissions.filter((submission) => filter === "all" || submission.status === filter),
    [submissions, filter]
  );

  const selectedSub = useMemo(
    () => submissions.find((submission) => submission.id === selectedId) || null,
    [submissions, selectedId]
  );

  useEffect(() => {
    if (!editorRef.current) return;
    if (editorRef.current.innerText !== feedback) {
      editorRef.current.innerText = feedback;
    }
  }, [feedback]);

  const handleSelectSubmission = (id: string) => {
    setSelectedId(id);
    const current = submissions.find((submission) => submission.id === id) || null;
    const inspected = getAutoInspection(current);
    setFeedback(current?.feedback?.trim() || inspected.starterFeedback);
    setSelectedWord("");
    setReplacementDraft("");
    setSelectionPopup(null);
    setLastAction(null);
    setIsSidePanelCollapsed(true);
    toast.success("Document inspected and loaded into the review boxes.");
  };

  const handleAction = (action: "approved" | "rejected" | "revision") => {
    if (!selectedId || !selectedSub) return;

    const updated = submissions.map((submission) =>
      submission.id === selectedId ? { ...submission, status: action, feedback } : submission
    );

    setSubmissions(updated);
    localStorage.setItem("practicum_submissions", JSON.stringify(updated));
    setLastAction(action);
    toast.success(
      action === "approved"
        ? "Submission approved"
        : action === "revision"
          ? "Marked for revision"
          : "Submission rejected"
    );
  };

  const handleEditorInput = (event: React.FormEvent<HTMLDivElement>) => {
    setFeedback(event.currentTarget.innerText);
  };

  const handleWordSelection = () => {
    const selection = window.getSelection();
    const text = selection?.toString().trim() || "";
    if (!selection || !text || text.includes(" ") || selection.rangeCount === 0) {
      setSelectedWord("");
      setReplacementDraft("");
      setSelectionPopup(null);
      return;
    }

    const rangeRect = selection.getRangeAt(0).getBoundingClientRect();
    setSelectedWord(text);
    setReplacementDraft(text);
    setSelectionPopup({
      top: Math.max(16, rangeRect.top + window.scrollY - 12),
      left: rangeRect.left + window.scrollX + rangeRect.width / 2,
    });
    setIsSidePanelCollapsed(true);
  };

  const replaceSelectedWord = (replacement: string) => {
    if (!selectedWord.trim()) {
      toast.error("Select one word in the adviser feedback first.");
      return;
    }

    const next = feedback.replace(new RegExp(`\\b${escapeRegExp(selectedWord)}\\b`), replacement);
    setFeedback(next);
    setSelectedWord(replacement);
    setReplacementDraft(replacement);
    setSelectionPopup(null);
    toast.success("Selected word replaced.");
  };

  const toggleSpeechToText = () => {
    const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      toast.error("Speech-to-text is not supported in this browser.");
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setFeedback((current) => `${current}${current.endsWith("\n") || current.length === 0 ? "" : " "}${transcript}`);
    };

    recognition.onerror = () => {
      setIsListening(false);
      toast.error("Speech recognition stopped unexpectedly.");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
    toast.success("Speech-to-text started.");
  };

  const wordSuggestions = getWordSuggestions(selectedWord);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-[13px] text-[hsl(var(--muted-foreground))]">Adviser Review</p>
            <h1 className="text-[28px] font-bold tracking-tight mt-1">Document Approvals</h1>
          </div>
          <Badge variant="outline" className="text-[10px] font-semibold uppercase tracking-[0.18em] px-3 py-1.5 self-start sm:self-auto border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]">
            {today}
          </Badge>
        </div>

        {lastAction && selectedSub && (
          <div className={cn(
            "rounded-xl border px-5 py-4 flex items-center gap-4 transition-all animate-in fade-in slide-in-from-top-2",
            lastAction === "approved" ? "bg-green-500/10 border-green-500/20" :
            lastAction === "rejected" ? "bg-red-500/10 border-red-500/20" :
            "bg-blue-500/10 border-blue-500/20"
          )}>
            <div className={cn(
              "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
              lastAction === "approved" ? "bg-green-600" :
              lastAction === "rejected" ? "bg-red-600" :
              "bg-blue-600"
            )}>
              {lastAction === "approved" ? (
                <CheckCircle2 className="h-4 w-4 text-white" />
              ) : lastAction === "rejected" ? (
                <XCircle className="h-4 w-4 text-white" />
              ) : (
                <Send className="h-4 w-4 text-white" />
              )}
            </div>
            <div>
              <p className="text-[13px] font-semibold">
                {lastAction === "approved"
                  ? "Document approved successfully!"
                  : lastAction === "rejected"
                    ? "Document rejected."
                    : "Revision request sent."}
              </p>
              <p className="text-[12px] text-[hsl(var(--muted-foreground))] mt-0.5">
                {selectedSub.studentName}&rsquo;s submission has been updated.
              </p>
            </div>
          </div>
        )}

        <div className={`grid gap-6 items-start ${isSidePanelCollapsed ? "xl:grid-cols-[1.8fr_64px]" : "xl:grid-cols-[1.45fr_0.95fr]"}`}>
          <Card className="border border-[hsl(var(--border))] shadow-sm bg-[hsl(var(--card))] overflow-hidden">
            <CardHeader className="border-b border-[hsl(var(--border))]">
              <div className="flex items-center gap-4">
                <div className="h-9 w-9 rounded-lg bg-[hsl(var(--muted))] flex items-center justify-center">
                  <FileEdit className="h-[18px] w-[18px] text-[hsl(var(--muted-foreground))]" />
                </div>
                <div>
                  <CardTitle className="text-[15px]">Advisor Feedback</CardTitle>
                  <CardDescription className="text-[13px]">
                    {selectedSub ? "Select one word in the editor to open word-specific actions and speech-to-text." : "Choose a student submission from the queue to begin."}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center justify-between gap-3">
                <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[hsl(var(--muted-foreground))]">
                  Main Feedback Editor
                </label>
                <button
                  onClick={() => setIsSidePanelCollapsed((current) => !current)}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-[11px] font-semibold uppercase tracking-[0.18em] border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]"
                >
                  {isSidePanelCollapsed ? "Show Side Panel" : "Collapse Side Panel"}
                </button>
              </div>

              <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-4 relative">
                {!selectedWord && (
                  <div className="mb-3">
                    <span className="text-[11px] text-[hsl(var(--muted-foreground))]">
                      Select or double-click one word in the feedback editor to open a floating popup.
                    </span>
                  </div>
                )}

                <div
                  ref={editorRef}
                  contentEditable={Boolean(selectedSub)}
                  suppressContentEditableWarning
                  onInput={handleEditorInput}
                  onMouseUp={handleWordSelection}
                  onKeyUp={handleWordSelection}
                  onDoubleClick={handleWordSelection}
                  className={`min-h-[620px] rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-4 text-[13px] leading-relaxed outline-none whitespace-pre-wrap ${
                    selectedWord ? "ring-2 ring-orange-300 dark:ring-orange-800" : ""
                  } ${!selectedSub ? "opacity-60" : ""}`}
                >
                  {feedback}
                </div>
              </div>

              <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/60 px-4 py-3 text-[11px] text-[hsl(var(--muted-foreground))] flex items-center justify-between gap-3">
                <span>
                  {isListening
                    ? "Listening… speech-to-text is writing into the editor."
                    : selectedWord
                      ? "Selected word is ready for replacement suggestions."
                      : "Click a submission, then select one word in the editor to get recommendations."}
                </span>
                <span>{feedback.length} characters</span>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-[hsl(var(--border))]">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleAction("revision")}
                    disabled={!selectedSub}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border text-[12px] font-semibold uppercase tracking-widest transition-all bg-blue-600 text-white border-blue-600 hover:bg-blue-700 disabled:opacity-40"
                  >
                    <Send className="h-4 w-4" />
                    Mark for Revision
                  </button>
                  <button
                    onClick={() => handleAction("rejected")}
                    disabled={!selectedSub}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border text-[12px] font-semibold uppercase tracking-widest transition-all border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:bg-red-600 hover:text-white hover:border-red-600 disabled:opacity-40"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </button>
                </div>

                <Button
                  onClick={() => handleAction("approved")}
                  disabled={!selectedSub}
                  className="h-10 px-7 bg-[hsl(var(--foreground))] hover:opacity-90 text-[hsl(var(--background))] font-semibold text-[12px] uppercase tracking-widest rounded-lg disabled:opacity-40"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Approve
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className={isSidePanelCollapsed ? "hidden" : "flex flex-col gap-6"}>
            <Card className="border border-[hsl(var(--border))] shadow-sm bg-[hsl(var(--card))] overflow-hidden">
              <CardHeader>
                <CardTitle className="text-[15px]">Review Queue</CardTitle>
                <CardDescription className="text-[13px]">Select a student submission to inspect and process.</CardDescription>
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  {[
                    { key: "all", label: "All" },
                    { key: "pending", label: "Pending" },
                    { key: "revision", label: "Revision" },
                    { key: "approved", label: "Approved" },
                  ].map((item) => (
                    <button
                      key={item.key}
                      onClick={() => setFilter(item.key)}
                      className={`rounded-lg px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] transition-all ${
                        filter === item.key
                          ? "bg-[hsl(var(--foreground))] text-[hsl(var(--background))]"
                          : "border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="p-3">
                {filtered.length === 0 ? (
                  <div className="py-10 text-center text-[13px] text-[hsl(var(--muted-foreground))]">No submissions found.</div>
                ) : (
                  <div className="flex flex-col gap-2 max-h-[320px] overflow-y-auto">
                    {filtered.map((submission) => (
                      <button
                        key={submission.id}
                        onClick={() => handleSelectSubmission(submission.id)}
                        className={`text-left rounded-xl border p-4 transition-all ${
                          selectedId === submission.id
                            ? "border-[hsl(var(--foreground))] bg-[hsl(var(--foreground))] text-[hsl(var(--background))]"
                            : "border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:bg-[hsl(var(--muted))]"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${selectedId === submission.id ? "opacity-70" : "text-[hsl(var(--muted-foreground))]"}`}>
                            {submission.type}
                          </span>
                          <span className={`h-2.5 w-2.5 rounded-full ${
                            submission.status === "approved"
                              ? "bg-green-500"
                              : submission.status === "revision"
                                ? "bg-blue-500"
                                : submission.status === "rejected"
                                  ? "bg-red-500"
                                  : "bg-sti-blue"
                          }`} />
                        </div>
                        <p className="text-[13px] font-semibold mt-2 line-clamp-2">{submission.title}</p>
                        <p className={`text-[11px] mt-1 ${selectedId === submission.id ? "opacity-70" : "text-[hsl(var(--muted-foreground))]"}`}>
                          {submission.studentName}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border border-[hsl(var(--border))] shadow-sm bg-[hsl(var(--card))]">
              <CardHeader>
                <CardTitle className="text-[15px]">Submission Info</CardTitle>
                <CardDescription className="text-[13px]">Details for the selected submission.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-2">
                <div className="flex items-center justify-between rounded-lg border border-transparent px-3 py-3 bg-[hsl(var(--muted))]">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                    <span className="text-[13px] font-semibold">Date</span>
                  </div>
                  <span className="text-[12px] text-[hsl(var(--muted-foreground))]">
                    {selectedSub ? new Date(selectedSub.submittedAt).toLocaleDateString() : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-transparent px-3 py-3 bg-[hsl(var(--muted))]">
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                    <span className="text-[13px] font-semibold">Status</span>
                  </div>
                  <span className="text-[12px] text-[hsl(var(--muted-foreground))] uppercase">
                    {selectedSub?.status || "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-transparent px-3 py-3 bg-[hsl(var(--muted))]">
                  <div className="flex items-center gap-3">
                    <FileSearch className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                    <span className="text-[13px] font-semibold">Student</span>
                  </div>
                  <span className="text-[12px] text-[hsl(var(--muted-foreground))]">{selectedSub?.studentName || "—"}</span>
                </div>
              </CardContent>
            </Card>

          </div>
          {isSidePanelCollapsed && (
            <div className="hidden xl:flex flex-col items-center gap-3 sticky top-6">
              <button
                onClick={() => setIsSidePanelCollapsed(false)}
                className="h-24 w-16 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[11px] font-semibold text-[hsl(var(--muted-foreground))] [writing-mode:vertical-rl] rotate-180 hover:bg-[hsl(var(--muted))]"
              >
                Show Side Panel
              </button>
            </div>
          )}
        </div>

        {selectedWord && selectionPopup && (
          <div
            className="fixed z-50 -translate-x-1/2 -translate-y-full"
            style={{ top: selectionPopup.top, left: selectionPopup.left }}
          >
            <div className="mb-2 w-[320px] rounded-xl border border-orange-200 bg-white shadow-2xl dark:border-orange-900/30 dark:bg-slate-900">
              <div className="border-b border-orange-200 px-4 py-3 dark:border-orange-900/30">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center rounded-md bg-orange-100 px-2.5 py-1 text-[11px] font-semibold text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                      {selectedWord}
                    </span>
                    <span className="inline-flex items-center rounded-md bg-red-100 px-2.5 py-1 text-[11px] font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-300">
                      Suggestion mode
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedWord("");
                      setReplacementDraft("");
                      setSelectionPopup(null);
                    }}
                    className="text-[11px] font-semibold text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                  >
                    Close
                  </button>
                </div>
                <p className="mt-2 text-[11px] text-[hsl(var(--muted-foreground))]">
                  Word-specific popup with replacement and speech-to-text actions.
                </p>
              </div>
              <div className="p-4 space-y-3">
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[hsl(var(--muted-foreground))]">
                    Recommended words
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {wordSuggestions.slice(0, 3).map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => replaceSelectedWord(suggestion)}
                        className="inline-flex items-center rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-[11px] font-semibold text-orange-700 hover:bg-orange-100 dark:border-orange-900/30 dark:bg-orange-950/20 dark:text-orange-300 dark:hover:bg-orange-900/30"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    value={replacementDraft}
                    onChange={(e) => setReplacementDraft(e.target.value)}
                    placeholder="Type replacement word"
                    className="h-10 flex-1 rounded-lg border border-orange-200 bg-white px-3 text-[12px] outline-none dark:border-orange-900/30 dark:bg-slate-950"
                  />
                  <button
                    onClick={() => replaceSelectedWord(replacementDraft.trim() || selectedWord)}
                    className="h-10 rounded-lg bg-[hsl(var(--foreground))] px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[hsl(var(--background))] hover:opacity-90"
                  >
                    Replace
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleSpeechToText}
                    className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] transition-all ${
                      isListening
                        ? "bg-[hsl(var(--foreground))] text-[hsl(var(--background))] border-[hsl(var(--foreground))]"
                        : "border-orange-200 text-orange-700 hover:bg-orange-100 dark:border-orange-900/30 dark:text-orange-300 dark:hover:bg-orange-900/20"
                    }`}
                  >
                    {isListening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                    {isListening ? "Stop" : "Speech to Text"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}
