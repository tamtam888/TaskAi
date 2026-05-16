# TaskAi - Smart Task Management SaaS

**TaskAi** is a Hebrew-first RTL task management SaaS built with Next.js 14, TypeScript, Supabase, Tailwind CSS, and shadcn/ui.

The app is inspired by Monday-style task workflows, but keeps the product focused and lightweight: tasks, projects, dashboard insights, smart filters, focus mode, responsive layouts, protected routes, and Supabase Row Level Security.

This project demonstrates production-style frontend architecture, secure user-scoped data, Hebrew RTL UX, server/client separation in Next.js, and practical SaaS product thinking.

## Repository

- Live Demo: https://task-1mezh0h1x-tamar-karwans-projects.vercel.app/login
- Repository: https://github.com/tamtam888/TaskAi

---

## Core Features

| Area | Details |
|------|---------|
| Auth | Email/password signup and login, session refresh middleware, protected routes |
| Tasks | Monday-style task table with inline editing for title, status, priority, due date, and project |
| Smart Sorting | Prioritizes not-done tasks, nearest due dates, and completed tasks |
| Quick Filters | Hebrew filters for all tasks, today, upcoming week, and overdue tasks |
| Focus Mode | Highlights the most important tasks by priority and due date |
| Dashboard | Completion percentage, overdue count, priority chart, and project workload chart |
| Projects | Create, rename, and delete projects with task-count warning |
| Settings | UI density and default view preferences saved locally |
| Responsive UI | Mobile cards, tablet condensed layout, desktop table view |
| Accessibility | aria-label usage, focus states, and Hebrew dialog descriptions |
| Data Security | Supabase RLS so each user can access only their own data |

---

## Product Focus

TaskAi was designed as a practical SaaS-style productivity tool, not only as a UI exercise.

Main product decisions:

- Hebrew-first interface with RTL layout support
- Authenticated user experience from the start
- Supabase policies for user-level data isolation
- Dashboard and focus tools that help users act, not only store tasks
- Responsive behavior that changes the task view based on screen size
- Clear separation between server data loading and client-side interaction

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14, App Router, React Server Components |
| Language | TypeScript |
| Styling | Tailwind CSS, shadcn/ui, Radix primitives |
| Table | TanStack Table v8 |
| Forms | React Hook Form, Zod |
| Charts | Recharts |
| Backend | Supabase, PostgreSQL, Auth, RLS |
| UI Feedback | Sonner toasts, loading skeletons, error boundaries |
| Deployment | Vercel-ready configuration |

---

## Architecture Overview

The project is organized around route-level pages, reusable UI components, Supabase access helpers, shared types, and database schema files.

| Folder | Purpose |
|--------|---------|
| `app/` | Next.js App Router pages, protected routes, loading states, and error boundaries |
| `components/` | Reusable dashboard, layout, project, settings, task, and UI components |
| `lib/` | Supabase clients, shared types, date helpers, and utilities |
| `supabase/` | SQL schema and Row Level Security setup |
| `middleware.ts` | Session-aware route protection |
| `.env.example` | Required environment variable template |

---

## Data and Security Model

TaskAi uses Supabase Auth and PostgreSQL with Row Level Security.

Each task and project belongs to the authenticated user. Database policies are designed so users can only read and write their own records. This keeps the data model aligned with the product requirement: a personal task workspace with private user data.

The project includes a `supabase/schema.sql` file so the database schema and policies can be recreated in a new Supabase project.

---

## Local Setup

### 1. Clone and install

```bash
git clone https://github.com/tamtam888/TaskAi.git
cd TaskAi
npm install
```

### 2. Create a Supabase project

1. Create a new Supabase project.
2. Open the SQL Editor.
3. Run the SQL from `supabase/schema.sql`.
4. Copy the Project URL and anon public key from Supabase settings.

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Add your values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Run locally

```bash
npm run dev
```

Open `http://localhost:3000`.

---

## Available Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm start` | Run the production build locally after build |
| `npm run lint` | Run Next.js lint checks |

---

## Deployment Notes

TaskAi is built for Vercel deployment.

Required Vercel environment variables:

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon public key |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL for auth redirects |

After deployment, update Supabase Authentication URL settings so the Site URL and Redirect URLs match the Vercel domain.

The demo may depend on active Supabase and Vercel services. If a free-tier backend is paused, the source code still documents the product and architecture.

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| Blank page or no data | Missing environment variables | Check `.env.local` and restart the dev server |
| Redirect loop after login | Wrong `NEXT_PUBLIC_SITE_URL` | Match it with the Supabase Site URL |
| Insert blocked by RLS | Missing or wrong user id | Confirm the user is authenticated and rows include `user_id` |
| Other users' data appears | RLS policy issue | Re-run `supabase/schema.sql` and inspect Supabase policies |
| Supabase key error | Wrong key copied | Use the anon public key, not the service role key |

---

## What This Project Demonstrates

- Next.js App Router architecture
- TypeScript-based UI and data modeling
- Hebrew RTL product interface
- Supabase Auth and RLS integration
- Protected routes and session-aware layouts
- Responsive data-heavy UI with table and card views
- Dashboard UX with actionable productivity metrics
- Clean component organization using shadcn/ui and Tailwind CSS
- Production-oriented deployment configuration

---

## Future Improvements

- Add automated tests for core task and project flows
- Add CI workflow for lint and production build checks
- Add AI-assisted task suggestions and prioritization
- Add collaboration features for shared projects

---

## License

MIT - see [LICENSE](LICENSE) for details.
