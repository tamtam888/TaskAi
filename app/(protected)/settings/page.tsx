import { createClient } from "@/lib/supabase/server";
import { SettingsClient } from "@/components/settings/settings-client";

export const metadata = { title: "הגדרות – משימות חכמות" };

export default async function SettingsPage() {
  const supabase = createClient();
  // user is guaranteed non-null — protected layout redirects otherwise
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <SettingsClient
      email={user?.email ?? ""}
      createdAt={user?.created_at ?? null}
    />
  );
}
