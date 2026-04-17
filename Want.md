👤 1. STUDENT ACCOUNT PROCESS
🎯 Role Goal:

Complete practicum requirements and get approved

🔄 FULL STUDENT WORKFLOW
1. Authentication

Input: Role selection / login
Process:

Access /login
System validates session
Redirect to dashboard

Output: Access to student features

2. Dashboard Monitoring

Input: Stored submissions, journals
Process:

System loads:
submissions
journals
Filters by studentId
Calculates:
progress
completion status
Displays:
deadlines
notifications

Output:

Overview of practicum status
3. Journal Creation Process

Input: Daily activities (text/voice)
Process:

Student writes or records activity
(Optional) AI generates summary
Save as:
Draft OR Submit
If submitted:
Added to practicum_submissions

Output:

Journal entry stored
Submission ready for review
4. Document Submission Process
(DTR / MOA / Evaluation)

Input: File upload
Process:

Select file
System reads file
Convert → base64
Create submission object:
studentId
type
status = pending
Save to storage

Output:

Submission appears in Documents
5. Submission Tracking

Input: Existing submissions
Process:

Load all submissions
Filter:
pending / approved / rejected
Display status

Output:

Student sees progress
6. Revision Handling

Input: Adviser feedback
Process:

Student opens submission
Reads feedback
Edits document
Re-submits

Output:

Updated submission version
7. Messaging

Input: Message content
Process:

Compose message
Select recipient (advisor/admin)
Save to system

Output:

Communication sent
⚠️ Student Process Gaps (Improvements)
No clear progress tracker
No submission checklist
No auto-reminders

👉 Add:

“You are 65% complete”
Missing requirements alert
AI assistant guidance
👨‍🏫 2. ADVISOR ACCOUNT PROCESS
🎯 Role Goal:

Review, evaluate, and approve student submissions

🔄 FULL ADVISOR WORKFLOW
1. Authentication

Input: Login
Process:

Access /advisor
Validate role

Output:

Advisor dashboard
2. Submission Retrieval

Input: All student submissions
Process:

Load practicum_submissions
Group by:
student
status
Filter:
pending
revision

Output:

Organized submission list
3. Review Process

Input: Selected submission
Process:

Open document
Analyze content
Use tools:
text editor
annotation
Add feedback

Output:

Feedback attached to submission
4. Decision Process

Input: Reviewed submission
Process:
Advisor selects:

Approve
Reject
Request Revision

System updates:

status
feedback

Output:

Updated submission status
5. Feedback Loop

Input: Student revisions
Process:

Re-review updated submissions

Output:

Final approval
6. Monitoring Students

Input: Student data
Process:

Track:
submission frequency
pending work

Output:

Student performance insight
⚠️ Advisor Process Gaps
Manual-heavy review
No prioritization
No analytics

👉 Add:

AI feedback suggestions
“Students at risk” list
Auto-priority queue
🛠️ 3. ADMIN ACCOUNT PROCESS
🎯 Role Goal:

Manage system, users, and overall practicum operations

🔄 FULL ADMIN WORKFLOW
1. Authentication

Input: Login
Process:

Access /admin
Validate admin role

Output:

Admin dashboard
2. User Management

Input: User data
Process:

Create user:
student / advisor
Assign adviser to student
Delete/update users

Output:

Updated user database
3. Practicum Setup

Input: Batch data
Process:

Create batch:
academic year
program
Assign students

Output:

Organized practicum groups
4. Template Management

Input: Template data
Process:

Create template
Edit/delete template

Output:

Available templates for students
5. Submission Monitoring

Input: All submissions
Process:

Load system-wide submissions
Analyze:
status distribution
Open documents
Update status if needed

Output:

System-wide visibility
6. Document Control

Input: Submitted files
Process:

View/edit content
Approve/reject

Output:

Controlled document flow
7. Reporting

Input: System data
Process:

Generate:
user stats
submission stats

Output:

Reports
⚠️ Admin Process Gaps
No real analytics
No audit logs
No system alerts

👉 Add:

Dashboard charts
Activity logs
Performance metrics