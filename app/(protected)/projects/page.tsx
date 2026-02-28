import { createClient } from "@/lib/supabase/server";
import { ProjectsClient } from "@/components/projects/projects-client";

export default async function ProjectsPage() {
  const supabase = createClient();

  // Fetch projects and task-project assignments in parallel.
  // Count tasks per project in JS — avoids Supabase embedded-count quirks.
  const [projectsResult, tasksResult] = await Promise.all([
    supabase.from("projects").select("*").order("name", { ascending: true }),
    supabase
      .from("tasks")
      .select("project_id")
      .not("project_id", "is", null),
  ]);

  const projects = projectsResult.data || [];
  const taskRows = tasksResult.data || [];

  // Build a count map: project_id → count
  const countMap: Record<string, number> = {};
  for (const row of taskRows) {
    if (row.project_id) {
      countMap[row.project_id] = (countMap[row.project_id] || 0) + 1;
    }
  }

  const projectsWithCount = projects.map((p) => ({
    ...p,
    task_count: countMap[p.id] || 0,
  }));

  return <ProjectsClient initialProjects={projectsWithCount} />;
}
