import { createClient } from "@/lib/supabase/server";
import type {
  FdDeposit,
  FundSettings,
  FundSummary,
  LoanTransaction,
  Member,
  MemberSummary,
  MonthlyTrendRow,
} from "@/lib/fund/types";

export async function getFundSummary(): Promise<FundSummary> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("v_fund_summary")
    .select("*")
    .single();
  if (error) throw error;
  return data as FundSummary;
}

export async function getMemberSummaries(): Promise<MemberSummary[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("v_member_summary")
    .select("*")
    .order("joined_on", { ascending: true });
  if (error) throw error;
  return data as MemberSummary[];
}

export async function getMonthlyTrend(): Promise<MonthlyTrendRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("v_monthly_trend")
    .select("*")
    .order("month", { ascending: true });
  if (error) throw error;
  return data as MonthlyTrendRow[];
}

export async function getSettings(): Promise<FundSettings> {
  const supabase = createClient();
  const { data, error } = await supabase.from("fund_settings").select("key, value");
  if (error) throw error;
  const map = new Map((data ?? []).map((r) => [r.key, Number(r.value)]));
  return {
    monthly_contribution: map.get("monthly_contribution") ?? 600,
    loan_interest_percent: map.get("loan_interest_percent") ?? 1,
    max_credit_per_member: map.get("max_credit_per_member") ?? 50000,
  };
}

export async function getFdDeposits(): Promise<FdDeposit[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("fd_deposits")
    .select("*")
    .order("opened_on", { ascending: false });
  if (error) throw error;
  return data as FdDeposit[];
}

export async function getMemberBySlug(slug: string): Promise<Member | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .ilike("short_name", slug)
    .maybeSingle();
  if (error) throw error;
  return data as Member | null;
}

export async function getMemberSummaryById(
  id: string
): Promise<MemberSummary | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("v_member_summary")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data as MemberSummary | null;
}

export async function getMemberByUserId(userId: string): Promise<Member | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data as Member | null;
}

export type PaymentDueInfo = {
  monthlyAmount: number;
  currentMonthPaid: number;
  isCurrentMonthSettled: boolean;
  /** Month (first-of-month date string) the "next minimum payment" applies to —
   * the current month if it's still unpaid/short, otherwise next month. */
  dueMonth: string;
  dueAmount: number;
};

/** This member's next minimum payment: what's left for the current month if
 * it isn't fully paid yet, otherwise next month's standard contribution. */
export async function getPaymentDueInfo(memberId: string): Promise<PaymentDueInfo> {
  const supabase = createClient();
  const settings = await getSettings();
  const now = new Date();
  const currentMonth = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-01`;

  const { data, error } = await supabase
    .from("monthly_contributions")
    .select("contribution")
    .eq("member_id", memberId)
    .eq("month", currentMonth)
    .maybeSingle();
  if (error) throw error;

  const currentMonthPaid = Number(data?.contribution ?? 0);
  const isCurrentMonthSettled = currentMonthPaid >= settings.monthly_contribution;

  if (isCurrentMonthSettled) {
    const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
    const dueMonth = `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, "0")}-01`;
    return {
      monthlyAmount: settings.monthly_contribution,
      currentMonthPaid,
      isCurrentMonthSettled: true,
      dueMonth,
      dueAmount: settings.monthly_contribution,
    };
  }

  return {
    monthlyAmount: settings.monthly_contribution,
    currentMonthPaid,
    isCurrentMonthSettled: false,
    dueMonth: currentMonth,
    dueAmount: settings.monthly_contribution - currentMonthPaid,
  };
}


export async function getMemberHistory(memberId: string) {
  const supabase = createClient();
  const [{ data: contributions, error: e1 }, { data: loans, error: e2 }] =
    await Promise.all([
      supabase
        .from("monthly_contributions")
        .select("*")
        .eq("member_id", memberId)
        .order("month", { ascending: false }),
      supabase
        .from("loan_transactions")
        .select("*")
        .eq("member_id", memberId)
        .order("txn_date", { ascending: false }),
    ]);
  if (e1) throw e1;
  if (e2) throw e2;

  type Row = {
    id: string;
    kind: "contribution" | "interest" | "disbursement" | "repayment";
    amount: number;
    date: string;
    note: string | null;
  };

  const rows: Row[] = [];
  for (const c of contributions ?? []) {
    if (Number(c.contribution) > 0) {
      rows.push({
        id: `${c.id}-c`,
        kind: "contribution",
        amount: Number(c.contribution),
        date: c.month,
        note: c.note,
      });
    }
    if (Number(c.interest_share) > 0) {
      rows.push({
        id: `${c.id}-i`,
        kind: "interest",
        amount: Number(c.interest_share),
        date: c.month,
        note: c.note,
      });
    }
  }
  for (const l of (loans ?? []) as LoanTransaction[]) {
    rows.push({
      id: l.id,
      kind: l.txn_type,
      amount: Number(l.amount),
      date: l.txn_date,
      note: l.note,
    });
  }

  rows.sort((a, b) => (a.date < b.date ? 1 : -1));
  return rows;
}

/** Recent activity across every member, for the dashboard's activity feed. */
export async function getRecentActivity(limit = 8) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("activity_log")
    .select("id, activity_type, amount, description, occurred_at, members(short_name)")
    .order("occurred_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}
