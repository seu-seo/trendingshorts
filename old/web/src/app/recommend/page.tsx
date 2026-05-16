"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loadPersona } from "@/lib/persona";
import type { PersonaInput } from "@/lib/types";
import { TrendItem, formatNumber } from "@/lib/mock-data";
import BottomNav from "@/components/BottomNav";

// TODO (feature/recommend): 이 파일 전체를 3단계 파이프라인으로 교체 예정

const GOAL_LABEL: Record<PersonaInput["goal"], string> = {
  growth:    "팔로워 성장",
  monetize:  "수익화",
  brand:     "브랜드 인지도",
  community: "팬덤/커뮤니티",
};

const PLATFORM_LABEL: Record<PersonaInput["platform"], string> = {
  youtube:   "YouTube Shorts",
  tiktok:    "TikTok",
  instagram: "Instagram Reels",
  multi:     "전 플랫폼",
};

function makePrompts(item: TrendItem, goal: PersonaInput["goal"]): string[] {
  const base = `"${item.title.slice(0, 30)}"`;
  const goalLine = goal === "growth" ? "팔로워가 공유하고 싶어지는" : goal === "monetize" ? "클릭·전환을 유도하는" : "내가 즐기면서 만드는";
  return [
    `[HOOK] ${base} 트렌드를 활용해 처음 3초 안에 시선을 잡는 오프닝 만들기`,
    `[BODY] ${goalLine} 관점에서 ${item.category} 콘텐츠 구성하기`,
    `[CTA] 시청자가 댓글·저장·팔로우를 누르게 만드는 마무리 문장 3가지`,
  ];
}

export default function RecommendPage() {
  const router = useRouter();
  const [persona, setPersona] = useState<PersonaInput | null>(null);
  const [picks, setPicks] = useState<TrendItem[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = loadPersona();
    if (!stored) { router.push("/onboarding"); return; }
    const p = stored.input;
    setPersona(p);

    fetch(`/api/trends?platform=${p.platform === "multi" ? "all" : p.platform}`)
      .then(r => r.json())
      .then(({ data }: { data: TrendItem[] }) => {
        const matched = data
          .filter(item => item.category === p.category)
          .sort((a, b) => b.views - a.views)
          .slice(0, 3);
        setPicks(matched.length > 0 ? matched : data.slice(0, 3));
        setLoading(false);
      });
  }, [router]);

  if (loading || !persona) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af" }}>
        추천 트렌드를 불러오는 중...
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", paddingBottom: 80 }}>
      {/* 헤더 */}
      <div style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", padding: "28px 20px 24px", color: "#fff" }}>
        <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 4 }}>나의 트렌드 추천</div>
        <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>
          {PLATFORM_LABEL[persona.platform]} · {persona.category}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <span style={{ background: "rgba(255,255,255,0.2)", borderRadius: 12, padding: "4px 10px", fontSize: 12 }}>
            🎯 {GOAL_LABEL[persona.goal]}
          </span>
          <button
            onClick={() => router.push("/onboarding")}
            style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 12, padding: "4px 10px", fontSize: 12, color: "#fff", cursor: "pointer" }}
          >
            설문 다시하기
          </button>
        </div>
      </div>

      {/* 추천 카드 */}
      <div style={{ padding: "20px 16px" }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 16 }}>
          🔥 지금 이 트렌드를 잡아보세요
        </div>

        {picks.map((item, idx) => {
          const prompts = makePrompts(item, persona.goal);
          const isOpen = expanded === idx;

          return (
            <div key={item.id} style={{ background: "#fff", borderRadius: 16, marginBottom: 16, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              {/* 트렌드 정보 */}
              <div style={{ padding: "16px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <span style={{ fontSize: 32 }}>{item.thumbnail}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, color: "#6366f1", fontWeight: 700, marginBottom: 4 }}>
                      #{idx + 1} 추천 · {item.category}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#111827", marginBottom: 6, lineHeight: 1.4 }}>
                      {item.title.slice(0, 50)}{item.title.length > 50 ? "..." : ""}
                    </div>
                    <div style={{ fontSize: 12, color: "#6b7280" }}>
                      {item.creator} · 👁 {formatNumber(item.views)} · {item.trending_since}
                    </div>
                  </div>
                </div>
              </div>

              {/* 추천 프롬프트 토글 */}
              <button
                onClick={() => setExpanded(isOpen ? null : idx)}
                style={{
                  width: "100%", padding: "12px 16px", border: "none", borderTop: "1px solid #f3f4f6",
                  background: isOpen ? "#eef2ff" : "#fafafa",
                  color: "#6366f1", fontSize: 13, fontWeight: 600,
                  cursor: "pointer", textAlign: "left", display: "flex", justifyContent: "space-between",
                }}
              >
                <span>✍️ 추천 프롬프트 3종 보기</span>
                <span>{isOpen ? "▲" : "▼"}</span>
              </button>

              {isOpen && (
                <div style={{ padding: "12px 16px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
                  {prompts.map((prompt, pi) => (
                    <div key={pi} style={{ background: "#f5f3ff", borderRadius: 10, padding: "12px 14px" }}>
                      <div style={{ fontSize: 12, color: "#7c3aed", fontWeight: 700, marginBottom: 4 }}>
                        {["HOOK", "BODY", "CTA"][pi]}
                      </div>
                      <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.5 }}>{prompt}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <BottomNav />
    </div>
  );
}
