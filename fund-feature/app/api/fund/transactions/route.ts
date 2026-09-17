import { NextRequest, NextResponse } from "next/server";
import { addTransaction } from "@/lib/fund/queries";
// Swap in your project's real auth check (the same one guarding your other
// admin/write routes) — this is a placeholder so the route isn't left open.
import { requireAdmin } from "@/lib/auth/require-admin";

const VALID_TYPES = ["loan", "repayment", "contribution", "interest"] as const;

export async function POST(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { member_id, type, amount, txn_date, period, note } = body;

  if (!member_id || typeof member_id !== "string") {
    return NextResponse.json({ error: "member_id is required" }, { status: 400 });
  }
  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json(
      { error: `type must be one of: ${VALID_TYPES.join(", ")}` },
      { status: 400 },
    );
  }
  const parsedAmount = Number(amount);
  if (!Number.isFinite(parsedAmount) || parsedAmount < 0) {
    return NextResponse.json({ error: "amount must be a non-negative number" }, { status: 400 });
  }
  if (!txn_date || typeof txn_date !== "string") {
    return NextResponse.json({ error: "txn_date is required (YYYY-MM-DD)" }, { status: 400 });
  }

  try {
    const txn = await addTransaction({
      member_id,
      type,
      amount: parsedAmount,
      txn_date,
      period: period ?? null,
      note: note ?? null,
    });
    return NextResponse.json({ transaction: txn }, { status: 201 });
  } catch (err) {
    console.error("[fund/transactions] insert failed", err);
    return NextResponse.json({ error: "Failed to save transaction" }, { status: 500 });
  }
}
