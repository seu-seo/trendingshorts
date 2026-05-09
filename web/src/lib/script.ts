import type {
  TrendItem,
  ScriptTone,
  ScriptRequest,
  ScriptOutput,
} from "@/lib/types";

// ============================================================
// Script Generation — v2 (data-driven tone, single-call prompt)
// Owner: feature/script (경재)
// Last reviewed: 2026-05-09
//
// v1 → v2 변경점
// - typeIndex 기반 톤 매핑 제거 (Kyudong 리뷰 #3: typeIndex 의미 충돌)
// - 데이터 신호 기반 톤 추천: reference.engagement_rate, growth, persona.styles
// - 단일 LLM 호출로 3톤 동시 생성 (3회 → 1회, 비용 1/3)
// - onboarding `styles` 필드를 system prompt에 직접 반영 (Kyudong 리뷰 #4)
// - 한국 숏폼 컨벤션 명시 (13음절 훅, 팔로워 구간별 CTA)
// - Strict JSON 스키마 + 파싱 fallback
// - 프롬프트 버전 메타데이터 (관찰 가능성)
// ============================================================

export const PROMPT_METADATA = {
  version: "2.0.0",
  changedAt: "2026-05-09",
  owner: "feature/script (경재)",
} as const;

export interface ToneDefinition {
  id: ScriptTone;
  label: string;
  description: string;
}

export const TONE_DEFS: ToneDefinition[] = [
  {
    id: "informative",
    label: "정보형",
    description: "사실·데이터·기준 제시 중심. 차분한 어조. 학습/요약/비교 구조의 훅.",
  },
  {
    id: "story",
    label: "스토리형",
    description: "1인칭 경험담·감정 기반 내러티브. 공감대 형성. '어제 처음 ○○ 해봤는데요' 류 도입.",
  },
  {
    id: "hooking",
    label: "후킹형",
    description: "3초 내 강한 호기심 유발. 의문문/충격 사실/숫자제시. 이탈률 최소화.",
  },
];

// ------------------------------------------------------------
// 1. 데이터 신호 기반 톤 추천 (구 recommendedToneByType 대체)
// ------------------------------------------------------------
// 입력: reference 메트릭 + persona styles
// 출력: { tone, score, signals }  — 결정 근거가 명시적

export interface ToneRecommendation {
  tone: ScriptTone;
  /** 0-100, 추천 톤이 다른 두 톤보다 얼마나 더 적합한가 */
  confidence: number;
  /** 의사결정에 사용된 신호들 (사용자에게 노출 가능) */
  signals: string[];
}

export function recommendTone(
  reference: TrendItem,
  persona: { styles?: string[]; typeIndex?: number; followerCount?: number }
): ToneRecommendation {
  const signals: string[] = [];
  let scoreInformative = 0;
  let scoreStory = 0;
  let scoreHooking = 0;

  // --- 신호 1: 인게이지먼트 vs 카테고리 평균 (실제 데이터로 결정) ---
  const er = reference.engagement_rate ?? 0;
  const avgEr = reference.category_avg_engagement ?? 0;
  const erDelta = avgEr > 0 ? er / avgEr - 1 : 0;

  if (erDelta > 0.3) {
    scoreHooking += 25;
    signals.push(`인게이지먼트가 카테고리 평균 대비 +${Math.round(erDelta * 100)}% (바이럴 패턴)`);
  }

  // --- 신호 2: 댓글-좋아요 비율 (토론 신호 → 정보형) ---
  if (reference.likes > 0) {
    const ctlRatio = reference.comments / reference.likes;
    if (ctlRatio >= 0.15) {
      scoreInformative += 20;
      signals.push(`댓글/좋아요 비율 ${(ctlRatio * 100).toFixed(0)}% (토론·질문 신호)`);
    }
  }

  // --- 신호 3: 성장률 (24h growth → 신생 트렌드 → 후킹형) ---
  const growth = reference.growth ?? 0;
  if (growth > 30) {
    scoreHooking += 20;
    signals.push(`24h 성장률 +${growth}% (emerging 트렌드 → 빠른 어그로 필요)`);
  } else if (growth > 0 && growth <= 30) {
    scoreStory += 10;
    signals.push(`성장률 안정 구간 (스토리 전개에 유리)`);
  }

  // --- 신호 4: 카테고리 (구조적 적합도) ---
  const category = reference.category ?? "";
  if (/(테크|교육|edu|뷰티)/i.test(category)) {
    scoreInformative += 15;
    signals.push(`카테고리 '${category}' — 정보형 친화`);
  }
  if (/(일상|브이로그|펫|먹방)/i.test(category)) {
    scoreStory += 15;
    signals.push(`카테고리 '${category}' — 스토리형 친화`);
  }

  // --- 신호 5: 페르소나 styles (Kyudong 리뷰 #4 — styles 직접 반영) ---
  const styles = persona.styles ?? [];
  if (styles.includes("education") || styles.includes("expertise")) {
    scoreInformative += 15;
    signals.push("페르소나 스타일 'education' → 정보형 가중");
  }
  if (styles.includes("emotion") || styles.includes("authenticity")) {
    scoreStory += 15;
    signals.push("페르소나 스타일 'emotion' → 스토리형 가중");
  }
  if (styles.includes("humor") || styles.includes("impact")) {
    scoreHooking += 15;
    signals.push("페르소나 스타일 'humor/impact' → 후킹형 가중");
  }

  // --- 신호 6: 팔로워 수 (1만 미만 emerging creator 타겟 — 5/5 합의) ---
  const followers = persona.followerCount ?? 0;
  if (followers > 0 && followers < 1000) {
    scoreHooking += 10;
    signals.push(`팔로워 ${followers} (어텐션 확보 우선 → 후킹형)`);
  }

  // --- 결정 ---
  const scores = {
    informative: scoreInformative,
    story: scoreStory,
    hooking: scoreHooking,
  };
  const sorted = (Object.entries(scores) as [ScriptTone, number][]).sort(
    (a, b) => b[1] - a[1]
  );
  const [topTone, topScore] = sorted[0];
  const [, secondScore] = sorted[1];
  const total = topScore + secondScore + sorted[2][1];
  const confidence =
    total > 0 ? Math.round(((topScore - secondScore) / Math.max(total, 1)) * 100 + 50) : 50;

  // 모든 신호가 빈약한 경우 (신생 카테고리 등) → 후킹형 default
  return {
    tone: topScore > 0 ? topTone : "hooking",
    confidence: Math.min(100, Math.max(0, confidence)),
    signals: signals.length > 0 ? signals : ["데이터 신호 부족 — 기본 후킹형 적용"],
  };
}

// ------------------------------------------------------------
// 2. System prompt builder — 단일 호출로 3톤 동시 생성
// ------------------------------------------------------------

export function buildSystemPrompt(args: {
  reference: TrendItem;
  direction: string;
  persona: ScriptRequest["persona"] & { styles?: string[]; followerCount?: number };
  recommendation: ToneRecommendation;
}): string {
  const { reference, direction, persona, recommendation } = args;

  const er = reference.engagement_rate
    ? `${reference.engagement_rate.toFixed(1)}%`
    : "정보 없음";
  const avgEr = reference.category_avg_engagement
    ? `${reference.category_avg_engagement.toFixed(1)}%`
    : "정보 없음";
  const erDelta =
    reference.engagement_rate && reference.category_avg_engagement
      ? `${((reference.engagement_rate / reference.category_avg_engagement - 1) * 100).toFixed(0)}%`
      : "정보 없음";
  const growth = reference.growth ? `+${reference.growth}%` : "정보 없음";

  const stylesText = (persona.styles ?? []).join(", ") || "(미지정)";
  const followerSegment =
    (persona.followerCount ?? 0) < 1000
      ? "1K 미만 (어텐션 확보 단계)"
      : (persona.followerCount ?? 0) < 10000
        ? "1K-10K (저장·공유 유도 단계)"
        : "10K+ (외부 범위)";

  return `당신은 한국 숏폼 콘텐츠 전략가입니다. YouTube Shorts(주력), Instagram Reels, TikTok의 알고리즘 동학과 한국 크리에이터 이코노미 관행에 깊은 전문성을 갖고 있습니다.

[작업 컨텍스트 — 5/5 회의 합의]
- 대상 사용자: 팔로워 1만 명 미만의 emerging creator
- 주력 플랫폼: YouTube Shorts (60초 이내)
- 부가 플랫폼: Instagram Reels, TikTok (OSMU)
- 한국어 콘텐츠 전용

[레퍼런스 트렌딩 영상]
- 제목: ${reference.title}
- 카테고리: ${reference.category}${reference.subcategory ? ` / ${reference.subcategory}` : ""}
- 플랫폼: ${reference.platform}
- 메트릭: 조회수 ${reference.views.toLocaleString()} · 좋아요 ${reference.likes.toLocaleString()} · 댓글 ${reference.comments.toLocaleString()}
- 인게이지먼트: ${er} (카테고리 평균 ${avgEr} 대비 ${erDelta})
- 24h 성장률: ${growth}
- 해시태그: ${(reference.tags ?? []).join(" ")}

[크리에이터 페르소나]
- 페르소나 타입: ${persona.personaType}
- 콘텐츠 스타일: ${stylesText}
- 팔로워 구간: ${followerSegment}

[콘텐츠 방향]
${direction}

[프리컴퓨트된 톤 추천 — 데이터 신호 기반]
권장 톤: ${recommendation.tone} (confidence ${recommendation.confidence})
근거 신호:
${recommendation.signals.map((s) => `  - ${s}`).join("\n")}

위 권장 톤이 가장 우선이지만, 3톤 모두 작성합니다 (사용자가 비교 선택 가능).

[훅 작성 규칙 — 한국 숏폼 컨벤션]
- 첫 문장은 0.8초 이내 발화 가능한 13음절 이하 권장 (최대 16음절)
- 정보형: 숫자·기준 제시. 예) "3000원 차이로 효과 2배 달라지는 치약"
- 스토리형: 1인칭 시작. 예) "어제 처음 ○○ 해봤는데요"
- 후킹형: 의문문 또는 충격 사실. 예) "이거 진짜 모르고 쓰면 손해예요"

[CTA 작성 규칙 — 팔로워 구간별]
- 1K 미만: 구독 직접 요청보다 댓글 유도 ("○○ 한 분 댓글 남겨주세요")
  → 알고리즘이 댓글 신호에 더 강하게 반응
- 1K-10K: 저장·공유 유도 ("○○일 때 다시 볼 수 있게 저장해두세요")
- styles에 'humor': 농담조 마무리 허용
- styles에 'education': 다음 콘텐츠 예고

[금지사항]
- 레퍼런스 영상의 제목·캡션을 15단어 이상 그대로 인용 금지
- 의료·금융·법률 분야의 단정적 주장 금지
- 특정 브랜드 비방 또는 비교 우위 단정 금지

[출력 형식 — 반드시 준수]
다음 JSON 스키마로만 응답하세요. 마크다운 코드블록(\`\`\`) 금지, 설명 문장 금지, 순수 JSON만:
{
  "informative": { "hook": "한 문장", "body": "본문 (개행 \\n 으로 3-5단계)", "cta": "한 문장" },
  "story":       { "hook": "한 문장", "body": "본문 (개행 \\n 으로 3-5단계)", "cta": "한 문장" },
  "hooking":     { "hook": "한 문장", "body": "본문 (개행 \\n 으로 3-5단계)", "cta": "한 문장" }
}

[제약]
- 60초 영상 분량 기준 (각 톤별 본문 300~400자 내외)
- 한국어로 작성
- JSON 외 다른 텍스트는 절대 포함 금지`;
}

// ------------------------------------------------------------
// 3. Response parser — strict JSON + fallback
// ------------------------------------------------------------

export function parseAllScripts(raw: string): Record<ScriptTone, ScriptOutput> {
  let cleaned = raw.trim();
  cleaned = cleaned.replace(/^```json\s*/i, "").replace(/^```\s*/, "");
  cleaned = cleaned.replace(/```\s*$/, "");
  const start = cleaned.indexOf("{");
  if (start < 0) throw new Error("No JSON object found in response");

  const parsed = JSON.parse(cleaned.slice(start)) as Record<
    ScriptTone,
    ScriptOutput | { hook: string; body: string | string[]; cta: string }
  >;

  const result = {} as Record<ScriptTone, ScriptOutput>;
  for (const tone of ["informative", "story", "hooking"] as ScriptTone[]) {
    const v = parsed[tone];
    if (!v || typeof v !== "object") {
      throw new Error(`Missing tone '${tone}' in response`);
    }
    const body = Array.isArray(v.body) ? (v.body as string[]).join("\n") : v.body;
    result[tone] = { hook: v.hook, body, cta: v.cta };
  }
  return result;
}

// ------------------------------------------------------------
// 4. Single-tone parser (호환성 — 기존 parseScript 시그니처 유지)
// ------------------------------------------------------------

export function parseScript(raw: string): ScriptOutput {
  let cleaned = raw.trim();
  cleaned = cleaned.replace(/^```json\s*/i, "").replace(/^```\s*/, "");
  cleaned = cleaned.replace(/```\s*$/, "");
  const start = cleaned.indexOf("{");
  const parsed = JSON.parse(cleaned.slice(start));
  if (Array.isArray(parsed.body)) {
    parsed.body = (parsed.body as string[]).join("\n");
  }
  return parsed;
}

// ------------------------------------------------------------
// 5. Backward-compat helper (deprecated, will be removed in v2.1)
// ------------------------------------------------------------

/** @deprecated Use recommendTone(reference, persona) instead. */
export function recommendedToneByType(typeIndex: number): ScriptTone {
  const map: Record<number, ScriptTone> = {
    0: "story",
    1: "informative",
    2: "hooking",
    3: "story",
  };
  return map[typeIndex] ?? "hooking";
}
