# Code Reference

This document is a compact code map for the project. It is **not** a full source dump. It explains what each file does, what it exports, and the important functions/state used in the app.

## Project Stack
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Browser `localStorage` for demo persistence

---

## App Flow

### Route flow
- `/` → redirects to `/login`
- `/login` → demo role selection
- Student routes:
  - `/dashboard`
  - `/journal`
  - `/dtr`
  - `/moa`
  - `/evaluation`
  - `/documents`
  - `/messages`
  - `/templates`
  - `/profile`
- Advisor route:
  - `/advisor`
- Admin route:
  - `/admin`

### Session flow
- Session is stored in `localStorage` under `demo_role`
- `getSession()` resolves the current demo user from the role
- `login(role)` writes the role and returns the demo user
- `logout()` clears the role

### Shared persistence keys
- `demo_role`
- `practicum_journals`
- `practicum_submissions`
- `practicum_messages`
- `practicum_documents`
- `practicum_admin_documents`
- `practicum_adviser_assignments`
- `practicum-daily-journal`
- `practicum-darkmode`

---

## File Reference

## `src/app/page.tsx`
**Purpose:** Root landing page.

**Exports:**
- `Home()`

**Behavior:**
- Immediately redirects to `/login` using `router.replace()`.
- Shows a simple loading state while redirecting.

**Key logic:**
- `useEffect(() => router.replace("/login"), [])`

---

## `src/app/login/page.tsx`
**Purpose:** Demo login screen.

**Exports:**
- `LoginPage()`

**Imports used:**
- `login`, `getSession`, `UserRole` from `@/lib/auth`

**State:**
- `isLoading`

**Key functions:**
- `handleDemoLogin(role)`
  - sets loading state
  - stores selected role via `login(role)`
  - routes to:
    - `/admin` for admin
    - `/advisor` for advisor
    - `/dashboard` for student

**Session redirect behavior:**
- If a session already exists, user is redirected automatically based on role.

---

## `src/app/layout.tsx`
**Purpose:** Root app layout and metadata.

**Exports:**
- `metadata`
- `RootLayout({ children })`

**Wraps the app with:**
- `ThemeProvider`
- `ThemeWrapper`

**Notes:**
- Applies the Inter font.
- Sets the base page background/text colors.

---

## `src/app/globals.css`
**Purpose:** Global styles and theme variables.

**Key contents:**
- Tailwind import
- CSS variables for background/foreground
- Dark mode fallback variables
- Base body font and colors

---

## `src/lib/auth.ts`
**Purpose:** Demo authentication and user store.

**Exports:**
- `User` interface
- `UserRole` type
- `DEMO_USERS`
- `getSession()`
- `login(role)`
- `logout()`
- `getUsers()`
- `createUser(data)`
- `deleteUser(id)`
- `initializeUsers()`

### `User` interface
Fields:
- `id`
- `studentId`
- `name`
- `email`
- `role`

### `DEMO_USERS`
Contains 3 demo accounts:
- admin
- advisor
- student

### Function behavior
- `getSession()`
  - reads `demo_role` from `localStorage`
  - returns matching user or `null`
- `login(role)`
  - writes `demo_role`
  - returns the demo user
- `logout()`
  - removes `demo_role`
- `getUsers()`
  - returns all demo users
- `createUser(data)`
  - creates a user object in memory
  - currently returns `null` if the demo role already exists
- `deleteUser(id)`
  - stub
- `initializeUsers()`
  - stub

---

## `src/lib/ThemeContext.tsx`
**Purpose:** Global dark mode state.

**Exports:**
- `ThemeProvider({ children })`
- `useTheme()`

**State:**
- `darkMode`
- `setDarkMode`

**Behavior:**
- Loads `practicum-darkmode` from `localStorage`
- Writes dark mode changes back to `localStorage`
- Throws if `useTheme()` is used outside the provider

---

## `src/lib/ThemeWrapper.tsx`
**Purpose:** Applies/removes the `dark` class on `<html>`.

**Exports:**
- default `ThemeWrapper({ children })`

**Behavior:**
- Watches `darkMode`
- Adds `dark` class when enabled
- Removes `dark` class when disabled

---

## `src/components/Sidebar.tsx`
**Purpose:** Shared sidebar used by the newer template page.

**Exports:**
- default `Sidebar({ session })`

**Props:**
- `session: User | null`

**Important logic:**
- Filters nav items by role
- Uses `usePathname()` to mark the active route
- `handleLogout()` clears session and returns to `/login`
- `getIcon(name)` returns the SVG path for each sidebar item

**Nav items supported:**
- Dashboard
- Journal
- DTR
- MOA
- Evaluation
- Templates
- Documents
- Messages
- Submissions
- Users

---

## `src/components/Topbar.tsx`
**Purpose:** Shared top bar used by the newer template page.

**Exports:**
- default `Topbar({ session, title })`

**Props:**
- `session: User | null`
- `title: string`

**State:**
- `showNotifications`
- `showUserMenu`

**Refs:**
- `notifRef`
- `userRef`

**Key functions:**
- `handleClickOutside(event)`
  - closes dropdowns when clicking outside
- `handleLogout()`
  - logs out and routes to `/login`

**UI actions:**
- Theme toggle
- Notifications dropdown
- Profile menu
- Sign out

---

## `src/app/dashboard/page.tsx`
**Purpose:** Student dashboard.

**Exports:**
- default `Dashboard()`

**State:**
- `session`
- `entries`
- `stats`
- `activeNav`
- `showNotifications`
- `showUserMenu`
- `notifications`
- `announcements`
- `deadlines`
- `recentEntries`

**Main sample data:**
- `sampleNotifications`
- `sampleAnnouncements`
- `sampleDeadlines`
- `sampleRecentEntries`

**Key functions:**
- `handleLogout()`
- `markAllAsRead()`

**Main process:**
1. Loads current session.
2. Redirects non-students.
3. Reads data from:
   - `practicum-daily-journal`
   - `practicum_documents`
   - `practicum_journals`
   - `practicum_submissions`
4. Calculates stats:
   - total entries
   - total hours
   - approved/rejected/pending submissions
5. Builds notification list from current user submissions.

---

## `src/app/journal/page.tsx`
**Purpose:** Student journal editor and journal history.

**Exports:**
- default `JournalPage()`

**State:**
- `session`
- `activeNav`
- `isRecording`
- `isProcessing`
- `activities`
- `aiSummary`
- `showSummary`
- `isGenerating`
- `isUrgent`
- `showPreview`
- `journals`
- `showNotifications`
- `notifications`
- `showUserMenu`
- `viewJournal`

**Important storage:**
- `practicum_journals`
- `practicum_submissions`

**Key functions:**
- `saveJournals(data)`
- `handleSubmit()`
  - creates a journal entry and pushes it to `practicum_submissions`
- `handleSaveDraft()`
- `generateSummary()` / AI-related journal helper logic
- voice-recognition helpers used in the page
- `handleLogout()`
- `markAllAsRead()`

**Initialization behavior:**
- If no saved journals exist, the page seeds demo journal entries.

---

## `src/app/documents/page.tsx`
**Purpose:** Student document/submission browser.

**Exports:**
- default `DocumentsPage()`

**Types:**
- `Submission`
- `Revision`
- `Notification`

**State:**
- `session`
- `activeNav`
- `showNotifications`
- `notifications`
- `submissions`
- `filterType`
- `filterStatus`
- `showUserMenu`

**Key functions:**
- `handleLogout()`
- `markAllAsRead()`
- `filteredSubmissions`
- `getStatusColor(status)`
- `getTypeIcon(type)`

**Main process:**
- Reads `practicum_submissions`
- Filters records by current student ID
- Displays only the current student’s submissions

---

## `src/app/dtr/page.tsx`
**Purpose:** Student DTR upload page.

**Exports:**
- default `DTRPage()`

**State:**
- `session`
- `activeNav`
- `isUrgent`
- `uploadedFile`
- `fileName`
- `showNotifications`
- `notifications`
- `showUserMenu`

**Key functions:**
- `handleLogout()`
- `markAllAsRead()`
- `handleFileUpload()`
  - opens a file input
  - reads selected file as data URL

**Submission behavior:**
- When a file is uploaded/submitted, it is added to `practicum_submissions`.

---

## `src/app/moa/page.tsx`
**Purpose:** Student MOA upload page.

**Exports:**
- default `MOAPage()`

**State:**
- `session`
- `activeNav`
- `isUrgent`
- `uploadedFile`
- `fileName`
- `showNotifications`
- `notifications`
- `showUserMenu`

**Data:**
- `sampleRevisions`

**Key functions:**
- `handleLogout()`
- `markAllAsRead()`
- `handleFileUpload()`

**Submission behavior:**
- Builds an MOA submission and stores it in `practicum_submissions`.

---

## `src/app/evaluation/page.tsx`
**Purpose:** Student evaluation form upload page.

**Exports:**
- default `EvaluationPage()`

**State:**
- `session`
- `activeNav`
- `isUrgent`
- `uploadedFile`
- `fileName`
- `showNotifications`
- `notifications`
- `showUserMenu`

**Key functions:**
- `handleLogout()`
- `markAllAsRead()`
- `handleFileUpload()`

**Submission behavior:**
- Builds an evaluation submission and stores it in `practicum_submissions`.

---

## `src/app/messages/page.tsx`
**Purpose:** Internal messaging page.

**Exports:**
- default `MessagesPage()`

**Types:**
- `Message`

**State:**
- `session`
- `messages`
- `showCompose`
- `composeData`
- `allUsers`
- `showUserMenu`

**Key functions:**
- `saveMessages(data)`
- `handleLogout()`
- `handleSendMessage(e)`
- `getNavItems()`

**Behavior:**
- Loads all users from `getUsers()`
- Reads messages from `practicum_messages`
- Filters inbox based on role
- Allows role-specific navigation links

**Message logic:**
- Students see messages addressed to them
- Admin/advisor see sent and received messages

---

## `src/app/profile/page.tsx`
**Purpose:** Student profile page.

**Exports:**
- default `ProfilePage()`

**State:**
- `session`
- `activeNav`
- `showNotifications`
- `notifications`
- `showUserMenu`
- `profileData`

**Profile fields:**
- course
- yearSection
- specialization
- email
- mobile
- homeAddress
- guardianName
- relationship
- emergencyContact
- status
- skills

**Key functions:**
- `handleLogout()`
- `markAllAsRead()`

---

## `src/app/templates/page.tsx`
**Purpose:** Requirement template browser.

**Exports:**
- default `TemplatesPage()`

**Imports used:**
- `Sidebar`
- `Topbar`

**State:**
- `session`

**Data:**
- `sampleTemplates`

**Template fields:**
- `id`
- `name`
- `description`
- `category`
- `format`
- `size`

**Behavior:**
- Redirects unauthenticated users to `/login`
- Shows downloadable template cards
- Links users to `/messages` for template requests

---

## `src/app/advisor/page.tsx`
**Purpose:** Advisor review dashboard and submission workflow.

**Exports:**
- default `AdvisorPage()`

**Types:**
- `Submission`
- `StudentSubmission`

**State:**
- `session`
- `submissions`
- `selectedSubmission`
- `feedback`
- `filter`
- `showUserMenu`
- `activeTab`
- `editorContent`
- `selectedWord`
- `showWordEditor`
- `customWordValue`
- `studentSubmissions`
- `expandedBoxes`
- `revisionComments`
- `showCommentModal`
- `selectedText`
- `newComment`
- `isListening`
- `editMode`
- `highlightedCommentId`

**Static demo data:**
- `students`
- seeded `submissions`
- `sampleStudentSubmissions`
- `wordRecommendations`

**Key functions:**
- `handleLogout()`
- `handleAction(submissionId, action)`
  - updates status to approved/rejected/revision
  - writes back to `practicum_submissions`
- `getStatusColor(status)`
- `toggleBox(box)`
- `handleWordClick(word)`
- `handleWordReplace()`
- `handleWordSelectFromList(value)`
- `loadStudentSubmission(submission)`
- `getDocumentCount(type)`
- `getRevisionCount()`
- `handleTextSelection()`
- `deleteRevisionComment(id)`
- voice input helpers:
  - `startVoiceInput()`
  - `stopVoiceInput()`

**Workflow:**
1. Advisor loads submissions from storage.
2. If no submissions exist, demo submissions are seeded.
3. Advisor can filter by status.
4. Advisor can review/edit/annotate content.
5. Updated status and feedback are persisted.

---

## `src/app/admin/page.tsx`
**Purpose:** Admin management dashboard.

**Exports:**
- default `AdminPage()`

**Types:**
- `Template`
- `StudentAdviser`
- `Batch`
- `SubmittedDocument`

**State:**
- `session`
- `users`
- `mounted`
- `activeTab`
- `showModal`
- `showTemplateModal`
- `showEditUserModal`
- `showResetPasswordModal`
- `editingUser`
- `userSearch`
- `roleFilter`
- `templates`
- `studentAdvisers`
- `batches`
- `showBatchModal`
- `showUserMenu`
- `showDocumentModal`
- `selectedDocument`
- `documentContent`
- `submittedDocuments`
- `activeTemplateTab`
- `showRecommendedWords`
- `expandedBoxes`
- `editorContent`
- `editableWords`
- `showWordEditor`
- `selectedWord`
- `customWordValue`
- `isSpeaking`
- `isListening`
- `formData`
- `batchForm`
- `templateForm`
- `error`

**Important data sources:**
- `getUsers()`
- `practicum_adviser_assignments`
- `practicum_admin_documents`
- `practicum_submissions`

**Key functions:**
- `saveAdviserAssignments(data)`
- `handleLogout()`
- `handleCreateUser(e)`
- `handleDeleteUser(id)`
- `handleAssignAdviser(studentId, adviserId)`
- `handleAddTemplate(e)`
- `handleDeleteTemplate(id)`
- `handleCreateBatch(e)`
- `handleDeleteBatch(id)`
- `handleOpenDocument(doc)`
- `handleUpdateDocumentStatus(docId, status, feedback?)`
- `handleSaveDocumentContent()`
- `getStatusColor(status)`
- `getTypeIcon(type, isScanned)`
- `toggleBox(box)`
- `insertWord(word)`
- `handleWordClick(word)`
- `handleWordReplace()`
- `handleWordSelectFromList(value)`
- `speakText(text)`
- `startVoiceInput()`
- `stopVoiceInput()`
- `speakAllRecommendations()`
- `stopSpeaking()`
- `getRoleBadge(role)`

**Admin workflow:**
1. Loads users and assignments.
2. Loads submitted documents or seeds demo documents.
3. Supports user CRUD, adviser assignment, batch creation, template management.
4. Supports document review/editing.
5. Persists changes in localStorage.

---

## Common UI/UX Patterns

### Theme handling
- `useTheme()` is used in most pages.
- `darkMode` drives layout colors.
- `setDarkMode()` toggles light/dark mode.

### Authorization checks
Most role pages do this pattern:
1. Load session from `getSession()`.
2. Redirect if role is wrong.
3. Render page content only for the allowed role.

### Notification pattern
Many pages use:
- `sampleNotifications`
- `showNotifications`
- `markAllAsRead()`
- `unreadCount`

### Submission pattern
Student upload pages usually:
1. Build a submission object.
2. Assign `studentName`, `studentId`, `type`, `status`, and `submittedAt`.
3. Store it in `practicum_submissions`.

---

## Current Demo Data Notes
- Demo user names were generalized to avoid hardcoded real names.
- The app still uses seeded sample data for UI demonstration.
- Some admin/advisor helper functions are demo-first and operate entirely in the browser.

---

## Important Implementation Notes
- This is a client-side demo system, not a real backend-authenticated app.
- Data is persisted only in the browser unless connected to a backend later.
- Many components use direct DOM APIs:
  - file input creation
  - FileReader
  - speech synthesis
  - speech recognition
- Some pages are heavily UI-focused and contain many inline styles and SVG icons.

---

## Quick File Index

### Core
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/globals.css`

### Auth / Theme
- `src/lib/auth.ts`
- `src/lib/ThemeContext.tsx`
- `src/lib/ThemeWrapper.tsx`

### Shared components
- `src/components/Sidebar.tsx`
- `src/components/Topbar.tsx`

### Pages
- `src/app/login/page.tsx`
- `src/app/dashboard/page.tsx`
- `src/app/journal/page.tsx`
- `src/app/documents/page.tsx`
- `src/app/dtr/page.tsx`
- `src/app/moa/page.tsx`
- `src/app/evaluation/page.tsx`
- `src/app/messages/page.tsx`
- `src/app/profile/page.tsx`
- `src/app/templates/page.tsx`
- `src/app/advisor/page.tsx`
- `src/app/admin/page.tsx`
