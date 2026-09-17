import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Returns null when the current request is from a signed-in admin (allowed
 * to proceed). Otherwise returns the NextResponse the route handler should
 * return immediately.
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { data: member } = await supabase
    .from("members")
    .select("is_admin")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!member?.is_admin) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  return null;
}
