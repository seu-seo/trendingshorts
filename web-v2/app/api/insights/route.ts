import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';

export interface InsightsRequest {
  category: string;
  titles: string[];
  hashtags: string[];
}

export interface KeywordItem {
  text: string;
  type: 'hot' | 'rising' | '';
}

export interface InsightsResponse {
  keywords: KeywordItem[];
  insight: string;
  source: 'live' | 'mock';
}

function buildPrompt(category: string, titles: string[], hashtags: string[]): string {
  const tagCloud = [...new Set(hashtags)].slice(0, 30).join(' ');
  const titleSample = titles.slice(0, 10).join('\n');
  return `당신은 숏폼 트렌드 분석 전문가입니다.

[카테고리] ${category}
[이번 주 인기 영상 제목]
${titleSample}

[주요 해시태그]
${tagCloud}

위 데이터를 분석해 다음 JSON 형식으로만 응답하세요. 마크다운 코드블록 없이 순수 JSON만:
{
  "keywords": [
    {"text": "#키워드", "type": "hot"},
    {"text": "#키워드", "type": "rising"},
    {"text": "#키워드", "type": ""},
    {"text": "#키워드", "type": "hot"},
    {"text": "#키워드", "type": "rising"},
    {"text": "#키워드", "type": ""}
  ],
  "insight": "이번 주 트렌드 핵심 인사이트를 2문장으로 (한국어, 구체적 수치 포함)"
}

- keywords: 6개, type은 hot(1~2위 급상승), rising(상승 중), ''(보통)
- insight: 크리에이터가 바로 활용할 수 있는 구체적 포인트`;
}

function buildFallback(category: string): InsightsResponse {
  const FALLBACK: Record<string, InsightsResponse> = {
    lifestyle: {
      keywords: [
        { text: '#미라클모닝', type: 'hot' },
        { text: '#루틴', type: 'hot' },
        { text: '#자취일상', type: 'rising' },
        { text: '#자기계발', type: 'rising' },
        { text: '#습관만들기', type: '' },
        { text: '#브이로그', type: '' },
      ],
      insight: '"루틴" 키워드가 2주 연속 상위권. 미라클 모닝과 저녁 루틴 콘텐츠가 강세이며, 한 달 챌린지 형식 영상의 완주율이 평균 대비 1.8배 높습니다.',
      source: 'mock',
    },
    beauty: {
      keywords: [
        { text: '#글로우메이크업', type: 'hot' },
        { text: '#5분메이크업', type: 'hot' },
        { text: '#톤업', type: 'rising' },
        { text: '#피부결', type: 'rising' },
        { text: '#여름메이크업', type: '' },
        { text: '#쿨톤', type: '' },
      ],
      insight: '여름 시즌 진입과 함께 "글로우/물광 피부" 관련 콘텐츠가 급상승. Before-After 변화를 보여주는 영상 포맷이 평균 조회수 3.1배 높습니다.',
      source: 'mock',
    },
    food: {
      keywords: [
        { text: '#마라탕', type: 'hot' },
        { text: '#홈쿠킹', type: 'rising' },
        { text: '#밀프렙', type: 'rising' },
        { text: '#5분레시피', type: '' },
        { text: '#한식', type: '' },
        { text: '#편의점', type: '' },
      ],
      insight: '"혼자 빠르게 만들 수 있는 요리"가 폭발적으로 상승 중. 직장인 타깃 콘텐츠가 강세이고, 30초 내외 영상이 평균 조회수 2.3배 더 높습니다.',
      source: 'mock',
    },
  };
  return FALLBACK[category] ?? {
    keywords: [
      { text: `#${category}`, type: 'hot' },
      { text: '#숏폼챌린지', type: 'rising' },
      { text: '#트렌드', type: '' },
      { text: '#크리에이터', type: '' },
      { text: '#일상', type: '' },
      { text: '#viral', type: '' },
    ],
    insight: `${category} 카테고리에서 짧고 임팩트 있는 콘텐츠가 강세입니다. 첫 3초 훅을 강화하면 이탈률을 크게 낮출 수 있습니다.`,
    source: 'mock',
  };
}

export async function POST(req: Request) {
  const body: InsightsRequest = await req.json();
  const { category, titles, hashtags } = body;

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY || titles.length === 0) {
    return NextResponse.json(buildFallback(category));
  }

  try {
    const { text } = await generateText({
      model: google('gemini-2.5-flash'),
      prompt: buildPrompt(category, titles, hashtags),
    });
    const cleaned = text.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/```\s*$/, '').trim();
    const parsed = JSON.parse(cleaned.slice(cleaned.indexOf('{'))) as Omit<InsightsResponse, 'source'>;
    return NextResponse.json({ ...parsed, source: 'live' } satisfies InsightsResponse);
  } catch {
    return NextResponse.json(buildFallback(category));
  }
}
