import { createClient } from "@/lib/supabase/server";
import { formatINR, formatMonth } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ContributionsPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from("monthly_contributions")
    .select("id, month, contribution, interest_share, note, members(short_name)")
    .order("month", { ascending: false })
    .limit(100);

  const rows = (data ?? []) as any[];

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-['Fraunces',serif] text-2xl text-[#101828]">Contributions</h1>
      <p className="mt-1 text-sm text-[#101828]/50">
        Most recent 100 monthly entries across all members
      </p>

      <div className="mt-5 overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-[#F0F1F5] text-left text-xs text-[#101828]/45">
              <th className="px-5 py-3 font-medium">Member</th>
              <th className="px-5 py-3 font-medium">Month</th>
              <th className="px-5 py-3 font-medium">Contribution</th>
              <th className="px-5 py-3 font-medium">Interest</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0F1F5]">
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="px-5 py-3 font-medium text-[#101828]">
                  {r.members?.short_name}
                </td>
                <td className="px-5 py-3 text-[#101828]/70">{formatMonth(r.month)}</td>
                <td className="px-5 py-3 tabular-nums text-[#101828]">
                  {formatINR(Number(r.contribution))}
                </td>
                <td className="px-5 py-3 tabular-nums text-[#101828]/70">
                  {formatINR(Number(r.interest_share))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-[#101828]/40">No entries yet.</p>
        )}
      </div>
    </div>
  );
}
