"use client";

import { TrendItem, PLATFORMS, formatNumber } from "@/lib/mock-data";
import EngagementBar from "./EngagementBar";

interface Props {
  item: TrendItem;
  onClose: () => void;
}

export default function DetailModal({ item, onClose }: Props) {
  const platformColor = PLATFORMS[item.platform]?.color || "#fff";
  const engagementRate = ((item.likes + item.comments + item.shares) / item.views * 100).toFixed(1);
  const maxStat = Math.max(item.likes, item.comments, item.shares);

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: "linear-gradient(160deg, #16171d 0%, #1a1b23 100%)", border: `1px solid ${platformColor}33`, borderRadius: 20, padding: 28, maxWidth: 480, width: "100%", maxHeight: "85vh", overflowY: "auto", boxShadow: `0 24px 80px ${platformColor}20` }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ background: `${platformColor}20`, color: platformColor, fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 6 }}>
              {PLATFORMS[item.platform]?.icon} {PLATFORMS[item.platform]?.label}
            </span>
            {item.videoUrl && (
              <a
                href={item.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 11, color: platformColor, background: `${platformColor}15`, border: `1px solid ${platformColor}30`, padding: "4px 10px", borderRadius: 6, textDecoration: "none", fontWeight: 600 }}
              >
                ▶ 영상 보기
              </a>
            )}
          </div>
          <button onClick={onClose} style={{ background: "#2a2b35", border: "none", color: "#8a8f98", fontSize: 18, width: 32, height: 32, borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        </div>
        <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
          <div style={{ width: 72, height: 72, borderRadius: 16, background: `linear-gradient(135deg, ${platformColor}30, ${platformColor}08)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, flexShrink: 0 }}>{item.thumbnail}</div>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: "#e8eaed", lineHeight: 1.4, margin: 0 }}>{item.title}</h2>
            <p style={{ fontSize: 13, color: "#6a6f7a", margin: "6px 0 0" }}>{item.creator} • {item.duration} • {item.trending_since}</p>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 24 }}>
          {[
            { label: "총 조회수", value: formatNumber(item.views), sub: `↑${item.growth}%` },
            { label: "참여율", value: `${engagementRate}%`, sub: "Engagement" },
            { label: "카테고리", value: item.category, sub: "Category" },
          ].map((m, i) => (
            <div key={i} style={{ textAlign: "center", padding: "14px 8px", background: "#12131a", borderRadius: 12 }}>
              <div style={{ fontSize: 10, color: "#555", marginBottom: 4 }}>{m.label}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#e8eaed" }}>{m.value}</div>
              <div style={{ fontSize: 10, color: platformColor, marginTop: 2 }}>{m.sub}</div>
            </div>
          ))}
        </div>
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 12, fontWeight: 600, color: "#8a8f98", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>참여도 분석</h3>
          <EngagementBar label="❤ 좋아요" value={item.likes} max={maxStat} color="#FF4444" />
          <EngagementBar label="💬 댓글" value={item.comments} max={maxStat} color="#4488FF" />
          <EngagementBar label="↗ 공유" value={item.shares} max={maxStat} color="#44CC88" />
        </div>
        <div>
          <h3 style={{ fontSize: 12, fontWeight: 600, color: "#8a8f98", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>해시태그</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {item.tags.map((tag, i) => (
              <span key={i} style={{ fontSize: 12, color: platformColor, background: `${platformColor}12`, padding: "4px 10px", borderRadius: 6, border: `1px solid ${platformColor}20` }}>{tag}</span>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 20, padding: 16, background: `${platformColor}08`, borderRadius: 12, border: `1px solid ${platformColor}15` }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: platformColor, marginBottom: 6 }}>💡 크리에이터 인사이트</div>
          <div style={{ fontSize: 12, color: "#8a8f98", lineHeight: 1.6 }}>
            이 콘텐츠는 <strong style={{ color: "#c0c4cc" }}>{item.category}</strong> 카테고리에서 상위 {item.growth > 300 ? "1%" : item.growth > 200 ? "5%" : "10%"} 성장률을 기록 중입니다.
            참여율 <strong style={{ color: "#c0c4cc" }}>{engagementRate}%</strong>는 평균 대비 {parseFloat(engagementRate) > 10 ? "매우 높은" : parseFloat(engagementRate) > 5 ? "높은" : "양호한"} 수준입니다.
          </div>
        </div>
      </div>
    </div>
  );
}
