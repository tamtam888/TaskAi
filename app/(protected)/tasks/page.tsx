import { createClient } from "@/lib/supabase/server";
import { TasksClient } from "@/components/tasks/tasks-client";

export default async function TasksPage() {
  const supabase = createClient();

  const [tasksResult, projectsResult, tagsResult] = await Promise.all([
    supabase
      .from("tasks")
      .select(
        `
        *,
        project:projects(id, name),
        tags:task_tags(tag:tags(id, name))
      `
      )
      .order("created_at", { ascending: false }),
    supabase
      .from("projects")
      .select("*")
      .order("name", { ascending: true }),
    supabase
      .from("tags")
      .select("*")
      .order("name", { ascending: true }),
  ]);

  if (tasksResult.error) throw tasksResult.error;
  if (projectsResult.error) throw projectsResult.error;

  const rawTasks = tasksResult.data || [];
  const projects = projectsResult.data || [];
  const tags = tagsResult.data || [];

  // Normalize task_tags join result
  const tasks = rawTasks.map((task) => ({
    ...task,
    tags: (task.tags || []).map(
      (tt: { tag: { id: string; name: string } }) => tt.tag
    ),
  }));

  return (
    <TasksClient
      initialTasks={tasks}
      projects={projects}
      tags={tags}
    />
  );
}
