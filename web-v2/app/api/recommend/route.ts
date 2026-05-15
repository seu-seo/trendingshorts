import { NextResponse } from 'next/server';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import type { Persona, PersonaResult, SurveyAnswers, Trend, RecommendConcept, RecommendResponse } from '@/lib/types';

interface RecommendRequest {
  persona: Persona | null;
  personaResult?: PersonaResult | null;
  surveyAnswers: SurveyAnswers;
  trends: Trend[];
}

const TREND_LABEL: Record<string, string> = {
  'trend-full': '트렌드 그대로 편승',
  'trend-mix': '트렌드 + 내 색깔 믹스',
  'trend-none': '내 스타일 독립적으로',
};

const ENERGY_LABEL: Record<string, string> = {
  funny: '웃기고 가볍게 (유머·공감)',
  emotional: '공감·감성 (진심·스토리)',
  informative: '실용 정보 중심',
  challenge: '새로운 시도·도전',
};

const MOCK_CONCEPTS: RecommendConcept[] = [
  {
    title: '직장인 점심 편의점 조합 — 나만의 꿀조합 공개',
    trendBasis: '이번 주 편의점 음식 조합 영상 조회수 급상승 + #편의점 해시태그 트렌딩',
    hook: '"점심값 8천원으로 이거 다 먹을 수 있어요, 진짜로"',
    keywords: ['#편의점꿀조합', '#직장인점심', '#편의점브이로그'],
    expectedReaction: '저장률 높음, 공감 댓글 폭발',
  },
  {
    title: '출근길 5분 루틴 — 3개월 해보니 달라진 것들',
    trendBasis: '라이프스타일 루틴 영상 시청 지속률 상위 + 정보형 포맷 성장률 1위',
    hook: '"이거 시작하고 나서 아침이 진짜 달라졌는데요"',
    keywords: ['#직장인루틴', '#아침루틴', '#출근준비'],
    expectedReaction: '구독 유도, 시리즈 연결 가능',
  },
  {
    title: '팔로워 0에서 1000 만드는 법 — 내가 실제로 한 것',
    trendBasis: '크리에이터 성장 스토리 포맷 TikTok·Shorts 동시 급상승',
    hook: '"처음 올린 영상 조회수 12였는데, 지금은요?"',
    keywords: ['#유튜브시작', '#팔로워늘리기', '#크리에이터일상'],
    expectedReaction: '공유 유도, 성장 스토리 공감',
  },
];

function buildPrompt(persona: Persona | null, surveyAnswers: SurveyAnswers, trends: Trend[], personaResult?: PersonaResult | null): string {
  const topTrends = trends
    .slice(0, 8)
    .map((t) => `- "${t.title}" (${t.platform}, 조회수 ${t.views?.toLocaleString() ?? '?'}, 해시태그: ${t.hashtags})`)
    .join('\n');

  const allHashtags = trends
    .slice(0, 10)
    .flatMap((t) => t.hashtags?.split(' ') ?? [])
    .filter((h) => h.startsWith('#'))
    .slice(0, 15)
    .join(' ');

  const category = persona?.category ?? '일반';
  const styles = persona?.styles?.join(', ') ?? '없음';
  const trendUsage = TREND_LABEL[surveyAnswers.trendUsage] ?? surveyAnswers.trendUsage;
  const energy = ENERGY_LABEL[surveyAnswers.energy] ?? surveyAnswers.energy;

  const personaSection = personaResult ? `
## 페르소나 분석 결과
- 유형: ${personaResult.personaType} — ${personaResult.personaTagline}
- 특성: ${personaResult.personaSummary}
- 효과적인 훅 패턴: ${personaResult.hookPatterns.map((h) => `"${h.example}"`).join(', ')}
- 이번 주 추천 키워드: ${personaResult.topTrends.map((t) => t.keyword).join(', ')}` : '';

  return `당신은 숏폼 크리에이터 영상 기획 전문가입니다.

## 크리에이터 정보
- 채널 카테고리: ${category}
- 콘텐츠 스타일: ${styles}
- 트렌드 활용도: ${trendUsage}
- 영상 에너지: ${energy}
- 타겟 오디언스: ${surveyAnswers.targetAudience}${personaSection}

## 이번 주 트렌딩 영상 TOP 8
${topTrends}

## 이번 주 인기 키워드
${allHashtags}

## 요청
위 트렌드 데이터와 크리에이터 정보를 종합해서, 이 크리에이터가 직접 만들 수 있는 **영상 컨셉 3가지**를 제안하세요.

중요: 트렌딩 영상을 소개하는 게 아니라, 이 사람이 어떤 주제와 컨셉으로 본인 영상을 만들어야 하는지를 제안하는 것입니다.
각 컨셉은 트렌드 데이터를 근거로 하되, 크리에이터의 스타일과 특징이 녹아든 독창적인 영상 아이디어여야 합니다.

JSON 배열 형식으로만 응답하세요 (다른 텍스트 없이):

[
  {
    "title": "크리에이터가 만들 영상 제목/컨셉 (25자 이내, 실제 올릴 수 있는 제목)",
    "trendBasis": "이 컨셉을 제안한 트렌드·키워드 근거 (1-2문장)",
    "hook": "영상 첫 3초 훅 대사 (실제 말할 수 있는 형식, 따옴표 포함)",
    "keywords": ["#해시태그1", "#해시태그2", "#해시태그3"],
    "expectedReaction": "예상 시청자 반응 (15자 이내)"
  }
]`;
}

export async function POST(req: Request) {
  let body: RecommendRequest;
  try {
    body = (await req.json()) as RecommendRequest;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { persona, personaResult, surveyAnswers, trends } = body;
  if (!surveyAnswers) {
    return NextResponse.json({ error: 'Missing surveyAnswers' }, { status: 400 });
  }

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    const response: RecommendResponse = { concepts: MOCK_CONCEPTS, source: 'mock' };
    return NextResponse.json(response);
  }

  try {
    const { text } = await generateText({
      model: google('gemini-2.5-flash'),
      prompt: buildPrompt(persona, surveyAnswers, trends ?? [], personaResult),
    });

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('No JSON array in response');

    const concepts = JSON.parse(jsonMatch[0]) as RecommendConcept[];
    const response: RecommendResponse = { concepts: concepts.slice(0, 3), source: 'live' };
    return NextResponse.json(response);
  } catch (e) {
    console.error('[/api/recommend]', e);
    return NextResponse.json({ concepts: MOCK_CONCEPTS, source: 'mock' } satisfies RecommendResponse);
  }
}
