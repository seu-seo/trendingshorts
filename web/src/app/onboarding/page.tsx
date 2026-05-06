"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { savePersona, Persona } from "@/lib/persona";
import { CATEGORIES } from "@/lib/mock-data";

const PLATFORMS = [
  { value: "youtube", label: "YouTube Shorts", icon: "▶️" },
  { value: "tiktok", label: "TikTok", icon: "♪" },
  { value: "instagram", label: "Instagram Reels", icon: "◎" },
  { value: "all", label: "아직 모름", icon: "🤔" },
] as const;

const GOALS = [
  { value: "growth", label: "팔로워 성장", icon: "📈" },
  { value: "monetization", label: "수익화", icon: "💰" },
  { value: "hobby", label: "취미·즐거움", icon: "🎉" },
] as const;

const CATEGORY_OPTIONS = CATEGORIES.filter(c => c !== "전체");

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [platform, setPlatform] = useState<Persona["platform"] | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [goal, setGoal] = useState<Persona["goal"] | null>(null);

  function toggleCategory(cat: string) {
    setCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : prev.length < 3 ? [...prev, cat] : prev
    );
  }

  function handleFinish() {
    if (!platform || !goal || categories.length === 0) return;
    savePersona({ platform, categories, goal });
    router.push("/");
  }

  const steps = [
    {
      title: "주로 활동할 플랫폼은?",
      subtitle: "가장 집중하고 싶은 플랫폼을 선택해 주세요",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {PLATFORMS.map(p => (
            <button
              key={p.value}
              onClick={() => setPlatform(p.value)}
              style={{
                padding: "16px 20px", borderRadius: 12, border: "2px solid",
                borderColor: platform === p.value ? "#6366f1" : "#e5e7eb",
                background: platform === p.value ? "#eef2ff" : "#fff",
                display: "flex", alignItems: "center", gap: 12,
                cursor: "pointer", fontSize: 16, fontWeight: 500,
                transition: "all 0.15s",
              }}
            >
              <span style={{ fontSize: 24 }}>{p.icon}</span>
              <span>{p.label}</span>
            </button>
          ))}
        </div>
      ),
      canNext: platform !== null,
    },
    {
      title: "관심 카테고리 선택",
      subtitle: "최대 3개까지 선택할 수 있어요",
      content: (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {CATEGORY_OPTIONS.map(cat => (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              style={{
                padding: "10px 16px", borderRadius: 20, border: "2px solid",
                borderColor: categories.includes(cat) ? "#6366f1" : "#e5e7eb",
                background: categories.includes(cat) ? "#eef2ff" : "#fff",
                color: categories.includes(cat) ? "#6366f1" : "#374151",
                cursor: "pointer", fontSize: 14, fontWeight: 500,
                transition: "all 0.15s",
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      ),
      canNext: categories.length > 0,
    },
    {
      title: "콘텐츠 목표는?",
      subtitle: "솔직하게 선택해 주세요",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {GOALS.map(g => (
            <button
              key={g.value}
              onClick={() => setGoal(g.value)}
              style={{
                padding: "16px 20px", borderRadius: 12, border: "2px solid",
                borderColor: goal === g.value ? "#6366f1" : "#e5e7eb",
                background: goal === g.value ? "#eef2ff" : "#fff",
                display: "flex", alignItems: "center", gap: 12,
                cursor: "pointer", fontSize: 16, fontWeight: 500,
                transition: "all 0.15s",
              }}
            >
              <span style={{ fontSize: 24 }}>{g.icon}</span>
              <span>{g.label}</span>
            </button>
          ))}
        </div>
      ),
      canNext: goal !== null,
    },
  ];

  const current = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 20px" }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        {/* 진행 바 */}
        <div style={{ display: "flex", gap: 6, marginBottom: 32 }}>
          {steps.map((_, i) => (
            <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= step ? "#6366f1" : "#e5e7eb", transition: "background 0.3s" }} />
          ))}
        </div>

        <div style={{ fontSize: 22, fontWeight: 700, color: "#111827", marginBottom: 8 }}>{current.title}</div>
        <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 28 }}>{current.subtitle}</div>

        {current.content}

        <button
          onClick={isLast ? handleFinish : () => setStep(s => s + 1)}
          disabled={!current.canNext}
          style={{
            marginTop: 32, width: "100%", padding: "16px",
            borderRadius: 12, border: "none",
            background: current.canNext ? "#6366f1" : "#e5e7eb",
            color: current.canNext ? "#fff" : "#9ca3af",
            fontSize: 16, fontWeight: 700, cursor: current.canNext ? "pointer" : "not-allowed",
            transition: "all 0.15s",
          }}
        >
          {isLast ? "시작하기 🚀" : "다음"}
        </button>

        {step > 0 && (
          <button onClick={() => setStep(s => s - 1)} style={{ marginTop: 12, width: "100%", padding: 12, border: "none", background: "none", color: "#9ca3af", fontSize: 14, cursor: "pointer" }}>
            이전으로
          </button>
        )}
      </div>
    </div>
  );
}
