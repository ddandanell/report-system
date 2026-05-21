# PTB Session Tracker — Reference

## Quick Start

```bash
npm install
npm run dev        # → http://localhost:3000
```

---

## Database

### Connection
- **File:** `.env.local` (never committed to Git)
- **Provider:** Neon PostgreSQL (Singapore region)
- **Database:** `neondb`

### Run schema (first time only)
```bash
npx tsx scripts/migrate.ts
```
This creates all 8 tables: users, students, assignments, parent_students, questions, reports, report_answers, settings.

### Seed test data
```bash
npx tsx scripts/seed.ts
```
Creates admin/teacher/parent users + 1 test student + 4 report questions.

---

## Login Credentials

| Role | Username | Password | Portal |
|------|----------|----------|--------|
| Admin | `admin` | `admin` | http://localhost:3000/admin |
| Teacher | `teacher` | `admin` | http://localhost:3000/teacher |
| Parent | `parent` | `admin` | http://localhost:3000/parent |

> Change passwords in Admin → Teachers (or create a new user).

---

## File Map — Where Everything Lives

### Database & Config
```
.env.local              ← Database URL, JWT secret (YOUR credentials)
.env.example            ← Template (safe to commit)
scripts/migrate.ts      ← Runs schema.sql against Neon
scripts/seed.ts         ← Seeds test users, student, questions
src/lib/schema.sql      ← PostgreSQL table definitions
src/lib/db.ts           ← Database connection (auto Neon or demo)
src/lib/auth.ts         ← JWT login/session logic
src/lib/email.ts        ← Nodemailer email templates
src/lib/demo-data.ts    ← Hardcoded demo data (fallback mode)
src/lib/demo-adapter.ts ← Demo mode database simulator
```

### Pages (what users see)
```
src/app/page.tsx                    ← Login page
src/app/admin/page.tsx              ← Admin dashboard + report tracker
src/app/admin/teachers/page.tsx     ← Teacher CRUD
src/app/admin/students/page.tsx     ← Student CRUD (with report depth)
src/app/admin/questions/page.tsx    ← Question editor (4 default questions)
src/app/admin/reports/page.tsx      ← Browse all reports
src/app/teacher/page.tsx            ← Teacher dashboard + student list
src/app/teacher/report/[studentId]/ ← Report form (4 questions, all at once)
src/app/parent/page.tsx             ← Parent dashboard + children's reports
src/app/report/[id]/page.tsx        ← Full report view (all roles)
src/app/report/[id]/ReportView.tsx  ← Report display component
src/app/set-password/page.tsx       ← Parent invite password setup
```

### API Routes (backend)
```
src/app/api/auth/login/      ← POST — login
src/app/api/auth/logout/     ← POST — logout
src/app/api/auth/me/         ← GET  — current session
src/app/api/auth/set-password/ ← POST — parent password setup

src/app/api/admin/teachers/  ← GET/POST   — list/create teachers
src/app/api/admin/teachers/[id]/ ← PUT/DELETE — update/delete teacher
src/app/api/admin/students/  ← GET/POST   — list/create students
src/app/api/admin/students/[id]/ ← PUT/DELETE
src/app/api/admin/questions/ ← GET/POST   — list/create questions
src/app/api/admin/questions/[id]/ ← PUT/DELETE
src/app/api/admin/reports/   ← GET        — list/filter reports
src/app/api/admin/reports/approve/ ← POST — approve report + email parent
src/app/api/admin/parents/   ← GET/POST   — list/create parents
src/app/api/admin/parents/[id]/ ← PUT/DELETE
src/app/api/admin/settings/  ← GET/PUT    — SMTP + app settings

src/app/api/teacher/students/ ← GET — teacher's assigned students
src/app/api/teacher/reports/  ← GET/POST — teacher's reports
src/app/api/parent/children/  ← GET — parent's linked children
src/app/api/parent/reports/   ← GET — parent's children's reports
src/app/api/questions/active/ ← GET — active questions for report form
src/app/api/report/[id]/      ← GET — single report with answers
```

### Components (reusable UI)
```
src/components/Nav.tsx           ← Sidebar + mobile hamburger menu
src/components/Toast.tsx         ← Toast notification system
src/components/ClientProviders.tsx ← Wraps app with ToastProvider
src/components/Illustrations.tsx ← SVG empty state illustrations
```

### Styling
```
src/app/globals.css       ← All CSS — buttons, cards, animations, colors
tailwind.config.ts        ← Tailwind breakpoints + custom colors
```

---

## How Data Flows

```
Teacher fills report form
  ↓ POST /api/teacher/reports
  ↓ INSERT INTO reports + report_answers
  ↓
Admin dashboard shows it
  ↓ GET /api/admin/reports
  ↓ Counts done vs required per teacher
  ↓
Parent sees their child's report
  ↓ GET /api/parent/reports
  ↓ JOIN parent_students → students → reports
```

---

## Report Depth Per Student

Each student has a `report_depth` field set in Admin → Students → Edit:

| Depth | Teacher sees |
|-------|-------------|
| Simple 📝 | One big text field — write freely |
| Standard ✏️ | 4 questions (how was it, how did it go, problems, progress) |

---

## Deploy to Vercel

1. Push to GitHub
2. Import repo in Vercel
3. Add environment variables:
   - `DATABASE_URL` — your Neon connection string
   - `JWT_SECRET` — random string
   - `NEXT_PUBLIC_APP_URL` — your Vercel URL
4. Deploy — auto-deploys on every push to main
