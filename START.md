# PTB Session Tracker — Quick Start

## First-time setup

Open **Terminal** in this folder, then:

```bash
# 1. Install dependencies
npm install

# 2. Create your .env.local (already exists, edit it)
#    Open .env.local and paste your Neon DATABASE_URL

# 3. Run the schema in Neon SQL Editor
#    Go to neon.tech → your project → SQL Editor
#    Paste the entire contents of src/lib/schema.sql and click Run

# 4. Seed the database
npm run seed

# 5. Start the app
npm run dev
```

Open your browser at: **http://localhost:3000**

---

## Login credentials

| Role  | Username | Password      |
|-------|----------|---------------|
| Admin | `admin`  | `ptb2024admin` |

> Change the password after first login (Admin → Teachers → edit Admin user).

---

## Every day after that

```bash
cd ptb-system
npm run dev
```

Then go to **http://localhost:3000** — done.

---

## How it works

### Admin flow:
1. **Students** → Create student profiles, set how many sessions/week (1–5)
2. **Teachers** → Create teacher accounts, assign students to them
3. **Questions** → Customize the questions on the report form
4. **Reports** → View all reports, filter by week or student, print to PDF

### Teacher flow:
1. Log in with the credentials given by admin
2. See your students and this week's report progress
3. Click **Fill Report** after each session (takes 3–5 min)
4. Answer questions with emoji faces 😄
5. Submit — saved immediately

### Parent flow:
1. Admin creates parent account (sends email invite)
2. Parent clicks email link → sets password
3. Login → see children's reports

---

## Default questions (editable in Admin → Questions)

- Did the student get enough sleep? *(Yes/No)*
- Energy level today *(😢 → 😄)*
- Mood during the session *(😢 → 😄)*
- Focus and attention *(😢 → 😄)*
- Completed planned tasks? *(Yes/No)*
- Motivation level *(😢 → 😄)*
- Behaviour *(😢 → 😄)*
- Engagement with material *(😢 → 😄)*
- Specific observations *(free text)*
