import { getFundSummary, getFdDeposits } from "@/lib/fund/queries";
import { formatINR, formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const [summary, deposits] = await Promise.all([getFundSummary(), getFdDeposits()]);

  const rows: [string, number][] = [
    ["Fund gross value (contribution + interest)", summary.fund_gross_value],
    ["Total contribution", summary.total_contribution],
    ["Total interest earned", summary.total_interest],
    ["Total loan outstanding", summary.total_loan_taken],
    ["Fixed deposits", summary.fd_balance],
    ["Set aside / savings", summary.save_others],
    ["Available balance", summary.fund_balance],
  ];

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-['Fraunces',serif] text-2xl text-[#101828]">Reports</h1>
      <p className="mt-1 text-sm text-[#101828]/50">Fund-wide summary</p>

      <div className="mt-5 divide-y divide-[#F0F1F5] rounded-2xl bg-white shadow-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between px-5 py-3.5 text-sm">
            <span className="text-[#101828]/70">{label}</span>
            <span className="font-medium tabular-nums text-[#101828]">{formatINR(value)}</span>
          </div>
        ))}
      </div>

      <h2 className="mt-8 mb-3 font-['Fraunces',serif] text-lg text-[#101828]">
        Fixed deposits
      </h2>
      <div className="divide-y divide-[#F0F1F5] rounded-2xl bg-white shadow-sm">
        {deposits.map((d) => (
          <div key={d.id} className="flex items-center justify-between px-5 py-3.5 text-sm">
            <span className="text-[#101828]/70">
              Opened {formatDate(d.opened_on)}
              {d.note ? ` · ${d.note}` : ""}
            </span>
            <span className="font-medium tabular-nums text-[#101828]">
              {formatINR(Number(d.amount))}
            </span>
          </div>
        ))}
        {deposits.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-[#101828]/40">No FDs on record.</p>
        )}
      </div>
    </div>
  );
}
