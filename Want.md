These are the standard pages used in real admin systems:

📊 Dashboard
Overview cards (Total Students, Pending Docs, Approved, Rejected)
Recent activity feed
Quick actions
👨‍🎓 Students
Student list table
View profile
Upload status tracking
Filter (Year, Section, Status)
📄 Submissions / Documents
Pending submissions
For review
Approved documents
Revisions required
🧑‍🏫 Advisors Panel
Assigned students
Review queue
Feedback history
⚙️ Admin Settings
User management
Role management
System configuration
📢 Announcements
Create announcement
Publish / draft
Visibility settings
🔘 2. Standard Button Names + Functions (IMPORTANT)

These are what professional systems actually use:

📌 General Actions
Create New → add record (student, document, announcement)
Edit → modify data
Delete → remove record
View Details → open full profile/page
Save Changes → commit updates
📄 Document Workflow Buttons
Submit → student sends document
Review → advisor opens for checking
Approve → marks document as accepted
Reject → marks as failed
Request Revision → sends back with comments
Download PDF → export file
🧑‍🏫 Advisor Actions
Assign Student
Add Feedback
Mark as Reviewed
Return for Revision
⚙️ Admin Actions
Add User
Deactivate Account
Change Role
Reset Password
Force Logout
🔎 UI Utility Buttons
Filter
Search
Sort
Refresh
Export CSV / PDF
🔁 3. Typical Process Flow (How system should behave)
📄 Student Submission Flow
Student clicks → Submit Document
System stores → status = "Pending Review"
Advisor sees in → Review Queue
Advisor clicks → Review
Action:
Approve → moves to "Approved"
Reject → moves to "Rejected"
Revision → returns to student
🧑‍🏫 Advisor Review Flow
Open dashboard
Click Assigned Students
Open submission
Add comments
Choose action (Approve / Reject / Revision)
👨‍💻 Admin Flow
Open User Management
Click user
Edit role / status
Save changes