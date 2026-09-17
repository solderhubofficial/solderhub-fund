import Link from "next/link";
import { getFundSummary, getLoanOutstandingTrend, getRecentActivity } from "@/lib/fund/queries";
import { FundGrowthChart, FundAllocationChart } from "./charts";

function inr(n: number) {
  return n.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
}

const TYPE_LABEL: Record<string, string> = {
  loan: "Loan disbursed to",
  repayment: "Repayment received from",
  contribution: "Contribution received from",
  interest: "Interest posted for",
};

export const dynamic = "force-dynamic";

export default async function FundDashboardPage() {
  const [summary, trend, activity] = await Promise.all([
    getFundSummary(),
    getLoanOutstandingTrend(),
    getRecentActivity(6),
  ]);

  const availableBalance = Math.max(summary.fundBalance, 0);

  const statCards = [
    { label: "Fund Gross Value", value: summary.fundGrossValue, icon: "🗄️" },
    { label: "Total Contribution", value: summary.totalContribution, icon: "👛" },
    { label: "Total Loan Taken", value: summary.totalLoanOutstanding, icon: "📄" },
    { label: "Total Interest", value: summary.totalInterest, icon: "％" },
    { label: "Fund Balance", value: summary.fundBalance, icon: "₹" },
    { label: "FD / Savings", value: summary.fdAmount + summary.saveAmount, icon: "🐖" },
  ];

  return (
    <div className="mx-auto max-w-[1400px]">
      {/* Hero */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        <section className="rounded-2xl bg-gradient-to-br from-[#DCEBFF] to-[#EAF7EF] p-7">
          <p className="text-2xl text-[#101828]">
            Welcome to <br />
            <span className="font-['Fraunces',serif] text-4xl font-semibold text-[#2F5FD0]">Happy Future</span>
          </p>
          <p className="mt-3 text-[#101828]/70">Secure your today, build your tomorrow.</p>
          <p className="mt-2 text-sm text-[#101828]/50">
            Group savings &nbsp;|&nbsp; Low interest loans &nbsp;|&nbsp; Financial growth
          </p>
        </section>
        <section className="flex flex-col justify-center rounded-2xl bg-[#EAF0FF] p-6">
          <p className="font-['Fraunces',serif] text-lg italic text-[#101828]/80">
            "A better financial future is possible when we plan together."
          </p>
          <p className="mt-3 text-sm font-medium text-[#101828]/60">— Happy Future</p>
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
            <p className="mt-0.5 font-['Fraunces',serif] text-xl font-medium text-[#101828]">{inr(c.value)}</p>
          </div>
        ))}
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F5F6FA] text-base">🛡️</span>
          <p className="mt-3 text-xs text-[#101828]/50">Maximum Credit</p>
          <p className="mt-0.5 font-['Fraunces',serif] text-xl font-medium text-[#101828]">
            {inr(summary.maxCreditPerMember)}
          </p>
          <p className="text-[11px] text-[#101828]/40">Per member</p>
        </div>
      </div>

      {/* Charts + quick actions */}
      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr_280px]">
        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="font-['Fraunces',serif] text-base font-medium text-[#101828]">Loan Outstanding Trend</h2>
          <FundGrowthChart data={trend} />
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-['Fraunces',serif] text-base font-medium text-[#101828]">Fund Allocation</h2>
          <FundAllocationChart
            loans={summary.totalLoanOutstanding}
            fd={summary.fdAmount}
            save={summary.saveAmount}
            available={availableBalance}
          />
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="mb-3 font-['Fraunces',serif] text-base font-medium text-[#101828]">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-2">
            <button className="rounded-xl bg-[#EAF7EF] p-3 text-left text-sm font-medium text-[#2F7A5C]">
              + Add Member
            </button>
            <button className="rounded-xl bg-[#EAF0FF] p-3 text-left text-sm font-medium text-[#2F5FD0]">
              Record Contribution
            </button>
            <button className="rounded-xl bg-[#FBF0E6] p-3 text-left text-sm font-medium text-[#C98A2B]">
              Issue Loan
            </button>
            <button className="rounded-xl bg-[#F1EBFA] p-3 text-left text-sm font-medium text-[#7C5CBF]">
              View Reports
            </button>
          </div>
        </section>
      </div>

      {/* Tables + activity */}
      <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <section className="rounded-2xl bg-white p-5 shadow-sm xl:col-span-1">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-['Fraunces',serif] text-base font-medium text-[#101828]">Member Overview</h2>
            <Link href="/fund/members" className="text-xs font-medium text-[#2F5FD0]">
              View All →
            </Link>
          </div>
          <p className="mb-3 text-sm text-[#101828]/50">{summary.memberCount} total members</p>
          <div className="divide-y divide-[#F0F1F5] text-sm">
            {summary.members.slice(0, 6).map((m) => (
              <Link
                key={m.member.id}
                href={`/fund/${m.member.slug}`}
                className="flex items-center gap-3 py-2.5"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2F5FD0]/10 text-xs font-medium text-[#2F5FD0]">
                  {m.member.name.slice(0, 2).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1 truncate font-medium text-[#101828]">{m.member.name}</span>
                <span className="tabular-nums text-[#101828]/60">{inr(m.totalContribution)}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm xl:col-span-1">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-['Fraunces',serif] text-base font-medium text-[#101828]">Loan Details</h2>
            <Link href="/fund/loans" className="text-xs font-medium text-[#2F5FD0]">
              View All →
            </Link>
          </div>
          <div className="divide-y divide-[#F0F1F5] text-sm">
            {summary.members
              .filter((m) => m.loanOutstanding > 0)
              .slice(0, 6)
              .map((m) => (
                <div key={m.member.id} className="flex items-center gap-3 py-2.5">
                  <span className="min-w-0 flex-1 truncate font-medium text-[#101828]">{m.member.name}</span>
                  <span className="tabular-nums text-[#101828]/60">{inr(m.loanOutstanding)}</span>
                  <span className="rounded-full bg-[#FBEFE6] px-2 py-0.5 text-xs font-medium text-[#C98A2B]">
                    Active
                  </span>
                </div>
              ))}
          </div>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm xl:col-span-1">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-['Fraunces',serif] text-base font-medium text-[#101828]">Recent Activity</h2>
          </div>
          <div className="space-y-3 text-sm">
            {activity.map((a) => (
              <div key={a.id} className="flex items-start gap-3">
                <span
                  className="mt-0.5 h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: a.type === "loan" ? "#C98A2B" : "#2F7A5C" }}
                />
                <div className="min-w-0">
                  <p className="text-[#101828]">
                    {TYPE_LABEL[a.type] ?? a.type} {a.memberName}
                  </p>
                  <p className="text-xs text-[#101828]/45">
                    {inr(a.amount)} · {new Date(a.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </p>
                </div>
              </div>
            ))}
            {activity.length === 0 && <p className="text-[#101828]/40">No activity yet.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
