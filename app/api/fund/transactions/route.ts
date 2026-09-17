import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await request.json();
  const supabase = createClient();

  if (body.kind === "monthly") {
    const { member_id, month, contribution, interest_share, note } = body;
    if (!member_id || !month) {
      return NextResponse.json({ error: "member_id and month are required" }, { status: 400 });
    }
    if (!(Number(contribution) >= 0) || !(Number(interest_share) >= 0)) {
      return NextResponse.json({ error: "Amounts must be zero or more" }, { status: 400 });
    }
    // One row per member per month — upsert so re-entering a month edits it.
    const { error } = await supabase.from("monthly_contributions").upsert(
      {
        member_id,
        month,
        contribution: Number(contribution),
        interest_share: Number(interest_share),
        note: note ?? null,
      },
      { onConflict: "member_id,month" }
    );
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    await supabase.from("activity_log").insert({
      member_id,
      activity_type: "contribution",
      amount: Number(contribution),
      description: "Monthly contribution logged",
    });
    return NextResponse.json({ ok: true });
  }

  if (body.kind === "disbursement" || body.kind === "repayment") {
    const { member_id, amount, txn_date, note } = body;
    if (!member_id || !txn_date) {
      return NextResponse.json({ error: "member_id and txn_date are required" }, { status: 400 });
    }
    if (!(Number(amount) > 0)) {
      return NextResponse.json({ error: "Amount must be greater than zero" }, { status: 400 });
    }
    const { error } = await supabase.from("loan_transactions").insert({
      member_id,
      txn_type: body.kind,
      amount: Number(amount),
      txn_date,
      note: note ?? null,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    await supabase.from("activity_log").insert({
      member_id,
      activity_type: body.kind === "disbursement" ? "loan_disbursed" : "loan_repaid",
      amount: Number(amount),
      description: body.kind === "disbursement" ? "Loan disbursed" : "Loan repayment received",
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown entry kind" }, { status: 400 });
}
