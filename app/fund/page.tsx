import Link from "next/link";
import {
  getFundSummary,
  getMemberSummaries,
  getMonthlyTrend,
  getRecentActivity,
} from "@/lib/fund/queries";
import { formatINR } from "@/lib/format";
import { FundGrowthChart, FundAllocationChart } from "./charts";

const ACTIVITY_LABEL: Record<string, string> = {
  contribution: "Contribution received from",
  loan_disbursed: "Loan disbursed to",
  loan_repaid: "Repayment received from",
  interest_posted: "Interest posted for",
  member_added: "New member added:",
  fd_created: "FD created",
};

export const dynamic = "force-dynamic";

export default async function FundDashboardPage() {
  const [summary, members, trend, activity] = await Promise.all([
    getFundSummary(),
    getMemberSummaries(),
    getMonthlyTrend(),
    getRecentActivity(6),
  ]);

  const availableBalance = Math.max(summary.fund_balance, 0);

  const statCards = [
    { label: "Fund Gross Value", value: summary.fund_gross_value, icon: "🗄️" },
    { label: "Total Contribution", value: summary.total_contribution, icon: "👛" },
    { label: "Total Loan Taken", value: summary.total_loan_taken, icon: "📄" },
    { label: "Total Interest", value: summary.total_interest, icon: "％" },
    { label: "Fund Balance", value: summary.fund_balance, icon: "₹" },
    { label: "FD / Savings", value: summary.fd_balance + summary.save_others, icon: "🐖" },
  ];

  return (
    <div className="mx-auto max-w-[1400px]">
      {/* Hero */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        <section className="rounded-2xl bg-gradient-to-br from-[#DCEBFF] to-[#EAF7EF] p-7">
          <p className="text-2xl text-[#101828]">
            Welcome to <br />
            <span className="font-['Fraunces',serif] text-4xl font-semibold text-[#2F5FD0]">
              Solderhub Fund
            </span>
          </p>
          <p className="mt-3 text-[#101828]/70">Secure your today, build your tomorrow.</p>
          <p className="mt-2 text-sm text-[#101828]/50">
            Group savings &nbsp;|&nbsp; 1% monthly interest on loans &nbsp;|&nbsp; 11 members
          </p>
        </section>
        <section className="flex flex-col justify-center rounded-2xl bg-[#EAF0FF] p-6">
          <p className="font-['Fraunces',serif] text-lg italic text-[#101828]/80">
            &ldquo;A better financial future is possible when we plan together.&rdquo;
          </p>
          <p className="mt-3 text-sm font-medium text-[#101828]/60">— Solderhub Fund</p>
        </section>
      </div>

      {/* Stat cards */}
      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        {statCards.map((c) => (
          <div key={c.label} className="rounded-2xl bg-white p-4 shadow-sm">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F5F6FA] text-base">
              {c.icon}
            </span>
            <p className="mt-3 text-xs text-[#101828]/50">{c.label}</p>
            <p className="mt-0.5 font-['Fraunces',serif] text-xl font-medium text-[#101828]">
              {formatINR(c.value)}
            </p>
          </div>
        ))}
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F5F6FA] text-base">
            🛡️
          </span>
          <p className="mt-3 text-xs text-[#101828]/50">Maximum Credit</p>
          <p className="mt-0.5 font-['Fraunces',serif] text-xl font-medium text-[#101828]">
            {formatINR(summary.max_credit_per_member)}
          </p>
          <p className="text-[11px] text-[#101828]/40">Per member</p>
        </div>
      </div>

      {/* Charts + quick actions */}
      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr_280px]">
        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="font-['Fraunces',serif] text-base font-medium text-[#101828]">
            Fund Growth Trend
          </h2>
          <FundGrowthChart data={trend} />
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-['Fraunces',serif] text-base font-medium text-[#101828]">
            Fund Allocation
          </h2>
          <FundAllocationChart
            loans={summary.total_loan_taken}
            fd={summary.fd_balance}
            save={summary.save_others}
            available={availableBalance}
          />
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="mb-3 font-['Fraunces',serif] text-base font-medium text-[#101828]">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/fund/members"
              className="rounded-xl bg-[#EAF7EF] p-3 text-left text-sm font-medium text-[#2F7A5C]"
            >
              + Add Member
            </Link>
            <Link
              href="/fund/members"
              className="rounded-xl bg-[#EAF0FF] p-3 text-left text-sm font-medium text-[#2F5FD0]"
            >
              Record Contribution
            </Link>
            <Link
              href="/fund/members"
              className="rounded-xl bg-[#FBF0E6] p-3 text-left text-sm font-medium text-[#C98A2B]"
            >
              Issue Loan
            </Link>
            <Link
              href="/fund/reports"
              className="rounded-xl bg-[#F1EBFA] p-3 text-left text-sm font-medium text-[#7C5CBF]"
            >
              View Reports
            </Link>
          </div>
          <p className="mt-3 text-xs text-[#101828]/40">
            Contribution and loan entries are logged from each member&rsquo;s own page.
          </p>
        </section>
      </div>

      {/* Tables + activity */}
      <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <section className="rounded-2xl bg-white p-5 shadow-sm xl:col-span-1">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-['Fraunces',serif] text-base font-medium text-[#101828]">
              Member Overview
            </h2>
            <Link href="/fund/members" className="text-xs font-medium text-[#2F5FD0]">
              View All →
            </Link>
          </div>
          <p className="mb-3 text-sm text-[#101828]/50">{members.length} total members</p>
          <div className="divide-y divide-[#F0F1F5] text-sm">
            {members.slice(0, 6).map((m) => (
              <Link
                key={m.id}
                href={`/fund/${m.short_name.toLowerCase()}`}
                className="flex items-center gap-3 py-2.5"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2F5FD0]/10 text-xs font-medium text-[#2F5FD0]">
                  {m.short_name.slice(0, 2).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1 truncate font-medium text-[#101828]">
                  {m.short_name}
                </span>
                <span className="tabular-nums text-[#101828]/60">
                  {formatINR(m.total_contribution)}
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm xl:col-span-1">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-['Fraunces',serif] text-base font-medium text-[#101828]">
              Loan Details
            </h2>
            <Link href="/fund/loans" className="text-xs font-medium text-[#2F5FD0]">
              View All →
            </Link>
          </div>
          <div className="divide-y divide-[#F0F1F5] text-sm">
            {members
              .filter((m) => m.outstanding_loan > 0)
              .slice(0, 6)
              .map((m) => (
                <Link
                  key={m.id}
                  href={`/fund/${m.short_name.toLowerCase()}`}
                  className="flex items-center gap-3 py-2.5"
                >
                  <span className="min-w-0 flex-1 truncate font-medium text-[#101828]">
                    {m.short_name}
                  </span>
                  <span className="tabular-nums text-[#101828]/60">
                    {formatINR(m.outstanding_loan)}
                  </span>
                  <span className="rounded-full bg-[#FBEFE6] px-2 py-0.5 text-xs font-medium text-[#C98A2B]">
                    Active
                  </span>
                </Link>
              ))}
            {members.every((m) => m.outstanding_loan === 0) && (
              <p className="py-2.5 text-[#101828]/40">No outstanding loans.</p>
            )}
          </div>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm xl:col-span-1">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-['Fraunces',serif] text-base font-medium text-[#101828]">
              Recent Activity
            </h2>
          </div>
          <div className="space-y-3 text-sm">
            {(activity ?? []).map((a: any) => (
              <div key={a.id} className="flex items-start gap-3">
                <span
                  className="mt-0.5 h-2 w-2 shrink-0 rounded-full"
                  style={{
                    backgroundColor:
                      a.activity_type === "loan_disbursed" ? "#C98A2B" : "#2F7A5C",
                  }}
                />
                <div className="min-w-0">
                  <p className="text-[#101828]">
                    {ACTIVITY_LABEL[a.activity_type] ?? a.activity_type}{" "}
                    {a.members?.short_name ?? ""}
                  </p>
                  <p className="text-xs text-[#101828]/45">
                    {a.amount ? `${formatINR(Number(a.amount))} · ` : ""}
                    {new Date(a.occurred_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                </div>
              </div>
            ))}
            {(!activity || activity.length === 0) && (
              <p className="text-[#101828]/40">
                No activity logged yet — new entries from member pages will appear here.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
