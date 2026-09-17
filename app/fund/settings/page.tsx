import { getSettings } from "@/lib/fund/queries";
import { formatINR } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="font-['Fraunces',serif] text-2xl text-[#101828]">Settings</h1>
      <p className="mt-1 text-sm text-[#101828]/50">Fund-wide rules</p>

      <div className="mt-5 divide-y divide-[#F0F1F5] rounded-2xl bg-white shadow-sm">
        <div className="flex items-center justify-between px-5 py-3.5 text-sm">
          <span className="text-[#101828]/70">Monthly contribution per member</span>
          <span className="font-medium text-[#101828]">
            {formatINR(settings.monthly_contribution)}
          </span>
        </div>
        <div className="flex items-center justify-between px-5 py-3.5 text-sm">
          <span className="text-[#101828]/70">Loan interest rate</span>
          <span className="font-medium text-[#101828]">
            {settings.loan_interest_percent}% / month
          </span>
        </div>
        <div className="flex items-center justify-between px-5 py-3.5 text-sm">
          <span className="text-[#101828]/70">Maximum credit per member</span>
          <span className="font-medium text-[#101828]">
            {formatINR(settings.max_credit_per_member)}
          </span>
        </div>
      </div>
      <p className="mt-3 text-xs text-[#101828]/40">
        To change these, update the <code>fund_settings</code> table in Supabase — an editable
        form here is a natural next step once you&rsquo;re ready for it.
      </p>
    </div>
  );
}
