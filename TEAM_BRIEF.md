# Private Tutoring Bali — Session Tracker
## Project Manager Brief · Full Team Specification

> **Project name:** PTB Session Tracker  
> **Stack:** Next.js 14 · Neon PostgreSQL · Vercel · GitHub  
> **PM contact:** admin@privatetutoringbali.com  
> **Website:** https://privatetutoringbali.com  

---

## 1. What We're Building

A web-based session reporting system for **Private Tutoring Bali (PTB)**. After every tutoring session, the assigned teacher logs in and fills out a short report about the student. That report is stored and made available to:
- The **Admin** (Dede, the founder) — to monitor all teachers and students across the company
- The **Teacher** — to track their own sessions and see what's still missing
- The **Parent** — to log in and see how their child is doing each week

The system replaces manual WhatsApp/email updates with a structured, professional, branded reporting portal.

---

## 2. The Team

### Role Assignments

| Role | Responsibility | Hours Est. |
|------|---------------|------------|
| **Project Manager** | Spec, tickets, review, deployment sign-off | Ongoing |
| **Full-Stack Developer (Lead)** | Next.js app, API routes, auth, database | 40–60h |
| **Frontend Developer** | UI polish, component library, responsive design | 20–30h |
| **Database Engineer** | Neon schema, migrations, seed data, query optimization | 8–12h |
| **DevOps** | GitHub repo setup, Vercel deployment, env vars, CI | 4–6h |

> For a small team: one full-stack developer can cover Lead + Frontend + Database. DevOps is ~2 hours of setup.

### Communication
- All tasks tracked in **GitHub Issues** (see Section 9 for ticket breakdown)
- Design reference: screenshots in `/docs/designs/` folder
- Environment credentials: shared via `.env.local` (NEVER committed to Git)
- Weekly sync: Thursday, async Loom updates accepted

---

## 3. Tech Stack

```
Frontend:   Next.js 14 (App Router) + TypeScript + Tailwind CSS
Backend:    Next.js API Routes (serverless, runs on Vercel)
Database:   Neon (PostgreSQL, serverless) — neon.tech
Auth:       JWT via jose library, stored in httpOnly cookie
Hosting:    Vercel — auto-deploys from GitHub main branch
Version:    GitHub — private repository
Email:      (future) Resend or SendGrid for report notifications
```

### Why This Stack
- **Neon** = serverless Postgres, free tier, works perfectly with Vercel Edge Functions, no server to manage
- **Vercel** = zero-config deployment, auto HTTPS, preview URLs for every PR
- **Next.js App Router** = frontend + backend in one repo, no separate API server needed
- **JWT + httpOnly cookies** = secure auth without a session database

---

## 4. Three Portals — Detailed Feature Spec

### 4.1 Admin Portal (`/admin/*`)

**Who uses it:** Dede (founder / admin)  
**Login:** username + password (admin role)  

#### Dashboard (`/admin`)
- Greeting header
- Date range selector (current week default, navigable)
- **5 stat cards:**
  - Active Teachers (count)
  - Active Parents (count)
  - Active Children (count)
  - Reports This Week (count submitted)
  - Missing Reports (count not yet submitted for this week)
- **Reports Overview chart** (line chart, 7 days):
  - Blue dashed line: Required reports per day
  - Green line: Submitted reports per day
  - Red line: Missing reports per day
  - Summary row: Required total / Submitted total / Missing total for week
- **Missing Reports table** (right panel):
  - Columns: Teacher · Child · Required · Submitted · Missing
  - Missing count shown in red
  - "View all missing reports →" link
- **Quick Actions row:**
  - Add Teacher · Add Parent · Add Child · Assign Teacher · View Reports · Missing Reports

#### Teachers (`/admin/teachers`)
- Table of all teachers: Name, Username, Students Assigned, Created date, Actions
- **Add Teacher modal:** Name, Username, Password, Assign Students (multi-select)
- **Edit Teacher modal:** Same fields, password optional (blank = keep current)
- Delete teacher (with confirmation)

#### Parents (`/admin/parents`)
- Table: Name, Username, Children linked, Created date, Actions
- **Add Parent modal:** Name, Username, Password, Link Children (multi-select)
- Edit + Delete

#### Children / Students (`/admin/children`)
- Table: Name, Grade, Age, Subject(s), Assigned Teacher, Sessions/Week, Actions
- **Add Child modal:**
  - Full name, Age, Grade/Year
  - Subject (e.g. English, Math, Science, IB, IGCSE, etc.)
  - Sessions per week (1–5 selector)
  - Assign Teacher (dropdown)
  - Link Parent (dropdown — optional)
  - Notes
- Edit + Delete

#### Assignments (`/admin/assignments`)
- Visual overview: which teacher is assigned to which child for which subject
- Quick reassignment UI
- Shows sessions/week per assignment

#### Reports (`/admin/reports`)
- Filter bar: Week picker, Teacher filter, Child filter, Status filter (all/submitted/missing)
- Table: Date · Child · Teacher · Subject · Status · Actions
- Click any row → full report view
- Export/Print button per report

#### Missing Reports (`/admin/missing-reports`)
- Focused view: only reports that are overdue
- Shows: Teacher · Child · Subject · Week · Sessions Required · Sessions Submitted · Gap
- Sorted by most overdue first

#### Settings (`/admin/settings`)
- Manage report questions (same as current Questions page)
- Question types: Rating (😢→😄), Yes/No, Short text, Long text
- Drag to reorder
- Enable/disable per question

---

### 4.2 Teacher Portal (`/teacher/*`)

**Who uses it:** Tutors employed by PTB  
**Login:** username + password (teacher role)

#### Dashboard (`/teacher`)
- Personalized greeting: "Good morning, [First Name]! 👋"
- Week date range display
- **4 stat cards:**
  - Reports Required This Week (total across all students)
  - Reports Submitted This Week (count + % complete)
  - Reports Still Missing (in orange/red)
  - Total Students (count)
- **My Students table:**
  - Columns: Student · Subject · Reports Required/Week · Submitted This Week · Missing · Action
  - Missing shown in red
  - "Write Report" button per student
- **Weekly Progress bar chart:**
  - Grey bars = required per day
  - Green bars = submitted per day
  - Days: Mon–Sun
  - Info note: "You need to submit X more report(s) this week"
- **Recent Reports** (left panel):
  - Last 5 reports: Student · Topic · Date · View button
- **Quick Actions** (right panel):
  - Write New Report
  - My Students
  - My Reports

#### Write Report (`/teacher/report/[studentId]`)
- Select date (default: today)
- Step-by-step question flow with progress dots
- **Rating questions:** 5 emoji smiley faces (😢 😕 😐 🙂 😄) — large, tappable, mobile-friendly
- **Yes/No questions:** 👍 / 👎 large buttons
- **Text questions:** Text input or textarea
- **Report details section:**
  - Topic/Subject worked on today (text field — e.g. "Fractions and Decimals")
  - Overall notes (free text)
- Navigation: Back / Next / Submit
- Progress bar across top
- Submit → redirect to completed report view

#### My Reports (`/teacher/reports`)
- All submitted reports by this teacher
- Filter by student, date range
- Click to view full report

---

### 4.3 Parent Portal (`/parent/*`)

**Who uses it:** Parents of PTB students  
**Login:** username + password (parent role)

#### Dashboard (`/parent`)
- Personalized greeting: "Good morning, [Parent Name]! 👋"
- **My Children cards** (horizontal scroll on mobile):
  - Child photo placeholder / avatar with initial
  - Name, Grade
  - Subject being tutored
  - Teacher name
  - Latest Report date (shown in green if recent, grey if older)
  - "View Reports" button
  - Left border color-coded per child (green, purple, blue)
- **Recent Reports table:**
  - Child · Topic · Teacher · Date · View Report button
  - Show last 10 reports across all children
  - "View all reports →" link
- **About the Reports** panel (right):
  - Short explanation of what reports contain
  - Checklist: What we worked on · How your child did · What was difficult · What improved · Next steps & homework · Teacher comments
  - "Reports are required X time(s) per week per subject" (dynamic from settings)
- Bottom left: "Need help? Contact our admin team" + "Contact Admin" button

#### My Children (`/parent/children`)
- Detailed view of each child
- All reports per child with date, topic, teacher

#### Reports (`/parent/reports`)
- All reports for all their children
- Filter by child, date

#### Profile (`/parent/profile`)
- Update name, email, password

---

## 5. Design System

> **Reference:** See `/docs/designs/` for screenshots (admin-dashboard.png, teacher-portal.png, parent-portal.png)

### Layout
```
┌─────────────────────────────────────────────┐
│ Sidebar (240px)     │  Main Content Area     │
│ Dark navy (#1a2642) │  White (#FFFFFF)        │
│                     │  Light grey bg (#F8F9FA)│
└─────────────────────────────────────────────┘
```

### Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `sidebar-bg` | `#1a2642` | Left nav background |
| `sidebar-active` | `#2563EB` | Active nav item pill |
| `sidebar-text` | `#94a3b8` | Nav item text |
| `sidebar-text-active` | `#ffffff` | Active nav item text |
| `accent-green` | `#10B981` | PTB brand, positive/submitted |
| `accent-blue` | `#2563EB` | Primary buttons, links |
| `accent-red` | `#EF4444` | Missing/overdue alerts |
| `accent-orange` | `#F59E0B` | Warnings, "still missing" |
| `accent-purple` | `#8B5CF6` | Secondary chart color |
| `content-bg` | `#F8F9FA` | Page background |
| `card-bg` | `#FFFFFF` | Card/panel background |
| `border` | `#E5E7EB` | Card borders |
| `text-primary` | `#111827` | Headings |
| `text-secondary` | `#6B7280` | Subtitles, labels |
| `text-muted` | `#9CA3AF` | Timestamps, hints |

### Typography
- Font: `Inter` (Google Fonts)
- Headings: `font-bold`, sizes: 24px (page title), 18px (section), 14px (card label)
- Body: `font-normal`, 14px
- Mono (usernames): `font-mono`, 13px

### Components
- **Cards:** white bg, 1px border (#E5E7EB), 8px radius, 16-24px padding, subtle shadow
- **Stat cards:** icon (circle with colored bg) + large number + label + "View all →" link
- **Buttons Primary:** Blue (#2563EB), white text, 8px radius, 10px 20px padding
- **Buttons Secondary:** White bg, blue border, blue text
- **Buttons Danger:** Red text/border, white bg
- **Table rows:** 48px height, hover: light blue bg, border-bottom only
- **Badges:** Rounded-full pill, colored bg/text
- **Nav items:** 40px height, 12px horizontal padding, active = blue bg + white text + 6px radius

### Logo (top of sidebar)
- Book/graduation icon in white, 32px
- "Private Tutoring Bali" in white, bold, 15px
- Subtitle in grey: "Reporting Portal" / "Teacher Portal" / "Parent Portal"

---

## 6. Database Schema

### Tables

```sql
-- Users table (all roles: admin, teacher, parent)
users (id, name, username, email, password_hash, role, avatar_url, created_at)

-- Students/Children
students (id, name, age, grade, subject, notes, avatar_url, created_at)

-- Link teachers to students (with subject + sessions per week)
assignments (id, teacher_id, student_id, subject, sessions_per_week, active, created_at)

-- Link parents to students
parent_students (parent_id, student_id)

-- Report template questions
questions (id, text, type, category, sort_order, active, created_at)

-- Submitted reports
reports (id, student_id, teacher_id, session_date, week_start, topic, overall_notes, created_at)

-- Answers to questions within a report
report_answers (id, report_id, question_id, answer)

-- Notifications (future)
notifications (id, user_id, message, read, created_at)
```

### Key Relationships
```
users (teacher) ──< assignments >── students
users (parent)  ──< parent_students >── students
students ──< reports ──< report_answers >── questions
```

---

## 7. API Endpoints

```
POST   /api/auth/login           Login, returns JWT cookie
POST   /api/auth/logout          Clear cookie
GET    /api/auth/me              Current session user

GET    /api/admin/stats          Dashboard stats + chart data
GET    /api/admin/teachers       List teachers
POST   /api/admin/teachers       Create teacher
PUT    /api/admin/teachers/[id]  Update teacher
DELETE /api/admin/teachers/[id]  Delete teacher

GET    /api/admin/parents        List parents
POST   /api/admin/parents        Create parent
PUT    /api/admin/parents/[id]   Update parent
DELETE /api/admin/parents/[id]   Delete parent

GET    /api/admin/students       List students
POST   /api/admin/students       Create student
PUT    /api/admin/students/[id]  Update student
DELETE /api/admin/students/[id]  Delete student

GET    /api/admin/questions      List questions
POST   /api/admin/questions      Create question
PUT    /api/admin/questions/[id] Update question
DELETE /api/admin/questions/[id] Delete question

GET    /api/admin/reports        List all reports (filterable)
GET    /api/admin/reports/missing  Missing reports for current week

GET    /api/teacher/students     Teacher's assigned students
GET    /api/teacher/reports      Teacher's submitted reports
POST   /api/teacher/reports      Submit a new report

GET    /api/parent/children      Parent's linked children
GET    /api/parent/reports       Reports for parent's children

GET    /api/questions/active     Active questions (used in report form)
GET    /api/report/[id]          Full report detail (all roles)
```

---

## 8. Folder Structure

```
ptb-system/
├── .env.local              ← YOUR CREDENTIALS (never commit)
├── .env.example            ← Template (safe to commit)
├── .gitignore
├── README.md               ← Developer quickstart
├── TEAM_BRIEF.md           ← This file
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
│
├── docs/
│   └── designs/            ← Screenshots for reference
│       ├── admin-dashboard.png
│       ├── teacher-portal.png
│       └── parent-portal.png
│
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx             ← Login / role router
│   │   ├── globals.css
│   │   │
│   │   ├── admin/               ← Admin portal
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx         ← Dashboard
│   │   │   ├── teachers/
│   │   │   ├── parents/
│   │   │   ├── children/
│   │   │   ├── assignments/
│   │   │   ├── reports/
│   │   │   ├── missing-reports/
│   │   │   └── settings/
│   │   │
│   │   ├── teacher/             ← Teacher portal
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx         ← Dashboard
│   │   │   ├── report/[studentId]/
│   │   │   └── reports/
│   │   │
│   │   ├── parent/              ← Parent portal
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx         ← Dashboard
│   │   │   ├── children/
│   │   │   └── reports/
│   │   │
│   │   ├── report/[id]/         ← Report view (all roles)
│   │   │
│   │   └── api/                 ← API routes
│   │       ├── auth/
│   │       ├── admin/
│   │       ├── teacher/
│   │       ├── parent/
│   │       ├── questions/
│   │       └── report/
│   │
│   ├── components/
│   │   ├── Nav.tsx              ← Sidebar nav (role-aware)
│   │   ├── StatCard.tsx         ← Dashboard stat cards
│   │   ├── ReportTable.tsx      ← Reusable report list
│   │   ├── Modal.tsx            ← Generic modal wrapper
│   │   ├── WeeklyChart.tsx      ← Bar/line chart component
│   │   └── EmojiRating.tsx      ← Smiley face rating input
│   │
│   └── lib/
│       ├── db.ts                ← Neon database connection
│       ├── auth.ts              ← JWT helpers
│       └── utils.ts             ← Week start, date helpers
│
└── scripts/
    └── seed.ts                  ← Seed admin user + default questions
```

---

## 9. GitHub Issues — Sprint Breakdown

### Milestone 1: Foundation (Week 1)

| # | Title | Assignee | Priority |
|---|-------|----------|----------|
| 1 | Set up GitHub repo + Vercel project | DevOps | 🔴 Blocker |
| 2 | Connect Neon database, run schema migration | DB Eng | 🔴 Blocker |
| 3 | Implement JWT auth (login, logout, session) | Backend | 🔴 Blocker |
| 4 | Build sidebar Nav component (all 3 role variants) | Frontend | High |
| 5 | Build login page (PTB branded) | Frontend | High |

### Milestone 2: Admin Portal (Week 1–2)

| # | Title | Assignee | Priority |
|---|-------|----------|----------|
| 6 | Admin dashboard stats API endpoint | Backend | High |
| 7 | Admin dashboard UI + charts | Frontend | High |
| 8 | Teachers CRUD (API + UI) | Full-Stack | High |
| 9 | Parents CRUD (API + UI) | Full-Stack | High |
| 10 | Children CRUD (API + UI) | Full-Stack | High |
| 11 | Assignments management (API + UI) | Full-Stack | Medium |
| 12 | Missing reports view (API + UI) | Full-Stack | Medium |
| 13 | Questions/settings manager | Full-Stack | Medium |

### Milestone 3: Teacher Portal (Week 2)

| # | Title | Assignee | Priority |
|---|-------|----------|----------|
| 14 | Teacher dashboard (stats + student table) | Full-Stack | High |
| 15 | Weekly progress chart component | Frontend | Medium |
| 16 | Step-by-step report form (emoji input) | Full-Stack | High |
| 17 | Report submit API | Backend | High |
| 18 | Teacher report history view | Full-Stack | Medium |

### Milestone 4: Parent Portal (Week 2–3)

| # | Title | Assignee | Priority |
|---|-------|----------|----------|
| 19 | Parent dashboard (children cards + reports) | Full-Stack | High |
| 20 | Parent report detail view | Frontend | High |
| 21 | Parent profile page | Frontend | Low |

### Milestone 5: Report View + Polish (Week 3)

| # | Title | Assignee | Priority |
|---|-------|----------|----------|
| 22 | Professional report print view (PDF-ready) | Frontend | High |
| 23 | Notification bell (unread reports) | Full-Stack | Low |
| 24 | Responsive mobile layout | Frontend | Medium |
| 25 | Deploy to Vercel production + smoke test | DevOps | 🔴 Blocker |

---

## 10. Deployment Workflow

```
Developer machine
      ↓  git push origin feature/xxx
GitHub (private repo)
      ↓  pull request → review → merge to main
Vercel (auto-deploy)
      ↓  builds Next.js, injects env vars
https://ptb-tracker.vercel.app  (or custom domain)
      ↓  API routes connect to
Neon (PostgreSQL, serverless)
```

### Environment Variables (set in Vercel dashboard)

| Variable | Where to get it |
|----------|----------------|
| `DATABASE_URL` | Neon dashboard → your project → Connection string |
| `JWT_SECRET` | Generate: `openssl rand -base64 32` |
| `NEXT_PUBLIC_APP_URL` | Your Vercel URL or custom domain |

---

## 11. Definition of Done

A feature is **done** when:
1. ✅ API endpoint tested (Postman or curl)
2. ✅ UI matches design screenshots
3. ✅ Mobile-responsive (test at 375px width)
4. ✅ Error states handled (loading, empty, error)
5. ✅ No hardcoded credentials or test data
6. ✅ Deployed to Vercel preview URL
7. ✅ PM review signed off

---

## 12. Security Rules

1. **Never commit `.env.local`** — it's in `.gitignore`
2. All API routes must verify session via `getSession()` before returning data
3. Teachers can only read/write their own students' reports
4. Parents can only read their own children's reports
5. Passwords hashed with bcrypt (cost factor 10)
6. JWT expires after 7 days
7. Cookies set with `httpOnly: true`, `sameSite: lax`

---

## 13. Current Build Status

The MVP scaffolding is already complete in this folder:
- ✅ Admin portal (dashboard, questions, students, teachers, reports)
- ✅ Teacher portal (dashboard, step-by-step emoji form, report view)
- ✅ JWT auth with cookie
- ✅ Professional PDF-printable report view
- 🔄 **Needs upgrade:** SQLite → Neon PostgreSQL (see `src/lib/db.ts`)
- 🔄 **Needs upgrade:** Light theme redesign (match screenshots)
- ❌ Parent portal (not yet built)
- ❌ Charts/analytics
- ❌ Missing reports tracker
- ❌ Assignments with subject field
- ❌ Notification bell

The team picks up from this foundation. The database migration is the first priority.

---

*Document maintained by: PTB Project Manager*  
*Last updated: May 2026*
