import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getMemberBySlug,
  getMemberSummaryById,
  getMemberHistory,
  getPaymentDueInfo,
} from "@/lib/fund/queries";
import { formatINR, formatDate, formatMonth } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { getUnifiedRole, isFundManager } from "@/lib/auth/roles";
import { NewTransactionForm } from "./new-transaction-form";

export const dynamic = "force-dynamic";

const KIND_LABEL: Record<string, string> = {
  contribution: "Monthly contribution",
  interest: "Interest",
  disbursement: "Loan disbursed",
  repayment: "Loan repayment",
};
const OUTFLOW = new Set(["disbursement"]);

export default async function MemberPage({ params }: { params: { slug: string } }) {
  const member = await getMemberBySlug(params.slug);
  if (!member) notFound();

  const [summary, history, due] = await Promise.all([
    getMemberSummaryById(member.id),
    getMemberHistory(member.id),
    getPaymentDueInfo(member.id),
  ]);

  const loanOutstanding = summary?.outstanding_loan ?? 0;

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const canWrite = user ? isFundManager(await getUnifiedRole(supabase, user.id)) : false;

  // Note: this page renders inside app/fund/layout.tsx (Next.js nested
  // layout resolves /fund/[slug] under /fund automatically), so it must
  // NOT bring its own <main> or full-bleed background — that shell already
  // provides the sidebar, topbar, and page background.
  return (
    <div className="mx-auto max-w-xl">
      <Link href="/fund/members" className="text-sm text-[#101828]/50 hover:text-[#101828]">
        ← All members
      </Link>

      <section className="mt-4 rounded-2xl bg-[#0B1C3F] px-6 py-7 text-white">
        <p className="text-sm text-white/60">{member.full_name ?? member.short_name}</p>
        <p className="mt-1 font-['Fraunces',serif] text-[38px] leading-none tracking-tight">
          {formatINR(loanOutstanding)}
        </p>
        <p className="mt-2 text-sm text-white/50">
          {loanOutstanding > 0 ? "Outstanding loan" : "No outstanding loan"}
        </p>
        {summary && (
          <div className="mt-4 flex gap-6 border-t border-white/10 pt-4 text-sm">
            <div>
              <p className="text-white/45">Contributed</p>
              <p className="font-medium">{formatINR(summary.total_contribution)}</p>
            </div>
            <div>
              <p className="text-white/45">Interest earned</p>
              <p className="font-medium">{formatINR(summary.total_interest_share)}</p>
            </div>
          </div>
        )}
      </section>

      <section className="mt-4 flex items-center justify-between rounded-2xl bg-white px-5 py-4 shadow-sm">
        <div>
          <p className="text-sm text-[#101828]/50">
            {due.isCurrentMonthSettled ? "Next minimum payment" : "Minimum payment due"}
          </p>
          <p className="mt-0.5 font-['Fraunces',serif] text-2xl text-[#101828]">
            {formatINR(due.dueAmount)}
          </p>
          <p className="mt-0.5 text-xs text-[#101828]/45">for {formatMonth(due.dueMonth)}</p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            due.isCurrentMonthSettled
              ? "bg-[#EAF7EF] text-[#2F7A5C]"
              : "bg-[#FBEFE6] text-[#C98A2B]"
          }`}
        >
          {due.isCurrentMonthSettled ? "This month settled" : "Not yet paid"}
        </span>
      </section>

      {canWrite ? (
        <>
          <h2 className="mt-8 mb-2 font-['Fraunces',serif] text-lg text-[#101828]">New entry</h2>
          <NewTransactionForm memberId={member.id} />
        </>
      ) : (
        <p className="mt-8 rounded-2xl bg-white px-4 py-3.5 text-sm text-[#101828]/50 shadow-sm">
          You have view-only fund access. Ask a Fund Manager to log new entries.
        </p>
      )}

      <h2 className="mt-9 mb-2 font-['Fraunces',serif] text-lg text-[#101828]">History</h2>
      <div className="divide-y divide-[#E4E7EC] rounded-2xl bg-white shadow-sm">
        {history.map((t) => {
          const out = OUTFLOW.has(t.kind);
          return (
            <div key={t.id} className="flex items-center gap-3 px-4 py-3.5">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: out ? "#C98A2B" : "#2F7A5C" }}
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium text-[#101828]">
                  {KIND_LABEL[t.kind] ?? t.kind}
                </span>
                <span className="block text-sm text-[#101828]/55">
                  {formatDate(t.date)}
                  {t.note ? ` · ${t.note}` : ""}
                </span>
              </span>
              <span
                className="tabular-nums text-sm font-medium"
                style={{ color: out ? "#C98A2B" : "#2F7A5C" }}
              >
                {out ? "−" : "+"}
                {formatINR(t.amount)}
              </span>
            </div>
          );
        })}
        {history.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-[#101828]/40">No entries yet.</p>
        )}
      </div>
    </div>
  );
}
