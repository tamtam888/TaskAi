# משימות חכמות — Smart Personal Todo

A production-ready personal task management web app (Hebrew RTL) built with Next.js 14, Supabase, TailwindCSS, Shadcn/ui, TanStack Table, and Recharts.

---

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | Next.js 14 (App Router), TypeScript |
| Styling    | TailwindCSS + Shadcn/ui             |
| Forms      | React Hook Form + Zod               |
| Table      | TanStack Table v8                   |
| Charts     | Recharts                            |
| Backend    | Supabase (Postgres + Auth + RLS)    |
| Deployment | Vercel                              |

---

## Features

- **Authentication** – Email/Password sign-up & login (Hebrew UI)
- **Tasks Table** – Monday.com–style table with inline editing, sorting, filtering, pagination
- **Dashboard** – Completion %, overdue count, priority pie chart, project bar chart
- **Full Hebrew RTL** UI
- **Row Level Security** – every user sees only their own data

---

## Quick Start

### 1. Clone & Install

```bash
git clone <repo-url>
cd TaskAi
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. In the SQL Editor, run the entire contents of `supabase/schema.sql`.
3. Copy your project URL and anon key from **Settings → API**.

### 3. Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Configure Supabase Auth Redirects

In the Supabase dashboard → **Authentication → URL Configuration**:

- **Site URL**: `http://localhost:3000` (local) or your production URL
- **Redirect URLs** – add all of:
  - `http://localhost:3000/**`
  - `https://<your-vercel-domain>.vercel.app/**`
  - `https://<your-custom-domain>/**` (if applicable)

### 5. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deployment to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Create Vercel Project

1. Go to [vercel.com](https://vercel.com) → New Project → Import your repo.
2. Add environment variables in Vercel dashboard:

   | Variable | Value |
   |----------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | your Supabase project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your Supabase anon key |
   | `NEXT_PUBLIC_SITE_URL` | `https://your-vercel-domain.vercel.app` |

3. Deploy.

### 3. Update Supabase Auth Configuration

After deploying, go back to Supabase → **Authentication → URL Configuration**:

- Update **Site URL** to your Vercel production URL.
- Add your Vercel domain to **Redirect URLs**.

---

## Project Structure

```
.
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (protected)/
│   │   ├── layout.tsx          # Auth guard + Navbar
│   │   ├── tasks/page.tsx
│   │   └── dashboard/page.tsx
│   ├── layout.tsx              # Root layout (RTL, Toaster)
│   ├── globals.css
│   └── page.tsx                # Redirects to /tasks
├── components/
│   ├── auth/
│   │   ├── login-form.tsx
│   │   └── signup-form.tsx
│   ├── dashboard/
│   │   └── dashboard-client.tsx
│   ├── layout/
│   │   └── navbar.tsx
│   ├── tasks/
│   │   ├── add-task-modal.tsx
│   │   ├── columns.tsx
│   │   └── tasks-client.tsx
│   └── ui/                     # Shadcn components
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Browser Supabase client
│   │   ├── server.ts           # Server Supabase client
│   │   └── middleware.ts       # Session refresh
│   ├── types.ts
│   └── utils.ts
├── middleware.ts                # Route protection
├── supabase/
│   └── schema.sql
├── .env.example
└── README.md
```

---

## Adding Projects and Tags

Projects and tags are stored in Supabase. To add them:

**Option A – SQL Editor:**
```sql
INSERT INTO public.projects (user_id, name) VALUES ('<your-user-id>', 'My Project');
INSERT INTO public.tags (user_id, name) VALUES ('<your-user-id>', 'Urgent');
```

**Option B – Supabase Table Editor:** Use the GUI to insert rows directly.

> A future enhancement could add a Projects/Tags management UI page.

---

## Database Schema

See `supabase/schema.sql` for the full schema including:
- `projects`, `tasks`, `tags`, `task_tags`, `comments` tables
- RLS policies for all tables (user_id = auth.uid())

---

## License

MIT
