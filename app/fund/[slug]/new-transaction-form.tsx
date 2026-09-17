"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Kind = "monthly" | "disbursement" | "repayment";

const TYPES: { value: Kind; label: string }[] = [
  { value: "monthly", label: "Monthly entry" },
  { value: "disbursement", label: "Loan out" },
  { value: "repayment", label: "Repayment" },
];

export function NewTransactionForm({ memberId }: { memberId: string }) {
  const router = useRouter();
  const [kind, setKind] = useState<Kind>("monthly");
  const [amount, setAmount] = useState("");
  const [interest, setInterest] = useState("");
  const [txnDate, setTxnDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/fund/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          kind === "monthly"
            ? {
                kind,
                member_id: memberId,
                month: `${month}-01`,
                contribution: Number(amount || 0),
                interest_share: Number(interest || 0),
                note: note || null,
              }
            : {
                kind,
                member_id: memberId,
                amount: Number(amount),
                txn_date: txnDate,
                note: note || null,
              }
        ),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to save entry");
      }
      setAmount("");
      setInterest("");
      setNote("");
      router.refresh();
    } catch (err: any) {
      setError(err.message ?? "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-[#E4E7EC] bg-white p-4">
      <div className="flex gap-1 rounded-full bg-[#F5F6FA] p-1">
        {TYPES.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setKind(t.value)}
            className={`flex-1 rounded-full px-2 py-1.5 text-sm transition-colors ${
              kind === t.value ? "bg-[#0B1C3F] text-white" : "text-[#101828]/60 hover:text-[#101828]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {kind === "monthly" ? (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <label className="text-sm text-[#101828]/60">
            Contribution (₹)
            <input
              type="number"
              min="0"
              step="1"
              required
              className="mt-1 w-full rounded-lg border border-[#E4E7EC] px-2.5 py-1.5 text-[#101828]"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="600"
            />
          </label>
          <label className="text-sm text-[#101828]/60">
            Interest share (₹)
            <input
              type="number"
              min="0"
              step="1"
              className="mt-1 w-full rounded-lg border border-[#E4E7EC] px-2.5 py-1.5 text-[#101828]"
              value={interest}
              onChange={(e) => setInterest(e.target.value)}
              placeholder="0"
            />
          </label>
          <label className="col-span-2 text-sm text-[#101828]/60">
            Month
            <input
              type="month"
              required
              className="mt-1 w-full rounded-lg border border-[#E4E7EC] px-2.5 py-1.5 text-[#101828]"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            />
          </label>
        </div>
      ) : (
        <>
          <div className="mt-4 flex items-baseline gap-2 border-b border-[#E4E7EC] pb-2">
            <span className="font-['Fraunces',serif] text-2xl text-[#101828]/40">₹</span>
            <input
              type="number"
              min="0"
              step="1"
              required
              placeholder="0"
              className="w-full bg-transparent font-['Fraunces',serif] text-3xl text-[#101828] outline-none placeholder:text-[#101828]/25"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <label className="mt-4 block text-sm text-[#101828]/60">
            Date
            <input
              type="date"
              required
              className="mt-1 w-full rounded-lg border border-[#E4E7EC] px-2.5 py-1.5 text-[#101828]"
              value={txnDate}
              onChange={(e) => setTxnDate(e.target.value)}
            />
          </label>
        </>
      )}

      <label className="mt-3 block text-sm text-[#101828]/60">
        Note (optional)
        <input
          type="text"
          className="mt-1 w-full rounded-lg border border-[#E4E7EC] px-2.5 py-1.5 text-[#101828]"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </label>

      {error && <p className="mt-3 text-sm text-[#B4552E]">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="mt-4 w-full rounded-full bg-[#2F5FD0] py-2.5 text-sm font-medium text-white transition-opacity disabled:opacity-50"
      >
        {submitting ? "Saving…" : "Add entry"}
      </button>
    </form>
  );
}
