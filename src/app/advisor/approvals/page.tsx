"use client";

import { useState, useEffect, useRef } from "react";
import { getSession } from "@/lib/auth";
import AdvisorLayout from "@/components/AdvisorLayout";

interface Submission {
  id: string;
  type: string;
  studentName: string;
  studentId: string;
  title: string;
  status: "pending" | "approved" | "rejected" | "revision";
  submittedAt: string;
  isUrgent: boolean;
  content?: string;
  feedback?: string;
  comments?: Array<{ id: string; text: string; author: string; time: string; selectedText?: string }>;
}

export default function AdvisorApprovals() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [newComment, setNewComment] = useState("");
  const [selectedText, setSelectedText] = useState("");
  const [filter, setFilter] = useState("all");
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const s = getSession();
    if (!s || s.role !== "advisor") return;
    const subs: Submission[] = JSON.parse(localStorage.getItem("practicum_submissions") || "[]");
    setSubmissions(subs);
    if (subs.length > 0) setSelectedId(subs[0].id);
  }, []);

  const selectedSub = submissions.find(s => s.id === selectedId);

  const handleAction = (action: "approved" | "rejected" | "revision") => {
    if (!selectedId) return;
    const updated = submissions.map(s => s.id === selectedId ? { ...s, status: action, feedback } : s);
    setSubmissions(updated);
    localStorage.setItem("practicum_submissions", JSON.stringify(updated));
    setFeedback("");
  };

  const addComment = () => {
    if (!selectedId || (!newComment && !selectedText)) return;
    const updated = submissions.map(s => {
      if (s.id === selectedId) {
        const c = s.comments || [];
        return {
          ...s,
          comments: [...c, {
            id: Date.now().toString(),
            text: newComment,
            author: "Advisor",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            selectedText
          }]
        };
      }
      return s;
    });
    setSubmissions(updated);
    localStorage.setItem("practicum_submissions", JSON.stringify(updated));
    setNewComment("");
    setSelectedText("");
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      setSelectedText(selection.toString().trim());
    }
  };

  const filtered = submissions.filter(s => filter === "all" || s.status === filter);

  return (
    <AdvisorLayout activeNav="approvals">
      <div className="max-w-[1600px] mx-auto h-[calc(100vh-180px)] flex flex-col lg:flex-row gap-6">
        
        {/* Left: Submission Panel (Scrollable List) */}
        <div className="w-full lg:w-72 flex-shrink-0 flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-sm">Review Queue</h3>
            <select value={filter} onChange={e => setFilter(e.target.value)} className="text-[10px] bg-slate-50 dark:bg-slate-800 border-none rounded-lg font-bold outline-none">
              <option value="all">ALL</option>
              <option value="pending">PENDING</option>
              <option value="revision">REVISION</option>
            </select>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800/50">
            {filtered.map(sub => (
              <button 
                key={sub.id} 
                onClick={() => setSelectedId(sub.id)}
                className={`w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${selectedId === sub.id ? 'bg-blue-50 dark:bg-blue-900/20 ring-1 ring-inset ring-blue-100 dark:ring-blue-900/30' : ''}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">{sub.type}</span>
                  <span className={`w-2 h-2 rounded-full ${sub.status === 'approved' ? 'bg-green-500' : sub.status === 'pending' ? 'bg-amber-500' : 'bg-red-500'}`} />
                </div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100 line-clamp-1">{sub.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{sub.studentName}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Center: Document Viewer */}
        <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {selectedSub ? (
            <>
              {/* Toolbar */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-100">{selectedSub.title}</h4>
                  <p className="text-xs text-slate-500">Submitted by {selectedSub.studentName} on {new Date(selectedSub.submittedAt).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
                    <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  </button>
                  <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
                    <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4-4m0 0L8 8m4-4v12" /></svg>
                  </button>
                </div>
              </div>

              {/* Viewer Content */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/50 dark:bg-slate-950/20">
                <div 
                  ref={contentRef}
                  onMouseUp={handleTextSelection}
                  className="max-w-4xl mx-auto bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 min-h-[1000px] p-8 md:p-12 text-slate-800 dark:text-slate-200 font-serif leading-relaxed"
                >
                  <div className="mb-12 text-center">
                    <h1 className="text-2xl font-bold uppercase tracking-widest">{selectedSub.type}</h1>
                    <div className="w-24 h-1 bg-blue-600 mx-auto mt-4" />
                  </div>
                  
                  {selectedSub.content ? (
                    <div className="whitespace-pre-wrap selection:bg-blue-100 selection:text-blue-900">
                      {selectedSub.content}
                    </div>
                  ) : (
                    <div className="py-20 text-center text-slate-400 italic">
                      No text content available for this submission type.
                    </div>
                  )}
                </div>
              </div>

              {/* Action Bar */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col md:flex-row gap-4 items-center">
                <input 
                  type="text" 
                  value={feedback} 
                  onChange={e => setFeedback(e.target.value)} 
                  placeholder="Final feedback or decision notes..."
                  className="flex-1 w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border-none text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex gap-2 w-full md:w-auto">
                  <button onClick={() => handleAction("revision")} className="flex-1 md:flex-none px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-amber-600 transition-colors">Revision</button>
                  <button onClick={() => handleAction("approved")} className="flex-1 md:flex-none px-6 py-2 bg-green-600 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-green-700 transition-colors">Approve</button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400">Select a submission to review</div>
          )}
        </div>

        {/* Right: Comments System (Threads) */}
        <div className="w-full lg:w-72 flex-shrink-0 flex flex-col gap-6">
          <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm">Review Comments</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedSub?.comments && selectedSub.comments.length > 0 ? (
                selectedSub.comments.map(c => (
                  <div key={c.id} className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50 relative group">
                    {c.selectedText && (
                      <div className="mb-2 pl-2 border-l-2 border-blue-400 italic text-[10px] text-slate-500 line-clamp-2">
                        "{c.selectedText}"
                      </div>
                    )}
                    <p className="text-xs text-slate-800 dark:text-slate-200 font-medium">{c.text}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">{c.author}</span>
                      <span className="text-[10px] text-slate-400">{c.time}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                  <p className="text-xs text-slate-400">No comments yet. Highlight text to add specific feedback.</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800">
              {selectedText && (
                <div className="mb-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-between">
                  <p className="text-[10px] text-blue-700 dark:text-blue-300 font-medium truncate italic max-w-[180px]">"{selectedText}"</p>
                  <button onClick={() => setSelectedText("")} className="text-blue-500 hover:text-blue-700"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                </div>
              )}
              <div className="relative">
                <textarea 
                  value={newComment} 
                  onChange={e => setNewComment(e.target.value)} 
                  placeholder="Add a comment..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs outline-none focus:ring-2 focus:ring-blue-500 resize-none pr-10"
                />
                <button 
                  onClick={addComment}
                  className="absolute bottom-2 right-2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                </button>
              </div>
            </div>
          </div>

          {/* AI Feedback Assistant */}
          <div className="bg-indigo-600 rounded-2xl p-5 text-white shadow-lg">
            <h4 className="text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              AI Assistant
            </h4>
            <div className="space-y-3">
              <button className="w-full text-left p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
                <p className="text-[10px] font-bold mb-1">Suggest Feedback</p>
                <p className="text-[10px] opacity-80 leading-tight">Analyze document for missing requirements or common errors.</p>
              </button>
            </div>
          </div>
        </div>

      </div>
    </AdvisorLayout>
  );
}
