"use client";

import { TrendItem, PLATFORMS } from "@/lib/mock-data";
import { formatNumber } from "@/lib/mock-data";

interface Props {
  item: TrendItem;
  index: number;
  onClick: (item: TrendItem) => void;
}

export default function TrendCard({ item, index, onClick }: Props) {
  const platformColor = PLATFORMS[item.platform]?.color || "#fff";
  return (
    <div
      onClick={() => onClick(item)}
      style={{
        background: "linear-gradient(135deg, #16171d 0%, #1a1b23 100%)",
        border: "1px solid #2a2b35",
        borderRadius: 16,
        padding: 20,
        cursor: "pointer",
        transition: "all 0.3s ease",
        position: "relative",
        overflow: "hidden",
        animationName: "fadeSlideUp",
        animationDuration: "0.5s",
        animationTimingFunction: "ease-out",
        animationFillMode: "both",
        animationDelay: `${index * 0.05}s`,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.border = `1px solid ${platformColor}55`;
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = `0 8px 32px ${platformColor}15`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.border = "1px solid #2a2b35";
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div style={{ position: "absolute", top: 12, right: 12, background: index < 3 ? `linear-gradient(135deg, ${platformColor}, ${platformColor}aa)` : "#2a2b35", color: index < 3 ? "#fff" : "#8a8f98", fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 6 }}>
        #{index + 1}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span style={{ background: `${platformColor}20`, color: platformColor, fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 4, letterSpacing: 0.5, textTransform: "uppercase" }}>
          {PLATFORMS[item.platform]?.icon} {PLATFORMS[item.platform]?.label}
        </span>
        <span style={{ fontSize: 10, color: "#555" }}>•</span>
        <span style={{ fontSize: 10, color: "#6a6f7a" }}>{item.trending_since}</span>
      </div>
      <div style={{ display: "flex", gap: 14, marginBottom: 14 }}>
        <div style={{ width: 56, height: 56, borderRadius: 12, background: `linear-gradient(135deg, ${platformColor}25, ${platformColor}08)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>
          {item.thumbnail}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#e8eaed", lineHeight: 1.4, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
            {item.title}
          </div>
          <div style={{ fontSize: 12, color: "#6a6f7a" }}>{item.creator}</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
        {[{ label: "조회수", value: item.views, icon: "👁" }, { label: "좋아요", value: item.likes, icon: "❤" }, { label: "공유", value: item.shares, icon: "↗" }].map((s, i) => (
          <div key={i} style={{ flex: 1, textAlign: "center", padding: "8px 0", background: "#12131a", borderRadius: 8 }}>
            <div style={{ fontSize: 10, color: "#555", marginBottom: 2 }}>{s.icon} {s.label}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#e0e2e8" }}>{formatNumber(s.value)}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {item.tags.slice(0, 2).map((tag, i) => (
            <span key={i} style={{ fontSize: 10, color: "#5a5f6a", background: "#1e1f28", padding: "2px 6px", borderRadius: 4 }}>{tag}</span>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {item.videoUrl && (
            <a
              href={item.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              style={{ fontSize: 10, color: platformColor, background: `${platformColor}15`, border: `1px solid ${platformColor}30`, padding: "3px 8px", borderRadius: 6, textDecoration: "none", fontWeight: 600 }}
            >
              ▶ 보기
            </a>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 4, color: item.growth > 300 ? "#FF4444" : item.growth > 200 ? "#FF8C00" : "#4CAF50", fontSize: 12, fontWeight: 700 }}>
            <span style={{ fontSize: 14 }}>↑</span>
            {item.growth}%
            <span style={{ fontSize: 9, fontWeight: 400, color: "#555" }}>성장률</span>
          </div>
        </div>
      </div>
    </div>
  );
}
