"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { FundTransactionType } from "@/lib/fund/types";

const TYPES: { value: FundTransactionType; label: string }[] = [
  { value: "contribution", label: "Contribution" },
  { value: "loan", label: "Loan" },
  { value: "repayment", label: "Repayment" },
  { value: "interest", label: "Interest" },
];

export function NewTransactionForm({ memberId }: { memberId: string }) {
  const router = useRouter();
  const [type, setType] = useState<FundTransactionType>("contribution");
  const [amount, setAmount] = useState("");
  const [txnDate, setTxnDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [period, setPeriod] = useState(() => new Date().toISOString().slice(0, 7));
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const needsPeriod = type === "contribution" || type === "interest";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/fund/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          member_id: memberId,
          type,
          amount: Number(amount),
          txn_date: txnDate,
          period: needsPeriod ? `${period}-01` : null,
          note: note || null,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to save entry");
      }
      setAmount("");
      setNote("");
      router.refresh();
    } catch (err: any) {
      setError(err.message ?? "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-[#E4E0D6] bg-white/70 p-4"
    >
      {/* Segmented pill control instead of a <select> */}
      <div className="flex gap-1 rounded-full bg-[#F0EDE5] p-1">
        {TYPES.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setType(t.value)}
            className={`flex-1 rounded-full px-2 py-1.5 text-sm transition-colors ${
              type === t.value
                ? "bg-[#101828] text-[#F6F4EF]"
                : "text-[#101828]/60 hover:text-[#101828]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Large amount entry, banking-app style */}
      <div className="mt-4 flex items-baseline gap-2 border-b border-[#E4E0D6] pb-2">
        <span className="font-fraunces text-2xl text-[#101828]/40">₹</span>
        <input
          type="number"
          min="0"
          step="1"
          required
          placeholder="0"
          className="w-full bg-transparent font-fraunces text-3xl text-[#101828] outline-none placeholder:text-[#101828]/25"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <label className="text-[#101828]/60">
          Date
          <input
            type="date"
            required
            className="mt-1 w-full rounded-lg border border-[#E4E0D6] bg-white px-2.5 py-1.5 text-[#101828]"
            value={txnDate}
            onChange={(e) => setTxnDate(e.target.value)}
          />
        </label>

        {needsPeriod && (
          <label className="text-[#101828]/60">
            Month
            <input
              type="month"
              required
              className="mt-1 w-full rounded-lg border border-[#E4E0D6] bg-white px-2.5 py-1.5 text-[#101828]"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            />
          </label>
        )}

        <label className={`text-[#101828]/60 ${needsPeriod ? "col-span-2" : ""}`}>
          Note (optional)
          <input
            type="text"
            className="mt-1 w-full rounded-lg border border-[#E4E0D6] bg-white px-2.5 py-1.5 text-[#101828]"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. next month payment"
          />
        </label>
      </div>

      {error && <p className="mt-3 text-sm text-[#B4552E]">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="mt-4 w-full rounded-full bg-[#C98A2B] py-2.5 text-sm font-medium text-[#101828] transition-opacity disabled:opacity-50"
      >
        {submitting ? "Saving…" : "Add entry"}
      </button>
    </form>
  );
}
