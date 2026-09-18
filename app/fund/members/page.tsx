import Link from "next/link";
import { getMemberSummaries } from "@/lib/fund/queries";
import { formatINR, formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  const members = await getMemberSummaries();

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-['Fraunces',serif] text-2xl text-[#101828]">Members</h1>
      <p className="mt-1 text-sm text-[#101828]/50">{members.length} members in the fund</p>

      <div className="mt-5 divide-y divide-[#F0F1F5] rounded-2xl bg-white shadow-sm">
        {members.map((m) => (
          <Link
            key={m.id}
            href={`/fund/${m.short_name.toLowerCase()}`}
            className="flex items-center gap-4 px-5 py-4 text-sm"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2F5FD0]/10 text-xs font-medium text-[#2F5FD0]">
              {m.short_name.slice(0, 2).toUpperCase()}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium text-[#101828]">
                {m.full_name ?? m.short_name}
              </span>
              <span className="block text-xs text-[#101828]/45">
                Joined {formatDate(m.joined_on)}
              </span>
            </span>
            <span className="hidden text-right sm:block">
              <span className="block text-[#101828]/60">Contributed</span>
              <span className="block font-medium tabular-nums text-[#101828]">
                {formatINR(m.total_contribution)}
              </span>
            </span>
            <span className="hidden text-right sm:block">
              <span className="block text-[#101828]/60">Outstanding loan</span>
              <span className="block font-medium tabular-nums text-[#101828]">
                {formatINR(m.outstanding_loan)}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
