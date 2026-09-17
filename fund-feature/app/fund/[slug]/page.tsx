import Link from "next/link";
import { notFound } from "next/navigation";
import { getMemberBySlug, getTransactionsForMember } from "@/lib/fund/queries";
import { NewTransactionForm } from "./new-transaction-form";

function formatINR(n: number, opts: { sign?: boolean } = {}) {
  const abs = Math.abs(n);
  const formatted = abs.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });
  if (!opts.sign) return formatted;
  return n < 0 ? `−${formatted}` : `+${formatted}`;
}

// Fund's perspective: a loan is money leaving the fund; everything else is
// money (or credited interest) coming back in.
const OUTFLOW = new Set(["loan"]);

function formatDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const TYPE_LABEL: Record<string, string> = {
  loan: "Loan disbursed",
  repayment: "Loan repayment",
  contribution: "Monthly contribution",
  interest: "Interest credited",
};

export const dynamic = "force-dynamic";

export default async function MemberLedgerPage({ params }: { params: { slug: string } }) {
  const member = await getMemberBySlug(params.slug);
  if (!member) notFound();

  const txns = await getTransactionsForMember(member.id);
  const loanOutstanding = txns.reduce((acc, t) => {
    if (t.type === "loan") return acc + Number(t.amount);
    if (t.type === "repayment") return acc - Number(t.amount);
    return acc;
  }, 0);

  return (
    <main className="min-h-screen bg-[#F6F4EF] pb-16">
      <div className="mx-auto max-w-xl px-5 pt-8">
        <Link href="/fund" className="text-sm text-[#101828]/50 hover:text-[#101828]">
          ← All accounts
        </Link>

        <section className="mt-4 rounded-[28px] bg-[#101828] px-6 py-7 text-[#F6F4EF]">
          <p className="text-sm text-[#F6F4EF]/60">{member.name}</p>
          <p className="mt-1 font-fraunces text-[38px] leading-none tracking-tight">
            {formatINR(loanOutstanding)}
          </p>
          <p className="mt-2 text-sm text-[#F6F4EF]/50">
            {loanOutstanding > 0 ? "Outstanding loan" : "No outstanding loan"}
          </p>
        </section>

        <h2 className="mt-8 mb-2 font-fraunces text-lg text-[#101828]">New entry</h2>
        <NewTransactionForm memberId={member.id} />

        <h2 className="mt-9 mb-2 font-fraunces text-lg text-[#101828]">History</h2>
        <div className="divide-y divide-[#E4E0D6] rounded-2xl bg-white/60">
          {txns.map((t) => {
            const out = OUTFLOW.has(t.type);
            return (
              <div key={t.id} className="flex items-center gap-3 px-4 py-3.5">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: out ? "#B4552E" : "#1F7A5C" }}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-[#101828]">
                    {TYPE_LABEL[t.type] ?? t.type}
                  </span>
                  <span className="block text-sm text-[#101828]/55">
                    {formatDate(t.txn_date)}
                    {t.note ? ` · ${t.note}` : ""}
                  </span>
                </span>
                <span
                  className="tabular-nums text-sm font-medium"
                  style={{ color: out ? "#B4552E" : "#1F7A5C" }}
                >
                  {out ? "−" : "+"}
                  {formatINR(Number(t.amount))}
                </span>
              </div>
            );
          })}
          {txns.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-[#101828]/40">No entries yet.</p>
          )}
        </div>
      </div>
    </main>
  );
}
