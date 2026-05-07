import { NextResponse } from "next/server";
import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import type { PersonaInput, PersonaResult } from "@/lib/types";

function buildPrompt(input: PersonaInput): string {
  const platformLabel: Record<string, string> = {
    youtube: "YouTube Shorts", tiktok: "TikTok",
    instagram: "Instagram Reels", multi: "멀티플랫폼",
  };
  const categoryLabel: Record<string, string> = {
    food: "요리/먹방", beauty: "뷰티/패션", lifestyle: "라이프스타일/일상",
    edu: "정보/자기계발", gaming: "게임/엔터테인먼트", fitness: "운동/건강",
  };
  const goalLabel: Record<string, string> = {
    growth: "구독자/팔로워 증가", monetize: "수익화 시작",
    brand: "브랜드 인지도 구축", community: "팬덤/커뮤니티",
  };
  const expLabel = ["채널 없음", "1개월 미만", "1~6개월", "6개월~1년", "1~3년", "3년 이상"];
  const painLabel: Record<string, string> = {
    idea: "아이디어가 안 떠올라요", trend: "트렌드를 어떻게 써야 할지 모르겠어요",
    reach: "영상을 만들어도 반응이 없어요", consistency: "꾸준히 못하겠어요",
  };

  return `당신은 숏폼 크리에이터 전략 전문가입니다.
아래 크리에이터의 설문 응답을 분석해 페르소나와 맞춤 전략을 제공하세요.

[설문 응답]
- 플랫폼: ${platformLabel[input.platform] ?? input.platform}
- 카테고리: ${categoryLabel[input.category] ?? input.category}
- 경력: ${expLabel[input.experience] ?? input.experience}
- 목표: ${goalLabel[input.goal] ?? input.goal}
- 콘텐츠 스타일: ${input.styles.join(", ")}
- 가장 큰 고민: ${painLabel[input.pain] ?? input.pain}
- 주당 목표 업로드: ${input.uploadFreq}편

다음 JSON 스키마로만 응답하세요. 마크다운 코드블록 및 설명 텍스트 금지, 순수 JSON만:
{
  "personaType": "영문 대문자 2~3단어 (예: THE TRENDSETTER)",
  "personaTagline": "20자 이내 한국어 한 줄 태그라인",
  "personaSummary": "이 크리에이터의 강점과 특성을 2~3문장으로",
  "topTrends": [
    { "keyword": "#해시태그", "state": "rising|peak|fading", "fitScore": 0~100, "reason": "이 트렌드가 이 채널에 맞는 이유 한 문장" },
    { "keyword": "#해시태그", "state": "rising|peak|fading", "fitScore": 0~100, "reason": "한 문장" },
    { "keyword": "#해시태그", "state": "rising|peak|fading", "fitScore": 0~100, "reason": "한 문장" }
  ],
  "hookPatterns": [
    { "type": "훅 유형명 (예: 질문형)", "example": "실제 영상 첫 3초에 쓸 수 있는 예시 문장" },
    { "type": "훅 유형명", "example": "예시 문장" }
  ],
  "actionItems": [
    { "title": "액션 제목", "desc": "구체적인 실행 방법 1~2문장" },
    { "title": "액션 제목", "desc": "1~2문장" },
    { "title": "액션 제목", "desc": "1~2문장" }
  ],
  "weeklyPlan": "이번 주 구체적인 주제를 포함한 콘텐츠 계획 2~3문장",
  "typeIndex": 0~3 사이 정수
}`;
}

function parseResult(raw: string): PersonaResult {
  const cleaned = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/, "")
    .replace(/```\s*$/, "")
    .trim();
  const start = cleaned.indexOf("{");
  return JSON.parse(cleaned.slice(start));
}

function buildFallback(input: PersonaInput): PersonaResult {
  return {
    personaType: "THE RISING CREATOR",
    personaTagline: "나만의 콘텐츠를 찾아가는 중",
    personaSummary: "아직 자신만의 스타일을 정립하는 단계입니다. 꾸준한 업로드와 트렌드 분석으로 성장 가능성이 높습니다.",
    topTrends: [
      { keyword: `#${input.category}`, state: "rising", fitScore: 75, reason: "내 카테고리의 핵심 트렌드입니다." },
      { keyword: "#숏폼챌린지", state: "peak", fitScore: 60, reason: "높은 참여율을 보이는 포맷입니다." },
      { keyword: "#일상브이로그", state: "rising", fitScore: 55, reason: "초보 크리에이터에게 진입장벽이 낮습니다." },
    ],
    hookPatterns: [
      { type: "질문형", example: "혹시 이거 알고 계셨나요?" },
      { type: "공감형", example: "저도 처음엔 이게 제일 힘들었어요." },
    ],
    actionItems: [
      { title: "오늘 바로 첫 영상 올리기", desc: "완벽하지 않아도 괜찮습니다. 일단 올리는 것이 시작입니다." },
      { title: "트렌드 3개 저장하기", desc: "오늘 대시보드에서 내 카테고리 트렌드 3개를 북마크하세요." },
      { title: "같은 카테고리 채널 5개 분석", desc: "잘 되는 채널의 후크 패턴을 메모해두세요." },
    ],
    weeklyPlan: `이번 주는 ${input.category} 카테고리의 트렌딩 콘텐츠를 참고해 ${input.uploadFreq}편 업로드를 목표로 합니다. 첫 영상은 가장 쉬운 포맷으로 시작하세요.`,
    typeIndex: 0,
  };
}

export async function POST(req: Request) {
  const input: PersonaInput = await req.json();

  try {
    const { text } = await generateText({
      model: anthropic("claude-sonnet-4.5"),
      prompt: buildPrompt(input),
      maxOutputTokens: 1024,
    });

    const result = parseResult(text);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(buildFallback(input));
  }
}
