"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { savePersona } from "@/lib/persona";
import type { PersonaInput, PersonaResult } from "@/lib/types";

// ── 디자인 토큰 ──────────────────────────────────────────────
const C = {
  bg:      "#0A0A0B",
  surface: "#111114",
  surface2:"#18181C",
  border:  "#2A2A30",
  text:    "#F2F0EB",
  muted:   "#6B6B75",
  accents: ["#C8FF57", "#57C8FF", "#FF8657", "#C857FF"] as const,
};

// ── 설문 정의 ────────────────────────────────────────────────
type QuestionType = "single" | "multi" | "slider";

interface Question {
  id: keyof PersonaInput;
  label: string;
  type: QuestionType;
  options?: { value: string; label: string }[];
  slider?: { min: number; max: number; labels: string[] };
  multiMax?: number;
}

const QUESTIONS: Question[] = [
  {
    id: "platform",
    label: "주로 활동하는 플랫폼은 어디인가요?",
    type: "single",
    options: [
      { value: "youtube",   label: "YouTube Shorts" },
      { value: "tiktok",    label: "TikTok" },
      { value: "instagram", label: "Instagram Reels" },
      { value: "multi",     label: "멀티플랫폼" },
    ],
  },
  {
    id: "category",
    label: "내 채널의 주요 카테고리는 무엇인가요?",
    type: "single",
    options: [
      { value: "food",      label: "요리 / 먹방" },
      { value: "beauty",    label: "뷰티 / 패션" },
      { value: "lifestyle", label: "라이프스타일 / 일상" },
      { value: "edu",       label: "정보 / 자기계발" },
      { value: "gaming",    label: "게임 / 엔터테인먼트" },
      { value: "fitness",   label: "운동 / 건강" },
    ],
  },
  {
    id: "experience",
    label: "숏폼 크리에이터 경력이 얼마나 됩니까?",
    type: "slider",
    slider: {
      min: 0, max: 5,
      labels: ["채널 없음", "1개월 미만", "1~6개월", "6개월~1년", "1~3년", "3년 이상"],
    },
  },
  {
    id: "goal",
    label: "지금 가장 원하는 목표는 무엇인가요?",
    type: "single",
    options: [
      { value: "growth",    label: "구독자 / 팔로워 증가" },
      { value: "monetize",  label: "수익화 시작" },
      { value: "brand",     label: "브랜드 인지도 구축" },
      { value: "community", label: "팬덤 / 커뮤니티" },
    ],
  },
  {
    id: "styles",
    label: "내 콘텐츠 스타일 키워드는? (최대 3개)",
    type: "multi",
    multiMax: 3,
    options: [
      { value: "humor",     label: "🎭 유머 / 웃음" },
      { value: "info",      label: "💡 정보 / 교육" },
      { value: "emotion",   label: "🤍 감성 / 공감" },
      { value: "impact",    label: "⚡ 자극 / 임팩트" },
      { value: "honest",    label: "📝 솔직 / 현실" },
      { value: "visual",    label: "✨ 비주얼 / 심미" },
      { value: "challenge", label: "🔥 챌린지 / 트렌드" },
      { value: "creative",  label: "🧪 실험 / 독창성" },
    ],
  },
  {
    id: "pain",
    label: "숏폼 제작에서 가장 힘든 부분은?",
    type: "single",
    options: [
      { value: "idea",        label: "아이디어가 안 떠올라요" },
      { value: "trend",       label: "트렌드를 어떻게 써야 할지 모르겠어요" },
      { value: "reach",       label: "영상을 만들어도 반응이 없어요" },
      { value: "consistency", label: "꾸준히 못하겠어요" },
    ],
  },
  {
    id: "uploadFreq",
    label: "앞으로 주당 몇 편을 올리고 싶나요?",
    type: "slider",
    slider: { min: 1, max: 14, labels: [] },
  },
];

const DEFAULT_ANSWERS: PersonaInput = {
  platform: "youtube", category: "lifestyle", experience: 0,
  goal: "growth", styles: [], pain: "idea", uploadFreq: 3,
};

const LIFECYCLE = {
  rising: { icon: "▲", label: "RISING", color: "#C8FF57" },
  peak:   { icon: "◆", label: "PEAK",   color: "#57C8FF" },
  fading: { icon: "▼", label: "FADING", color: "#6B6B75" },
} as const;

// ── 메인 컴포넌트 ─────────────────────────────────────────────
type Screen = "intro" | "survey" | "loading" | "result";

export default function OnboardingPage() {
  const router = useRouter();
  const [screen, setScreen]     = useState<Screen>("intro");
  const [step, setStep]         = useState(0);
  const [answers, setAnswers]   = useState<PersonaInput>({ ...DEFAULT_ANSWERS });
  const [result, setResult]     = useState<PersonaResult | null>(null);
  const [progress, setProgress] = useState(0);

  function setAnswer(id: keyof PersonaInput, value: unknown) {
    setAnswers(prev => ({ ...prev, [id]: value }));
  }

  function toggleMulti(id: keyof PersonaInput, value: string, max: number) {
    setAnswers(prev => {
      const current = (prev[id] as string[]) ?? [];
      const next = current.includes(value)
        ? current.filter(v => v !== value)
        : current.length < max ? [...current, value] : current;
      return { ...prev, [id]: next };
    });
  }

  function canProceed(): boolean {
    const q = QUESTIONS[step];
    const val = answers[q.id];
    if (q.type === "multi") return (val as string[]).length > 0;
    return val !== undefined && val !== "";
  }

  function next() {
    if (!canProceed()) return;
    if (step < QUESTIONS.length - 1) setStep(s => s + 1);
    else startAnalysis();
  }

  function back() {
    if (step > 0) setStep(s => s - 1);
    else setScreen("intro");
  }

  async function startAnalysis() {
    setScreen("loading");
    setProgress(0);
    const timer = setInterval(() => setProgress(p => Math.min(p + 8, 90)), 300);
    try {
      const res = await fetch("/api/persona", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers),
      });
      const data: PersonaResult = await res.json();
      savePersona(answers, data);
      setResult(data);
      clearInterval(timer);
      setProgress(100);
      setTimeout(() => setScreen("result"), 400);
    } catch {
      clearInterval(timer);
      setScreen("result"); // 서버 fallback으로 이미 결과 받음
    }
  }

  const accent = result ? C.accents[result.typeIndex ?? 0] : C.accents[0];

  // ── 인트로 ───────────────────────────────────────────────
  if (screen === "intro") return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 24 }}>⚡</div>
      <h1 style={{ fontSize: 28, fontWeight: 900, color: C.text, marginBottom: 12, letterSpacing: -0.5 }}>
        나만의 크리에이터<br />페르소나를 찾아보세요
      </h1>
      <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.7, marginBottom: 40, maxWidth: 300 }}>
        7가지 질문으로 내 채널에 맞는 트렌드와<br />오늘 찍을 콘텐츠 방향을 알려드립니다.
      </p>
      <button
        onClick={() => setScreen("survey")}
        style={{ background: C.accents[0], color: C.bg, border: "none", borderRadius: 14, padding: "16px 40px", fontSize: 16, fontWeight: 700, cursor: "pointer", width: "100%", maxWidth: 320 }}
      >
        시작하기
      </button>
    </div>
  );

  // ── 설문 ─────────────────────────────────────────────────
  if (screen === "survey") {
    const q = QUESTIONS[step];
    const val = answers[q.id];
    return (
      <div style={{ minHeight: "100vh", background: C.bg, color: C.text }}>
        <div style={{ maxWidth: 480, margin: "0 auto", padding: "28px 20px 40px" }}>
          {/* 진행 바 */}
          <div style={{ marginBottom: 36 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.muted, marginBottom: 10 }}>
              <span>{step + 1} / {QUESTIONS.length}</span>
              <button onClick={back} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 12 }}>← 뒤로</button>
            </div>
            <div style={{ height: 3, background: C.surface2, borderRadius: 2 }}>
              <div style={{ height: "100%", background: C.accents[0], borderRadius: 2, width: `${((step + 1) / QUESTIONS.length) * 100}%`, transition: "width 0.3s" }} />
            </div>
          </div>

          <h2 style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.5, marginBottom: 28 }}>{q.label}</h2>

          {/* Single select */}
          {q.type === "single" && q.options && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {q.options.map(opt => {
                const sel = val === opt.value;
                return (
                  <button key={opt.value} onClick={() => setAnswer(q.id, opt.value)}
                    style={{ padding: "14px 18px", borderRadius: 12, textAlign: "left", cursor: "pointer", transition: "all 0.15s",
                      background: sel ? `${C.accents[0]}18` : C.surface, border: `1.5px solid ${sel ? C.accents[0] : C.border}`,
                      color: sel ? C.accents[0] : C.text, fontSize: 14, fontWeight: sel ? 600 : 400 }}
                  >{opt.label}</button>
                );
              })}
            </div>
          )}

          {/* Multi select */}
          {q.type === "multi" && q.options && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {q.options.map(opt => {
                const sel = (val as string[])?.includes(opt.value);
                return (
                  <button key={opt.value} onClick={() => toggleMulti(q.id, opt.value, q.multiMax ?? 3)}
                    style={{ padding: "12px 14px", borderRadius: 12, textAlign: "left", cursor: "pointer", transition: "all 0.15s",
                      background: sel ? `${C.accents[0]}18` : C.surface, border: `1.5px solid ${sel ? C.accents[0] : C.border}`,
                      color: sel ? C.accents[0] : C.text, fontSize: 13, fontWeight: sel ? 600 : 400 }}
                  >{opt.label}</button>
                );
              })}
            </div>
          )}

          {/* Slider */}
          {q.type === "slider" && q.slider && (
            <div>
              <input type="range" min={q.slider.min} max={q.slider.max} value={val as number}
                onChange={e => setAnswer(q.id, Number(e.target.value))}
                style={{ width: "100%", accentColor: C.accents[0], cursor: "pointer" }}
              />
              <div style={{ textAlign: "center", marginTop: 16, padding: "14px", background: C.surface, borderRadius: 12, border: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: C.accents[0] }}>
                  {q.slider.labels.length > 0 ? q.slider.labels[val as number] : `주 ${val}편`}
                </span>
              </div>
            </div>
          )}

          <button onClick={next} disabled={!canProceed()}
            style={{ marginTop: 32, width: "100%", padding: "16px", borderRadius: 14, border: "none", fontSize: 15, fontWeight: 700,
              cursor: canProceed() ? "pointer" : "default", transition: "all 0.2s",
              background: canProceed() ? C.accents[0] : C.surface2,
              color: canProceed() ? C.bg : C.muted }}
          >
            {step < QUESTIONS.length - 1 ? "다음" : "분석 시작"}
          </button>
        </div>
      </div>
    );
  }

  // ── 로딩 ─────────────────────────────────────────────────
  if (screen === "loading") return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ fontSize: 40, marginBottom: 24, display: "inline-block", animation: "spin 1.5s linear infinite" }}>⚙️</div>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 8 }}>페르소나 분석 중...</h2>
      <p style={{ color: C.muted, fontSize: 13, marginBottom: 32 }}>AI가 내 채널을 분석하고 있습니다</p>
      <div style={{ width: 240, height: 4, background: C.surface2, borderRadius: 2 }}>
        <div style={{ height: "100%", background: C.accents[0], borderRadius: 2, width: `${progress}%`, transition: "width 0.3s" }} />
      </div>
    </div>
  );

  // ── 결과 ─────────────────────────────────────────────────
  if (screen === "result" && result) return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text }}>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "28px 20px 80px" }}>

        {/* 페르소나 카드 */}
        <div style={{ background: C.surface, border: `1px solid ${accent}50`, borderRadius: 20, padding: "28px 24px", marginBottom: 12, textAlign: "center" }}>
          <div style={{ fontSize: 10, letterSpacing: 3, color: accent, marginBottom: 10 }}>YOUR PERSONA</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: accent, marginBottom: 6, letterSpacing: -0.5 }}>{result.personaType}</div>
          <div style={{ fontSize: 14, color: C.muted }}>{result.personaTagline}</div>
        </div>

        {/* 페르소나 분석 */}
        <ResultSection title="페르소나 분석" accent={accent}>
          <p style={{ fontSize: 14, lineHeight: 1.8, color: C.text, margin: 0 }}>{result.personaSummary}</p>
        </ResultSection>

        {/* 채널 Fit 트렌드 TOP 3 */}
        <ResultSection title="채널 Fit 트렌드 TOP 3" accent={accent}>
          {result.topTrends.map((t, i) => {
            const lc = LIFECYCLE[t.state];
            return (
              <div key={i} style={{ display: "flex", gap: 12, marginBottom: i < 2 ? 16 : 0, alignItems: "flex-start" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: lc.color, minWidth: 52, paddingTop: 2 }}>{lc.icon} {lc.label}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: accent }}>{t.keyword}</span>
                    <span style={{ fontSize: 11, color: C.muted }}>Fit {t.fitScore}%</span>
                  </div>
                  <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>{t.reason}</p>
                </div>
              </div>
            );
          })}
        </ResultSection>

        {/* 추천 훅 패턴 */}
        <ResultSection title="추천 훅 패턴" accent={accent}>
          {result.hookPatterns.map((h, i) => (
            <div key={i} style={{ background: C.surface2, borderRadius: 10, padding: "12px 14px", marginBottom: i < result.hookPatterns.length - 1 ? 10 : 0 }}>
              <div style={{ fontSize: 10, color: accent, fontWeight: 700, marginBottom: 4 }}>{h.type}</div>
              <p style={{ fontSize: 13, color: C.text, margin: 0 }}>"{h.example}"</p>
            </div>
          ))}
        </ResultSection>

        {/* 이번 주 콘텐츠 플랜 */}
        <ResultSection title="이번 주 콘텐츠 플랜" accent={accent}>
          <p style={{ fontSize: 14, lineHeight: 1.8, color: C.text, margin: 0 }}>{result.weeklyPlan}</p>
        </ResultSection>

        {/* 지금 당장 할 일 3가지 */}
        <ResultSection title="지금 당장 할 일 3가지" accent={accent}>
          {result.actionItems.map((a, i) => (
            <div key={i} style={{ display: "flex", gap: 12, marginBottom: i < result.actionItems.length - 1 ? 16 : 0 }}>
              <div style={{ width: 22, height: 22, borderRadius: "50%", background: accent, color: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{a.title}</div>
                <p style={{ fontSize: 12, color: C.muted, margin: 0, lineHeight: 1.6 }}>{a.desc}</p>
              </div>
            </div>
          ))}
        </ResultSection>

        {/* CTA */}
        <button onClick={() => router.push("/")}
          style={{ width: "100%", padding: "16px", borderRadius: 14, background: accent, color: C.bg, border: "none", fontSize: 15, fontWeight: 700, cursor: "pointer", marginTop: 8 }}>
          트렌드 대시보드 보기 →
        </button>
        <button onClick={() => { setStep(0); setAnswers({ ...DEFAULT_ANSWERS }); setScreen("intro"); }}
          style={{ width: "100%", padding: "12px", borderRadius: 14, background: "none", color: C.muted, border: `1px solid ${C.border}`, fontSize: 13, cursor: "pointer", marginTop: 10 }}>
          설문 다시하기
        </button>
      </div>
    </div>
  );

  return null;
}

function ResultSection({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: "18px 20px", marginBottom: 10 }}>
      <div style={{ fontSize: 10, letterSpacing: 2, color: accent, fontWeight: 700, marginBottom: 12 }}>{title.toUpperCase()}</div>
      {children}
    </div>
  );
}
