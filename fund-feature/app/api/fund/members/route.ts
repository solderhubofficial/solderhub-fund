import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getMembers } from "@/lib/fund/queries";
import { requireAdmin } from "@/lib/auth/require-admin";

function slugify(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function GET() {
  const members = await getMembers();
  return NextResponse.json({ members });
}

export async function POST(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  const body = await req.json().catch(() => null);
  const name: string | undefined = body?.name;
  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("fund_members")
    .insert({ name, slug: slugify(name) })
    .select()
    .single();

  if (error) {
    console.error("[fund/members] insert failed", error);
    return NextResponse.json({ error: "Failed to create member" }, { status: 500 });
  }
  return NextResponse.json({ member: data }, { status: 201 });
}
