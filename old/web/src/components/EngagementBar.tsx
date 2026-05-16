"use client";

import { formatNumber } from "@/lib/mock-data";

interface Props {
  label: string;
  value: number;
  max: number;
  color: string;
}

export default function EngagementBar({ label, value, max, color }: Props) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#8a8f98", marginBottom: 3 }}>
        <span>{label}</span>
        <span style={{ color: "#c0c4cc" }}>{formatNumber(value)}</span>
      </div>
      <div style={{ height: 4, background: "#1e2028", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: `linear-gradient(90deg, ${color}, ${color}88)`, borderRadius: 2, transition: "width 0.6s ease" }} />
      </div>
    </div>
  );
}
