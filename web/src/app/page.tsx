"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { PLATFORMS, CATEGORIES, TrendItem, formatNumber } from "@/lib/mock-data";
import { loadPersona } from "@/lib/persona";
import TrendCard from "@/components/TrendCard";
import DetailModal from "@/components/DetailModal";
import BottomNav from "@/components/BottomNav";

type SortKey = "growth" | "views" | "engagement";

export default function TrendPulse() {
  const router = useRouter();
  const [activePlatform, setActivePlatform] = useState<"all" | "youtube" | "tiktok" | "instagram">("all");
  const [activeCategory, setActiveCategory] = useState("전체");
  const [sortBy, setSortBy] = useState<SortKey>("growth");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<TrendItem | null>(null);
  const [trends, setTrends] = useState<TrendItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const catScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loadPersona()) {
      router.push("/onboarding");
      return;
    }
    fetch("/api/trends?platform=all")
      .then((r) => r.json())
      .then(({ data }: { data: TrendItem[] }) => {
        setTrends(data);
        setIsLoaded(true);
      });
  }, [router]);

  const filtered = trends
    .filter(item => activePlatform === "all" || item.platform === activePlatform)
    .filter(item => activeCategory === "전체" || item.category === activeCategory)
    .filter(item => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return item.title.toLowerCase().includes(q) || item.creator.toLowerCase().includes(q) || item.tags.some(t => t.toLowerCase().includes(q));
    })
    .sort((a, b) => {
      if (sortBy === "growth") return b.growth - a.growth;
      if (sortBy === "views") return b.views - a.views;
      return ((b.likes + b.comments + b.shares) / b.views) - ((a.likes + a.comments + a.shares) / a.views);
    });

  const totalViews = filtered.reduce((sum, i) => sum + i.views, 0);
  const avgGrowth = filtered.length ? Math.round(filtered.reduce((sum, i) => sum + i.growth, 0) / filtered.length) : 0;
  const topCategory = (() => {
    const counts: Record<string, number> = {};
    filtered.forEach(i => { counts[i.category] = (counts[i.category] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";
  })();

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #0d0e12 0%, #111218 50%, #0d0e12 100%)", color: "#e8eaed", paddingBottom: 80 }}>
      {/* 헤더 */}
      <div style={{ padding: "28px 24px 0", opacity: isLoaded ? 1 : 0, transition: "opacity 0.6s ease" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#FF4500", animation: "pulse 2s ease-in-out infinite" }} />
          <span style={{ fontSize: 11, color: "#FF4500", fontWeight: 600, letterSpacing: 2, textTransform: "uppercase" }}>LIVE TRENDING</span>
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 900, margin: "8px 0 6px", background: "linear-gradient(135deg, #e8eaed 0%, #8a8f98 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: -0.5 }}>TrendPulse</h1>
        <p style={{ fontSize: 13, color: "#5a5f6a", margin: 0, lineHeight: 1.5 }}>숏폼 플랫폼 트렌드를 한눈에 · 크리에이터를 위한 인사이트</p>
      </div>

      {/* 검색 */}
      <div style={{ padding: "20px 24px 0" }}>
        <div style={{ position: "relative", background: "#16171d", border: "1px solid #2a2b35", borderRadius: 12 }}>
          <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16, color: "#4a4f5a" }}>🔍</span>
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="제목, 크리에이터, 해시태그 검색..."
            style={{ width: "100%", padding: "13px 14px 13px 42px", background: "transparent", border: "none", outline: "none", color: "#e8eaed", fontSize: 14 }}
          />
        </div>
      </div>

      {/* 플랫폼 필터 */}
      <div style={{ padding: "16px 24px 0", display: "flex", gap: 8, overflowX: "auto" }}>
        {Object.entries(PLATFORMS).map(([key, p]) => (
          <button
            key={key}
            onClick={() => setActivePlatform(key as typeof activePlatform)}
            style={{ padding: "8px 14px", borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", flexShrink: 0, transition: "all 0.2s ease", background: activePlatform === key ? `${p.color}20` : "#16171d", color: activePlatform === key ? p.color : "#6a6f7a", border: activePlatform === key ? `1px solid ${p.color}40` : "1px solid #2a2b35" }}
          >
            {p.icon} {p.label}
          </button>
        ))}
      </div>

      {/* 카테고리 필터 */}
      <div ref={catScrollRef} style={{ padding: "12px 24px 0", display: "flex", gap: 6, overflowX: "auto" }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{ padding: "5px 12px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 500, whiteSpace: "nowrap", flexShrink: 0, background: activeCategory === cat ? "#e8eaed" : "transparent", color: activeCategory === cat ? "#0d0e12" : "#5a5f6a", transition: "all 0.2s" }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 정렬 */}
      <div style={{ padding: "16px 24px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 12, color: "#5a5f6a" }}>{filtered.length}개 트렌딩 콘텐츠</span>
        <div style={{ display: "flex", gap: 4 }}>
          {([{ key: "growth", label: "성장률순" }, { key: "views", label: "조회수순" }, { key: "engagement", label: "참여율순" }] as const).map(s => (
            <button key={s.key} onClick={() => setSortBy(s.key)} style={{ padding: "4px 10px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 500, background: sortBy === s.key ? "#2a2b35" : "transparent", color: sortBy === s.key ? "#e8eaed" : "#5a5f6a" }}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* 요약 통계 */}
      <div style={{ padding: "16px 24px 0", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        {[
          { label: "총 조회수", value: formatNumber(totalViews), color: "#FF4500" },
          { label: "평균 성장률", value: `${avgGrowth}%`, color: "#4CAF50" },
          { label: "인기 카테고리", value: topCategory, color: "#4488FF" },
        ].map((s, i) => (
          <div key={i} style={{ textAlign: "center", padding: "14px 8px", borderRadius: 12, background: "linear-gradient(135deg, #16171d, #1a1b23)", border: "1px solid #2a2b35" }}>
            <div style={{ fontSize: 10, color: "#5a5f6a", marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* 카드 그리드 */}
      <div style={{ padding: "20px 24px 40px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }}>
        {filtered.map((item, i) => (
          <TrendCard key={`${item.platform}-${item.id}`} item={item} index={i} onClick={setSelectedItem} />
        ))}
        {filtered.length === 0 && (
          <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "60px 20px", color: "#4a4f5a" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <div style={{ fontSize: 14 }}>검색 결과가 없습니다</div>
          </div>
        )}
      </div>

      {selectedItem && <DetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />}
      <BottomNav />
    </div>
  );
}
