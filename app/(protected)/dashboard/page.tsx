import { createClient } from "@/lib/supabase/server";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export default async function DashboardPage() {
  const supabase = createClient();

  const { data: tasks = [] } = await supabase
    .from("tasks")
    .select("*, project:projects(id, name)");

  return <DashboardClient tasks={tasks || []} />;
}
