import type { TrendItem, ScriptTone } from "@/lib/types";

interface ToneDefinition {
  id: ScriptTone;
  label: string;
  description: string;
}

export const TONE_DEFS: ToneDefinition[] = [
  {
    id: "informative",
    label: "정보형",
    description: "사실, 데이터, 팁 중심으로 신뢰감 있게 전달. 차분한 어조.",
  },
  {
    id: "story",
    label: "스토리형",
    description: "1인칭 경험담/감정에 기반한 내러티브. 공감대 형성.",
  },
  {
    id: "hooking",
    label: "후킹형",
    description: "강한 호기심 유발, 빠른 전개, 자극적인 도입. 이탈률 최소화.",
  },
];

export function buildSystemPrompt(
  reference: TrendItem,
  direction: string,
  tone: ToneDefinition
): string {
  const engagementRate = reference.engagement_rate
    ? `${reference.engagement_rate.toFixed(1)}%`
    : "정보 없음";
  const categoryAvg = reference.category_avg_engagement
    ? `${reference.category_avg_engagement.toFixed(1)}%`
    : "정보 없음";
  const delta =
    reference.engagement_rate && reference.category_avg_engagement
      ? `${((reference.engagement_rate / reference.category_avg_engagement - 1) * 100).toFixed(0)}%`
      : "정보 없음";

  return `당신은 한국 숏폼 컨텐츠 마케팅 대본 전문가입니다.

[레퍼런스 트렌딩 영상]
- 제목: ${reference.title}
- 카테고리: ${reference.category}
- 플랫폼: ${reference.platform}
- 조회수: ${reference.views.toLocaleString()} / 좋아요: ${reference.likes.toLocaleString()}
- 인게이지먼트: ${engagementRate} (카테고리 평균 ${categoryAvg} 대비 ${delta})

[콘텐츠 방향]
${direction}

[작성 톤]
"${tone.label}" 톤으로 작성하세요.
가이드: ${tone.description}

[출력 형식 — 반드시 준수]
다음 JSON 스키마로만 응답하세요. 마크다운 코드블록(\`\`\`) 금지, 설명 문장 금지, 순수 JSON만:
{
  "hook": "영상 첫 3초에 들어갈 임팩트 있는 한 문장 멘트",
  "body": "본문 흐름을 개행(\\n)으로 구분한 3~5단계 텍스트",
  "cta": "마지막 콜투액션 한 문장"
}

[제약]
- 60초 영상 분량 기준 (300~400자 내외)
- 한국어로 작성
- JSON 외 다른 텍스트는 절대 포함하지 마세요`;
}

export function parseScript(raw: string): { hook: string; body: string; cta: string } {
  let cleaned = raw.trim();
  cleaned = cleaned.replace(/^```json\s*/i, "").replace(/^```\s*/, "");
  cleaned = cleaned.replace(/```\s*$/, "");
  const start = cleaned.indexOf("{");
  const parsed = JSON.parse(cleaned.slice(start));
  // body가 배열로 왔을 때 개행으로 변환
  if (Array.isArray(parsed.body)) {
    parsed.body = (parsed.body as string[]).join("\n");
  }
  return parsed;
}

// typeIndex → 추천 톤 매핑 (kyungjae V0 기준)
export function recommendedToneByType(typeIndex: number): ScriptTone {
  const map: Record<number, ScriptTone> = {
    0: "story",      // 초보 크리에이터 → 공감 위주
    1: "informative", // 성장형 → 정보 신뢰
    2: "hooking",    // 유입형 → 자극적 오프닝
    3: "story",      // 커뮤니티형 → 감성 내러티브
  };
  return map[typeIndex] ?? "hooking";
}
