"use client";

import { usePathname } from "next/navigation";

const NAV = [
  { label: "Dashboard", href: "/fund", icon: "home" },
  { label: "My Account", href: "/fund/account", icon: "user" },
  { label: "Members", href: "/fund/members", icon: "users" },
  { label: "Contributions", href: "/fund/contributions", icon: "wallet" },
  { label: "Loans", href: "/fund/loans", icon: "file" },
  { label: "Reports", href: "/fund/reports", icon: "chart" },
  { label: "Settings", href: "/fund/settings", icon: "gear" },
];

function NavIcon({ name }: { name: string }) {
  const paths: Record<string, string> = {
    home: "M3 11l9-8 9 8M5 10v10h14V10",
    user: "M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0",
    users:
      "M16 11a4 4 0 100-8 4 4 0 000 8zM8 11a4 4 0 100-8 4 4 0 000 8zM2 21v-2a4 4 0 014-4h1M14 21v-2a4 4 0 014-4h1a4 4 0 014 4v2",
    wallet: "M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7zM16 12h.01",
    file: "M6 2h9l5 5v15H6V2zM14 2v6h6",
    chart: "M3 20h18M6 20V10M12 20V4M18 20v-7",
    gear: "M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 12.9a1.7 1.7 0 00.34 1.87l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.7 1.7 0 00-1.87-.34 1.7 1.7 0 00-1.03 1.56V19a2 2 0 11-4 0v-.09A1.7 1.7 0 008 17.35a1.7 1.7 0 00-1.87.34l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.7 1.7 0 004.65 13a1.7 1.7 0 00-1.56-1.03H3a2 2 0 110-4h.09A1.7 1.7 0 004.65 6.6a1.7 1.7 0 00-.34-1.87l-.06-.06a2 2 0 112.83-2.83l.06.06A1.7 1.7 0 008 2.24a1.7 1.7 0 001.03-1.56V.6a2 2 0 114 0v.09A1.7 1.7 0 0016 2.24a1.7 1.7 0 001.87-.34l.06-.06a2 2 0 112.83 2.83l-.06.06A1.7 1.7 0 0019.35 6.6a1.7 1.7 0 001.56 1.03H21a2 2 0 010 4h-.09a1.7 1.7 0 00-1.56 1.03z",
  };
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={paths[name] ?? paths.home} />
    </svg>
  );
}

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => {
        const active =
          item.href === "/fund" ? pathname === "/fund" : pathname.startsWith(item.href);
        return (
          <a
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
              active ? "bg-[#2F5FD0] text-white" : "text-white/55 hover:bg-white/5 hover:text-white"
            }`}
          >
            <NavIcon name={item.icon} />
            {item.label}
          </a>
        );
      })}
    </nav>
  );
}
