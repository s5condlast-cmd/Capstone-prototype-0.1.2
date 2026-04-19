"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import StudentLayout from "@/components/StudentLayout";
import { getSession } from "@/lib/auth";

export default function JournalPage() {
  const router = useRouter();
  const [activities, setActivities] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    const s = getSession();
    if (!s || s.role !== "student") router.push("/login");
  }, [router]);

  const handleSubmit = () => {
    if (!activities.trim()) {
      alert("Please add some content first.");
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
    
    const existingSubs = JSON.parse(localStorage.getItem("practicum_submissions") || "[]");
    localStorage.setItem("practicum_submissions", JSON.stringify([entry, ...existingSubs]));
    
    const existingJournals = JSON.parse(localStorage.getItem("practicum_journals") || "[]");
    localStorage.setItem("practicum_journals", JSON.stringify([entry, ...existingJournals]));
    
    setActivities("");
    setIsUrgent(false);
    alert("Journal submitted successfully!");
    router.push("/dashboard");
  };

  const handleRecord = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      alert("Microphone access would be requested here in a real app. (Demo Mode)");
    }
  };

  return (
    <StudentLayout activeNav="journal">
      <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row gap-6 md:gap-8 items-start">
        
        {/* Left Form Area */}
        <div className="flex-1 w-full">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Journal Entry</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">What happened during your OJT?</label>
                <textarea 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-y" 
                  rows={12} 
                  placeholder="Describe your activities for the day... Or use voice input" 
                  value={activities} 
                  onChange={(e) => setActivities(e.target.value)} 
                />
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Mark as Urgent</span>
                  <button 
                    onClick={() => setIsUrgent(!isUrgent)} 
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 ${isUrgent ? 'bg-red-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                  >
                    <span className={`inline-block h-5 w-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${isUrgent ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                <button 
                  onClick={handleSubmit} 
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Submit Journal
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar Widgets */}
        <div className="w-full lg:w-72 xl:w-80 flex-shrink-0 space-y-6 lg:sticky lg:top-0">
          
          {/* Box 1: Document Info */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Entry Details</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800/50">
                <span className="text-slate-500">Date</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800/50">
                <span className="text-slate-500">Time</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-slate-500">Status</span>
                <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Draft</span>
              </div>
            </div>
          </div>

          {/* Box 2: Voice Input */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-3">Voice Input</h3>
            <button 
              onClick={handleRecord}
              className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                isRecording 
                  ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 animate-pulse' 
                  : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:hover:bg-indigo-900/40'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              {isRecording ? "Stop Recording..." : "Tap to Speak"}
            </button>
            <p className="text-xs text-slate-500 mt-3 text-center">AI will automatically transcribe your speech to text.</p>
          </div>

          {/* Box 3: Comments from Advisor */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Advisor Comments</h3>
            </div>
            
            <div className="flex-1 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <span className="text-xs font-bold text-white">A</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Advisor</span>
                    <span className="text-[10px] font-medium text-slate-400">10:30 AM</span>
                  </div>
                  <div className="p-3 rounded-2xl rounded-tl-none bg-slate-50 border border-slate-100 dark:bg-slate-800 dark:border-slate-700/50">
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      Your journal shows good progress. Keep it up!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </StudentLayout>
  );
}
