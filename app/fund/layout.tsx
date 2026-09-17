import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";
import { SidebarNav } from "@/components/sidebar-nav";
import { SignOutButton } from "@/components/sign-out-button";

export default async function FundLayout({ children }: { children: ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let displayName = user?.email ?? "Signed in";
  let role = "Member";
  if (user) {
    const { data: member } = await supabase
      .from("members")
      .select("short_name, is_admin")
      .eq("user_id", user.id)
      .maybeSingle();
    if (member) {
      displayName = member.short_name;
      role = member.is_admin ? "Fund admin" : "Member";
    }
  }
  const initial = displayName.trim()[0]?.toUpperCase() ?? "?";

  return (
    <div className="flex min-h-screen bg-[#F5F6FA] font-['IBM_Plex_Sans',sans-serif]">
      {/* Sidebar */}
      <aside className="flex w-64 shrink-0 flex-col bg-[#0B1C3F] px-5 py-6 text-white">
        <div className="mb-8 flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2F7A5C] text-lg">
            🌱
          </span>
          <div>
            <p className="font-['Fraunces',serif] text-lg leading-tight">Solderhub Fund</p>
            <p className="text-[11px] text-white/45">Together for a better tomorrow</p>
          </div>
        </div>

        <SidebarNav />

        <div className="mt-auto pt-6 text-xs text-white/35">
          Small steps today build a secure tomorrow
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="flex items-center gap-4 border-b border-black/5 bg-white px-6 py-3.5">
          <div className="flex flex-1 items-center gap-2 rounded-lg bg-[#F5F6FA] px-3 py-2 text-sm text-[#101828]/45">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
            </svg>
            <span>Search member, loan, or transaction…</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2F5FD0] text-sm font-medium text-white">
              {initial}
            </span>
            <div className="text-sm leading-tight">
              <p className="font-medium text-[#101828]">{displayName}</p>
              <p className="text-xs text-[#101828]/45">{role}</p>
            </div>
          </div>
          <SignOutButton />
        </header>

        <main className="flex-1 overflow-y-auto px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
