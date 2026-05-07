"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loadPersona } from "@/lib/persona";
import type { PersonaInput } from "@/lib/types";
import type { ScriptResponse } from "@/lib/types";
import { TrendItem, formatNumber } from "@/lib/mock-data";
import BottomNav from "@/components/BottomNav";
import ScriptViewer from "@/components/ScriptViewer";

// TODO (feature/recommend): 1단계(레퍼런스 선택)·2단계(방향 편집) 고도화 예정

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

export default function RecommendPage() {
  const router = useRouter();
  const [persona, setPersona] = useState<PersonaInput | null>(null);
  const [personaResult, setPersonaResult] = useState<{ personaType: string; typeIndex: number } | null>(null);
  const [picks, setPicks] = useState<TrendItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 대본 생성 상태
  const [selectedRef, setSelectedRef] = useState<TrendItem | null>(null);
  const [direction, setDirection] = useState("");
  const [scriptLoading, setScriptLoading] = useState(false);
  const [scriptResult, setScriptResult] = useState<ScriptResponse | null>(null);

  useEffect(() => {
    const stored = loadPersona();
    if (!stored) { router.push("/onboarding"); return; }
    const p = stored.input;
    setPersona(p);
    setPersonaResult({ personaType: stored.result.personaType, typeIndex: stored.result.typeIndex });

    fetch(`/api/trends?platform=${p.platform === "multi" ? "all" : p.platform}`)
      .then(r => r.json())
      .then(({ data }: { data: TrendItem[] }) => {
        const matched = data
          .filter(item => item.category === p.category)
          .sort((a, b) => b.views - a.views)
          .slice(0, 3);
        const finalPicks = matched.length > 0 ? matched : data.slice(0, 3);
        setPicks(finalPicks);
        if (finalPicks.length > 0) {
          setSelectedRef(finalPicks[0]);
          setDirection(
            `${finalPicks[0].category} 카테고리에서 "${finalPicks[0].title.slice(0, 30)}" 트렌드를 활용해 ` +
            `${GOAL_LABEL[p.goal]} 목표에 맞는 콘텐츠를 제작합니다.`
          );
        }
        setLoading(false);
      });
  }, [router]);

  async function generateScript() {
    if (!selectedRef || !personaResult || !direction.trim()) return;
    setScriptLoading(true);
    setScriptResult(null);
    try {
      const res = await fetch("/api/script", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          direction,
          reference: selectedRef,
          persona: personaResult,
        }),
      });
      const data: ScriptResponse = await res.json();
      setScriptResult(data);
    } finally {
      setScriptLoading(false);
    }
  }

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

      <div style={{ padding: "20px 16px" }}>

        {/* Step 1: 레퍼런스 선택 */}
        <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 12 }}>
          1️⃣ 레퍼런스 트렌드 선택
        </div>
        {picks.map((item) => (
          <div
            key={item.id}
            onClick={() => {
              setSelectedRef(item);
              setDirection(
                `${item.category} 카테고리에서 "${item.title.slice(0, 30)}" 트렌드를 활용해 ` +
                `${GOAL_LABEL[persona.goal]} 목표에 맞는 콘텐츠를 제작합니다.`
              );
              setScriptResult(null);
            }}
            style={{
              background: "#fff",
              borderRadius: 14,
              marginBottom: 10,
              overflow: "hidden",
              boxShadow: selectedRef?.id === item.id
                ? "0 0 0 2px #6366f1"
                : "0 2px 8px rgba(0,0,0,0.06)",
              cursor: "pointer",
            }}
          >
            <div style={{ padding: "14px 16px", display: "flex", alignItems: "flex-start", gap: 12 }}>
              <span style={{ fontSize: 28 }}>{item.thumbnail}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, color: "#6366f1", fontWeight: 700, marginBottom: 3 }}>
                  {item.category}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", lineHeight: 1.4 }}>
                  {item.title.slice(0, 50)}{item.title.length > 50 ? "..." : ""}
                </div>
                <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>
                  {item.creator} · 👁 {formatNumber(item.views)}
                </div>
              </div>
              {selectedRef?.id === item.id && (
                <span style={{ fontSize: 18, color: "#6366f1" }}>✓</span>
              )}
            </div>
          </div>
        ))}

        {/* Step 2: 콘텐츠 방향 편집 */}
        {selectedRef && (
          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 12 }}>
              2️⃣ 콘텐츠 방향 확인 · 수정
            </div>
            <textarea
              value={direction}
              onChange={(e) => setDirection(e.target.value)}
              rows={4}
              style={{
                width: "100%",
                padding: "12px 14px",
                border: "1.5px solid #e5e7eb",
                borderRadius: 12,
                fontSize: 13,
                lineHeight: 1.6,
                color: "#374151",
                resize: "vertical",
                boxSizing: "border-box",
                outline: "none",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
              onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
            />

            {/* Step 3: 대본 생성 버튼 */}
            <button
              onClick={generateScript}
              disabled={scriptLoading || !direction.trim()}
              style={{
                width: "100%",
                marginTop: 12,
                padding: "14px",
                background: scriptLoading ? "#c7d2fe" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                border: "none",
                borderRadius: 12,
                color: "#fff",
                fontSize: 15,
                fontWeight: 700,
                cursor: scriptLoading ? "not-allowed" : "pointer",
              }}
            >
              {scriptLoading ? "대본 생성 중..." : "✍️ 대본 3종 생성하기"}
            </button>
          </div>
        )}

        {/* Step 3: 대본 결과 */}
        {scriptResult && (
          <div style={{ marginTop: 24 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 4 }}>
              3️⃣ 생성된 대본
            </div>
            <ScriptViewer result={scriptResult} />
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
