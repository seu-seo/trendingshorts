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

function buildPrompt(category: string, trendTitles?: string[]): string {
  const catLabel = CATEGORY_KR[category] ?? category;
  const now = new Date();
  const weekStr = `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${Math.ceil(now.getDate() / 7)}주차`;
  const trendContext = trendTitles?.length
    ? `\n\n현재 플랫폼에서 높은 조회수를 기록 중인 콘텐츠 제목들:\n${trendTitles.slice(0, 10).map((t, i) => `${i + 1}. ${t}`).join('\n')}`
    : '';

  return `당신은 한국 숏폼 콘텐츠 트렌드 분석 전문가입니다.

이번 주(${weekStr}) 한국에서 '${catLabel}' 카테고리와 관련하여 YouTube Shorts, TikTok, Instagram Reels에서
크리에이터들이 주목해야 할 트렌드 이슈 3가지를 분석하세요.${trendContext}

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

- 크리에이터가 영상 소재로 바로 쓸 수 있는 구체적이고 실용적인 내용
- 현재 한국 숏폼 플랫폼 트렌드 반영
- JSON 외 다른 텍스트 절대 포함 금지`;
}

const STATIC_ISSUES: Record<string, WeeklyIssue[]> = {
  food:      [{ title: '초간단 혼밥 레시피', summary: '1인 가구 증가로 간편 혼밥 콘텐츠 급상승', angle: '5분 완성 레시피로 차별화' }, { title: '편의점 조합법', summary: '편의점 식재료 고급 요리 변신 트렌드', angle: '비포/애프터 포맷으로 제작' }, { title: '집밥 자랑하기', summary: '외식 물가 상승으로 집밥 콘텐츠 인기', angle: '레시피 공개 + 비용 비교 각도' }],
  beauty:    [{ title: '유리알 피부 루틴', summary: '초간단 스킨케어 루틴 영상 폭발 조회수', angle: '3단계 루틴으로 Before/After 촬영' }, { title: '향수 레이어링', summary: '두 가지 향수 혼합 트렌드 Z세대 주도', angle: '조합별 반응 비교 시리즈화' }, { title: '올리브영 추천템', summary: '가성비 K-뷰티 제품 리뷰 수요 폭증', angle: '1만원대 이하 추천 포맷 인기' }],
  lifestyle: [{ title: '짠테크 루틴', summary: '고물가 시대 절약 라이프스타일 급부상', angle: '한 달 지출 절감 챌린지 포맷' }, { title: '미라클모닝 후기', summary: '새벽 루틴 콘텐츠 꾸준히 높은 참여율', angle: '30일 챌린지 형식으로 시리즈화' }, { title: '홈카페 꾸미기', summary: '카페 비용 절약 + 공간 인테리어 관심↑', angle: '재료비 공개하며 DIY 과정 공유' }],
  edu:       [{ title: '30초 핵심 요약', summary: '긴 내용 초압축 요약 포맷 조회수 급증', angle: '책/영상/뉴스 1분 요약 시리즈' }, { title: 'AI 활용법', summary: 'ChatGPT·Gemini 실전 활용 수요 지속', angle: '직업별 AI 활용 사례 비교 영상' }, { title: '부업 정보 공유', summary: 'N잡 트렌드와 부수입 콘텐츠 인기 지속', angle: '실수령액 공개 후기 포맷이 고반응' }],
  gaming:    [{ title: '1분 공략 영상', summary: '게임 팁 초압축 포맷 틱톡에서 폭발', angle: '보스 패턴 핵심만 1분 컷 제작' }, { title: '인디게임 발굴', summary: '숨은 명작 소개 콘텐츠 구독자 확보↑', angle: '리뷰 + 첫인상 리액션 조합' }, { title: '게임 OST 리뷰', summary: '게임 음악 분석 콘텐츠 팬덤 반응↑', angle: '명장면 + 음악 설명 편집' }],
  fitness:   [{ title: '5분 홈트 루틴', summary: '장비 없는 홈트 영상 신규 진입 쉬움', angle: '운동 전후 체형 변화 비교 포맷' }, { title: '헬스 식단 공개', summary: '단백질 식단 및 식단 인증 콘텐츠↑', angle: '일주일 식단 타임랩스 형식' }, { title: '스트레칭 꿀팁', summary: '직장인 허리·어깨 스트레칭 수요 높음', angle: '출근 전 5분 루틴으로 타겟 공략' }],
  art:       [{ title: '30초 드로잉', summary: '빠른 스케치 과정 영상 전 연령 인기', angle: '타임랩스 + 완성본 공개 포맷' }, { title: '커버곡 챌린지', summary: 'K-팝 커버 영상 지속적 인기 유지', angle: '원곡 비교 + 나만의 해석 포인트' }, { title: 'AI 아트 활용', summary: 'AI로 만든 이미지·영상 제작 관심↑', angle: '프롬프트 공개 + 완성 과정 편집' }],
};

function buildFallback(category: string): WeeklyIssuesResponse {
  const issues = STATIC_ISSUES[category] ?? STATIC_ISSUES['lifestyle'];
  return { issues, source: 'mock' };
}

const CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12시간 (이슈는 더 자주 갱신)
interface CacheEntry { data: WeeklyIssuesResponse; fetchedAt: number }
const issuesCache = new Map<string, CacheEntry>();

export async function POST(req: Request) {
  const body = await req.json() as WeeklyIssuesRequest & { trendTitles?: string[] };
  const { category, trendTitles } = body;

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
      prompt: buildPrompt(category, trendTitles),
    });
    const cleaned = text.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/```\s*$/, '').trim();
    const parsed = JSON.parse(cleaned.slice(cleaned.indexOf('{'))) as Pick<WeeklyIssuesResponse, 'issues'>;
    const result: WeeklyIssuesResponse = { ...parsed, source: 'live' };
    issuesCache.set(category, { data: result, fetchedAt: Date.now() });
    return NextResponse.json(result);
  } catch (err) {
    console.error('[weekly-issues] generateText failed:', (err as Error).message?.slice(0, 120));
    return NextResponse.json(buildFallback(category)); // fallback은 캐시하지 않음 — 다음 요청에서 재시도
  }
}
