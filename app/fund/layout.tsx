import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";
import { getUnifiedRole, roleLabel } from "@/lib/auth/roles";
import { AppShell } from "@/components/app-shell";

export default async function FundLayout({ children }: { children: ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let displayName = user?.email ?? "Signed in";
  let role = null;
  if (user) {
    role = await getUnifiedRole(supabase, user.id);
    const { data: member } = await supabase
      .from("members")
      .select("short_name")
      .eq("user_id", user.id)
      .maybeSingle();
    if (member?.short_name) displayName = member.short_name;
  }

  return (
    <AppShell displayName={displayName} roleLabel={roleLabel(role)}>
      {children}
    </AppShell>
  );
}
