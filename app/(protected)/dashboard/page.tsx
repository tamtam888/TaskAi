import { createClient } from "@/lib/supabase/server";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export default async function DashboardPage() {
  const supabase = createClient();

  const { data: tasks, error } = await supabase
    .from("tasks")
    .select("*, project:projects(id, name)");

  if (error) throw error;

  return <DashboardClient tasks={tasks || []} />;
}
