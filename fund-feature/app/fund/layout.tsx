import type { ReactNode } from "react";

// Add Fraunces + IBM Plex Sans in your root layout's <head>:
// <link rel="preconnect" href="https://fonts.googleapis.com" />
// <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=IBM+Plex+Sans:wght@400;500;600&display=swap" rel="stylesheet" />

const NAV = [
  { label: "Dashboard", href: "/fund", icon: "home" },
  { label: "Members", href: "/fund/members", icon: "users" },
  { label: "Contributions", href: "/fund/contributions", icon: "wallet" },
  { label: "Loans", href: "/fund/loans", icon: "file" },
  { label: "Reports", href: "/fund/reports", icon: "chart" },
  { label: "Settings", href: "/fund/settings", icon: "gear" },
];

function NavIcon({ name }: { name: string }) {
  const paths: Record<string, string> = {
    home: "M3 11l9-8 9 8M5 10v10h14V10",
    users: "M16 11a4 4 0 100-8 4 4 0 000 8zM8 11a4 4 0 100-8 4 4 0 000 8zM2 21v-2a4 4 0 014-4h1M14 21v-2a4 4 0 014-4h1a4 4 0 014 4v2",
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

export default function FundLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#F5F6FA] font-['IBM_Plex_Sans',sans-serif]">
      {/* Sidebar */}
      <aside className="flex w-64 shrink-0 flex-col bg-[#0B1C3F] px-5 py-6 text-white">
        <div className="mb-8 flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2F7A5C] text-lg">🌱</span>
          <div>
            <p className="font-['Fraunces',serif] text-lg leading-tight">Happy Future</p>
            <p className="text-[11px] text-white/45">Together for a better tomorrow</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          {NAV.map((item, i) => (
            <a
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                i === 0 ? "bg-[#2F5FD0] text-white" : "text-white/55 hover:bg-white/5 hover:text-white"
              }`}
            >
              <NavIcon name={item.icon} />
              {item.label}
            </a>
          ))}
        </nav>

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
              <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" strokeLinecap="round" />
            </svg>
            <span>Search member, loan, or transaction…</span>
          </div>
          <button className="relative rounded-full p-2 hover:bg-[#F5F6FA]" aria-label="Notifications">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 8a6 6 0 1112 0c0 7 3 9 3 9H3s3-2 3-9" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M13.7 21a2 2 0 01-3.4 0" strokeLinecap="round" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2F5FD0] text-sm font-medium text-white">
              A
            </span>
            {/* Wire this to your real session user */}
            <div className="text-sm leading-tight">
              <p className="font-medium text-[#101828]">Admin</p>
              <p className="text-xs text-[#101828]/45">Fund manager</p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
