import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Unified Solderhub account roles that this app cares about. These live on
 * the shared `profiles` table (same Supabase project as solderhub.com /
 * simulator.solderhub.com) — NOT on this app's local `members` table.
 * `members.is_admin` is kept only as fund-specific display data; it no
 * longer gates access (see supabase/migration-002-unified-auth.sql).
 *
 * `admin` is the site-wide Solderhub admin role (not fund-specific) — an
 * account with that role gets fund_manager-level access here automatically,
 * without also needing a separate fund_manager grant.
 */
export const FUND_ROLES = ["fund_user", "fund_manager", "admin"] as const;
export type UnifiedRole = (typeof FUND_ROLES)[number];

function isUnifiedRole(value: unknown): value is UnifiedRole {
  return typeof value === "string" && (FUND_ROLES as readonly string[]).includes(value);
}

/** Looks up the signed-in user's unified role. Returns null if they have no
 * role this app recognizes (including: no profile row, or a role outside
 * the ones above — e.g. a plain solderhub.com reader account). */
export async function getUnifiedRole(
  supabase: SupabaseClient,
  userId: string
): Promise<UnifiedRole | null> {
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  return isUnifiedRole(data?.role) ? data.role : null;
}

export function hasFundAccess(role: UnifiedRole | null): boolean {
  return role === "fund_user" || role === "fund_manager" || role === "admin";
}

/** fund_manager and site-wide admin both get write access. */
export function isFundManager(role: UnifiedRole | null): boolean {
  return role === "fund_manager" || role === "admin";
}

export function roleLabel(role: UnifiedRole | null): string {
  if (role === "admin") return "Admin";
  if (role === "fund_manager") return "Fund Manager";
  if (role === "fund_user") return "Fund Member";
  return "No fund access";
}
