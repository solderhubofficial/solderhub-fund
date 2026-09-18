import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMemberByUserId } from "@/lib/fund/queries";

export const dynamic = "force-dynamic";

export default async function MyAccountPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const member = user ? await getMemberByUserId(user.id) : null;

  if (member) {
    redirect(`/fund/${member.short_name.toLowerCase()}`);
  }

  // Signed in with fund access, but this Solderhub account isn't linked to
  // one of the 11 members yet — that link is members.user_id, set by a
  // fund manager (see supabase/migration-002-unified-auth.sql).
  return (
    <div className="mx-auto max-w-sm">
      <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
        <p className="font-['Fraunces',serif] text-lg text-[#101828]">Account not linked yet</p>
        <p className="mt-2 text-sm text-[#101828]/60">
          {user?.email ?? "Your Solderhub account"} isn&rsquo;t linked to a fund member record,
          so there&rsquo;s no personal payment history to show yet. Ask a fund manager to link
          it — it&rsquo;s a one-line update on the <code>members</code> table.
        </p>
      </div>
    </div>
  );
}
