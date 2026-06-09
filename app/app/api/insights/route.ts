import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';

export interface HashtagScore {
  tag: string;
  score: number;
}

export interface InsightsRequest {
  category: string;
  titles: string[];
  hashtags: string[];
  hashtagScores?: HashtagScore[];
}

export interface KeywordItem {
  text: string;
  type: 'hot' | 'rising' | '';
}

export interface InsightsResponse {
  keywords: KeywordItem[];
  bullets: string[];
  source: 'live' | 'mock';
}

function buildPrompt(category: string, titles: string[], hashtags: string[], hashtagScores?: HashtagScore[]): string {
  const titleSample = titles.slice(0, 10).join('\n');

  const hashtagSection = hashtagScores && hashtagScores.length > 0
    ? `[해시태그 점수 — 빈도×평균반응률, 높을수록 실제 반응이 좋은 태그]\n${hashtagScores.slice(0, 20).map((h) => `${h.tag} (${h.score.toFixed(1)})`).join(', ')}`
    : `[주요 해시태그]\n${[...new Set(hashtags)].slice(0, 30).join(' ')}`;

  return `당신은 숏폼 트렌드 분석 전문가입니다.

[카테고리] ${category}
[이번 주 인기 영상 제목]
${titleSample}

${hashtagSection}

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
  "bullets": [
    "수치로 시작하는 충격적인 첫 번째 인사이트 — 크리에이터가 바로 쓸 수 있는 액션 포인트",
    "트렌드 패턴을 짚는 두 번째 인사이트 — 지금 해야 하는 이유",
    "놓치면 손해인 세 번째 팁 — 구체적인 실행 방법"
  ]
}

- keywords: 6개. 해시태그 점수가 있으면 상위 점수 태그를 hot으로, 중간을 rising으로 선정. type은 hot(1~2위), rising(3~4위), ''(나머지)
- bullets: 2~3개, 각 항목은 구체적 수치/사실로 시작해 후킹하게, 한국어`;
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
      bullets: [
        '#루틴 2주 연속 상위권 — 미라클모닝·저녁 루틴 즉시 제작 권장',
        '챌린지 시리즈 완주율 1.8배 — 구독자 락인 최적 포맷',
        '자취 + 자기계발 조합 — 20대 알고리즘 공략 공식',
      ],
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
      bullets: [
        'Before-After 포맷 조회수 3.1배 — 변화 비교 영상 즉시 촬영 권장',
        '#글로우메이크업 3주 연속 급등 — 여름 시즌 최대 기회',
        '5분 이내 튜토리얼 완주율 67% — 긴 영상 대비 압도적 우위',
      ],
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
      bullets: [
        '30초 이내 레시피 조회수 2.3배 — 속도 압축이 핵심',
        '직장인 타깃 5분 요리 — 현재 최대 블루오션',
        '편의점 신상 조합 리뷰 — 24시간 내 바이럴 확률 1위 포맷',
      ],
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
    bullets: [
      '첫 3초 훅 강화 시 이탈률 40% 감소 — 오프닝 문장이 핵심',
      `${category} 카테고리 — 짧고 임팩트 있는 콘텐츠가 알고리즘 상위 독점`,
      '일정한 업로드 주기 — 불규칙 채널 대비 노출 2.1배 우위',
    ],
    source: 'mock',
  };
}

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
interface CacheEntry { data: InsightsResponse; fetchedAt: number }
const insightCache = new Map<string, CacheEntry>();

export async function POST(req: Request) {
  const body: InsightsRequest = await req.json();
  const { category, titles, hashtags, hashtagScores } = body;

  // 서버 캐시: 카테고리별 24시간
  const cached = insightCache.get(category);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return NextResponse.json(cached.data);
  }

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY || titles.length === 0) {
    return NextResponse.json(buildFallback(category));
  }

  try {
    const { text } = await generateText({
      model: google('gemini-2.5-flash'),
      prompt: buildPrompt(category, titles, hashtags, hashtagScores),
    });
    const cleaned = text.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/```\s*$/, '').trim();
    const parsed = JSON.parse(cleaned.slice(cleaned.indexOf('{'))) as Omit<InsightsResponse, 'source'>;
    const result: InsightsResponse = { ...parsed, source: 'live' };
    insightCache.set(category, { data: result, fetchedAt: Date.now() });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(buildFallback(category));
  }
}
