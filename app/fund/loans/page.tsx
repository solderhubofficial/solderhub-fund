import Link from "next/link";
import { getMemberSummaries } from "@/lib/fund/queries";
import { formatINR } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function LoansPage() {
  const members = await getMemberSummaries();
  const withLoans = members.filter((m) => m.outstanding_loan > 0 || m.total_loan_disbursed > 0);

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-['Fraunces',serif] text-2xl text-[#101828]">Loans</h1>
      <p className="mt-1 text-sm text-[#101828]/50">
        1% monthly interest on outstanding principal · no mandatory monthly repayment
      </p>

      <div className="mt-5 overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-[#F0F1F5] text-left text-xs text-[#101828]/45">
              <th className="px-5 py-3 font-medium">Member</th>
              <th className="px-5 py-3 font-medium">Disbursed (all time)</th>
              <th className="px-5 py-3 font-medium">Repaid (all time)</th>
              <th className="px-5 py-3 font-medium">Outstanding</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0F1F5]">
            {withLoans.map((m) => (
              <tr key={m.id}>
                <td className="px-5 py-3">
                  <Link
                    href={`/fund/${m.short_name.toLowerCase()}`}
                    className="font-medium text-[#101828] hover:text-[#2F5FD0]"
                  >
                    {m.short_name}
                  </Link>
                </td>
                <td className="px-5 py-3 tabular-nums text-[#101828]/70">
                  {formatINR(m.total_loan_disbursed)}
                </td>
                <td className="px-5 py-3 tabular-nums text-[#101828]/70">
                  {formatINR(m.total_loan_repaid)}
                </td>
                <td className="px-5 py-3 tabular-nums font-medium text-[#101828]">
                  {formatINR(m.outstanding_loan)}
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      m.outstanding_loan > 0
                        ? "bg-[#FBEFE6] text-[#C98A2B]"
                        : "bg-[#EAF7EF] text-[#2F7A5C]"
                    }`}
                  >
                    {m.outstanding_loan > 0 ? "Active" : "Closed"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {withLoans.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-[#101828]/40">
            No loans have been taken yet.
          </p>
        )}
      </div>
    </div>
  );
}
