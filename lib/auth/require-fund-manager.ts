import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUnifiedRole, isFundManager } from "@/lib/auth/roles";

/**
 * Returns null when the current request is from a signed-in Fund Manager
 * (allowed to write). Otherwise returns the NextResponse the route handler
 * should return immediately. Gate is the unified `profiles.role`, not the
 * local `members.is_admin` flag.
 */
export async function requireFundManager(): Promise<NextResponse | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const role = await getUnifiedRole(supabase, user.id);
  if (!isFundManager(role)) {
    return NextResponse.json({ error: "Fund manager access required" }, { status: 403 });
  }

  return null;
}
