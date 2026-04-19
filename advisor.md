# Advisor Documentation

## Overview

The Practicum Management System provides advisors with a comprehensive dashboard for managing student submissions, reviewing documents, and providing feedback. This document covers all advisor processes, features, and code implementations.

**Related Documentation:** [student.md](./student.md) - For student-side processes and workflows.

---

## Table of Contents

1. [Authentication](#authentication)
2. [Dashboard](#dashboard)
3. [Document Review Workflow](#document-review-workflow)
4. [AI Feedback System](#ai-feedback-system)
5. [Student Management](#student-management)
6. [Data Models](#data-models)
7. [Functions Reference](#functions-reference)
8. [Components](#components)

---

## Authentication

### Login Process

Advisors access the system via `/login` and are routed to `/advisor` upon successful authentication.

**File:** `src/lib/auth.ts`

```typescript
export interface User {
  id: string;
  studentId: string;
  name: string;
  email: string;
  role: "admin" | "advisor" | "student";
}

export const DEMO_USERS: Record<UserRole, User> = {
  advisor: {
    id: "advisor-001",
    studentId: "ADVISOR001",
    name: "Ms. Rodriguez",
    email: "rodriguez@practicum.edu",
    role: "advisor",
  },
  // ... other roles
};
```

### Session Management

**File:** `src/lib/auth.ts`

```typescript
export function getSession(): User | null {
  if (typeof window === "undefined") return null;
  const role = localStorage.getItem("demo_role") as UserRole | null;
  if (!role) return null;
  return DEMO_USERS[role] || null;
}

export function login(role: UserRole): User {
  if (typeof window !== "undefined") {
    localStorage.setItem("demo_role", role);
  }
  return DEMO_USERS[role];
}

export function logout(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("demo_role");
  }
}
```

### Route Protection

**File:** `src/app/advisor/page.tsx` (lines 71-77)

```typescript
useEffect(() => {
  const currentSession = getSession();
  if (!currentSession || currentSession.role !== "advisor") {
    router.push("/login");
    return;
  }
  setSession(currentSession);
  // ... load submissions
}, []);
```

---

## Dashboard

### Dashboard Overview

The advisor dashboard displays:
- Welcome message with current date
- Statistics cards (My Students, Pending, Approved, Revision)
- Quick action buttons
- Recent activity feed
- Students at risk widget
- Auto-priority queue
- AI feedback suggestions

### Statistics Cards

**File:** `src/app/advisor/page.tsx` (lines 425-470)

```typescript
<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
  {/* My Students Card */}
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
  
  {/* Pending Card */}
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
  
  {/* Approved Card */}
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
  
  {/* Revision Card */}
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
```

### Tab Navigation

**File:** `src/app/advisor/page.tsx` (lines 346-359)

```typescript
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
```

---

## Document Review Workflow

### Process Overview

1. Browse submissions by document type (MOA, Evaluation, DTR, Resume)
2. Select a submission to load in document viewer
3. Review content with highlighted keywords
4. Add revision comments to specific text
5. Take action (Approve, Request Revision, Reject)
6. Provide feedback notes

### Document Viewer

**File:** `src/app/advisor/page.tsx` (lines 625-733)

```typescript
{(activeTab === "documents" || activeTab === "approvals") && (
  <div className="flex gap-6">
    {/* Left Side - Document Viewer */}
    <div className="flex-1 space-y-6">
      <div className="p-6 rounded-2xl" style={{ backgroundColor: "#FFFFFF", boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold" style={{ color: "#1E293B" }}>Document Viewer</h3>
          <div className="flex items-center gap-2">
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
    </div>
  </div>
)}
```

### Submission Categories

**File:** `src/app/advisor/page.tsx` (lines 781-1010)

```typescript
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
      <svg className="w-5 h-5 transition-transform" style={{ color: "#64748B", transform: expandedBoxes.moa ? "rotate(180deg)" : "rotate(0deg)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
  
  {/* Similar structure for Evaluation, DTR, Resume, and Revision Requirements */}
</div>
```

### Action Modal

**File:** `src/app/advisor/page.tsx` (lines 1016-1045)

```typescript
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
```

### Revision Comments System

**File:** `src/app/advisor/page.tsx` (lines 1123-1170)

```typescript
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
        <button onClick={() => { setShowCommentModal(false); setSelectedText(""); }} className="flex-1 py-2 rounded-xl text-sm font-medium" style={{ backgroundColor: "#F1F5F9", color: "#64748B" }}>Cancel</button>
        <button onClick={addRevisionComment} className="flex-1 py-2 rounded-xl text-sm font-medium" style={{ backgroundColor: "#D97706", color: "white" }}>Add Comment</button>
      </div>
    </div>
  </div>
)}
```

---

## AI Feedback System

### AI Feedback Suggestions

**File:** `src/app/advisor/page.tsx` (lines 149-161)

```typescript
const getAiFeedbackSuggestions = (submission: Submission | StudentSubmission | null) => {
  if (!submission) return ["Open a submission to see AI-assisted feedback suggestions."];

  const suggestions: string[] = [];
  if (submission.status === "revision") suggestions.push("Acknowledge the previous revision note and confirm what needs to be corrected before approval.");
  if (submission.type === "journal") suggestions.push("Ask the student to expand concrete daily tasks, learning outcomes, and hours rendered.");
  if (submission.type === "dtr") suggestions.push("Verify completeness of dates, time in/out, total hours, and supporting signatures.");
  if (submission.type === "moa") suggestions.push("Check company details, practicum duration, and signatures before final approval.");
  if (submission.type === "evaluation") suggestions.push("Review whether performance areas and overall rating are fully completed.");
  if (submission.content && submission.content.length < 120) suggestions.push("The content looks short. Request more specific details or supporting context.");
  if (suggestions.length === 0) suggestions.push("Submission looks complete. Confirm alignment with practicum standards before approval.");
  return suggestions;
};
```

### Word Recommendations Dictionary

**File:** `src/app/advisor/page.tsx` (lines 172-185)

```typescript
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
```

### Word Editor Modal

**File:** `src/app/advisor/page.tsx` (lines 1047-1121)

```typescript
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
        <button onClick={() => { setShowWordEditor(false); setSelectedWord(""); }} className="flex-1 py-2 rounded-xl text-sm font-medium" style={{ backgroundColor: "#F1F5F9", color: "#64748B" }}>Cancel</button>
        <button onClick={handleWordReplace} className="flex-1 py-2 rounded-xl text-sm font-medium" style={{ backgroundColor: "#00529B", color: "white" }}>Insert Value</button>
      </div>
    </div>
  </div>
)}
```

### Voice Input

**File:** `src/app/advisor/page.tsx` (lines 257-288)

```typescript
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
```

### Content Highlighting

**File:** `src/app/advisor/page.tsx` (lines 290-327)

```typescript
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
```

---

## Student Management

### Students at Risk Widget

**File:** `src/app/advisor/page.tsx` (lines 130-147)

```typescript
const studentsAtRisk = students
  .map((student) => {
    const studentItems = submissions.filter((sub) => sub.studentId === student.studentId);
    const pendingItems = studentItems.filter((sub) => sub.status === "pending").length;
    const revisionItems = studentItems.filter((sub) => sub.status === "revision").length;
    const approvedItems = studentItems.filter((sub) => sub.status === "approved").length;
    const riskScore = pendingItems + revisionItems * 2 + (approvedItems === 0 ? 1 : 0);
    return {
      ...student,
      pendingItems,
      revisionItems,
      approvedItems,
      riskScore,
    };
  })
  .filter((student) => student.riskScore > 0)
  .sort((a, b) => b.riskScore - a.riskScore)
  .slice(0, 3);
```

**Risk Score Formula:**
```
riskScore = pendingItems + (revisionItems × 2) + (approvedItems === 0 ? 1 : 0)
```

### Auto-Priority Queue

**File:** `src/app/advisor/page.tsx` (lines 121-129)

```typescript
const priorityQueue = [...submissions]
  .filter(s => s.status === "pending" || s.status === "revision")
  .sort((a, b) => {
    if (a.status === "revision" && b.status !== "revision") return -1;
    if (a.status !== "revision" && b.status === "revision") return 1;
    if (a.isUrgent && !b.isUrgent) return -1;
    if (!a.isUrgent && b.isUrgent) return 1;
    return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
  });
```

**Priority Order:**
1. Revision status (highest priority)
2. Urgent flag
3. Oldest submission date

### Student List

**File:** `src/app/advisor/page.tsx` (lines 65-69)

```typescript
const students = [
  { id: "1", studentId: "student1", name: "Demo Student 1", company: "Tech Corp" },
  { id: "2", studentId: "student2", name: "Demo Student 2", company: "Business Inc" },
  { id: "3", studentId: "student3", name: "Demo Student 3", company: "Local Co" },
];
```

---

## Data Models

### Submission Interface

**File:** `src/app/advisor/page.tsx` (lines 8-19)

```typescript
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
```

### StudentSubmission Interface

**File:** `src/app/advisor/page.tsx` (lines 21-33)

```typescript
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
```

### RevisionComment Interface

**File:** `src/app/advisor/page.tsx` (line 56)

```typescript
const [revisionComments, setRevisionComments] = useState<{id: string; startIndex: number; endIndex: number; text: string; comment: string}[]>([]);
```

---

## Functions Reference

### Core Functions

| Function | Location | Purpose |
|----------|----------|---------|
| `handleAction()` | Line 109 | Process approve/reject/revision actions on submissions |
| `handleLogout()` | Line 104 | Log out advisor and redirect to login |
| `loadStudentSubmission()` | Line 213 | Load submission content into editor |
| `getAiFeedbackSuggestions()` | Line 149 | Generate AI-assisted feedback based on submission type |
| `getStatusColor()` | Line 163 | Return color scheme for submission status |
| `getDocumentCount()` | Line 218 | Count pending documents by type |
| `getRevisionCount()` | Line 222 | Count documents needing revision |

### Document Editing Functions

| Function | Location | Purpose |
|----------|----------|---------|
| `handleWordClick()` | Line 191 | Open word editor for selected word |
| `handleWordReplace()` | Line 197 | Replace word with custom value |
| `handleWordSelectFromList()` | Line 205 | Replace word with recommended value |
| `renderContentWithHighlights()` | Line 290 | Render document with clickable keywords |

### Comment Functions

| Function | Location | Purpose |
|----------|----------|---------|
| `handleTextSelection()` | Line 226 | Handle text selection for comments |
| `addRevisionComment()` | Line 236 | Add inline revision comment |
| `deleteRevisionComment()` | Line 253 | Remove revision comment |

### Voice Input Functions

| Function | Location | Purpose |
|----------|----------|---------|
| `startVoiceInput()` | Line 257 | Start speech recognition |
| `stopVoiceInput()` | Line 286 | Stop speech recognition |

### UI State Functions

| Function | Location | Purpose |
|----------|----------|---------|
| `toggleBox()` | Line 187 | Expand/collapse submission boxes |

---

## Components

### Sidebar Navigation

**File:** `src/components/Sidebar.tsx`

The sidebar displays different navigation items based on user role:

```typescript
{ label: "Submissions", href: "/advisor", icon: "chart", roles: ["advisor"] }
```

### Statistics Cards

Four cards displaying:
1. **My Students** - Count of assigned students (blue theme)
2. **Pending** - Pending submissions count (amber theme)
3. **Approved** - Approved submissions count (green theme)
4. **Revision** - Submissions needing revision (red theme)

### Document Viewer

- Edit mode toggle
- Text selection with revision comment capability
- Word recommendations with clickable replacements
- Voice input support

### Word Editor Modal

- Pre-defined word recommendations per category
- Custom value input
- Voice input integration

### Revision Comments System

- Inline text highlighting
- Comment list sidebar
- Delete comment functionality

---

## Status Colors

| Status | Background | Text |
|--------|------------|------|
| pending | `#F1F5F9` | `#64748B` |
| approved | `#DCFCE7` | `#16A34A` |
| rejected | `#FEE2E2` | `#DC2626` |
| revision | `#FEF3C7` | `#D97706` |

---

## Document Types

| Type | Description | Review Focus |
|------|-------------|--------------|
| MOA | Memorandum of Agreement | Company details, duration, signatures |
| Evaluation | Student performance form | Rating completeness, comments |
| DTR | Daily Time Record | Dates, time in/out, hours, signatures |
| Resume | Student resume | Format, content completeness |
| Journal | Daily activity logs | Tasks, learning outcomes, hours |

---

## Cross-Reference

For **student-side processes and workflows**, see [student.md](./student.md).

### Related Documentation

- [student.md](./student.md) - Student processes, journal management, document uploads
- [admin.md](./admin.md) - Admin features for user and advisor management

---

*Last Updated: April 2026*
