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

  if (tasksResult.error) {
    console.error("[Tasks] Supabase error:", tasksResult.error);
    throw new Error("Could not load tasks. Please try again.");
  }
  if (projectsResult.error) {
    console.error("[Tasks] Projects Supabase error:", projectsResult.error);
    throw new Error("Could not load projects. Please try again.");
  }

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
