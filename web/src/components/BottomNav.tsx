"use client";

import { usePathname, useRouter } from "next/navigation";

const TABS = [
  { path: "/", label: "트렌드", icon: "🔥" },
  { path: "/recommend", label: "추천", icon: "⭐" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav style={{
      position: "fixed", bottom: 0, left: 0, right: 0,
      height: 60, background: "#fff",
      borderTop: "1px solid #e5e7eb",
      display: "flex", zIndex: 100,
      boxShadow: "0 -2px 12px rgba(0,0,0,0.06)",
    }}>
      {TABS.map(tab => {
        const active = pathname === tab.path;
        return (
          <button
            key={tab.path}
            onClick={() => router.push(tab.path)}
            style={{
              flex: 1, border: "none", background: "none",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              gap: 2, cursor: "pointer",
              color: active ? "#6366f1" : "#9ca3af",
              fontWeight: active ? 700 : 400,
            }}
          >
            <span style={{ fontSize: 20 }}>{tab.icon}</span>
            <span style={{ fontSize: 11 }}>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
