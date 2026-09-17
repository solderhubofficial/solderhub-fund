import "server-only";
// Adjust this import to wherever your project creates its server-side
// Supabase client (the codebase already has one for the rest of the site).
import { createClient } from "@/lib/supabase/server";
import type {
  FundMember,
  FundTransaction,
  FundSummary,
  MemberBalance,
  NewTransactionInput,
  LoanOutstandingPoint,
  ActivityItem,
} from "./types";

export async function getMembers(): Promise<FundMember[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("fund_members")
    .select("*")
    .order("name", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getMemberBySlug(slug: string): Promise<FundMember | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("fund_members")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getTransactionsForMember(memberId: string): Promise<FundTransaction[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("fund_transactions")
    .select("*")
    .eq("member_id", memberId)
    .order("txn_date", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

async function getAllTransactions(): Promise<FundTransaction[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("fund_transactions").select("*");
  if (error) throw error;
  return data ?? [];
}

async function getFundSettings() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("fund_settings")
    .select("*")
    .eq("id", 1)
    .single();
  if (error) throw error;
  return data as { fd_amount: number; save_amount: number; max_credit_per_member: number };
}

function computeMemberBalance(member: FundMember, txns: FundTransaction[]): MemberBalance {
  const mine = txns.filter((t) => t.member_id === member.id);
  const sum = (type: FundTransaction["type"]) =>
    mine.filter((t) => t.type === type).reduce((acc, t) => acc + Number(t.amount), 0);

  const totalContribution = sum("contribution");
  const totalInterest = sum("interest");
  const totalLoanTaken = sum("loan");
  const totalRepaid = sum("repayment");
  const loanOutstanding = totalLoanTaken - totalRepaid;

  return {
    member,
    totalContribution,
    totalInterest,
    totalLoanTaken,
    totalRepaid,
    loanOutstanding,
    netPosition: totalContribution + totalInterest,
  };
}

/**
 * Fund-wide summary, computed straight from the ledger rather than stored,
 * so it can never drift out of sync the way a hand-maintained spreadsheet
 * total can.
 *
 * Formula reverse-engineered from the source HOME sheet, where the numbers
 * lined up exactly:
 *   fundGrossValue = totalContribution + totalInterest
 *   fundBalance    = fundGrossValue - totalLoanOutstanding - fd - save
 */
export async function getFundSummary(): Promise<FundSummary> {
  const [members, txns, settings] = await Promise.all([
    getMembers(),
    getAllTransactions(),
    getFundSettings(),
  ]);

  const memberBalances = members.map((m) => computeMemberBalance(m, txns));

  const totalContribution = memberBalances.reduce((a, m) => a + m.totalContribution, 0);
  const totalInterest = memberBalances.reduce((a, m) => a + m.totalInterest, 0);
  const totalLoanOutstanding = memberBalances.reduce((a, m) => a + m.loanOutstanding, 0);
  const fundGrossValue = totalContribution + totalInterest;
  const fundBalance =
    fundGrossValue - totalLoanOutstanding - settings.fd_amount - settings.save_amount;

  return {
    totalContribution,
    totalInterest,
    totalLoanOutstanding,
    fundGrossValue,
    fdAmount: settings.fd_amount,
    saveAmount: settings.save_amount,
    maxCreditPerMember: settings.max_credit_per_member,
    fundBalance,
    members: memberBalances,
    memberCount: members.length,
  };
}

/**
 * Cumulative loan-outstanding-by-month, for a trend chart. This is derived
 * straight from loan/repayment transactions (not the contribution/interest
 * side — see README for why those don't currently reconcile against the
 * source spreadsheet's summary totals).
 */
export async function getLoanOutstandingTrend(): Promise<LoanOutstandingPoint[]> {
  const txns = (await getAllTransactions())
    .filter((t) => t.type === "loan" || t.type === "repayment")
    .sort((a, b) => a.txn_date.localeCompare(b.txn_date));

  const byMonth = new Map<string, number>();
  let running = 0;
  for (const t of txns) {
    const month = t.txn_date.slice(0, 7); // "YYYY-MM"
    running += t.type === "loan" ? Number(t.amount) : -Number(t.amount);
    byMonth.set(month, running);
  }

  return Array.from(byMonth.entries()).map(([month, loanOutstanding]) => ({
    month,
    loanOutstanding,
  }));
}

/** Latest N entries across every member, newest first, for an activity feed. */
export async function getRecentActivity(limit = 6): Promise<ActivityItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("fund_transactions")
    .select("id, type, amount, txn_date, fund_members(name)")
    .order("txn_date", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    id: row.id,
    memberName: row.fund_members?.name ?? "Unknown",
    type: row.type,
    amount: Number(row.amount),
    date: row.txn_date,
  }));
}

export async function addTransaction(input: NewTransactionInput) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("fund_transactions")
    .insert({
      member_id: input.member_id,
      type: input.type,
      amount: input.amount,
      txn_date: input.txn_date,
      period: input.period ?? null,
      note: input.note ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data as FundTransaction;
}
