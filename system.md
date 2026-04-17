# System.md

## Overview
This project is a **Practicum Management System** built with **Next.js 16**, **React 19**, and **TypeScript**.

It is a client-heavy demo application that uses **localStorage** for session state and persisted data. The app supports three roles:

- **Student**
- **Advisor**
- **Admin**

## Core Behavior

### 1) App Start
- The root route (`/`) redirects to `/login`.
- The login page lets the user choose a demo role.
- After login, the app stores the selected role in `localStorage` under `demo_role`.

### 2) Session Flow
- `getSession()` reads the current role from `localStorage`.
- Protected pages check the session and redirect to `/login` when needed.
- Admin/advisor users are routed to their role-specific pages.
- Student users are routed to `/dashboard`.

### 3) Data Flow
Most page data is stored locally in the browser:
- `practicum_journals`
- `practicum_submissions`
- `practicum_messages`
- `practicum_documents`
- `practicum_admin_documents`
- `practicum_adviser_assignments`
- `practicum-daily-journal`

If no saved data exists, the pages initialize with demo/sample data.

### 4) Theme Flow
- The app uses a global theme provider.
- `ThemeProvider` and `ThemeWrapper` in `src/app/layout.tsx` wrap the app.
- The UI supports light/dark mode.

## Main Pages and Their Responsibilities

### `/login`
**Purpose:** Demo account selection.

**Main function:**
- `handleDemoLogin(role)`
  - Saves the selected role.
  - Redirects to the correct page.

---

### `/dashboard`
**Purpose:** Student home page.

**Responsibilities:**
- Shows notifications, announcements, deadlines, and recent entries.
- Reads student-related submissions from localStorage.
- Builds dashboard stats and notification summaries.

**Key processes:**
- Load data from localStorage.
- Merge stored journal/document/submission data.
- Generate dashboard counts and alerts.

---

### `/journal`
**Purpose:** Student journal submission and management.

**Responsibilities:**
- Create journal entries.
- Save drafts and submitted journals.
- Support AI/journal-related helper features.
- Show sample journal history if localStorage is empty.

**Key processes:**
- Load saved journals.
- Initialize sample journals on first run.
- Save new journals to localStorage.
- Push submitted entries into `practicum_submissions`.

---

### `/documents`
**Purpose:** Student document viewer / submission list.

**Responsibilities:**
- Show student submissions.
- Filter by type and status.
- Read from `practicum_submissions`.

**Key process:**
- Filter all stored submissions by the current student ID.

---

### `/dtr`
**Purpose:** Daily Time Record upload and submission.

**Responsibilities:**
- Upload DTR files.
- Mark urgent submissions.
- Add submissions to `practicum_submissions`.

**Key process:**
- Build a submission object and store it in localStorage.

---

### `/moa`
**Purpose:** Memorandum of Agreement upload and submission.

**Responsibilities:**
- Upload MOA files.
- Track urgent submissions.
- Add submissions to `practicum_submissions`.

**Key process:**
- Build a submission object and store it in localStorage.

---

### `/evaluation`
**Purpose:** Evaluation form upload and submission.

**Responsibilities:**
- Upload evaluation files.
- Track urgent submissions.
- Add submissions to `practicum_submissions`.

**Key process:**
- Build a submission object and store it in localStorage.

---

### `/messages`
**Purpose:** Simple internal messaging.

**Responsibilities:**
- Compose messages.
- Read and save messages in localStorage.
- Filter inbox by role and session.

**Key process:**
- Messages are scoped by sender/receiver IDs.

---

### `/templates`
**Purpose:** Template browsing.

**Responsibilities:**
- Show template cards.
- Let users access document templates.

---

### `/advisor`
**Purpose:** Advisor review and approval workflow.

**Responsibilities:**
- View student submissions.
- Review journal/document/DTR/evaluation/resume submissions.
- Approve, reject, or request revision.
- Save review feedback to localStorage.

**Key processes:**
- Load submissions from `practicum_submissions`.
- Seed the system with sample submissions if storage is empty.
- Update submission status and feedback.

---

### `/admin`
**Purpose:** Admin management console.

**Responsibilities:**
- Manage users.
- Manage batches.
- Manage templates.
- Review submitted documents.
- Manage adviser assignments.
- Support document editing and word recommendation helpers.

**Key processes:**
- Load users, assignments, and submitted documents from localStorage.
- Seed admin documents if none exist.
- Save updates back to localStorage.

---

### `/profile`
**Purpose:** View and edit profile data.

**Responsibilities:**
- Display current user profile.
- Show notifications.
- Support navigation to other sections.

---

## Shared System Functions

### Authentication and Session Functions
Defined in `src/lib/auth.ts`:

- `getSession()`
  - Reads the active role from `localStorage`.
  - Returns the matching demo user.

- `login(role)`
  - Saves the role to `localStorage`.
  - Returns the matching demo user.

- `logout()`
  - Removes the saved role from `localStorage`.

- `getUsers()`
  - Returns all demo users.

- `createUser(data)`
  - Creates a new user object in memory.
  - Returns `null` if the role already exists in the demo map.

- `deleteUser(id)`
  - Currently a stub.

- `initializeUsers()`
  - Currently a stub.

### Global Theme Functions / Components
- `ThemeProvider`
- `ThemeWrapper`

These wrap the app in the root layout and make the theme available to pages.

## Important Storage Keys

- `demo_role` — active demo session role
- `practicum_journals` — saved journal entries
- `practicum_submissions` — all submission records
- `practicum_messages` — message inbox/outbox
- `practicum_documents` — stored document records
- `practicum_admin_documents` — admin-reviewed document records
- `practicum_adviser_assignments` — student-to-adviser mapping
- `practicum-daily-journal` — dashboard journal data source

## Main System Processes

### Login Process
1. User opens `/login`.
2. User chooses a demo role.
3. `login(role)` saves the role.
4. App routes the user to the correct page.

### Submission Process
1. Student fills out a form or uploads a file.
2. Page creates a submission object.
3. Submission is saved to `practicum_submissions`.
4. Advisor and admin pages can later read it.

### Review Process
1. Advisor or admin opens a submission.
2. They change status to approved, rejected, or revision.
3. Feedback is stored with the record.
4. Updated data is written back to localStorage.

### Dashboard Aggregation Process
1. Dashboard reads journals, documents, and submissions.
2. It filters records for the active student.
3. It calculates counts and displays alerts.

### Messaging Process
1. User opens `/messages`.
2. Message is created with sender and receiver IDs.
3. Message is saved to localStorage.
4. Inbox filters by current session.

## Notes
- This is a demo/local-first system, not a backend-authenticated production app.
- Many page actions are implemented in the client using browser storage.
- Some admin functions such as `deleteUser()` and `initializeUsers()` are placeholders and may be expanded later.
