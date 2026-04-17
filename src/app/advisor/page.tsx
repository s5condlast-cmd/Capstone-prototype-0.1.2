"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession, logout, User } from "@/lib/auth";
import { useTheme } from "@/lib/ThemeContext";

interface Submission {
  id: string;
  type: "journal" | "document" | "dtr" | "moa" | "evaluation" | "resume";
  studentName: string;
  studentId: string;
  title: string;
  status: "pending" | "approved" | "rejected" | "revision";
  submittedAt: string;
  isUrgent: boolean;
  content?: string;
  feedback?: string;
}

interface StudentSubmission {
  id: string;
  type: "moa" | "evaluation" | "dtr" | "resume";
  studentName: string;
  studentId: string;
  title: string;
  content?: string;
  status: "pending" | "approved" | "rejected" | "revision";
  submittedAt: string;
  isScanned?: boolean;
  fileName?: string;
  feedback?: string;
}

export default function AdvisorPage() {
  const router = useRouter();
  const [session, setSession] = useState<User | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [feedback, setFeedback] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [editorContent, setEditorContent] = useState("");
  const [selectedWord, setSelectedWord] = useState("");
  const [showWordEditor, setShowWordEditor] = useState(false);
  const [customWordValue, setCustomWordValue] = useState("");
  const [studentSubmissions, setStudentSubmissions] = useState<StudentSubmission[]>([]);
  const [expandedBoxes, setExpandedBoxes] = useState<Record<string, boolean>>({
    moa: false,
    evaluation: false,
    dtr: false,
    resume: false,
    revisions: false,
  });
  const [revisionComments, setRevisionComments] = useState<{id: string; startIndex: number; endIndex: number; text: string; comment: string}[]>([]);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [newComment, setNewComment] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [highlightedCommentId, setHighlightedCommentId] = useState<string | null>(null);
  const { darkMode, setDarkMode } = useTheme();

  const students = [
    { id: "1", studentId: "student1", name: "Demo Student 1", company: "Tech Corp" },
    { id: "2", studentId: "student2", name: "Demo Student 2", company: "Business Inc" },
    { id: "3", studentId: "student3", name: "Demo Student 3", company: "Local Co" },
  ];

  useEffect(() => {
    const currentSession = getSession();
    if (!currentSession || currentSession.role !== "advisor") {
      router.push("/login");
      return;
    }
    setSession(currentSession);

    const storedSubmissions = localStorage.getItem("practicum_submissions");
    let subs: Submission[] = storedSubmissions ? JSON.parse(storedSubmissions) : [];
    if (subs.length === 0) {
      subs = [
        { id: "1", type: "journal", studentName: "Demo Student 1", studentId: "student1", title: "Week 1 Journal Entry", status: "pending", submittedAt: "2026-04-13T10:30:00Z", isUrgent: true, content: "Today I learned about the company workflow..." },
        { id: "2", type: "document", studentName: "Demo Student 2", studentId: "student2", title: "Endorsement Letter", status: "pending", submittedAt: "2026-04-12T14:00:00Z", isUrgent: false },
        { id: "3", type: "dtr", studentName: "Demo Student 1", studentId: "student1", title: "DTR Week 2", status: "approved", submittedAt: "2026-04-10T09:00:00Z", isUrgent: false },
        { id: "4", type: "journal", studentName: "Demo Student 3", studentId: "student3", title: "Week 2 Journal", status: "revision", submittedAt: "2026-04-11T16:00:00Z", isUrgent: false, content: "I was assigned to the QA team...", feedback: "Please add more details" },
      ];
    }
    setSubmissions(subs);

    const sampleStudentSubmissions: StudentSubmission[] = [
      { id: "1", type: "moa", studentName: "Demo Student 1", studentId: "STUDENT-001", title: "MOA - Tech Corp", status: "pending", submittedAt: "2026-04-14T10:30:00Z", content: "MEMORANDUM OF AGREEMENT\n\nThis Memorandum of Agreement is made and entered into between Tech Corp located at 123 Tech Street and Demo Student 1 of University of Makati for the purpose of 6 months practicum.\n\nThe Company agrees to provide training and supervision to the Student during the practicum period of 6 months.\n\nThe Company shall evaluate the Student's performance and submit an Evaluation Form to the school monthly." },
      { id: "2", type: "moa", studentName: "Demo Student 2", studentId: "STUDENT-002", title: "MOA - Business Inc", status: "approved", submittedAt: "2026-04-13T14:00:00Z", content: "MEMORANDUM OF AGREEMENT\n\nThis Memorandum of Agreement is made and entered into between Business Inc located at 456 Business Ave and Demo Student 2 of Polytechnic University for the purpose of 3 months.\n\nThe Company agrees to provide training and supervision." },
      { id: "3", type: "evaluation", studentName: "Demo Student 3", studentId: "STUDENT-003", title: "Evaluation Form - Week 4", status: "pending", submittedAt: "2026-04-12T09:00:00Z", content: "STUDENT EVALUATION FORM\n\nStudent Name: Demo Student 3\nCompany: Local Co\nEvaluation Period: Week 4\n\nPerformance Areas:\n1. Technical Skills: Good\n2. Communication: Excellent\n3. Work Ethic: Good\n\nOverall Rating: Good" },
      { id: "4", type: "evaluation", studentName: "Demo Student 1", studentId: "STUDENT-001", title: "Evaluation Form - Week 2", status: "revision", submittedAt: "2026-04-11T16:00:00Z", feedback: "Please provide more details on technical skills", content: "STUDENT EVALUATION FORM\n\nStudent Name: Demo Student 1\nCompany: Tech Corp\nEvaluation Period: Week 2\n\nPerformance Areas:\n1. Technical Skills: -\n2. Communication: Good\n\nOverall Rating: -" },
      { id: "5", type: "dtr", studentName: "Demo Student 2", studentId: "STUDENT-002", title: "DTR Week 3", status: "approved", submittedAt: "2026-04-10T11:00:00Z", content: "DAILY TIME RECORD\n\nStudent: Demo Student 2\nDate: April 10, 2026\n\nTime In: 8:00 AM\nTime Out: 5:00 PM\nTotal Hours: 8 hours\n\nSignature: Approved" },
      { id: "6", type: "dtr", studentName: "Demo Student 3", studentId: "STUDENT-003", title: "DTR Week 2", status: "pending", submittedAt: "2026-04-11T08:30:00Z", content: "DAILY TIME RECORD\n\nStudent: Demo Student 3\nDate: April 11, 2026\n\nTime In: 9:00 AM\nTime Out: 6:00 PM\nTotal Hours: 8 hours" },
      { id: "7", type: "resume", studentName: "Demo Student 1", studentId: "STUDENT-001", title: "Resume - Demo Student 1", status: "pending", submittedAt: "2026-04-14T12:00:00Z", content: "RESUME\n\nName: Demo Student 1\nEmail: student1@practicum.edu\n\nEducation: Bachelor of Science in Information Technology\nExperience: Software Development Intern at Tech Corp\nSkills: JavaScript, Python, React, Node.js" },
      { id: "8", type: "resume", studentName: "Demo Student 2", studentId: "STUDENT-002", title: "Resume - Demo Student 2", status: "approved", submittedAt: "2026-04-13T15:00:00Z", content: "RESUME\n\nName: Demo Student 2\nEmail: student2@practicum.edu\n\nEducation: BS in Computer Science\nExperience: Web Developer at Business Inc\nSkills: HTML, CSS, React, SQL" },
    ];
    setStudentSubmissions(sampleStudentSubmissions);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleAction = (submissionId: string, action: "approved" | "rejected" | "revision") => {
    const updated = submissions.map(s => s.id === submissionId ? { ...s, status: action, feedback: action === "revision" ? feedback : s.feedback } : s);
    setSubmissions(updated);
    localStorage.setItem("practicum_submissions", JSON.stringify(updated));
    setSelectedSubmission(null);
    setFeedback("");
  };

  const filteredSubmissions = submissions.filter(s => filter === "all" || s.status === filter);
  const pendingCount = submissions.filter(s => s.status === "pending").length;
  const approvedCount = submissions.filter(s => s.status === "approved").length;
  const revisionCount = submissions.filter(s => s.status === "revision").length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return { bg: "#DCFCE7", text: "#16A34A" };
      case "rejected": return { bg: "#FEE2E2", text: "#DC2626" };
      case "revision": return { bg: "#FEF3C7", text: "#D97706" };
      default: return { bg: "#F1F5F9", text: "#64748B" };
    }
  };

  const wordRecommendations: Record<string, string[]> = {
    "Company": ["Tech Corp", "Business Inc", "Local Co", "Global Solutions"],
    "Student": ["Demo Student 1", "Demo Student 2", "Demo Student 3", "Demo Student 4"],
    "School": ["University of Makati", "Polytechnic University", "State University"],
    "Date": ["April 2026", "May 2026", "June 2026", "July 2026"],
    "Duration": ["3 months", "6 months", "1 semester", "120 hours", "240 hours"],
    "Evaluation Form": ["Performance Rating", "Skills Assessment", "Monthly Report"],
    "Signature": ["Approved", "Confirmed", "Signed"],
    "Overall Rating": ["Excellent", "Good", "Satisfactory", "Needs Improvement"],
    "Performance": ["Excellent", "Good", "Satisfactory", "Needs Improvement"],
    "Name": ["Demo Student 1", "Demo Student 2", "Demo Student 3"],
    "Email": ["john@email.com", "maria@email.com", "pedro@email.com"],
    "Skills": ["JavaScript", "Python", "React", "Node.js", "HTML", "CSS"],
  };

  const toggleBox = (box: string) => {
    setExpandedBoxes(prev => ({ ...prev, [box]: !prev[box] }));
  };

  const handleWordClick = (word: string) => {
    setSelectedWord(word);
    setCustomWordValue("");
    setShowWordEditor(true);
  };

  const handleWordReplace = () => {
    const newContent = editorContent.replace(new RegExp(`\\b${selectedWord}\\b`, 'g'), customWordValue || selectedWord);
    setEditorContent(newContent);
    setShowWordEditor(false);
    setSelectedWord("");
    setCustomWordValue("");
  };

  const handleWordSelectFromList = (value: string) => {
    const newContent = editorContent.replace(new RegExp(`\\b${selectedWord}\\b`, 'g'), value);
    setEditorContent(newContent);
    setShowWordEditor(false);
    setSelectedWord("");
    setCustomWordValue("");
  };

  const loadStudentSubmission = (submission: StudentSubmission) => {
    setEditorContent(submission.content || "");
    setRevisionComments([]);
  };

  const getDocumentCount = (type: string) => {
    return studentSubmissions.filter(s => s.type === type && s.status === "pending").length;
  };

  const getRevisionCount = () => {
    return studentSubmissions.filter(s => s.status === "revision").length;
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      const selectedText = selection.toString().trim();
      setSelectedText(selectedText);
      setNewComment("");
      setShowCommentModal(true);
    }
  };

  const addRevisionComment = () => {
    if (selectedText && newComment.trim()) {
      const startIndex = editorContent.indexOf(selectedText);
      const newCommentObj = {
        id: Date.now().toString(),
        startIndex,
        endIndex: startIndex + selectedText.length,
        text: selectedText,
        comment: newComment.trim(),
      };
      setRevisionComments([...revisionComments, newCommentObj]);
      setShowCommentModal(false);
      setSelectedText("");
      setNewComment("");
    }
  };

  const deleteRevisionComment = (id: string) => {
    setRevisionComments(revisionComments.filter(c => c.id !== id));
  };

  const startVoiceInput = () => {
    if (typeof window !== 'undefined' && (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";
      
      recognition.onstart = () => {
        setIsListening(true);
      };
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setCustomWordValue(prev => prev + " " + transcript);
      };
      
      recognition.onerror = () => {
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      (recognition as any).start();
    }
  };

  const stopVoiceInput = () => {
    setIsListening(false);
  };

  const renderContentWithHighlights = () => {
    if (!editorContent) return null;
    
    const parts = editorContent.split(/(\b(?:Company|Student|Practicum Duration|School|Date|Evaluation Form|Duration|Address|Purpose|Terms|Responsibilities|Student Name|Time In|Time Out|Total Hours|Signature|Overall Rating|Performance|Skills|Comments|Evaluator|Company Name|Supervisor|Position|Name|Email)\b)/g);
    
    return parts.map((part, index) => {
      const commentForWord = revisionComments.find(c => c.text.toLowerCase() === part.toLowerCase());
      const isRecommended = wordRecommendations[part];
      
      if (commentForWord) {
        return (
          <span
            key={index}
            onClick={() => setHighlightedCommentId(highlightedCommentId === commentForWord.id ? null : commentForWord.id)}
            className="cursor-pointer px-1 rounded"
            style={{ backgroundColor: "#FEF3C7", color: "#92400E" }}
          >
            {part}
          </span>
        );
      }
      
      if (isRecommended) {
        return (
          <span 
            key={index}
            onClick={() => handleWordClick(part)}
            className="cursor-pointer font-medium underline decoration-dotted"
            style={{ color: "#00529B", textDecorationStyle: "dotted" }}
          >
            {part}
          </span>
        );
      }
      
      return part;
    });
  };

  if (!session) return null;

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: darkMode ? "#1E293B" : "#F8FAFC" }}>
      <aside className="w-60 flex-shrink-0 flex flex-col" style={{ backgroundColor: darkMode ? "#1E293B" : "#FFFFFF", borderRight: darkMode ? "1px solid #475569" : "1px solid #E2E8F0" }}>
        <div className="p-6 border-b" style={{ borderColor: darkMode ? "#475569" : "#E2E8F0" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00529B 0%, #0073C7 100%)' }}>
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            </div>
            <div>
              <h1 className="font-bold text-sm" style={{ color: darkMode ? "#F8FAFC" : "#1E293B" }}>Practicum</h1>
              <p className="text-xs" style={{ color: darkMode ? "#94A3B8" : "#64748B" }}>System</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            <li className="px-4 py-2 text-xs font-bold" style={{ color: "#94A3B8" }}>MAIN</li>
            <li><button onClick={() => setActiveTab("dashboard")} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl" style={{ backgroundColor: activeTab === "dashboard" ? "#00529B" : "transparent", color: activeTab === "dashboard" ? "#FFFFFF" : "#64748B" }}><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>Dashboard</button></li>
            <li><button onClick={() => setActiveTab("students")} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl" style={{ backgroundColor: activeTab === "students" ? "#00529B" : "transparent", color: activeTab === "students" ? "#FFFFFF" : "#64748B" }}><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>Students</button></li>
            <li><button onClick={() => setActiveTab("documents")} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl" style={{ backgroundColor: activeTab === "documents" ? "#00529B" : "transparent", color: activeTab === "documents" ? "#FFFFFF" : "#64748B" }}><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>Documents</button></li>
            <li><button onClick={() => setActiveTab("approvals")} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl" style={{ backgroundColor: activeTab === "approvals" ? "#00529B" : "transparent", color: activeTab === "approvals" ? "#FFFFFF" : "#64748B" }}><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>Approvals</button></li>
            <li className="px-4 py-2 text-xs font-bold mt-4" style={{ color: "#94A3B8" }}>REPORTS</li>
            <li><button onClick={() => setActiveTab("reports")} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl" style={{ backgroundColor: activeTab === "reports" ? "#00529B" : "transparent", color: activeTab === "reports" ? "#FFFFFF" : "#64748B" }}><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>DTR & Reports</button></li>
            <li><button onClick={() => setActiveTab("requirements")} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl" style={{ backgroundColor: activeTab === "requirements" ? "#00529B" : "transparent", color: activeTab === "requirements" ? "#FFFFFF" : "#64748B" }}><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>Requirements</button></li>
            <li className="px-4 py-2 text-xs font-bold mt-4" style={{ color: "#94A3B8" }}>SYSTEM</li>
            <li><button onClick={() => setActiveTab("notifications")} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl" style={{ backgroundColor: activeTab === "notifications" ? "#00529B" : "transparent", color: activeTab === "notifications" ? "#FFFFFF" : "#64748B" }}><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>Notifications</button></li>
            <li><button onClick={() => setActiveTab("messages")} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl" style={{ backgroundColor: activeTab === "messages" ? "#00529B" : "transparent", color: activeTab === "messages" ? "#FFFFFF" : "#64748B" }}><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.358 16.11 3 15.331 3 14c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>Messages</button></li>
          </ul>
        </nav>

        <div className="p-4 border-t" style={{ borderColor: darkMode ? "#475569" : "#E2E8F0" }}>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium" style={{ color: "#DC2626" }}>Logout</button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <header className="px-8 py-4 flex items-center justify-between" style={{ backgroundColor: darkMode ? "#1E293B" : "#FFFFFF", borderBottom: darkMode ? "1px solid #475569" : "1px solid #E2E8F0" }}>
          <h2 className="text-lg font-bold" style={{ color: darkMode ? "#F8FAFC" : "#1E293B" }}>
            {activeTab === "dashboard" && "Advisor Dashboard"}
            {activeTab === "students" && "My Students"}
            {activeTab === "documents" && "Documents"}
            {activeTab === "approvals" && "Pending Approvals"}
            {activeTab === "reports" && "DTR & Reports"}
            {activeTab === "requirements" && "Requirements"}
            {activeTab === "notifications" && "Notifications"}
            {activeTab === "messages" && "Messages"}
          </h2>
          <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-3 p-2 -m-2 rounded-xl">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: darkMode ? "#334155" : "#F0F7FF" }}>
              <span className="font-medium text-sm" style={{ color: "#00529B" }}>{session.name.charAt(0)}</span>
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: darkMode ? "#F8FAFC" : "#1E293B" }}>{session.name}</p>
              <p className="text-xs" style={{ color: darkMode ? "#94A3B8" : "#64748B" }}>Advisor</p>
            </div>
          </button>
        </header>

        {showUserMenu && (
          <div className="absolute right-8 top-20 w-64 rounded-2xl overflow-hidden z-50" style={{ backgroundColor: darkMode ? "#334155" : "#FFFFFF", border: darkMode ? "1px solid #475569" : "1px solid #E2E8F0", boxShadow: '0 10px 40px -10px rgba(0,0,0,0.15)' }}>
            <div className="px-4 py-3 border-b" style={{ borderColor: darkMode ? "#475569" : "#E2E8F0" }}>
              <p className="font-semibold text-sm" style={{ color: darkMode ? "#F8FAFC" : "#1E293B" }}>{session.name}</p>
              <p className="text-xs" style={{ color: darkMode ? "#94A3B8" : "#64748B" }}>ID: {session.studentId}</p>
            </div>
            <button onClick={() => setDarkMode(!darkMode)} className="w-full flex items-center justify-between px-4 py-3" style={{ backgroundColor: darkMode ? "#1E293B" : "#F8FAFC" }}>
              <span className="text-sm" style={{ color: darkMode ? "#F8FAFC" : "#1E293B" }}>Dark Mode</span>
              <div className={`w-10 h-5 rounded-full ${darkMode ? 'bg-blue-500' : 'bg-gray-300'}`}>
                <div className={`w-4 h-4 rounded-full bg-white ${darkMode ? 'left-5' : 'left-0.5'} relative top-0.5`} />
              </div>
            </button>
            <button onClick={() => router.push("/profile")} className="w-full flex items-center gap-3 px-4 py-3 border-t" style={{ borderColor: darkMode ? "#475569" : "#E2E8F0", backgroundColor: darkMode ? "#334155" : "#FFFFFF" }}>
              <span className="text-sm" style={{ color: darkMode ? "#F8FAFC" : "#1E293B" }}>Profile</span>
            </button>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 border-t" style={{ borderColor: darkMode ? "#475569" : "#E2E8F0", backgroundColor: darkMode ? "#334155" : "#FFFFFF" }}>
              <span className="text-sm" style={{ color: "#DC2626" }}>Logout</span>
            </button>
          </div>
        )}

        <div className="p-8">
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold" style={{ color: darkMode ? "#F8FAFC" : "#1E293B" }}>Welcome back, {session.name.split(' ')[0]}!</h3>
                  <p className="text-sm" style={{ color: darkMode ? "#94A3B8" : "#64748B" }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: "#DCFCE7", color: "#16A34A" }}>{pendingCount} Pending</span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: "#FEF2F2", color: "#DC2626" }}>{submissions.filter(s => s.isUrgent).length} Urgent</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <button onClick={() => setActiveTab("students")} className="p-4 rounded-xl text-left hover:opacity-80" style={{ backgroundColor: "#FFFFFF", boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#DBEAFE" }}>
                      <svg className="w-5 h-5" style={{ color: "#00529B" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    </div>
                    <div>
                      <p className="text-xs" style={{ color: "#64748B" }}>My Students</p>
                      <p className="text-2xl font-bold" style={{ color: "#00529B" }}>{students.length}</p>
                    </div>
                  </div>
                </button>
                <button onClick={() => setActiveTab("approvals")} className="p-4 rounded-xl text-left hover:opacity-80" style={{ backgroundColor: "#FFFFFF", boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#FEF3C7" }}>
                      <svg className="w-5 h-5" style={{ color: "#D97706" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                      <p className="text-xs" style={{ color: "#64748B" }}>Pending</p>
                      <p className="text-2xl font-bold" style={{ color: "#D97706" }}>{pendingCount}</p>
                    </div>
                  </div>
                </button>
                <button onClick={() => setActiveTab("documents")} className="p-4 rounded-xl text-left hover:opacity-80" style={{ backgroundColor: "#FFFFFF", boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#DCFCE7" }}>
                      <svg className="w-5 h-5" style={{ color: "#16A34A" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                      <p className="text-xs" style={{ color: "#64748B" }}>Approved</p>
                      <p className="text-2xl font-bold" style={{ color: "#16A34A" }}>{approvedCount}</p>
                    </div>
                  </div>
                </button>
                <button onClick={() => setActiveTab("approvals")} className="p-4 rounded-xl text-left hover:opacity-80" style={{ backgroundColor: "#FFFFFF", boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#FEE2E2" }}>
                      <svg className="w-5 h-5" style={{ color: "#DC2626" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    </div>
                    <div>
                      <p className="text-xs" style={{ color: "#64748B" }}>Revision</p>
                      <p className="text-2xl font-bold" style={{ color: "#DC2626" }}>{revisionCount}</p>
                    </div>
                  </div>
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <button onClick={() => setActiveTab("documents")} className="p-3 rounded-xl text-center hover:opacity-80 flex items-center justify-center gap-2" style={{ backgroundColor: "#F0F7FF" }}>
                  <svg className="w-4 h-4" style={{ color: "#00529B" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  <p className="text-sm font-medium" style={{ color: "#00529B" }}>Documents</p>
                </button>
                <button onClick={() => setActiveTab("reports")} className="p-3 rounded-xl text-center hover:opacity-80 flex items-center justify-center gap-2" style={{ backgroundColor: "#F0F7FF" }}>
                  <svg className="w-4 h-4" style={{ color: "#00529B" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  <p className="text-sm font-medium" style={{ color: "#00529B" }}>DTR</p>
                </button>
                <button onClick={() => setActiveTab("requirements")} className="p-3 rounded-xl text-center hover:opacity-80 flex items-center justify-center gap-2" style={{ backgroundColor: "#F0F7FF" }}>
                  <svg className="w-4 h-4" style={{ color: "#00529B" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                  <p className="text-sm font-medium" style={{ color: "#00529B" }}>Requirements</p>
                </button>
                <button onClick={() => setActiveTab("notifications")} className="p-3 rounded-xl text-center hover:opacity-80 flex items-center justify-center gap-2" style={{ backgroundColor: "#F0F7FF" }}>
                  <svg className="w-4 h-4" style={{ color: "#00529B" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                  <p className="text-sm font-medium" style={{ color: "#00529B" }}>Alerts</p>
                </button>
                <button onClick={() => setActiveTab("messages")} className="p-3 rounded-xl text-center hover:opacity-80 flex items-center justify-center gap-2" style={{ backgroundColor: "#F0F7FF" }}>
                  <svg className="w-4 h-4" style={{ color: "#00529B" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.358 16.11 3 15.331 3 14c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                  <p className="text-sm font-medium" style={{ color: "#00529B" }}>Messages</p>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl" style={{ backgroundColor: "#FFFFFF", boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}>
                  <h4 className="text-sm font-bold mb-3" style={{ color: "#1E293B" }}>Recent Activity</h4>
                  <div className="space-y-3">
                    {submissions.slice(0, 3).map((sub) => (
                      <div key={sub.id} className="flex items-center gap-3 p-2 rounded-xl" style={{ backgroundColor: "#F8FAFC" }}>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: sub.status === 'approved' ? '#DCFCE7' : sub.status === 'pending' ? '#FEF3C7' : '#FEE2E2' }}>
                          {sub.status === 'approved' ? <svg className="w-4 h-4" style={{ color: "#16A34A" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> : sub.status === 'pending' ? <svg className="w-4 h-4" style={{ color: "#D97706" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> : <svg className="w-4 h-4" style={{ color: "#DC2626" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" /></svg>}
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-medium" style={{ color: "#1E293B" }}>{sub.title}</p>
                          <p className="text-xs" style={{ color: "#64748B" }}>{sub.studentName} • {new Date(sub.submittedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-4 rounded-2xl" style={{ backgroundColor: "#FFFFFF", boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}>
                  <h4 className="text-sm font-bold mb-3" style={{ color: "#1E293B" }}>Quick Stats</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-2 rounded-xl" style={{ backgroundColor: "#F8FAFC" }}>
                      <span className="text-xs" style={{ color: "#64748B" }}>Total Submissions</span>
                      <span className="text-sm font-bold" style={{ color: "#00529B" }}>{submissions.length}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-xl" style={{ backgroundColor: "#F8FAFC" }}>
                      <span className="text-xs" style={{ color: "#64748B" }}>This Week</span>
                      <span className="text-sm font-bold" style={{ color: "#00529B" }}>{submissions.filter(s => new Date(s.submittedAt) > new Date(Date.now() - 7*24*60*60*1000)).length}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-xl" style={{ backgroundColor: "#F8FAFC" }}>
                      <span className="text-xs" style={{ color: "#64748B" }}>Urgent Items</span>
                      <span className="text-sm font-bold" style={{ color: "#DC2626" }}>{submissions.filter(s => s.isUrgent).length}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-xl" style={{ backgroundColor: "#F8FAFC" }}>
                      <span className="text-xs" style={{ color: "#64748B" }}>Completion Rate</span>
                      <span className="text-sm font-bold" style={{ color: "#16A34A" }}>{submissions.length > 0 ? Math.round((approvedCount / submissions.length) * 100) : 0}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "students" && (
            <div className="space-y-4">
              <input type="text" placeholder="Search student..." className="w-full px-4 py-2 rounded-xl border" style={{ borderColor: "#E2E8F0", backgroundColor: "#FFFFFF" }} />
              {students.map((s) => (<div key={s.id} className="p-4 rounded-xl" style={{ backgroundColor: "#FFFFFF" }}><p className="font-medium">{s.name}</p><p className="text-sm" style={{ color: "#64748B" }}>{s.studentId} • {s.company}</p></div>))}
            </div>
          )}

          {activeTab === "reports" && (
            <div className="p-6 rounded-2xl" style={{ backgroundColor: "#FFFFFF" }}>
              <h3 className="text-lg font-semibold mb-4">DTR & Reports</h3>
              <p className="text-sm" style={{ color: "#64748B" }}>View and validate student Daily Time Records.</p>
            </div>
          )}

          {activeTab === "requirements" && (
            <div className="p-6 rounded-2xl" style={{ backgroundColor: "#FFFFFF" }}>
              <h3 className="text-lg font-semibold mb-4">Requirements Tracker</h3>
              <p className="text-sm" style={{ color: "#64748B" }}>Track student requirements status.</p>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="p-6 rounded-2xl" style={{ backgroundColor: "#FFFFFF" }}>
              <h3 className="text-lg font-semibold mb-4">Notifications</h3>
              <div className="space-y-3">
                <div className="p-3 rounded-xl" style={{ backgroundColor: "#FEF2F2" }}><p className="text-sm" style={{ color: "#DC2626" }}>Incomplete submission detected</p></div>
                <div className="p-3 rounded-xl" style={{ backgroundColor: "#FEF3C7" }}><p className="text-sm" style={{ color: "#92400E" }}>Missing required hours</p></div>
              </div>
            </div>
          )}

          {activeTab === "messages" && (
            <div className="p-6 rounded-2xl" style={{ backgroundColor: "#FFFFFF" }}>
              <h3 className="text-lg font-semibold mb-4">Messages</h3>
              <p className="text-sm" style={{ color: "#64748B" }}>Communication with students.</p>
            </div>
          )}

          {(activeTab === "documents" || activeTab === "approvals") && (
            <div className="flex gap-6">
              {/* Left Side - Document Viewer */}
              <div className="flex-1 space-y-6">
                <div className="p-6 rounded-2xl" style={{ backgroundColor: "#FFFFFF", boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold" style={{ color: "#1E293B" }}>Document Viewer</h3>
                    <div className="flex items-center gap-2">
                      {editorContent && (
                        <button 
                          onClick={() => {
                            const selection = window.getSelection();
                            if (selection && selection.toString().trim().length > 0) {
                              setSelectedText(selection.toString().trim());
                              setNewComment("");
                              setShowCommentModal(true);
                            } else {
                              alert("Please select some text in the document first.");
                            }
                          }}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
                          style={{ backgroundColor: "#FEF3C7", color: "#92400E" }}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                          </svg>
                          Add Revision Comment
                        </button>
                      )}
                      <button 
                        onClick={() => document.getElementById('advisor-file-upload')?.click()}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
                        style={{ backgroundColor: "#00529B", color: "white" }}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Upload
                      </button>
                      <input 
                        type="file" 
                        id="advisor-file-upload" 
                        className="hidden" 
                        accept=".pdf,.doc,.docx,.txt"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              setEditorContent(`[Uploaded: ${file.name}]\n\n${event.target?.result || "File content loaded. You can edit here."}`);
                              setRevisionComments([]);
                            };
                            reader.readAsText(file);
                          }
                        }}
                      />
                    </div>
                  </div>
                  
                  {editorContent ? (
                    <div className="relative">
                      {editMode ? (
                        <textarea
                          value={editorContent}
                          onChange={(e) => setEditorContent(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border text-sm"
                          style={{ 
                            borderColor: "#E2E8F0", 
                            minHeight: "350px",
                            backgroundColor: "#F8FAFC"
                          }}
                          placeholder="Type your document content here..."
                        />
                      ) : (
                        <div 
                          className="w-full px-4 py-3 rounded-xl border text-sm whitespace-pre-wrap"
                          style={{ 
                            borderColor: "#E2E8F0", 
                            minHeight: "350px",
                            backgroundColor: "#F8FAFC"
                          }}
                          onMouseUp={handleTextSelection}
                        >
                          {renderContentWithHighlights()}
                        </div>
                      )}
                      <button
                        onClick={() => setEditMode(!editMode)}
                        className="absolute top-2 right-2 px-3 py-1 rounded-lg text-xs font-medium"
                        style={{ backgroundColor: editMode ? "#DCFCE7" : "#F1F5F9", color: editMode ? "#16A34A" : "#64748B" }}
                      >
                        {editMode ? "Done Editing" : "Edit Mode"}
                      </button>
                    </div>
                  ) : (
                    <div 
                      className="w-full px-4 py-3 rounded-xl border text-sm"
                      style={{ 
                        borderColor: "#E2E8F0", 
                        minHeight: "350px",
                        backgroundColor: "#F8FAFC"
                      }}
                    >
                      <span style={{ color: "#94A3B8" }}>
                        Select a student submission from the right side or upload a document.
                      </span>
                    </div>
                  )}
                </div>

                {/* Highlighted Comment Popup */}
                {highlightedCommentId && (
                  <div className="p-4 rounded-2xl border mb-4" style={{ borderColor: "#FEF3C7", backgroundColor: "#FEF9E7" }}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-medium mb-1" style={{ color: "#92400E" }}>Comment:</p>
                        <p className="text-sm" style={{ color: "#1E293B" }}>{revisionComments.find(c => c.id === highlightedCommentId)?.comment}</p>
                      </div>
                      <button onClick={() => setHighlightedCommentId(null)} className="p-1">
                        <svg className="w-4 h-4" style={{ color: "#64748B" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}

                {/* Revision Comments Sidebar */}
                {revisionComments.length > 0 && (
                  <div className="p-4 rounded-2xl border" style={{ borderColor: "#FEF3C7", backgroundColor: "#FEF9E7" }}>
                    <h4 className="text-sm font-semibold mb-3" style={{ color: "#92400E" }}>Revision Comments</h4>
                    <div className="space-y-3">
                      {revisionComments.map((comment) => (
                        <div key={comment.id} className="p-3 rounded-lg border" style={{ borderColor: "#FCD34D", backgroundColor: "#FFFFFF" }}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-xs font-medium mb-1" style={{ color: "#92400E" }}>Highlighted: "{comment.text}"</p>
                              <p className="text-sm" style={{ color: "#1E293B" }}>{comment.comment}</p>
                            </div>
                            <button 
                              onClick={() => deleteRevisionComment(comment.id)}
                              className="p-1 rounded hover:bg-gray-100"
                            >
                              <svg className="w-4 h-4" style={{ color: "#DC2626" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Side - Student Submissions */}
              <div className="w-80 space-y-4">
                {/* MOA Submissions */}
                <div className="rounded-xl border" style={{ borderColor: "#E2E8F0", backgroundColor: "#FFFFFF" }}>
                  <button 
                    onClick={() => toggleBox("moa")}
                    className="w-full flex items-center justify-between p-4"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold" style={{ color: "#1E293B" }}>MOA</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: "#DCFCE7", color: "#166534" }}>{getDocumentCount("moa")}</span>
                    </div>
                    <svg 
                      className="w-5 h-5 transition-transform" 
                      style={{ color: "#64748B", transform: expandedBoxes.moa ? "rotate(180deg)" : "rotate(0deg)" }}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedBoxes.moa && (
                    <div className="px-4 pb-4 space-y-2">
                      {studentSubmissions.filter(s => s.type === "moa").map((sub) => {
                        const colors = getStatusColor(sub.status);
                        return (
                          <div 
                            key={sub.id}
                            onClick={() => loadStudentSubmission(sub)}
                            className="p-3 rounded-lg border cursor-pointer hover:bg-gray-50"
                            style={{ borderColor: "#E2E8F0", backgroundColor: "#F8FAFC" }}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs font-medium" style={{ color: "#1E293B" }}>{sub.title}</p>
                                <p className="text-xs" style={{ color: "#64748B" }}>{sub.studentName}</p>
                              </div>
                              <span className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: colors.bg, color: colors.text }}>
                                {sub.status}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Evaluation Submissions */}
                <div className="rounded-xl border" style={{ borderColor: "#E2E8F0", backgroundColor: "#FFFFFF" }}>
                  <button 
                    onClick={() => toggleBox("evaluation")}
                    className="w-full flex items-center justify-between p-4"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold" style={{ color: "#1E293B" }}>Evaluation</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: "#F3E8FF", color: "#9333EA" }}>{getDocumentCount("evaluation")}</span>
                    </div>
                    <svg 
                      className="w-5 h-5 transition-transform" 
                      style={{ color: "#64748B", transform: expandedBoxes.evaluation ? "rotate(180deg)" : "rotate(0deg)" }}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedBoxes.evaluation && (
                    <div className="px-4 pb-4 space-y-2">
                      {studentSubmissions.filter(s => s.type === "evaluation").map((sub) => {
                        const colors = getStatusColor(sub.status);
                        return (
                          <div 
                            key={sub.id}
                            onClick={() => loadStudentSubmission(sub)}
                            className="p-3 rounded-lg border cursor-pointer hover:bg-gray-50"
                            style={{ borderColor: "#E2E8F0", backgroundColor: "#F8FAFC" }}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs font-medium" style={{ color: "#1E293B" }}>{sub.title}</p>
                                <p className="text-xs" style={{ color: "#64748B" }}>{sub.studentName}</p>
                              </div>
                              <span className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: colors.bg, color: colors.text }}>
                                {sub.status}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* DTR Submissions */}
                <div className="rounded-xl border" style={{ borderColor: "#E2E8F0", backgroundColor: "#FFFFFF" }}>
                  <button 
                    onClick={() => toggleBox("dtr")}
                    className="w-full flex items-center justify-between p-4"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold" style={{ color: "#1E293B" }}>DTR</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: "#FEF3C7", color: "#92400E" }}>{getDocumentCount("dtr")}</span>
                    </div>
                    <svg 
                      className="w-5 h-5 transition-transform" 
                      style={{ color: "#64748B", transform: expandedBoxes.dtr ? "rotate(180deg)" : "rotate(0deg)" }}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedBoxes.dtr && (
                    <div className="px-4 pb-4 space-y-2">
                      {studentSubmissions.filter(s => s.type === "dtr").map((sub) => {
                        const colors = getStatusColor(sub.status);
                        return (
                          <div 
                            key={sub.id}
                            onClick={() => loadStudentSubmission(sub)}
                            className="p-3 rounded-lg border cursor-pointer hover:bg-gray-50"
                            style={{ borderColor: "#E2E8F0", backgroundColor: "#F8FAFC" }}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs font-medium" style={{ color: "#1E293B" }}>{sub.title}</p>
                                <p className="text-xs" style={{ color: "#64748B" }}>{sub.studentName}</p>
                              </div>
                              <span className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: colors.bg, color: colors.text }}>
                                {sub.status}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Resume Submissions */}
                <div className="rounded-xl border" style={{ borderColor: "#E2E8F0", backgroundColor: "#FFFFFF" }}>
                  <button 
                    onClick={() => toggleBox("resume")}
                    className="w-full flex items-center justify-between p-4"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold" style={{ color: "#1E293B" }}>Resume</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: "#DBEAFE", color: "#00529B" }}>{getDocumentCount("resume")}</span>
                    </div>
                    <svg 
                      className="w-5 h-5 transition-transform" 
                      style={{ color: "#64748B", transform: expandedBoxes.resume ? "rotate(180deg)" : "rotate(0deg)" }}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedBoxes.resume && (
                    <div className="px-4 pb-4 space-y-2">
                      {studentSubmissions.filter(s => s.type === "resume").map((sub) => {
                        const colors = getStatusColor(sub.status);
                        return (
                          <div 
                            key={sub.id}
                            onClick={() => loadStudentSubmission(sub)}
                            className="p-3 rounded-lg border cursor-pointer hover:bg-gray-50"
                            style={{ borderColor: "#E2E8F0", backgroundColor: "#F8FAFC" }}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs font-medium" style={{ color: "#1E293B" }}>{sub.title}</p>
                                <p className="text-xs" style={{ color: "#64748B" }}>{sub.studentName}</p>
                              </div>
                              <span className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: colors.bg, color: colors.text }}>
                                {sub.status}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Revision Requirements */}
                <div className="rounded-xl border" style={{ borderColor: "#DC2626", backgroundColor: "#FEF2F2" }}>
                  <button 
                    onClick={() => toggleBox("revisions")}
                    className="w-full flex items-center justify-between p-4"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold" style={{ color: "#DC2626" }}>Revision Requirements</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: "#FEE2E2", color: "#DC2626" }}>{getRevisionCount()}</span>
                    </div>
                    <svg 
                      className="w-5 h-5 transition-transform" 
                      style={{ color: "#DC2626", transform: expandedBoxes.revisions ? "rotate(180deg)" : "rotate(0deg)" }}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedBoxes.revisions && (
                    <div className="px-4 pb-4 space-y-2">
                      {studentSubmissions.filter(s => s.status === "revision").map((sub) => {
                        const colors = getStatusColor(sub.status);
                        return (
                          <div 
                            key={sub.id}
                            onClick={() => loadStudentSubmission(sub)}
                            className="p-3 rounded-lg border cursor-pointer hover:bg-gray-50"
                            style={{ borderColor: "#FECACA", backgroundColor: "#FEF2F2" }}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs font-medium" style={{ color: "#1E293B" }}>{sub.title}</p>
                                <p className="text-xs" style={{ color: "#64748B" }}>{sub.studentName}</p>
                                {sub.feedback && <p className="text-xs mt-1" style={{ color: "#DC2626" }}>{sub.feedback}</p>}
                              </div>
                              <span className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: colors.bg, color: colors.text }}>
                                {sub.status}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                      {getRevisionCount() === 0 && (
                        <p className="text-xs text-center py-2" style={{ color: "#64748B" }}>No revisions needed</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {selectedSubmission && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="p-6 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-auto" style={{ backgroundColor: "#FFFFFF" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{selectedSubmission.title}</h3>
              <button onClick={() => setSelectedSubmission(null)} style={{ color: "#64748B", background: "none", border: "none", cursor: "pointer", fontSize: "20px" }}>✕</button>
            </div>
            <div className="mb-4 p-4 rounded-xl" style={{ backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0" }}>
              <p className="text-sm" style={{ color: "#64748B" }}><strong>Student:</strong> {selectedSubmission.studentName}</p>
              <p className="text-sm" style={{ color: "#64748B" }}><strong>Type:</strong> {selectedSubmission.type.toUpperCase()}</p>
              <p className="text-sm" style={{ color: "#64748B" }}><strong>Submitted:</strong> {new Date(selectedSubmission.submittedAt).toLocaleString()}</p>
            </div>
            {selectedSubmission.content && (
              <div className="mb-4">
                <p className="text-sm font-medium mb-2">Content:</p>
                <div className="p-4 rounded-xl" style={{ backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", whiteSpace: "pre-wrap" }}>{selectedSubmission.content}</div>
              </div>
            )}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Feedback / Notes</label>
              <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} className="w-full px-4 py-3 rounded-xl border text-sm" style={{ borderColor: "#E2E8F0" }} rows={3} placeholder="Add feedback..." />
            </div>
            <div className="flex gap-3">
              <button onClick={() => handleAction(selectedSubmission.id, "approved")} className="flex-1 py-2 rounded-xl text-sm font-medium" style={{ backgroundColor: "#16A34A", color: "white" }}>Approve</button>
              <button onClick={() => handleAction(selectedSubmission.id, "revision")} className="flex-1 py-2 rounded-xl text-sm font-medium" style={{ backgroundColor: "#F59E0B", color: "white" }}>Request Revision</button>
              <button onClick={() => handleAction(selectedSubmission.id, "rejected")} className="flex-1 py-2 rounded-xl text-sm font-medium" style={{ backgroundColor: "#DC2626", color: "white" }}>Reject</button>
            </div>
          </div>
        </div>
      )}

      {showWordEditor && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="p-6 rounded-2xl w-full max-w-md" style={{ backgroundColor: "#FFFFFF" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold" style={{ color: "#1E293B" }}>Edit: {selectedWord}</h3>
              <button onClick={() => { setShowWordEditor(false); setSelectedWord(""); }} className="p-1 rounded-lg hover:bg-gray-100">
                <svg className="w-5 h-5" style={{ color: "#64748B" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-sm mb-4" style={{ color: "#64748B" }}>Select a recommended value or enter your own.</p>
            
            <div className="mb-4">
              <p className="text-sm font-medium mb-2" style={{ color: "#1E293B" }}>Recommended Values:</p>
              <div className="flex flex-wrap gap-2">
                {(wordRecommendations[selectedWord] || []).map((value, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleWordSelectFromList(value)}
                    className="px-3 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80"
                    style={{ backgroundColor: "#F0F7FF", color: "#00529B" }}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl border" style={{ borderColor: "#00529B", backgroundColor: "#F0F7FF" }}>
              <p className="text-sm font-semibold mb-2" style={{ color: "#00529B" }}>Type Manually</p>
              <div className="relative">
                <input
                  type="text"
                  value={customWordValue}
                  onChange={(e) => setCustomWordValue(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border text-sm pr-12"
                  style={{ borderColor: "#E2E8F0" }}
                  placeholder={`Type your value for ${selectedWord}...`}
                />
                <button 
                  onClick={isListening ? stopVoiceInput : startVoiceInput}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full ${isListening ? 'animate-pulse' : ''}`}
                  style={{ backgroundColor: isListening ? "#DC2626" : "#F1F5F9" }}
                  title={isListening ? "Stop listening" : "Start voice input"}
                >
                  <svg className="w-5 h-5" style={{ color: isListening ? "white" : "#64748B" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </button>
              </div>
              {isListening && (
                <p className="text-xs mt-2" style={{ color: "#DC2626" }}>Listening... Speak now</p>
              )}
            </div>

            <div className="flex gap-3 pt-4 mt-4 border-t" style={{ borderColor: "#E2E8F0" }}>
              <button 
                onClick={() => { setShowWordEditor(false); setSelectedWord(""); }} 
                className="flex-1 py-2 rounded-xl text-sm font-medium"
                style={{ backgroundColor: "#F1F5F9", color: "#64748B" }}
              >
                Cancel
              </button>
              <button 
                onClick={handleWordReplace}
                className="flex-1 py-2 rounded-xl text-sm font-medium"
                style={{ backgroundColor: "#00529B", color: "white" }}
              >
                Insert Value
              </button>
            </div>
          </div>
        </div>
      )}

      {showCommentModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="p-6 rounded-2xl w-full max-w-md" style={{ backgroundColor: "#FFFFFF" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold" style={{ color: "#1E293B" }}>Add Revision Comment</h3>
              <button onClick={() => { setShowCommentModal(false); setSelectedText(""); }} className="p-1 rounded-lg hover:bg-gray-100">
                <svg className="w-5 h-5" style={{ color: "#64748B" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4 p-3 rounded-lg border" style={{ borderColor: "#FEF3C7", backgroundColor: "#FEF9E7" }}>
              <p className="text-xs font-medium mb-1" style={{ color: "#92400E" }}>Selected Text:</p>
              <p className="text-sm" style={{ color: "#1E293B" }}>"{selectedText}"</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{ color: "#1E293B" }}>Revision Comment:</label>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border text-sm"
                style={{ borderColor: "#E2E8F0" }}
                rows={3}
                placeholder="Explain what needs to be revised..."
              />
            </div>

            <div className="flex gap-3 pt-4 mt-4 border-t" style={{ borderColor: "#E2E8F0" }}>
              <button 
                onClick={() => { setShowCommentModal(false); setSelectedText(""); }} 
                className="flex-1 py-2 rounded-xl text-sm font-medium"
                style={{ backgroundColor: "#F1F5F9", color: "#64748B" }}
              >
                Cancel
              </button>
              <button 
                onClick={addRevisionComment}
                className="flex-1 py-2 rounded-xl text-sm font-medium"
                style={{ backgroundColor: "#D97706", color: "white" }}
              >
                Add Comment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}