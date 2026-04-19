"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import StudentLayout from "@/components/StudentLayout";
import { getSession } from "@/lib/auth";

export default function MOAPage() {
  const router = useRouter();
  const [isUrgent, setIsUrgent] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    const s = getSession();
    if (!s || s.role !== "student") router.push("/login");
  }, [router]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedFile(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!uploadedFile) {
      alert("Please upload a file first.");
      return;
    }
    const s = getSession();
    const entry = {
      id: Date.now().toString(),
      type: "moa",
      studentId: s?.studentId || "",
      title: `MOA Submission - ${fileName}`,
      content: "File uploaded successfully.",
      fileData: uploadedFile,
      fileName,
      isUrgent,
      status: "pending",
      date: new Date().toLocaleDateString(),
      createdAt: new Date().toISOString(),
    };
    
    const existingSubs = JSON.parse(localStorage.getItem("practicum_submissions") || "[]");
    localStorage.setItem("practicum_submissions", JSON.stringify([entry, ...existingSubs]));
    
    const existingDocs = JSON.parse(localStorage.getItem("practicum_documents") || "[]");
    localStorage.setItem("practicum_documents", JSON.stringify([entry, ...existingDocs]));
    
    setUploadedFile(null);
    setFileName("");
    setIsUrgent(false);
    alert("MOA submitted successfully!");
    router.push("/dashboard");
  };

  return (
    <StudentLayout activeNav="moa">
      <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row gap-6 md:gap-8 items-start">
        
        <div className="flex-1 w-full">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Upload Memorandum of Agreement</h2>
            </div>
            
            <div className="space-y-6">
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-10 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer relative">
                <input 
                  type="file" 
                  accept=".pdf,.doc,.docx,.jpg,.png" 
                  onChange={handleFileUpload} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">Click to upload or drag and drop</h3>
                <p className="text-xs text-slate-500">PDF, DOC, DOCX, PNG, JPG (Max 5MB)</p>
                
                {fileName && (
                  <div className="mt-4 px-4 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg text-sm font-medium border border-purple-200 dark:border-purple-800/50 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    {fileName}
                  </div>
                )}
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
                  className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm ${
                    uploadedFile 
                      ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                  }`}
                  disabled={!uploadedFile}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Submit Document
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-72 xl:w-80 flex-shrink-0 space-y-6 lg:sticky lg:top-0">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">MOA Guidelines</h3>
            </div>
            <div className="space-y-3 text-sm">
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-xs">
                Ensure that all signatures (Student, Company Rep, and School Coord) are present before submitting your MOA.
              </p>
              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800/50">
                <span className="text-slate-500">Date</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-slate-500">Status</span>
                <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Not Submitted</span>
              </div>
            </div>
          </div>

          {/* Message from Advisor (Template Download) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Message from Advisor</h3>
            </div>
            
            <div className="flex-1 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <span className="text-xs font-bold text-white">A</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Demo Advisor</span>
                    <span className="text-[10px] font-medium text-slate-400">Just now</span>
                  </div>
                  <div className="p-3 rounded-2xl rounded-tl-none bg-slate-50 border border-slate-100 dark:bg-slate-800 dark:border-slate-700/50 shadow-sm">
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                      Please use this official MOA template. Make sure all parties sign it before you upload it here.
                    </p>
                    <button className="w-full py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:hover:bg-purple-900/50 border border-purple-200 dark:border-purple-800/50">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      MOA_Template.docx
                    </button>
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
