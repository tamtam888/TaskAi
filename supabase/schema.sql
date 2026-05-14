-- ============================================================
-- Smart Personal Todo – Supabase Schema
-- Run this SQL in the Supabase SQL Editor
-- ============================================================

-- -------------------------------------------------------
-- 1. TABLES
-- -------------------------------------------------------

-- projects
CREATE TABLE IF NOT EXISTS public.projects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- tasks
CREATE TABLE IF NOT EXISTS public.tasks (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id   UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  title        TEXT NOT NULL,
  description  TEXT,
  status       TEXT NOT NULL DEFAULT 'backlog'
                 CHECK (status IN ('backlog', 'in_progress', 'done')),
  priority     TEXT NOT NULL DEFAULT 'medium'
                 CHECK (priority IN ('low', 'medium', 'high')),
  due_date     DATE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- tags
CREATE TABLE IF NOT EXISTS public.tags (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name     TEXT NOT NULL
);

-- task_tags (junction table)
CREATE TABLE IF NOT EXISTS public.task_tags (
  task_id  UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  tag_id   UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, tag_id)
);

-- comments
CREATE TABLE IF NOT EXISTS public.comments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id    UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES auth.users(id),
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -------------------------------------------------------
-- 2. ROW LEVEL SECURITY
-- -------------------------------------------------------

ALTER TABLE public.projects  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments  ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------------------
-- 3. RLS POLICIES
-- -------------------------------------------------------

-- projects
CREATE POLICY "projects: user owns"
  ON public.projects
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- tasks
CREATE POLICY "tasks: user owns"
  ON public.tasks
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- tags
CREATE POLICY "tags: user owns"
  ON public.tags
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- task_tags: enforce via tasks.user_id
CREATE POLICY "task_tags: user owns via task"
  ON public.task_tags
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM public.tasks t
      WHERE t.id = task_id
        AND t.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.tasks t
      WHERE t.id = task_id
        AND t.user_id = auth.uid()
    )
  );

-- comments
CREATE POLICY "comments: user owns"
  ON public.comments
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- -------------------------------------------------------
-- 4. SEED DATA (optional – for testing)
-- -------------------------------------------------------
-- Uncomment to insert sample projects and tags for a test user.
-- Replace '<your-user-uuid>' with your actual user UUID from auth.users.

/*
INSERT INTO public.projects (user_id, name) VALUES
  ('<your-user-uuid>', 'עבודה'),
  ('<your-user-uuid>', 'אישי'),
  ('<your-user-uuid>', 'בריאות');

INSERT INTO public.tags (user_id, name) VALUES
  ('<your-user-uuid>', 'דחוף'),
  ('<your-user-uuid>', 'חשוב'),
  ('<your-user-uuid>', 'ארוך טווח');
*/
