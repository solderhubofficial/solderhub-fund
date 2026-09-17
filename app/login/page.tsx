"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setSubmitting(false);
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F6FA] px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-7 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2F7A5C] text-lg">
            🌱
          </span>
          <div>
            <p className="font-['Fraunces',serif] text-lg leading-tight text-[#101828]">
              Solderhub Fund
            </p>
            <p className="text-xs text-[#101828]/50">Sign in to your account</p>
          </div>
        </div>

        {sent ? (
          <p className="text-sm text-[#101828]/70">
            Check <span className="font-medium">{email}</span> for a sign-in
            link.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="block text-sm text-[#101828]/60">
              Email
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1 w-full rounded-lg border border-[#E4E7EC] px-3 py-2 text-sm text-[#101828] outline-none focus:border-[#2F5FD0]"
              />
            </label>
            {error && <p className="text-sm text-[#B4552E]">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-[#2F5FD0] py-2.5 text-sm font-medium text-white disabled:opacity-50"
            >
              {submitting ? "Sending…" : "Send sign-in link"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
