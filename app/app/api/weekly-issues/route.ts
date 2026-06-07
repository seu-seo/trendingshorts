import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';

export interface WeeklyIssuesRequest {
  category: string;
}

export interface WeeklyIssue {
  title: string;
  summary: string;
  angle: string;
}

export interface WeeklyIssuesResponse {
  issues: WeeklyIssue[];
  source: 'live' | 'mock';
}

const CATEGORY_KR: Record<string, string> = {
  food: '요리/먹방',
  beauty: '뷰티/패션',
  lifestyle: '라이프스타일',
  edu: '정보/자기계발',
  gaming: '게임/엔터',
  fitness: '운동/건강',
  art: '예술/음악',
};

function buildPrompt(category: string): string {
  const catLabel = CATEGORY_KR[category] ?? category;
  const now = new Date();
  const weekStr = `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${Math.ceil(now.getDate() / 7)}주차`;

  return `당신은 한국 숏폼 트렌드 분석 전문가입니다.

Google 검색을 통해 이번 주(${weekStr}) 한국에서 '${catLabel}' 카테고리와 관련하여
숏폼 콘텐츠(YouTube Shorts, TikTok, Instagram Reels)에서 화제가 되고 있는 주요 이슈 3가지를 파악하고
다음 JSON 형식으로만 응답하세요. 마크다운 코드블록 없이 순수 JSON만:

{
  "issues": [
    {
      "title": "이슈 제목 (15자 이내, 한국어)",
      "summary": "이슈 내용 요약 (40자 이내, 한국어)",
      "angle": "크리에이터 활용 각도 (30자 이내, 예: '비교 영상으로 빠른 조회수')"
    },
    { "title": "...", "summary": "...", "angle": "..." },
    { "title": "...", "summary": "...", "angle": "..." }
  ]
}

- 반드시 이번 주 실제 트렌딩 이슈 기반
- 크리에이터가 영상 소재로 바로 쓸 수 있는 구체적 내용
- JSON 외 다른 텍스트 절대 포함 금지`;
}

function buildFallback(category: string): WeeklyIssuesResponse {
  const catLabel = CATEGORY_KR[category] ?? category;
  return {
    issues: [
      { title: `${catLabel} 트렌드 분석`, summary: 'AI 검색 비활성화 상태입니다', angle: 'Google API 키를 설정하세요' },
    ],
    source: 'mock',
  };
}

const CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12시간 (이슈는 더 자주 갱신)
interface CacheEntry { data: WeeklyIssuesResponse; fetchedAt: number }
const issuesCache = new Map<string, CacheEntry>();

export async function POST(req: Request) {
  const body: WeeklyIssuesRequest = await req.json();
  const { category } = body;

  const cached = issuesCache.get(category);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return NextResponse.json(cached.data);
  }

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return NextResponse.json(buildFallback(category));
  }

  try {
    const { text } = await generateText({
      model: google('gemini-2.5-flash'),
      tools: { googleSearch: google.tools.googleSearch({}) },
      prompt: buildPrompt(category),
    });
    const cleaned = text.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/```\s*$/, '').trim();
    const parsed = JSON.parse(cleaned.slice(cleaned.indexOf('{'))) as Pick<WeeklyIssuesResponse, 'issues'>;
    const result: WeeklyIssuesResponse = { ...parsed, source: 'live' };
    issuesCache.set(category, { data: result, fetchedAt: Date.now() });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(buildFallback(category));
  }
}
