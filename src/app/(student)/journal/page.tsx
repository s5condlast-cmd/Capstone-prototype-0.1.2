"use client";

import { useState } from "react";
import { getSession } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { FileEdit, Mic, AlertTriangle, Clock, Send, Calendar } from "lucide-react";
import { toast } from "sonner";

export default function JournalPage() {
  const [activities, setActivities] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  const handleSubmit = () => {
    if (!activities.trim()) {
      toast.error("Entry is empty", { description: "Please write something before submitting." });
      return;
    }
    const s = getSession();
    const entry = {
      id: Date.now().toString(),
      type: "journal",
      studentId: s?.studentId || "",
      title: `Journal Entry - ${new Date().toLocaleDateString()}`,
      content: activities,
      isUrgent,
      status: "pending",
      date: new Date().toLocaleDateString(),
      createdAt: new Date().toISOString(),
    };
    const prev = JSON.parse(localStorage.getItem("practicum_submissions") || "[]");
    localStorage.setItem("practicum_submissions", JSON.stringify([entry, ...prev]));
    setActivities("");
    setIsUrgent(false);
    setSubmitted(true);
    toast.success("Journal Submitted", { description: "Your entry has been sent to your adviser for review." });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[13px] text-[hsl(var(--muted-foreground))]">Practicum</p>
          <h1 className="text-[28px] font-bold tracking-tight mt-1">Daily Journal</h1>
        </div>
        <Badge variant="outline" className="text-[10px] font-semibold uppercase tracking-[0.18em] px-3 py-1.5 self-start sm:self-auto border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]">
          {today}
        </Badge>
      </div>

      {/* Success Banner */}
      {submitted && (
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-5 py-4 flex items-center gap-4">
          <div className="h-8 w-8 rounded-lg bg-[hsl(var(--foreground))] flex items-center justify-center shrink-0">
            <Send className="h-4 w-4 text-[hsl(var(--background))]" />
          </div>
          <div>
            <p className="text-[13px] font-semibold">Entry submitted successfully!</p>
            <p className="text-[12px] text-[hsl(var(--muted-foreground))] mt-0.5">Your adviser will review it shortly.</p>
          </div>
          <button onClick={() => setSubmitted(false)} className="ml-auto text-[12px] font-semibold text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] underline">
            Write another
          </button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        {/* Write Card */}
        <Card className="border border-[hsl(var(--border))] shadow-sm bg-[hsl(var(--card))] overflow-hidden">
          <CardHeader className="border-b border-[hsl(var(--border))]">
            <div className="flex items-center gap-4">
              <div className="h-9 w-9 rounded-lg bg-[hsl(var(--muted))] flex items-center justify-center">
                <FileEdit className="h-[18px] w-[18px] text-[hsl(var(--muted-foreground))]" />
              </div>
              <div>
                <CardTitle className="text-[15px]">New Entry</CardTitle>
                <CardDescription className="text-[13px]">What did you work on today?</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            <div className="space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[hsl(var(--muted-foreground))]">
                Activity Description
              </label>
              <Textarea
                className="min-h-[300px] bg-[hsl(var(--muted))] border-[hsl(var(--border))] text-[13px] leading-relaxed resize-none rounded-lg placeholder:text-[hsl(var(--muted-foreground))]"
                placeholder="Describe your tasks, what you learned, and any challenges you faced today…"
                value={activities}
                onChange={(e) => setActivities(e.target.value)}
              />
              <div className="flex justify-end">
                <span className="text-[11px] text-[hsl(var(--muted-foreground))]">{activities.length} characters</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-[hsl(var(--border))]">
              <button
                onClick={() => setIsUrgent(!isUrgent)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-[12px] font-semibold uppercase tracking-widest transition-all ${
                  isUrgent
                    ? "bg-[hsl(var(--foreground))] text-[hsl(var(--background))] border-[hsl(var(--foreground))]"
                    : "border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
                }`}
              >
                <AlertTriangle className="h-4 w-4" />
                {isUrgent ? "Marked High Priority" : "Mark as High Priority"}
              </button>

              <Button
                onClick={handleSubmit}
                className="h-10 px-7 bg-[hsl(var(--foreground))] hover:opacity-90 text-[hsl(var(--background))] font-semibold text-[12px] uppercase tracking-widest rounded-lg"
              >
                <Send className="mr-2 h-4 w-4" />
                Submit Entry
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="flex flex-col gap-6">
          <Card className="border border-[hsl(var(--border))] shadow-sm bg-[hsl(var(--card))]">
            <CardHeader>
              <CardTitle className="text-[15px]">Submission Info</CardTitle>
              <CardDescription className="text-[13px]">Details for this entry.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
              <div className="flex items-center justify-between rounded-lg border border-transparent px-3 py-3 bg-[hsl(var(--muted))]">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                  <span className="text-[13px] font-semibold">Date</span>
                </div>
                <span className="text-[12px] text-[hsl(var(--muted-foreground))]">{new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-transparent px-3 py-3 bg-[hsl(var(--muted))]">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                  <span className="text-[13px] font-semibold">Time</span>
                </div>
                <span className="text-[12px] text-[hsl(var(--muted-foreground))]">
                  {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-[hsl(var(--border))] shadow-sm bg-[hsl(var(--card))]">
            <CardHeader>
              <CardTitle className="text-[15px]">Voice Assistant</CardTitle>
              <CardDescription className="text-[13px]">Don&apos;t feel like typing?</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className={`w-full h-10 rounded-lg font-semibold text-[12px] uppercase tracking-widest border-[hsl(var(--border))] transition-all ${isRecording ? "animate-pulse" : ""}`}
                onClick={() => { setIsRecording(!isRecording); if (!isRecording) toast.info("Voice recognition active (Demo Mode)"); }}
              >
                <Mic className="mr-2 h-4 w-4" />
                {isRecording ? "Listening…" : "Start Dictation"}
              </Button>
            </CardContent>
          </Card>

          <div className="rounded-xl bg-[hsl(var(--foreground))] text-[hsl(var(--background))] p-6 space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] opacity-60">Last Advisor Comment</p>
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-[hsl(var(--background))]/20 flex items-center justify-center shrink-0">
                <span className="text-[12px] font-bold">A</span>
              </div>
              <div>
                <p className="text-[13px] leading-relaxed italic opacity-80">&quot;Please focus more on the technical implementation of your SQL queries in the next report.&quot;</p>
                <p className="text-[10px] font-semibold uppercase tracking-widest opacity-40 mt-2">Dr. Rodriguez · 2 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
