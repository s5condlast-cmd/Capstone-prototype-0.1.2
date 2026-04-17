"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUsers, createUser, deleteUser, getSession, logout, User, UserRole } from "@/lib/auth";
import { useTheme } from "@/lib/ThemeContext";

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  createdAt: string;
}

interface StudentAdviser {
  studentId: string;
  adviserId: string;
}

interface Batch {
  id: string;
  name: string;
  academicYear: string;
  term: string;
  program: string;
  createdAt: string;
}

interface SubmittedDocument {
  id: string;
  title: string;
  type: "dtr" | "moa" | "evaluation" | "journal" | "other";
  fileName: string;
  fileType: "pdf" | "docx" | "image";
  isScanned: boolean;
  studentName: string;
  studentId: string;
  submittedAt: string;
  status: "pending" | "approved" | "rejected" | "revision";
  content?: string;
  feedback?: string;
}

const defaultTemplates: Template[] = [];

export default function AdminPage() {
  const router = useRouter();
  const [session, setSession] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "users" | "adviserAssignment" | "batches" | "templates" | "reports" | "monitoring" | "accessControl">("dashboard");
  const [showModal, setShowModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userSearch, setUserSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [templates, setTemplates] = useState<Template[]>(defaultTemplates);
  const [studentAdvisers, setStudentAdvisers] = useState<StudentAdviser[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<SubmittedDocument | null>(null);
  const [documentContent, setDocumentContent] = useState("");
  const [submittedDocuments, setSubmittedDocuments] = useState<SubmittedDocument[]>([]);
  const [activeTemplateTab, setActiveTemplateTab] = useState<"moa" | "dtr" | "evaluation">("moa");
  const [showRecommendedWords, setShowRecommendedWords] = useState(false);
  const [expandedBoxes, setExpandedBoxes] = useState<Record<string, boolean>>({
    dtr: false,
    moa: false,
    evaluation: false,
    submitted: false,
  });
  const [editorContent, setEditorContent] = useState("");
  const [editableWords, setEditableWords] = useState<Record<string, string>>({});
  const [showWordEditor, setShowWordEditor] = useState(false);
  const [selectedWord, setSelectedWord] = useState("");
  const [customWordValue, setCustomWordValue] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const { darkMode, setDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    studentId: "",
    name: "",
    email: "",
    password: "",
    role: "student" as UserRole,
    adviserId: "",
  });
  const [batchForm, setBatchForm] = useState({
    name: "",
    academicYear: "2025-2026",
    term: "1st Semester",
    program: "BSIT",
  });
  const [templateForm, setTemplateForm] = useState({
    name: "",
    description: "",
    category: "Letter",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    setMounted(true);
    const currentSession = getSession();
    if (!currentSession || currentSession.role !== "admin") {
      router.push("/login");
      return;
    }
    setSession(currentSession);
    setUsers(getUsers());
    
    if (typeof window !== "undefined") {
      const savedAssignments = localStorage.getItem("practicum_adviser_assignments");
      if (savedAssignments) {
        setStudentAdvisers(JSON.parse(savedAssignments));
      }
      
      const savedDocs = localStorage.getItem("practicum_admin_documents");
      if (savedDocs) {
        setSubmittedDocuments(JSON.parse(savedDocs));
      } else {
        const sampleDocs: SubmittedDocument[] = [
          { id: "1", title: "DTR - Week 1", type: "dtr", fileName: "dtr_week1.pdf", fileType: "pdf", isScanned: false, studentName: "Demo Student 1", studentId: "STUDENT-001", submittedAt: "2026-04-14T10:30:00Z", status: "pending", content: "Daily Time Record for Week 1\n\nMonday: 8:00 AM - 5:00 PM\nTuesday: 8:00 AM - 5:00 PM\nWednesday: 8:00 AM - 5:00 PM\nThursday: 8:00 AM - 5:00 PM\nFriday: 8:00 AM - 5:00 PM" },
          { id: "2", title: "MOA - Tech Corp", type: "moa", fileName: "moa_techcorp.docx", fileType: "docx", isScanned: false, studentName: "Demo Student 2", studentId: "STUDENT-002", submittedAt: "2026-04-13T14:00:00Z", status: "pending", content: "MEMORANDUM OF AGREEMENT\n\nThis agreement is entered between Tech Corp and the student for practicum placement..." },
          { id: "3", title: "Evaluation Form", type: "evaluation", fileName: "evaluation_scan.jpg", fileType: "image", isScanned: true, studentName: "Demo Student 3", studentId: "STUDENT-003", submittedAt: "2026-04-12T09:00:00Z", status: "approved", content: "Student Evaluation\n\nRating: 4.5/5\nComments: Excellent performance" },
          { id: "4", title: "DTR - Week 2", type: "dtr", fileName: "dtr_week2_scan.png", fileType: "image", isScanned: true, studentName: "Demo Student 1", studentId: "STUDENT-001", submittedAt: "2026-04-11T16:00:00Z", status: "revision", feedback: "Please provide more details" },
        ];
        setSubmittedDocuments(sampleDocs);
        localStorage.setItem("practicum_admin_documents", JSON.stringify(sampleDocs));
      }
    }
  }, []);

  const saveAdviserAssignments = (data: StudentAdviser[]) => {
    setStudentAdvisers(data);
    if (typeof window !== "undefined") {
      localStorage.setItem("practicum_adviser_assignments", JSON.stringify(data));
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.studentId || !formData.name || !formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    const newUser = createUser({
      studentId: formData.studentId,
      password: formData.password,
      name: formData.name,
      email: formData.email,
      role: formData.role,
    });

    if (!newUser) {
      setError("Student ID already exists");
      return;
    }

    if (formData.role === "student" && formData.adviserId) {
      const newAssignment: StudentAdviser = {
        studentId: formData.studentId,
        adviserId: formData.adviserId,
      };
      saveAdviserAssignments([...studentAdvisers, newAssignment]);
    }

    setUsers(getUsers());
    setShowModal(false);
    setFormData({ studentId: "", name: "", email: "", password: "", role: "student", adviserId: "" });
  };

  const handleDeleteUser = (id: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      deleteUser(id);
      setUsers(getUsers());
    }
  };

  const handleAssignAdviser = (studentId: string, adviserId: string) => {
    const existing = studentAdvisers.find(s => s.studentId === studentId);
    if (existing) {
      const updated = studentAdvisers.map(s => s.studentId === studentId ? { ...s, adviserId } : s);
      saveAdviserAssignments(updated);
    } else {
      saveAdviserAssignments([...studentAdvisers, { studentId, adviserId }]);
    }
  };

  const handleAddTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateForm.name || !templateForm.description) return;
    
    const newTemplate: Template = {
      id: Date.now().toString(),
      name: templateForm.name,
      description: templateForm.description,
      category: templateForm.category,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setTemplates([...templates, newTemplate]);
    setShowTemplateModal(false);
    setTemplateForm({ name: "", description: "", category: "Letter" });
  };

  const handleDeleteTemplate = (id: string) => {
    if (confirm("Delete this template?")) {
      setTemplates(templates.filter(t => t.id !== id));
    }
  };

  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchForm.name) return;
    
    const newBatch: Batch = {
      id: Date.now().toString(),
      name: batchForm.name,
      academicYear: batchForm.academicYear,
      term: batchForm.term,
      program: batchForm.program,
      createdAt: new Date().toISOString(),
    };
    setBatches([...batches, newBatch]);
    setShowBatchModal(false);
    setBatchForm({ name: "", academicYear: "2025-2026", term: "1st Semester", program: "BSIT" });
  };

  const handleDeleteBatch = (id: string) => {
    if (confirm("Delete this batch?")) {
      setBatches(batches.filter(b => b.id !== id));
    }
  };

  const handleOpenDocument = (doc: SubmittedDocument) => {
    setSelectedDocument(doc);
    setDocumentContent(doc.content || "");
    setShowDocumentModal(true);
  };

  const handleUpdateDocumentStatus = (docId: string, status: "approved" | "rejected" | "revision", feedback?: string) => {
    const updated = submittedDocuments.map(d => 
      d.id === docId ? { ...d, status, feedback: feedback || d.feedback } : d
    );
    setSubmittedDocuments(updated);
    localStorage.setItem("practicum_admin_documents", JSON.stringify(updated));
    setShowDocumentModal(false);
    setSelectedDocument(null);
  };

  const handleSaveDocumentContent = () => {
    if (!selectedDocument) return;
    const updated = submittedDocuments.map(d => 
      d.id === selectedDocument.id ? { ...d, content: documentContent } : d
    );
    setSubmittedDocuments(updated);
    localStorage.setItem("practicum_admin_documents", JSON.stringify(updated));
    alert("Document saved successfully!");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return { bg: "#DCFCE7", text: "#16A34A" };
      case "rejected": return { bg: "#FEE2E2", text: "#DC2626" };
      case "revision": return { bg: "#FEF3C7", text: "#D97706" };
      default: return { bg: "#F1F5F9", text: "#64748B" };
    }
  };

  const getTypeIcon = (type: string, isScanned: boolean) => {
    if (isScanned) {
      return "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z";
    }
    switch (type) {
      case "pdf": return "M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z";
      case "docx": return "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z";
      default: return "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z";
    }
  };

  const recommendedWords: Record<string, string[]> = {
    moa: ["Memorandum of Agreement", "Partnership", "Company", "Practicum", "Agreement", "Terms", "Duration", "Responsibilities", "Confidentiality", "Obligations"],
    dtr: ["Daily Time Record", "Attendance", "Hours", "Login", "Logout", "Date", "Time In", "Time Out", "Total Hours", "Regular", "Overtime"],
    evaluation: ["Performance", "Rating", "Skills", "Comments", "Assessment", "Grade", "Strengths", "Improvement", "Work Ethic", "Communication"],
  };

  const toggleBox = (box: string) => {
    setExpandedBoxes(prev => ({ ...prev, [box]: !prev[box] }));
  };

  const insertWord = (word: string) => {
    setEditorContent(prev => prev + (prev ? " " : "") + word);
    setShowRecommendedWords(false);
  };

  const wordRecommendations: Record<string, string[]> = {
    "Company": ["Tech Corp", "Business Inc", "Local Co", "Global Solutions", "StartUp Hub", "Digital Systems"],
    "Student": ["Demo Student 1", "Demo Student 2", "Demo Student 3", "Demo Student 4", "Demo Student 5"],
    "Practicum Duration": ["3 months", "6 months", "1 semester", "1 year", "240 hours"],
    "School": ["University of Makati", "College of Science", "Polytechnic University", "State University"],
    "Date": ["April 2026", "May 2026", "June 2026", "July 2026", "August 2026"],
    "Evaluation Form": ["Performance Rating", "Skills Assessment", "Monthly Report", "Final Evaluation"],
    "Duration": ["3 months", "6 months", "1 semester", "120 hours", "240 hours"],
    "Address": ["123 Main Street", "456 Business Ave", "789 Tech Park", "101 Corporate Plaza"],
    "Purpose": ["On-the-job training", "Practicum Exposure", "Work immersion", "Professional development"],
    "Terms": ["Confidentiality", "Attendance", "Dress code", "Reporting", "Supervision"],
    "Responsibilities": ["Training", "Evaluation", "Feedback", "Documentation", "Orientation"],
    "Student Name": ["Demo Student 1", "Demo Student 2", "Demo Student 3", "Demo Student 4"],
    "Time In": ["8:00 AM", "9:00 AM", "7:00 AM", "8:30 AM"],
    "Time Out": ["5:00 PM", "6:00 PM", "4:00 PM", "5:30 PM"],
    "Total Hours": ["8 hours", "9 hours", "7 hours", "8.5 hours"],
    "Signature": ["[Signature]", "Approved", "Confirmed"],
    "Overall Rating": ["Excellent", "Good", "Satisfactory", "Needs Improvement", "Outstanding"],
    "Performance": ["Outstanding", "Excellent", "Good", "Satisfactory", "Needs Improvement"],
    "Skills": ["Technical", "Communication", "Problem-solving", "Teamwork", "Leadership"],
    "Comments": ["Great work", "Keep it up", "Needs more focus", "Excellent performance"],
    "Evaluator": ["Mr. Smith", "Ms. Johnson", "Dr. Brown", "Mrs. Davis"],
    "Company Name": ["Tech Corp", "Business Inc", "Local Co", "Global Solutions"],
    "Supervisor": ["Mr. Garcia", "Ms. Lee", "Mrs. Wilson", "Dr. Martinez"],
    "Position": ["Intern", "Trainee", "Junior Developer", "Assistant"],
  };

  const handleWordClick = (word: string) => {
    setSelectedWord(word);
    setCustomWordValue(editableWords[word] || "");
    setShowWordEditor(true);
  };

  const handleWordReplace = () => {
    const newContent = editorContent.replace(new RegExp(`\\b${selectedWord}\\b`, 'g'), customWordValue || selectedWord);
    setEditorContent(newContent);
    setEditableWords(prev => ({ ...prev, [selectedWord]: customWordValue }));
    setShowWordEditor(false);
    setSelectedWord("");
    setCustomWordValue("");
  };

  const handleWordSelectFromList = (value: string) => {
    const newContent = editorContent.replace(new RegExp(`\\b${selectedWord}\\b`, 'g'), value);
    setEditorContent(newContent);
    setEditableWords(prev => ({ ...prev, [selectedWord]: value }));
    setShowWordEditor(false);
    setSelectedWord("");
    setCustomWordValue("");
  };

  const speakText = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      } else {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  const startVoiceInput = () => {
    if (typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
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
        setCustomWordValue(prev => prev + (prev ? " " : "") + transcript);
      };
      
      recognition.onerror = () => {
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.start();
    } else {
      alert("Voice input is not supported in this browser. Please use Chrome or Edge.");
    }
  };

  const stopVoiceInput = () => {
    setIsListening(false);
  };

  const speakAllRecommendations = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const values = wordRecommendations[selectedWord] || [];
      let index = 0;
      
      const speakNext = () => {
        if (index < values.length) {
          const utterance = new SpeechSynthesisUtterance(values[index]);
          utterance.rate = 0.9;
          utterance.onend = () => {
            index++;
            speakNext();
          };
          window.speechSynthesis.speak(utterance);
        } else {
          setIsSpeaking(false);
        }
      };
      
      setIsSpeaking(true);
      speakNext();
    }
  };

  const stopSpeaking = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const getRoleBadge = (role: UserRole) => {
    const colors: Record<UserRole, { bg: string; text: string }> = {
      admin: { bg: "#FEE2E2", text: "#991B1B" },
      advisor: { bg: "#FEF3C7", text: "#92400E" },
      student: { bg: "#DCFCE7", text: "#166534" },
    };
    return colors[role];
  };

  const students = users.filter(u => u.role === "student");
  const advisors = users.filter(u => u.role === "advisor");
  const [submissions, setSubmissions] = useState<unknown[]>([]);

  useEffect(() => {
    if (mounted && typeof window !== "undefined") {
      const saved = localStorage.getItem("practicum_submissions");
      if (saved) {
        setSubmissions(JSON.parse(saved));
      }
    }
  }, [mounted]);

  if (!mounted) return null;

  if (!session) return null;

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#F8FAFC" }}>
      <aside className="w-60 flex-shrink-0 flex flex-col" style={{ backgroundColor: "#FFFFFF", borderRight: "1px solid #E2E8F0" }}>
        <div className="p-6 border-b" style={{ borderColor: "#E2E8F0" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00529B 0%, #0073C7 100%)' }}>
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h1 className="font-bold text-sm" style={{ color: "#1E293B" }}>Practicum</h1>
              <p className="text-xs" style={{ color: "#64748B" }}>System</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            <li className="px-4 py-2 text-xs font-bold" style={{ color: "#94A3B8" }}>MAIN</li>
            <li>
              <button onClick={() => setActiveTab("dashboard")} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all" style={{ backgroundColor: activeTab === "dashboard" ? "#00529B" : "transparent", color: activeTab === "dashboard" ? "#FFFFFF" : "#64748B" }}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Dashboard
              </button>
            </li>
            
            <li className="px-4 py-2 text-xs font-bold mt-4" style={{ color: "#94A3B8" }}>MANAGEMENT</li>
            <li>
              <button onClick={() => setActiveTab("users")} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all" style={{ backgroundColor: activeTab === "users" ? "#00529B" : "transparent", color: activeTab === "users" ? "#FFFFFF" : "#64748B" }}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                User Management
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab("adviserAssignment")} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all" style={{ backgroundColor: activeTab === "adviserAssignment" ? "#00529B" : "transparent", color: activeTab === "adviserAssignment" ? "#FFFFFF" : "#64748B" }}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Adviser Assignment
              </button>
            </li>
            
            <li className="px-4 py-2 text-xs font-bold mt-4" style={{ color: "#94A3B8" }}>ACADEMIC</li>
            <li>
              <button onClick={() => setActiveTab("batches")} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all" style={{ backgroundColor: activeTab === "batches" ? "#00529B" : "transparent", color: activeTab === "batches" ? "#FFFFFF" : "#64748B" }}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Practicum Setup
              </button>
            </li>
            
            <li className="px-4 py-2 text-xs font-bold mt-4" style={{ color: "#94A3B8" }}>DOCUMENTS</li>
            <li>
              <button onClick={() => setActiveTab("templates")} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all" style={{ backgroundColor: activeTab === "templates" ? "#00529B" : "transparent", color: activeTab === "templates" ? "#FFFFFF" : "#64748B" }}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z" />
                </svg>
                Templates
              </button>
            </li>
            
            <li className="px-4 py-2 text-xs font-bold mt-4" style={{ color: "#94A3B8" }}>REPORTS</li>
            <li>
              <button onClick={() => setActiveTab("reports")} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all" style={{ backgroundColor: activeTab === "reports" ? "#00529B" : "transparent", color: activeTab === "reports" ? "#FFFFFF" : "#64748B" }}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Reports
              </button>
            </li>
            
            <li className="px-4 py-2 text-xs font-bold mt-4" style={{ color: "#94A3B8" }}>SYSTEM</li>
            <li>
              <button onClick={() => setActiveTab("monitoring")} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all" style={{ backgroundColor: activeTab === "monitoring" ? "#00529B" : "transparent", color: activeTab === "monitoring" ? "#FFFFFF" : "#64748B" }}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                System Monitoring
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab("accessControl")} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all" style={{ backgroundColor: activeTab === "accessControl" ? "#00529B" : "transparent", color: activeTab === "accessControl" ? "#FFFFFF" : "#64748B" }}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Access Control
              </button>
            </li>
          </ul>
        </nav>
        <div className="p-4 border-t" style={{ borderColor: "#E2E8F0" }}>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium" style={{ color: "#DC2626" }}>Logout</button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <header className="px-8 py-4 flex items-center justify-between" style={{ backgroundColor: darkMode ? "#1E293B" : "#FFFFFF", borderBottom: darkMode ? "1px solid #475569" : "1px solid #E2E8F0" }}>
          <h2 className="text-lg font-bold" style={{ color: darkMode ? "#F8FAFC" : "#1E293B" }}>
            {activeTab === "dashboard" && "Admin Dashboard"}
            {activeTab === "users" && "User Management"}
            {activeTab === "adviserAssignment" && "Adviser Assignment"}
            {activeTab === "batches" && "Practicum Setup"}
            {activeTab === "templates" && "Template Management"}
            {activeTab === "reports" && "Reports"}
            {activeTab === "monitoring" && "System Monitoring"}
            {activeTab === "accessControl" && "Access Control"}
          </h2>
          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-xl" style={{ backgroundColor: darkMode ? "#334155" : "#F8FAFC" }}>
              <svg className="w-5 h-5" style={{ color: darkMode ? "#94A3B8" : "#64748B" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 p-2 -m-2 rounded-xl transition-colors"
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: darkMode ? "#334155" : "#F0F7FF" }}>
                <span className="font-medium text-sm" style={{ color: darkMode ? "#F8FAFC" : "#00529B" }}>{session.name.charAt(0)}</span>
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: darkMode ? "#F8FAFC" : "#1E293B" }}>{session.name}</p>
                <p className="text-xs" style={{ color: darkMode ? "#94A3B8" : "#64748B" }}>ADMIN001</p>
              </div>
            </button>
          </div>
        </header>

        {/* User Menu Dropdown */}
        {showUserMenu && (
          <div 
            className="absolute right-8 top-20 w-64 rounded-2xl overflow-hidden z-50"
            style={{ 
              backgroundColor: "#FFFFFF",
              border: "1px solid #E2E8F0",
              boxShadow: '0 10px 40px -10px rgba(0,0,0,0.15)'
            }}
          >
            {/* User Info */}
            <div className="px-4 py-3 border-b" style={{ borderColor: darkMode ? "#475569" : "#E2E8F0" }}>
              <p className="font-semibold text-sm" style={{ color: darkMode ? "#F8FAFC" : "#1E293B" }}>{session.name}</p>
              <p className="text-xs" style={{ color: darkMode ? "#94A3B8" : "#64748B" }}>ID: {session.studentId}</p>
            </div>

            {/* Dark Mode Toggle */}
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-opacity-50"
              style={{ backgroundColor: darkMode ? "#1E293B" : "#F8FAFC" }}
            >
              <div className="flex items-center gap-3">
                {darkMode ? (
                  <svg className="w-5 h-5" style={{ color: darkMode ? "#F8FAFC" : "#64748B" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" style={{ color: darkMode ? "#94A3B8" : "#64748B" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
                <span className="text-sm" style={{ color: darkMode ? "#F8FAFC" : "#1E293B" }}>Dark Mode</span>
              </div>
              <div 
                className={`w-10 h-5 rounded-full relative transition-colors ${darkMode ? 'bg-blue-500' : 'bg-gray-300'}`}
              >
                <div 
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${darkMode ? 'left-5' : 'left-0.5'}`}
                />
              </div>
            </button>

            {/* Profile */}
            <button 
              onClick={() => { setShowUserMenu(false); router.push("/profile"); }}
              className="w-full flex items-center gap-3 px-4 py-3 border-t hover:bg-opacity-50"
              style={{ 
                borderColor: darkMode ? "#475569" : "#E2E8F0",
                backgroundColor: darkMode ? "#334155" : "#FFFFFF"
              }}
            >
              <svg className="w-5 h-5" style={{ color: darkMode ? "#94A3B8" : "#64748B" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-sm" style={{ color: darkMode ? "#F8FAFC" : "#1E293B" }}>Profile</span>
            </button>

            {/* Logout */}
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 border-t hover:bg-opacity-50"
              style={{ 
                borderColor: darkMode ? "#475569" : "#E2E8F0",
                backgroundColor: darkMode ? "#334155" : "#FFFFFF"
              }}
            >
              <svg className="w-5 h-5" style={{ color: "#DC2626" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="text-sm" style={{ color: "#DC2626" }}>Logout</span>
            </button>
          </div>
        )}

        <div className="p-8">
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="p-6 rounded-2xl" style={{ backgroundColor: darkMode ? "#334155" : "#FFFFFF", boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: darkMode ? "rgba(59, 130, 246, 0.2)" : "#DBEAFE" }}>
                      <svg className="w-6 h-6" style={{ color: darkMode ? "#3B82F6" : "#00529B" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm" style={{ color: darkMode ? "#94A3B8" : "#64748B" }}>Total Users</p>
                      <p className="text-2xl font-bold" style={{ color: darkMode ? "#F8FAFC" : "#1E293B" }}>{users.length}</p>
                    </div>
                  </div>
                </div>
                <div className="p-6 rounded-2xl" style={{ backgroundColor: darkMode ? "#334155" : "#FFFFFF", boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: darkMode ? "rgba(34, 197, 94, 0.2)" : "#DCFCE7" }}>
                      <svg className="w-6 h-6" style={{ color: darkMode ? "#22C55E" : "#16A34A" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm" style={{ color: darkMode ? "#94A3B8" : "#64748B" }}>Students</p>
                      <p className="text-2xl font-bold" style={{ color: darkMode ? "#F8FAFC" : "#1E293B" }}>{students.length}</p>
                    </div>
                  </div>
                </div>
                <div className="p-6 rounded-2xl" style={{ backgroundColor: darkMode ? "#334155" : "#FFFFFF", boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: darkMode ? "rgba(245, 158, 11, 0.2)" : "#FEF3C7" }}>
                      <svg className="w-6 h-6" style={{ color: darkMode ? "#F59E0B" : "#D97706" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm" style={{ color: darkMode ? "#94A3B8" : "#64748B" }}>Advisers</p>
                      <p className="text-2xl font-bold" style={{ color: darkMode ? "#F8FAFC" : "#1E293B" }}>{advisors.length}</p>
                    </div>
                  </div>
                </div>
                <div className="p-6 rounded-2xl" style={{ backgroundColor: darkMode ? "#334155" : "#FFFFFF", boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: darkMode ? "rgba(168, 85, 247, 0.2)" : "#F3E8FF" }}>
                      <svg className="w-6 h-6" style={{ color: darkMode ? "#A855F7" : "#9333EA" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm" style={{ color: darkMode ? "#94A3B8" : "#64748B" }}>Submissions</p>
                      <p className="text-2xl font-bold" style={{ color: darkMode ? "#F8FAFC" : "#1E293B" }}>{submissions.length}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl" style={{ backgroundColor: darkMode ? "#334155" : "#FFFFFF", boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: darkMode ? "#F8FAFC" : "#1E293B" }}>Recent Submissions</h3>
                  <div className="space-y-3">
                    {submissions.slice(0, 5).map((sub: any, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: darkMode ? "#1E293B" : "#F8FAFC" }}>
                        <div>
                          <p className="text-sm font-medium" style={{ color: darkMode ? "#F8FAFC" : "#1E293B" }}>{sub.title}</p>
                          <p className="text-xs" style={{ color: darkMode ? "#94A3B8" : "#64748B" }}>{sub.studentName}</p>
                        </div>
                        <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ 
                          backgroundColor: sub.status === "approved" ? (darkMode ? "rgba(34, 197, 94, 0.2)" : "#DCFCE7") : 
                          sub.status === "rejected" ? (darkMode ? "rgba(239, 68, 68, 0.2)" : "#FEE2E2") : 
                          (darkMode ? "rgba(245, 158, 11, 0.2)" : "#FEF3C7"),
                          color: sub.status === "approved" ? (darkMode ? "#22C55E" : "#16A34A") : 
                          sub.status === "rejected" ? (darkMode ? "#EF4444" : "#DC2626") : 
                          (darkMode ? "#F59E0B" : "#D97706")
                        }}>
                          {sub.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 rounded-2xl" style={{ backgroundColor: darkMode ? "#334155" : "#FFFFFF", boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: darkMode ? "#F8FAFC" : "#1E293B" }}>Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setActiveTab("users")} className="p-4 rounded-xl text-left" style={{ backgroundColor: darkMode ? "#1E293B" : "#F8FAFC" }}>
                      <svg className="w-6 h-6 mb-2" style={{ color: darkMode ? "#3B82F6" : "#00529B" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <p className="text-sm font-medium" style={{ color: darkMode ? "#F8FAFC" : "#1E293B" }}>Manage Users</p>
                    </button>
                    <button onClick={() => setActiveTab("batches")} className="p-4 rounded-xl text-left" style={{ backgroundColor: darkMode ? "#1E293B" : "#F8FAFC" }}>
                      <svg className="w-6 h-6 mb-2" style={{ color: darkMode ? "#3B82F6" : "#00529B" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm font-medium" style={{ color: darkMode ? "#F8FAFC" : "#1E293B" }}>Batch Setup</p>
                    </button>
                    <button onClick={() => setActiveTab("templates")} className="p-4 rounded-xl text-left" style={{ backgroundColor: darkMode ? "#1E293B" : "#F8FAFC" }}>
                      <svg className="w-6 h-6 mb-2" style={{ color: darkMode ? "#3B82F6" : "#00529B" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z" />
                      </svg>
                      <p className="text-sm font-medium" style={{ color: darkMode ? "#F8FAFC" : "#1E293B" }}>Templates</p>
                    </button>
                    <button onClick={() => setActiveTab("reports")} className="p-4 rounded-xl text-left" style={{ backgroundColor: darkMode ? "#1E293B" : "#F8FAFC" }}>
                      <svg className="w-6 h-6 mb-2" style={{ color: darkMode ? "#3B82F6" : "#00529B" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-sm font-medium" style={{ color: darkMode ? "#F8FAFC" : "#1E293B" }}>View Reports</p>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl" style={{ backgroundColor: darkMode ? "#334155" : "#FFFFFF", boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold" style={{ color: darkMode ? "#F8FAFC" : "#1E293B" }}>All Users</h3>
                  <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium" style={{ backgroundColor: "#00529B", color: "white" }}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Add User
                  </button>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-1 relative">
                    <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#64748B" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input 
                      type="text" 
                      placeholder="Search users..." 
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-xl border text-sm"
                      style={{ borderColor: darkMode ? "#475569" : "#E2E8F0", backgroundColor: darkMode ? "#1E293B" : "#FFFFFF", color: darkMode ? "#F8FAFC" : "#1E293B" }}
                    />
                  </div>
                  <select 
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-4 py-2 rounded-xl border text-sm"
                    style={{ borderColor: darkMode ? "#475569" : "#E2E8F0", backgroundColor: darkMode ? "#1E293B" : "#FFFFFF", color: darkMode ? "#F8FAFC" : "#1E293B" }}
                  >
                    <option value="all">All Roles</option>
                    <option value="student">Student</option>
                    <option value="advisor">Adviser</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ borderBottom: darkMode ? "1px solid #475569" : "1px solid #E2E8F0" }}>
                        <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: darkMode ? "#94A3B8" : "#64748B" }}>Student ID</th>
                        <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: darkMode ? "#94A3B8" : "#64748B" }}>Name</th>
                        <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: darkMode ? "#94A3B8" : "#64748B" }}>Email</th>
                        <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: darkMode ? "#94A3B8" : "#64748B" }}>Role</th>
                        <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: darkMode ? "#94A3B8" : "#64748B" }}>Status</th>
                        <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: darkMode ? "#94A3B8" : "#64748B" }}>Assigned Adviser</th>
                        <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: darkMode ? "#94A3B8" : "#64748B" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.filter(u => {
                        const matchesSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
                          u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
                          u.studentId.toLowerCase().includes(userSearch.toLowerCase());
                        const matchesRole = roleFilter === "all" || u.role === roleFilter;
                        return matchesSearch && matchesRole;
                      }).map((user) => {
                        const badge = getRoleBadge(user.role);
                        const assignment = studentAdvisers.find(s => s.studentId === user.studentId);
                        const assignedAdviser = assignment ? advisors.find(a => a.id === assignment.adviserId) : null;
                        
                        return (
                          <tr key={user.id} style={{ borderBottom: darkMode ? "1px solid #475569" : "1px solid #E2E8F0" }}>
                            <td className="py-3 px-4 text-sm" style={{ color: darkMode ? "#F8FAFC" : "#1E293B" }}>{user.studentId}</td>
                            <td className="py-3 px-4 text-sm" style={{ color: darkMode ? "#F8FAFC" : "#1E293B" }}>{user.name}</td>
                            <td className="py-3 px-4 text-sm" style={{ color: darkMode ? "#94A3B8" : "#64748B" }}>{user.email}</td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: badge.bg, color: badge.text }}>
                                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: "#DCFCE7", color: "#16A34A" }}>Active</span>
                            </td>
                            <td className="py-3 px-4">
                              {user.role === "student" ? (
                                <select 
                                  value={assignment?.adviserId || ""}
                                  onChange={(e) => handleAssignAdviser(user.studentId, e.target.value)}
                                  className="text-sm px-2 py-1 rounded border"
                                  style={{ borderColor: darkMode ? "#475569" : "#E2E8F0", backgroundColor: darkMode ? "#1E293B" : "#FFFFFF", color: darkMode ? "#F8FAFC" : "#1E293B" }}
                                >
                                  <option value="">Select Adviser</option>
                                  {advisors.map(a => (
                                    <option key={a.id} value={a.id}>{a.name}</option>
                                  ))}
                                </select>
                              ) : (
                                <span className="text-sm" style={{ color: darkMode ? "#94A3B8" : "#64748B" }}>-</span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => { setEditingUser(user); setShowEditUserModal(true); }}
                                  className="text-sm font-medium px-2 py-1 rounded"
                                  style={{ color: "#00529B" }}
                                >
                                  Edit
                                </button>
                                <button 
                                  onClick={() => { setEditingUser(user); setShowResetPasswordModal(true); }}
                                  className="text-sm font-medium px-2 py-1 rounded"
                                  style={{ color: darkMode ? "#F59E0B" : "#D97706" }}
                                >
                                  Reset
                                </button>
                                <button 
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="text-sm font-medium px-2 py-1 rounded"
                                  style={{ color: "#DC2626" }}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
</div>
          )}

          {activeTab === "batches" && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl" style={{ backgroundColor: "#FFFFFF", boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold" style={{ color: "#1E293B" }}>Batches & Academic Terms</h3>
                  <button onClick={() => setShowBatchModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium" style={{ backgroundColor: "#00529B", color: "white" }}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Add Batch
                  </button>
                </div>

                {batches.length === 0 ? (
                  <p className="text-sm" style={{ color: "#64748B" }}>No batches created yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr style={{ borderBottom: "1px solid #E2E8F0" }}>
                          <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: "#64748B" }}>Batch Name</th>
                          <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: "#64748B" }}>Academic Year</th>
                          <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: "#64748B" }}>Term</th>
                          <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: "#64748B" }}>Program</th>
                          <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: "#64748B" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {batches.map((batch) => (
                          <tr key={batch.id} style={{ borderBottom: "1px solid #E2E8F0" }}>
                            <td className="py-3 px-4 text-sm" style={{ color: "#1E293B" }}>{batch.name}</td>
                            <td className="py-3 px-4 text-sm" style={{ color: "#64748B" }}>{batch.academicYear}</td>
                            <td className="py-3 px-4 text-sm" style={{ color: "#64748B" }}>{batch.term}</td>
                            <td className="py-3 px-4 text-sm" style={{ color: "#64748B" }}>{batch.program}</td>
                            <td className="py-3 px-4">
                              <button onClick={() => handleDeleteBatch(batch.id)} className="text-sm font-medium" style={{ color: "#DC2626" }}>Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "templates" && (
            <div className="flex gap-6">
              {/* Left Side - Main Editor */}
              <div className="flex-1 space-y-6">
                <div className="p-6 rounded-2xl" style={{ backgroundColor: "#FFFFFF", boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold" style={{ color: "#1E293B" }}>Template Editor</h3>
                    <button onClick={() => setShowTemplateModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium" style={{ backgroundColor: "#00529B", color: "white" }}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                      Upload Template
                    </button>
                  </div>

                  {/* Editor Box */}
                  <div className="relative">
                    <div className="w-full px-4 py-3 rounded-xl border text-sm whitespace-pre-wrap" style={{ 
                      borderColor: "#E2E8F0", 
                      minHeight: "300px",
                      backgroundColor: "#F8FAFC"
                    }}>
                      {editorContent ? (
                        editorContent.split(/(\b(?:Company|Student|Practicum Duration|School|Date|Evaluation Form|Duration|Address|Purpose|Terms|Responsibilities|Student Name|Time In|Time Out|Total Hours|Signature|Overall Rating|Performance|Skills|Comments|Evaluator|Company Name|Supervisor|Position)\b)/g).map((part, index) => {
                          if (wordRecommendations[part]) {
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
                        })
                      ) : (
                        <span style={{ color: "#94A3B8" }}>
                          Click "Load Template" on the right side to load a template with clickable words.
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Collapsible Boxes */}
              <div className="w-80 space-y-4">
                {/* DTR Template Box */}
                <div className="rounded-xl border" style={{ borderColor: "#E2E8F0", backgroundColor: "#FFFFFF" }}>
                  <button 
                    onClick={() => toggleBox("dtr")}
                    className="w-full flex items-center justify-between p-4"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold" style={{ color: "#1E293B" }}>DTR Template</span>
                      <span className="px-2 py-0.5 rounded text-xs" style={{ backgroundColor: "#FEF3C7", color: "#92400E" }}>DTR</span>
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
                    <div className="px-4 pb-4">
                      <div className="p-3 rounded-lg border" style={{ borderColor: "#E2E8F0", backgroundColor: "#F8FAFC" }}>
                        <p className="text-sm font-semibold" style={{ color: "#1E293B" }}>Daily Time Record Template</p>
                        <p className="text-xs mt-1" style={{ color: "#64748B" }}>Template for student daily attendance logging</p>
                        <button 
                          onClick={() => setEditorContent("DAILY TIME RECORD\n\nStudent: Student Name\nDate: Date\n\nTime In: Time In AM\nTime Out: Time Out PM\nTotal Hours: Total Hours\n\nSignature: Signature\n\nNotes: ")}
                          className="mt-2 px-3 py-1 text-xs font-medium rounded-lg"
                          style={{ backgroundColor: "#F0F7FF", color: "#00529B" }}
                        >
                          Load Template
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* MOA Template Box */}
                <div className="rounded-xl border" style={{ borderColor: "#E2E8F0", backgroundColor: "#FFFFFF" }}>
                  <button 
                    onClick={() => toggleBox("moa")}
                    className="w-full flex items-center justify-between p-4"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold" style={{ color: "#1E293B" }}>MOA Template</span>
                      <span className="px-2 py-0.5 rounded text-xs" style={{ backgroundColor: "#DCFCE7", color: "#166534" }}>MOA</span>
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
                    <div className="px-4 pb-4">
                      <div className="p-3 rounded-lg border" style={{ borderColor: "#E2E8F0", backgroundColor: "#F8FAFC" }}>
                        <p className="text-sm font-semibold" style={{ color: "#1E293B" }}>Memorandum of Agreement Template</p>
                        <p className="text-xs mt-1" style={{ color: "#64748B" }}>Partnership agreement template with companies</p>
                        <button 
                          onClick={() => setEditorContent("MEMORANDUM OF AGREEMENT\n\nThis Memorandum of Agreement is made and entered into between Company located at Address and Student of School for the purpose of Practicum Duration.\n\nThe Company agrees to provide training and supervision to the Student during the practicum period of Duration.\n\nThe Company shall evaluate the Student's performance and submit an Evaluation Form to the school monthly.\n\nThe Student agrees to follow all company rules, complete the required hours, and submit daily logs throughout the practicum.\n\nThis agreement shall remain in effect for a period of Duration beginning from Date.\n\nAny modifications to this agreement must be agreed upon in writing by both Company and Student.\n\nThis Memorandum of Agreement is signed by Company and Student on Date.")}
                          className="mt-2 px-3 py-1 text-xs font-medium rounded-lg"
                          style={{ backgroundColor: "#F0F7FF", color: "#00529B" }}
                        >
                          Load Template
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Evaluation Template Box */}
                <div className="rounded-xl border" style={{ borderColor: "#E2E8F0", backgroundColor: "#FFFFFF" }}>
                  <button 
                    onClick={() => toggleBox("evaluation")}
                    className="w-full flex items-center justify-between p-4"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold" style={{ color: "#1E293B" }}>Evaluation Template</span>
                      <span className="px-2 py-0.5 rounded text-xs" style={{ backgroundColor: "#F3E8FF", color: "#9333EA" }}>Evaluation</span>
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
                    <div className="px-4 pb-4">
                      <div className="p-3 rounded-lg border" style={{ borderColor: "#E2E8F0", backgroundColor: "#F8FAFC" }}>
                        <p className="text-sm font-semibold" style={{ color: "#1E293B" }}>Student Evaluation Form</p>
                        <p className="text-xs mt-1" style={{ color: "#64748B" }}>Performance evaluation template for interns</p>
                        <button 
                          onClick={() => setEditorContent("STUDENT EVALUATION FORM\n\nStudent Name: Student Name\nCompany: Company\nEvaluation Period: Date\n\nRating Scale: 1-5\n\nPerformance Areas:\n1. Technical Skills: Skills\n2. Communication: Performance\n3. Work Ethic: Performance\n4. Teamwork: Performance\n5. Initiative: Performance\n\nOverall Rating: Overall Rating\n\nComments: Comments\n\nEvaluator: Evaluator\n\nSignature: Signature")}
                          className="mt-2 px-3 py-1 text-xs font-medium rounded-lg"
                          style={{ backgroundColor: "#F0F7FF", color: "#00529B" }}
                        >
                          Load Template
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Submitted Documents Box */}
                <div className="rounded-xl border" style={{ borderColor: "#E2E8F0", backgroundColor: "#FFFFFF" }}>
                  <button 
                    onClick={() => toggleBox("submitted")}
                    className="w-full flex items-center justify-between p-4"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold" style={{ color: "#1E293B" }}>Submitted Documents</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: "#00529B", color: "white" }}>{submittedDocuments.length}</span>
                    </div>
                    <svg 
                      className="w-5 h-5 transition-transform" 
                      style={{ color: "#64748B", transform: expandedBoxes.submitted ? "rotate(180deg)" : "rotate(0deg)" }}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedBoxes.submitted && (
                    <div className="px-4 pb-4 space-y-2">
                      {submittedDocuments.map((doc) => {
                        const statusColors = getStatusColor(doc.status);
                        return (
                          <div 
                            key={doc.id} 
                            onClick={() => handleOpenDocument(doc)}
                            className="p-3 rounded-lg border cursor-pointer hover:bg-gray-50"
                            style={{ borderColor: "#E2E8F0", backgroundColor: "#F8FAFC" }}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="flex items-center gap-1">
                                  {doc.isScanned && (
                                    <span className="px-1 py-0.5 rounded text-xs" style={{ backgroundColor: "#FEF3C7", color: "#92400E" }}>Scanned</span>
                                  )}
                                  <p className="text-xs font-medium" style={{ color: "#1E293B" }}>{doc.title}</p>
                                </div>
                                <p className="text-xs" style={{ color: "#64748B" }}>{doc.studentName}</p>
                              </div>
                              <span className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: statusColors.bg, color: statusColors.text }}>
                                {doc.status}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "adviserAssignment" && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl" style={{ backgroundColor: darkMode ? "#334155" : "#FFFFFF", boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: darkMode ? "#F8FAFC" : "#1E293B" }}>Adviser Assignments</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ borderBottom: darkMode ? "1px solid #475569" : "1px solid #E2E8F0" }}>
                        <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: darkMode ? "#94A3B8" : "#64748B" }}>Student ID</th>
                        <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: darkMode ? "#94A3B8" : "#64748B" }}>Student Name</th>
                        <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: darkMode ? "#94A3B8" : "#64748B" }}>Assigned Adviser</th>
                        <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: darkMode ? "#94A3B8" : "#64748B" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => {
                        const assignment = studentAdvisers.find(s => s.studentId === student.studentId);
                        const assignedAdviser = assignment ? advisors.find(a => a.id === assignment.adviserId) : null;
                        return (
                          <tr key={student.id} style={{ borderBottom: darkMode ? "1px solid #475569" : "1px solid #E2E8F0" }}>
                            <td className="py-3 px-4 text-sm" style={{ color: darkMode ? "#F8FAFC" : "#1E293B" }}>{student.studentId}</td>
                            <td className="py-3 px-4 text-sm" style={{ color: darkMode ? "#F8FAFC" : "#1E293B" }}>{student.name}</td>
                            <td className="py-3 px-4">
                              {assignedAdviser ? (
                                <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: darkMode ? "rgba(59, 130, 246, 0.2)" : "#DBEAFE", color: darkMode ? "#3B82F6" : "#00529B" }}>
                                  {assignedAdviser.name}
                                </span>
                              ) : (
                                <span className="text-sm" style={{ color: darkMode ? "#94A3B8" : "#64748B" }}>Not Assigned</span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <button 
                                onClick={() => {}}
                                className="text-sm font-medium"
                                style={{ color: "#00529B" }}
                              >
                                Reassign
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "reports" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl" style={{ backgroundColor: darkMode ? "#334155" : "#FFFFFF", boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: darkMode ? "#F8FAFC" : "#1E293B" }}>Student Compliance Report</h3>
                  <p className="text-sm mb-4" style={{ color: darkMode ? "#94A3B8" : "#64748B" }}>View student compliance status across all requirements.</p>
                  <button className="px-4 py-2 rounded-xl text-sm font-medium" style={{ backgroundColor: "#00529B", color: "white" }}>
                    Generate Report
                  </button>
                </div>
                <div className="p-6 rounded-2xl" style={{ backgroundColor: darkMode ? "#334155" : "#FFFFFF", boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: darkMode ? "#F8FAFC" : "#1E293B" }}>Submission Status Report</h3>
                  <p className="text-sm mb-4" style={{ color: darkMode ? "#94A3B8" : "#64748B" }}>Overview of all submission statuses and trends.</p>
                  <button className="px-4 py-2 rounded-xl text-sm font-medium" style={{ backgroundColor: "#00529B", color: "white" }}>
                    Generate Report
                  </button>
                </div>
                <div className="p-6 rounded-2xl" style={{ backgroundColor: darkMode ? "#334155" : "#FFFFFF", boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: darkMode ? "#F8FAFC" : "#1E293B" }}>System Usage Report</h3>
                  <p className="text-sm mb-4" style={{ color: darkMode ? "#94A3B8" : "#64748B" }}>Track system activity and user engagement.</p>
                  <button className="px-4 py-2 rounded-xl text-sm font-medium" style={{ backgroundColor: "#00529B", color: "white" }}>
                    Generate Report
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "accessControl" && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl" style={{ backgroundColor: darkMode ? "#334155" : "#FFFFFF", boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: darkMode ? "#F8FAFC" : "#1E293B" }}>Role Management</h3>
                <div className="space-y-4">
                  <div className="p-4 rounded-xl flex items-center justify-between" style={{ backgroundColor: darkMode ? "#1E293B" : "#F8FAFC" }}>
                    <div>
                      <p className="text-sm font-medium" style={{ color: darkMode ? "#F8FAFC" : "#1E293B" }}>Admin</p>
                      <p className="text-xs" style={{ color: darkMode ? "#94A3B8" : "#64748B" }}>Full system access</p>
                    </div>
                    <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: "#FEE2E2", color: "#991B1B" }}>All Permissions</span>
                  </div>
                  <div className="p-4 rounded-xl flex items-center justify-between" style={{ backgroundColor: darkMode ? "#1E293B" : "#F8FAFC" }}>
                    <div>
                      <p className="text-sm font-medium" style={{ color: darkMode ? "#F8FAFC" : "#1E293B" }}>Adviser</p>
                      <p className="text-xs" style={{ color: darkMode ? "#94A3B8" : "#64748B" }}>Student management, document review</p>
                    </div>
                    <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: "#FEF3C7", color: "#92400E" }}>View, Edit, Approve</span>
                  </div>
                  <div className="p-4 rounded-xl flex items-center justify-between" style={{ backgroundColor: darkMode ? "#1E293B" : "#F8FAFC" }}>
                    <div>
                      <p className="text-sm font-medium" style={{ color: darkMode ? "#F8FAFC" : "#1E293B" }}>Student</p>
                      <p className="text-xs" style={{ color: darkMode ? "#94A3B8" : "#64748B" }}>Submit documents, view own data</p>
                    </div>
                    <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: "#DCFCE7", color: "#166534" }}>View, Create</span>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl" style={{ backgroundColor: darkMode ? "#334155" : "#FFFFFF", boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: darkMode ? "#F8FAFC" : "#1E293B" }}>Security Logs</h3>
                <p className="text-sm" style={{ color: darkMode ? "#94A3B8" : "#64748B" }}>No security events recorded.</p>
              </div>
            </div>
          )}

          {activeTab === "monitoring" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl" style={{ backgroundColor: "#FFFFFF", boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}>
                  <p className="text-sm" style={{ color: "#64748B" }}>Total Students</p>
                  <p className="text-2xl font-bold" style={{ color: "#1E293B" }}>{students.length}</p>
                </div>
                <div className="p-4 rounded-xl" style={{ backgroundColor: "#FFFFFF", boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}>
                  <p className="text-sm" style={{ color: "#64748B" }}>Total Advisors</p>
                  <p className="text-2xl font-bold" style={{ color: "#1E293B" }}>{advisors.length}</p>
                </div>
                <div className="p-4 rounded-xl" style={{ backgroundColor: "#FFFFFF", boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}>
                  <p className="text-sm" style={{ color: "#64748B" }}>Pending Submissions</p>
                  <p className="text-2xl font-bold" style={{ color: "#D97706" }}>{submissions.filter((s: any) => s.status === "pending").length}</p>
                </div>
                <div className="p-4 rounded-xl" style={{ backgroundColor: "#FFFFFF", boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}>
                  <p className="text-sm" style={{ color: "#64748B" }}>Total Submissions</p>
                  <p className="text-2xl font-bold" style={{ color: "#1E293B" }}>{submissions.length}</p>
                </div>
              </div>

              <div className="p-6 rounded-2xl" style={{ backgroundColor: "#FFFFFF", boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: "#1E293B" }}>All Submissions</h3>
                {submissions.length === 0 ? (
                  <p className="text-sm" style={{ color: "#64748B" }}>No submissions yet.</p>
                ) : (
                  <div className="space-y-3">
                    {submissions.map((sub: any) => (
                      <div key={sub.id} className="p-3 rounded-xl flex items-center justify-between" style={{ backgroundColor: "#F8FAFC" }}>
                        <div>
                          <p className="text-sm font-medium" style={{ color: "#1E293B" }}>{sub.title}</p>
                          <p className="text-xs" style={{ color: "#64748B" }}>{sub.studentName} • {sub.type}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          sub.status === "approved" ? "bg-green-100 text-green-700" :
                          sub.status === "rejected" ? "bg-red-100 text-red-700" :
                          sub.status === "revision" ? "bg-yellow-100 text-yellow-700" :
                          "bg-gray-100 text-gray-700"
                        }`}>
                          {sub.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="p-6 rounded-2xl w-full max-w-md" style={{ backgroundColor: "#FFFFFF" }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: "#1E293B" }}>Create New User</h3>
            
            {error && (
              <div className="mb-4 p-3 rounded-xl" style={{ backgroundColor: "#FEF2F2", color: "#991B1B" }}>
                <p className="text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#334155" }}>Student ID</label>
                <input type="text" value={formData.studentId} onChange={(e) => setFormData({ ...formData, studentId: e.target.value })} className="w-full px-4 py-2 rounded-xl border text-sm" style={{ borderColor: "#E2E8F0" }} placeholder="e.g., student001" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#334155" }}>Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 rounded-xl border text-sm" style={{ borderColor: "#E2E8F0" }} placeholder="Full Name" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#334155" }}>Email</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2 rounded-xl border text-sm" style={{ borderColor: "#E2E8F0" }} placeholder="email@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#334155" }}>Password</label>
                <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full px-4 py-2 rounded-xl border text-sm" style={{ borderColor: "#E2E8F0" }} placeholder="Password" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#334155" }}>Role</label>
                <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })} className="w-full px-4 py-2 rounded-xl border text-sm" style={{ borderColor: "#E2E8F0" }}>
                  <option value="student">Student</option>
                  <option value="advisor">Advisor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              {formData.role === "student" && (
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "#334155" }}>Assign Adviser</label>
                  <select value={formData.adviserId} onChange={(e) => setFormData({ ...formData, adviserId: e.target.value })} className="w-full px-4 py-2 rounded-xl border text-sm" style={{ borderColor: "#E2E8F0" }}>
                    <option value="">Select Adviser (Optional)</option>
                    {advisors.map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowModal(false); setError(""); }} className="flex-1 py-2 rounded-xl text-sm font-medium" style={{ backgroundColor: "#F1F5F9", color: "#64748B" }}>Cancel</button>
                <button type="submit" className="flex-1 py-2 rounded-xl text-sm font-medium" style={{ backgroundColor: "#00529B", color: "white" }}>Create User</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showBatchModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="p-6 rounded-2xl w-full max-w-md" style={{ backgroundColor: "#FFFFFF" }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: "#1E293B" }}>Create New Batch</h3>
            
            <form onSubmit={handleCreateBatch} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#334155" }}>Batch Name</label>
                <input type="text" value={batchForm.name} onChange={(e) => setBatchForm({ ...batchForm, name: e.target.value })} className="w-full px-4 py-2 rounded-xl border text-sm" style={{ borderColor: "#E2E8F0" }} placeholder="e.g., Batch 2026-1" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#334155" }}>Academic Year</label>
                <select value={batchForm.academicYear} onChange={(e) => setBatchForm({ ...batchForm, academicYear: e.target.value })} className="w-full px-4 py-2 rounded-xl border text-sm" style={{ borderColor: "#E2E8F0" }}>
                  <option value="2025-2026">2025-2026</option>
                  <option value="2026-2027">2026-2027</option>
                  <option value="2027-2028">2027-2028</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#334155" }}>Term</label>
                <select value={batchForm.term} onChange={(e) => setBatchForm({ ...batchForm, term: e.target.value })} className="w-full px-4 py-2 rounded-xl border text-sm" style={{ borderColor: "#E2E8F0" }}>
                  <option value="1st Semester">1st Semester</option>
                  <option value="2nd Semester">2nd Semester</option>
                  <option value="Summer">Summer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#334155" }}>Program</label>
                <select value={batchForm.program} onChange={(e) => setBatchForm({ ...batchForm, program: e.target.value })} className="w-full px-4 py-2 rounded-xl border text-sm" style={{ borderColor: "#E2E8F0" }}>
                  <option value="BSIT">BSIT - Information Technology</option>
                  <option value="BSBA">BSBA - Business Administration</option>
                  <option value="BSCRIM">BSCRIM - Criminology</option>
                  <option value="BSHM">BSHM - Hospitality Management</option>
                  <option value="BSENT">BSENT - Entrepreneurship</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowBatchModal(false)} className="flex-1 py-2 rounded-xl text-sm font-medium" style={{ backgroundColor: "#F1F5F9", color: "#64748B" }}>Cancel</button>
                <button type="submit" className="flex-1 py-2 rounded-xl text-sm font-medium" style={{ backgroundColor: "#00529B", color: "white" }}>Create Batch</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTemplateModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="p-6 rounded-2xl w-full max-w-md" style={{ backgroundColor: "#FFFFFF" }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: "#1E293B" }}>Upload Template</h3>
            
            <div 
              className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors hover:border-blue-500"
              style={{ borderColor: "#E2E8F0" }}
              onClick={() => document.getElementById('file-upload')?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                  const file = files[0];
                  let category = "Other";
                  let tab: "moa" | "dtr" | "evaluation" = "moa";
                  if (file.name.toLowerCase().includes('dtr')) {
                    category = 'DTR';
                    tab = "dtr";
                  } else if (file.name.toLowerCase().includes('moa')) {
                    category = 'MOA';
                    tab = "moa";
                  } else if (file.name.toLowerCase().includes('evaluation')) {
                    category = 'Evaluation';
                    tab = "evaluation";
                  }
                  const newTemplate: Template = {
                    id: Date.now().toString(),
                    name: file.name,
                    description: `Uploaded: ${file.name}`,
                    category,
                    createdAt: new Date().toISOString().split("T")[0],
                  };
                  setTemplates([...templates, newTemplate]);
                  setActiveTemplateTab(tab);
                  setEditorContent(`[Uploaded File: ${file.name}]\n\nThis is the content from your uploaded file. You can edit it here or use the recommended words from the tabs above.`);
                  setShowTemplateModal(false);
                }
              }}
            >
              <input 
                type="file" 
                id="file-upload" 
                className="hidden" 
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    let category = "Other";
                    let tab: "moa" | "dtr" | "evaluation" = "moa";
                    if (file.name.toLowerCase().includes('dtr')) {
                      category = 'DTR';
                      tab = "dtr";
                    } else if (file.name.toLowerCase().includes('moa')) {
                      category = 'MOA';
                      tab = "moa";
                    } else if (file.name.toLowerCase().includes('evaluation')) {
                      category = 'Evaluation';
                      tab = "evaluation";
                    }
                    const newTemplate: Template = {
                      id: Date.now().toString(),
                      name: file.name,
                      description: `Uploaded: ${file.name}`,
                      category,
                      createdAt: new Date().toISOString().split("T")[0],
                    };
                    setTemplates([...templates, newTemplate]);
                    setActiveTemplateTab(tab);
                    setEditorContent(`[Uploaded File: ${file.name}]\n\nThis is the content from your uploaded file. You can edit it here or use the recommended words from the tabs above.`);
                    setShowTemplateModal(false);
                  }
                }}
              />
              <svg className="w-12 h-12 mx-auto mb-4" style={{ color: "#94A3B8" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-sm font-medium" style={{ color: "#1E293B" }}>Drop file here or click to upload</p>
              <p className="text-xs mt-2" style={{ color: "#64748B" }}>PDF, Word, Excel, PowerPoint (max 10MB)</p>
            </div>

            <div className="flex gap-3 pt-4">
              <button type="button" onClick={() => setShowTemplateModal(false)} className="flex-1 py-2 rounded-xl text-sm font-medium" style={{ backgroundColor: "#F1F5F9", color: "#64748B" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showDocumentModal && selectedDocument && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="p-6 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-auto" style={{ backgroundColor: "#FFFFFF" }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  {selectedDocument.isScanned && (
                    <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: "#FEF3C7", color: "#92400E" }}>Scanned</span>
                  )}
                  <h3 className="text-lg font-semibold" style={{ color: "#1E293B" }}>{selectedDocument.title}</h3>
                </div>
                <p className="text-sm" style={{ color: "#64748B" }}>{selectedDocument.studentName} ({selectedDocument.studentId}) • {selectedDocument.fileName}</p>
              </div>
              <button onClick={() => { setShowDocumentModal(false); setSelectedDocument(null); }} className="p-2 rounded-lg hover:bg-gray-100">
                <svg className="w-5 h-5" style={{ color: "#64748B" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4 p-4 rounded-xl" style={{ backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0" }}>
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5" style={{ color: "#64748B" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getTypeIcon(selectedDocument.fileType, selectedDocument.isScanned)} />
                </svg>
                <span className="text-sm font-medium" style={{ color: "#1E293B" }}>Document Content</span>
                {selectedDocument.isScanned && (
                  <span className="text-xs" style={{ color: "#92400E" }}>(Image-based - Can add manual text)</span>
                )}
              </div>
              {selectedDocument.isScanned ? (
                <div className="space-y-3">
                  <div className="p-3 rounded-lg border" style={{ borderColor: "#E2E8F0", backgroundColor: "#FFFFFF" }}>
                    <p className="text-xs mb-2" style={{ color: "#64748B" }}>This is a scanned document. You can add manual text below:</p>
                    <textarea
                      value={documentContent}
                      onChange={(e) => setDocumentContent(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border text-sm"
                      style={{ borderColor: "#E2E8F0", minHeight: "200px" }}
                      placeholder="Type or paste text here to fill in the document manually..."
                    />
                  </div>
                  <button 
                    onClick={handleSaveDocumentContent}
                    className="px-3 py-1 text-sm font-medium rounded-lg"
                    style={{ backgroundColor: "#00529B", color: "white" }}
                  >
                    Save Manual Text
                  </button>
                </div>
              ) : (
                <div>
                  <textarea
                    value={documentContent}
                    onChange={(e) => setDocumentContent(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border text-sm"
                    style={{ borderColor: "#E2E8F0", minHeight: "200px" }}
                    placeholder="Edit document content here..."
                  />
                  <button 
                    onClick={handleSaveDocumentContent}
                    className="mt-2 px-3 py-1 text-sm font-medium rounded-lg"
                    style={{ backgroundColor: "#00529B", color: "white" }}
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </div>

            {selectedDocument.feedback && (
              <div className="mb-4 p-3 rounded-xl" style={{ backgroundColor: "#FEF3C7", border: "1px solid #FCD34D" }}>
                <p className="text-sm font-medium" style={{ color: "#92400E" }}>Feedback:</p>
                <p className="text-sm" style={{ color: "#78350F" }}>{selectedDocument.feedback}</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: "#E2E8F0" }}>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium" style={{ color: "#64748B" }}>Status:</span>
                <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: getStatusColor(selectedDocument.status).bg, color: getStatusColor(selectedDocument.status).text }}>
                  {selectedDocument.status.charAt(0).toUpperCase() + selectedDocument.status.slice(1)}
                </span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleUpdateDocumentStatus(selectedDocument.id, "rejected")}
                  className="px-4 py-2 rounded-xl text-sm font-medium"
                  style={{ backgroundColor: "#FEE2E2", color: "#DC2626" }}
                >
                  Reject
                </button>
                <button 
                  onClick={() => handleUpdateDocumentStatus(selectedDocument.id, "revision")}
                  className="px-4 py-2 rounded-xl text-sm font-medium"
                  style={{ backgroundColor: "#FEF3C7", color: "#D97706" }}
                >
                  Request Revision
                </button>
                <button 
                  onClick={() => handleUpdateDocumentStatus(selectedDocument.id, "approved")}
                  className="px-4 py-2 rounded-xl text-sm font-medium"
                  style={{ backgroundColor: "#DCFCE7", color: "#16A34A" }}
                >
                  Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showRecommendedWords && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="p-6 rounded-2xl w-full max-w-md" style={{ backgroundColor: "#FFFFFF" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold" style={{ color: "#1E293B" }}>Recommended Words - {activeTemplateTab.toUpperCase()}</h3>
              <button onClick={() => setShowRecommendedWords(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <svg className="w-5 h-5" style={{ color: "#64748B" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-sm mb-4" style={{ color: "#64748B" }}>Click a word to insert it into the editor, or type manually in the editor area.</p>
            <div className="flex flex-wrap gap-2">
              {recommendedWords[activeTemplateTab].map((word, idx) => (
                <button
                  key={idx}
                  onClick={() => insertWord(word)}
                  className="px-3 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80"
                  style={{ backgroundColor: "#F0F7FF", color: "#00529B" }}
                >
                  {word}
                </button>
              ))}
            </div>
            <div className="flex gap-3 pt-4 mt-4 border-t" style={{ borderColor: "#E2E8F0" }}>
              <button 
                onClick={() => setShowRecommendedWords(false)} 
                className="flex-1 py-2 rounded-xl text-sm font-medium"
                style={{ backgroundColor: "#F1F5F9", color: "#64748B" }}
              >
                Close
              </button>
              <button 
                onClick={() => { setShowRecommendedWords(false); setShowTemplateModal(true); }}
                className="flex-1 py-2 rounded-xl text-sm font-medium"
                style={{ backgroundColor: "#00529B", color: "white" }}
              >
                Upload File
              </button>
            </div>
          </div>
        </div>
      )}

      {showWordEditor && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="p-6 rounded-2xl w-full max-w-md" style={{ backgroundColor: "#FFFFFF" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold" style={{ color: "#1E293B" }}>Edit: {selectedWord}</h3>
              <button onClick={() => { stopSpeaking(); stopVoiceInput(); setShowWordEditor(false); }} className="p-1 rounded-lg hover:bg-gray-100">
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
                    onClick={() => { stopSpeaking(); stopVoiceInput(); handleWordSelectFromList(value); }}
                    className="px-3 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80"
                    style={{ backgroundColor: "#F0F7FF", color: "#00529B" }}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl border" style={{ borderColor: "#00529B", backgroundColor: "#F0F7FF" }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold" style={{ color: "#00529B" }}>Type Manually</p>
                <div className="flex items-center gap-2">
                  {isSpeaking && (
                    <button 
                      onClick={() => speakText("")}
                      className="flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium"
                      style={{ backgroundColor: "#DC2626", color: "white" }}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9 10h.01M15 10h.01M9 15h.01M15 15h.01" />
                      </svg>
                      Stop
                    </button>
                  )}
                  <button 
                    onClick={isListening ? stopVoiceInput : startVoiceInput}
                    className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium ${isListening ? 'animate-pulse' : ''}`}
                    style={{ backgroundColor: isListening ? "#DC2626" : "#16A34A", color: "white" }}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                    {isListening ? "Listening..." : "Voice Input"}
                  </button>
                </div>
              </div>
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
            </div>

            <div className="flex gap-3 pt-4 mt-4 border-t" style={{ borderColor: "#E2E8F0" }}>
              <button 
                onClick={() => { stopSpeaking(); stopVoiceInput(); setShowWordEditor(false); }} 
                className="flex-1 py-2 rounded-xl text-sm font-medium"
                style={{ backgroundColor: "#F1F5F9", color: "#64748B" }}
              >
                Cancel
              </button>
              <button 
                onClick={() => { stopSpeaking(); stopVoiceInput(); handleWordReplace(); }}
                className="flex-1 py-2 rounded-xl text-sm font-medium"
                style={{ backgroundColor: "#00529B", color: "white" }}
              >
                Insert Value
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}