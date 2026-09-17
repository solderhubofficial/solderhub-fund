"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import type { LoanOutstandingPoint } from "@/lib/fund/types";

const INK = "#0B1C3F";
const BLUE = "#2F5FD0";
const GOLD = "#C98A2B";
const GREEN = "#2F7A5C";
const VIOLET = "#7C5CBF";

export function FundGrowthChart({ data }: { data: LoanOutstandingPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#101828aa" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#101828aa" }} axisLine={false} tickLine={false} />
        <Tooltip
          formatter={(v: number) => v.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })}
          contentStyle={{ borderRadius: 10, border: "1px solid #E4E0D6", fontSize: 12 }}
        />
        <Line
          type="monotone"
          dataKey="loanOutstanding"
          name="Loan outstanding"
          stroke={GOLD}
          strokeWidth={2.5}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function FundAllocationChart({
  loans,
  fd,
  save,
  available,
}: {
  loans: number;
  fd: number;
  save: number;
  available: number;
}) {
  const data = [
    { name: "Loans out", value: loans, color: GOLD },
    { name: "FD / Fixed Deposit", value: fd, color: GREEN },
    { name: "Set aside", value: save, color: VIOLET },
    { name: "Available balance", value: available, color: BLUE },
  ].filter((d) => d.value > 0);

  const total = data.reduce((a, d) => a + d.value, 0);

  return (
    <div className="flex items-center gap-6">
      <div className="relative h-[160px] w-[160px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" innerRadius={52} outerRadius={78} paddingAngle={2} stroke="none">
              {data.map((d) => (
                <Cell key={d.name} fill={d.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-xs text-[#101828]/50">Total</p>
          <p className="font-['Fraunces',serif] text-base font-medium text-[#101828]">
            {total.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })}
          </p>
        </div>
      </div>
      <ul className="flex-1 space-y-2 text-sm">
        {data.map((d) => (
          <li key={d.name} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-[#101828]/70">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
              {d.name}
            </span>
            <span className="font-medium text-[#101828]">{((d.value / total) * 100).toFixed(1)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
