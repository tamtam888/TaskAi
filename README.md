# משימות חכמות — Smart Task Manager

> A production-quality, Hebrew RTL personal task management SaaS built with Next.js 14, Supabase, and Tailwind CSS.
> Inspired by Monday.com — without the enterprise complexity.

---

## Features

| Area | Details |
|------|---------|
| **Auth** | Email/password sign-up & login, session refresh middleware, protected routes |
| **Tasks** | Monday-style table with inline editing (title, status, priority, due date, project) |
| **Smart Sorting** | Default order: not-done → nearest due date → done; overridden by manual column sort |
| **Quick Filters** | הכל · היום · שבוע קרוב · באיחור — compose with search and pagination |
| **Focus Mode** | Top 3 tasks by priority + due date; live-updates when a task is marked done |
| **Workload Hint** | Gentle banner when > 7 tasks are due today; one-click into Focus Mode |
| **Dashboard** | Completion %, overdue count, priority pie chart, tasks-per-project bar chart |
| **Projects** | Full CRUD — create, inline rename, delete with task-count warning |
| **Settings** | Default view + UI density preferences stored in `localStorage` |
| **Responsive** | Mobile cards · tablet condensed table · desktop full table |
| **Accessibility** | `aria-label` on all icon buttons, visible focus rings, Hebrew dialog descriptions |
| **Loading/Error UX** | Skeleton screens (no layout shift), typed error boundaries with retry |
| **RLS** | Every user sees only their own data — enforced at the database level |

---

## Screenshots

> _Add screenshots here once deployed._

| Page | Preview |
|------|---------|
| Tasks (desktop) | `docs/screenshots/tasks-desktop.png` |
| Tasks (mobile) | `docs/screenshots/tasks-mobile.png` |
| Focus Mode | `docs/screenshots/focus-mode.png` |
| Dashboard | `docs/screenshots/dashboard.png` |
| Projects | `docs/screenshots/projects.png` |
| Settings | `docs/screenshots/settings.png` |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router, RSC) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS + shadcn/ui (Radix primitives) |
| Table | TanStack Table v8 |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| Backend | Supabase (Postgres + Auth + RLS) |
| Toasts | Sonner |
| Deployment | Vercel |

---

## Project Structure

```
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   └── (protected)/
│       ├── layout.tsx              # Auth guard + Navbar
│       ├── tasks/
│       │   ├── page.tsx            # Server: fetch tasks + projects
│       │   ├── loading.tsx         # Skeleton
│       │   └── error.tsx           # Error boundary
│       ├── dashboard/
│       │   ├── page.tsx
│       │   ├── loading.tsx
│       │   └── error.tsx
│       ├── projects/
│       │   ├── page.tsx
│       │   ├── loading.tsx
│       │   └── error.tsx
│       └── settings/
│           ├── page.tsx
│           └── loading.tsx
├── components/
│   ├── dashboard/dashboard-client.tsx
│   ├── layout/navbar.tsx
│   ├── projects/projects-client.tsx
│   ├── settings/settings-client.tsx
│   ├── tasks/
│   │   ├── tasks-client.tsx        # Main table + mobile cards + smart features
│   │   ├── columns.tsx             # TanStack column definitions
│   │   ├── add-task-modal.tsx
│   │   └── create-project-dialog.tsx
│   └── ui/                         # shadcn/ui primitives (+ skeleton.tsx)
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # Browser Supabase client
│   │   ├── server.ts               # Server Supabase client
│   │   └── middleware.ts           # Session refresh
│   ├── date-utils.ts               # Timezone-safe date helpers
│   ├── types.ts                    # Shared TypeScript types
│   └── utils.ts                    # cn() helper
├── middleware.ts                    # Route protection
├── public/favicon.svg
├── supabase/schema.sql
├── .env.example
└── README.md
```

---

## Local Setup

### 1. Clone & install

```bash
git clone https://github.com/tamtam888/TaskAi.git
cd TaskAi
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → **New project**.
2. Open **SQL Editor** → paste and run the full contents of `supabase/schema.sql`.
3. Copy your credentials from **Settings → API**:
   - **Project URL** (`https://xxxx.supabase.co`)
   - **Anon / public key**

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Configure Supabase auth redirect URLs

In Supabase → **Authentication → URL Configuration**:

| Field | Value |
|-------|-------|
| Site URL | `http://localhost:3000` |
| Redirect URLs | `http://localhost:3000/**` |

Add your production URLs here before deploying (see [Deployment](#deployment)).

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you will be redirected to the login page.

---

## Deployment

### Vercel (recommended)

1. Push to GitHub, then import the repo at [vercel.com](https://vercel.com).
2. Add the following environment variables in the Vercel dashboard:

   | Variable | Value |
   |----------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | your Supabase project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your Supabase anon key |
   | `NEXT_PUBLIC_SITE_URL` | `https://your-vercel-domain.vercel.app` |

3. Deploy.

4. After the first deploy, update Supabase → **Authentication → URL Configuration**:

   | Field | Value |
   |-------|-------|
   | Site URL | `https://your-vercel-domain.vercel.app` |
   | Redirect URLs | `http://localhost:3000/**` · `https://your-vercel-domain.vercel.app/**` · `https://your-custom-domain.com/**` |

> **Note:** `NEXT_PUBLIC_SITE_URL` must match the domain you add to Supabase redirect URLs, otherwise the post-login redirect will fail.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| Blank page / no data | Missing env vars | Confirm `.env.local` has all three variables and restart `npm run dev` |
| Redirect loop after login | Wrong `NEXT_PUBLIC_SITE_URL` | Make sure it matches the URL in Supabase → Authentication → Site URL |
| `new row violates RLS` | Row Level Security | Each insert must include `user_id: user.id`; confirm the user is logged in |
| Tasks from another user visible | RLS not applied | Re-run `supabase/schema.sql`; check policies in Supabase → Table Editor → Policies |
| Supabase anon key error | Key copied incorrectly | Use the **anon** key, not the **service_role** key |
| Auth email not arriving | Supabase email limits | Free tier has a 3 emails/hour cap; use a custom SMTP provider in production |
| `Error: Cannot find module '@/...'` | Missing install | Run `npm install` |

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project REST endpoint |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Public API key (safe to expose in browser) |
| `NEXT_PUBLIC_SITE_URL` | ✅ | Canonical app URL — used for auth redirects |

All three variables are public (`NEXT_PUBLIC_`) and safe to commit to Vercel's environment configuration. **Never commit `.env.local`** — it is listed in `.gitignore`.

---

## Contributing

Contributions are welcome for bug fixes and small improvements.

1. Fork the repository and create a feature branch:
   ```bash
   git checkout -b fix/your-description
   ```
2. Keep changes focused — one concern per PR.
3. Use Hebrew strings for any new UI text (this is a Hebrew-first product).
4. Run `npm run build` locally before opening a pull request — it must pass with zero TypeScript errors.
5. Open a pull request against `main` with a clear description of what changed and why.

For larger feature proposals, open an issue first to discuss the approach.

---

## License

MIT — see [LICENSE](LICENSE) for details.
