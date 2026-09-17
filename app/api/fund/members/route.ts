import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-admin";

export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .order("joined_on", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ members: data });
}

export async function POST(req: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const body = await req.json().catch(() => null);
  const shortName: string | undefined = body?.short_name;
  if (!shortName || typeof shortName !== "string") {
    return NextResponse.json({ error: "short_name is required" }, { status: 400 });
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("members")
    .insert({
      short_name: shortName.trim().toUpperCase(),
      full_name: body?.full_name ?? null,
      color: body?.color ?? "#2563eb",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await supabase.from("activity_log").insert({
    member_id: data.id,
    activity_type: "member_added",
    description: `New member added: ${data.short_name}`,
  });

  return NextResponse.json({ member: data }, { status: 201 });
}
