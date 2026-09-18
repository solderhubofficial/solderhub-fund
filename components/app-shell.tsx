"use client";

import { useState, type ReactNode } from "react";
import { SidebarNav } from "@/components/sidebar-nav";
import { SignOutButton } from "@/components/sign-out-button";

function Logo() {
  return (
    <div className="mb-8 flex items-center gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2F7A5C] text-lg">
        🌱
      </span>
      <div>
        <p className="font-['Fraunces',serif] text-lg leading-tight">Solderhub Fund</p>
        <p className="text-[11px] text-white/45">Together for a better tomorrow</p>
      </div>
    </div>
  );
}

export function AppShell({
  displayName,
  roleLabel,
  children,
}: {
  displayName: string;
  roleLabel: string;
  children: ReactNode;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const initial = displayName.trim()[0]?.toUpperCase() ?? "?";

  return (
    <div className="flex min-h-screen bg-[#F5F6FA] font-['IBM_Plex_Sans',sans-serif]">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col bg-[#0B1C3F] px-5 py-6 text-white lg:flex">
        <Logo />
        <SidebarNav />
        <div className="mt-auto pt-6 text-xs text-white/35">
          Small steps today build a secure tomorrow
        </div>
      </aside>

      {/* Mobile drawer + backdrop */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[80vw] flex-col bg-[#0B1C3F] px-5 py-6 text-white shadow-xl">
            <div className="mb-2 flex items-center justify-between">
              <Logo />
              <button
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
                className="rounded-full p-1.5 text-white/60 hover:bg-white/10 hover:text-white"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <SidebarNav onNavigate={() => setDrawerOpen(false)} />
            <div className="mt-auto pt-6 text-xs text-white/35">
              Small steps today build a secure tomorrow
            </div>
          </aside>
        </div>
      )}

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="flex items-center gap-3 border-b border-black/5 bg-white px-4 py-3 sm:gap-4 sm:px-6 sm:py-3.5">
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            className="shrink-0 rounded-lg p-2 text-[#101828]/60 hover:bg-[#F5F6FA] lg:hidden"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
            </svg>
          </button>

          <div className="hidden flex-1 items-center gap-2 rounded-lg bg-[#F5F6FA] px-3 py-2 text-sm text-[#101828]/45 sm:flex">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
            </svg>
            <span>Search member, loan, or transaction…</span>
          </div>

          <div className="ml-auto flex min-w-0 items-center gap-2 sm:ml-0">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2F5FD0] text-sm font-medium text-white">
              {initial}
            </span>
            <div className="hidden min-w-0 text-sm leading-tight sm:block">
              <p className="truncate font-medium text-[#101828]">{displayName}</p>
              <p className="truncate text-xs text-[#101828]/45">{roleLabel}</p>
            </div>
          </div>
          <SignOutButton />
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">{children}</main>
      </div>
    </div>
  );
}
