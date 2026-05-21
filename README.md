# PTB Session Tracker

**Private Tutoring Bali — Internal Reporting System**

Three-portal web app: Admin manages everything, Teachers submit session reports, Parents receive email notifications and view reports online.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend + Backend | Next.js 14 (App Router, TypeScript) |
| Styling | Tailwind CSS |
| Database | **Neon** (serverless PostgreSQL) |
| Auth | JWT (httpOnly cookie, 7-day expiry) |
| Email | Nodemailer (SMTP, configured in Admin Settings) |
| Hosting | **Vercel** |
| Version control | **GitHub** |

---

## Developer Setup

### Prerequisites
- Node.js 18+
- A [Neon](https://neon.tech) account (free tier is enough)
- A [Vercel](https://vercel.com) account
- A [GitHub](https://github.com) account

---

### Step 1 — Clone the repo

```bash
git clone https://github.com/YOUR_ORG/ptb-system.git
cd ptb-system
npm install
```

---

### Step 2 — Create the Neon database

1. Go to **https://neon.tech** → New Project → name it `ptb-tracker`
2. Open the **SQL Editor** in your Neon project
3. Paste the entire contents of `src/lib/schema.sql` and click **Run**
4. Go to **Connection Details** → copy the **Pooled connection string** (starts with `postgresql://...`)

---

### Step 3 — Configure environment

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in:

```env
DATABASE_URL=postgresql://...    # your Neon pooled connection string
JWT_SECRET=...                   # run: openssl rand -base64 32
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

### Step 4 — Seed the database

```bash
npm run seed
```

This creates:
- Admin user: `admin` / `ptb2024admin` ← **change this after first login**
- 9 default report questions

---

### Step 5 — Run locally

```bash
npm run dev
```

Open **http://localhost:3000** — log in as admin.

---

## Deploy to Vercel

### One-time setup

1. Push the repo to GitHub
2. Go to **vercel.com** → New Project → Import your GitHub repo
3. Vercel detects Next.js automatically — no build config needed
4. Go to **Settings → Environment Variables** and add:
   - `DATABASE_URL` → your Neon connection string
   - `JWT_SECRET` → your secret key
   - `NEXT_PUBLIC_APP_URL` → `https://your-app.vercel.app`
5. Click **Deploy**

### After that, every push to `main` auto-deploys.

---

## Configure Email (SMTP)

Email credentials are stored in the database — **no env vars needed for SMTP**.

1. Log in as admin → go to **Settings**
2. Fill in your SMTP credentials:
   - **Gmail:** host=`smtp.gmail.com`, port=`587`, use an [App Password](https://support.google.com/accounts/answer/185833)
   - **Outlook/Hotmail:** host=`smtp-mail.outlook.com`, port=`587`
   - **Custom domain:** whatever your host provides
3. Save → send a test email to verify

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx              Login page
│   ├── set-password/         Parent invite password setup
│   ├── admin/                Admin portal
│   │   ├── page.tsx          Dashboard
│   │   ├── teachers/         Teacher management
│   │   ├── parents/          Parent management + invite
│   │   ├── students/         Student management
│   │   ├── reports/          All reports + approve
│   │   └── settings/         SMTP + app settings
│   ├── teacher/              Teacher portal
│   │   ├── page.tsx          Dashboard + weekly progress
│   │   └── report/[id]/      Step-by-step emoji report form
│   ├── parent/               Parent portal
│   │   └── page.tsx          Children + recent reports
│   ├── report/[id]/          Shared report view (all roles)
│   └── api/                  All API routes
├── components/               Shared UI components
└── lib/
    ├── db.ts                 Neon SQL connection
    ├── auth.ts               JWT helpers
    ├── email.ts              Nodemailer email templates
    ├── schema.sql            PostgreSQL schema (run in Neon)
    └── utils.ts              Date helpers
```

---

## User Roles & Permissions

| Action | Admin | Teacher | Parent |
|--------|-------|---------|--------|
| Create teachers | ✅ | ❌ | ❌ |
| Create parents (sends email invite) | ✅ | ❌ | ❌ |
| Create students | ✅ | ❌ | ❌ |
| Assign teacher → student | ✅ | ❌ | ❌ |
| View all reports | ✅ | ❌ | ❌ |
| Approve reports + notify parent | ✅ | ❌ | ❌ |
| Submit session reports | ❌ | ✅ (own students only) | ❌ |
| View own submitted reports | ❌ | ✅ | ❌ |
| View children's reports | ❌ | ❌ | ✅ (own children only) |
| Download/print report PDF | ✅ | ✅ | ✅ |
| Configure SMTP settings | ✅ | ❌ | ❌ |

---

## How the Report Flow Works

```
1. Admin creates student
2. Admin creates teacher → assigns student
3. Admin creates parent (email) → welcome email sent automatically
4. Parent clicks email link → sets password → can now log in
5. Teacher logs in → fills out session report (emoji form, 3–5 min)
6. Admin logs in → sees report → clicks "Approve"
7. Parent receives email notification → clicks link → views report → downloads PDF
```

---

## Changing the Admin Password

First login → go to Admin → Teachers → find "Admin" → Edit → set new password.

---

## GitHub Push Checklist

Before pushing to GitHub, verify:

- [ ] `.env.local` is in `.gitignore` (never commit credentials)
- [ ] No hardcoded passwords or API keys in source code
- [ ] `npm run build` passes with no errors
- [ ] Test login works for all 3 roles locally

```bash
git init
git add .
git commit -m "Initial commit — PTB Session Tracker"
git remote add origin https://github.com/YOUR_ORG/ptb-system.git
git push -u origin main
```

---

*Private Tutoring Bali · privatetutoringbali.com · +62 858-6969-6869*
