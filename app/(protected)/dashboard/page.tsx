import { createClient } from "@/lib/supabase/server";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export default async function DashboardPage() {
  const supabase = createClient();

  const { data: tasks, error } = await supabase
    .from("tasks")
    .select("*, project:projects(id, name)");

  if (error) {
    console.error("[Dashboard] Supabase error:", error);
    throw new Error("Could not load dashboard data. Please try again.");
  }

  return <DashboardClient tasks={tasks || []} />;
}
