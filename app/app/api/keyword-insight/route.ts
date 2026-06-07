import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';

export interface KeywordEntry {
  tag: string;
  score: number;
}

export interface KeywordInsightResponse {
  keywords: KeywordEntry[];
  source: 'live' | 'mock';
}

interface TrendInput {
  title: string;
  hashtags: string;
  engagementRate: number;
}

function buildPrompt(titles: string[], hashtags: string[], category: string | null): string {
  const catLabel = category ?? '전체';
  const titlesText = titles.slice(0, 20).map((t, i) => `${i + 1}. ${t}`).join('\n');
  const tagsText = [...new Set(hashtags)].slice(0, 60).join(' ');

  return `당신은 한국 숏폼 콘텐츠 트렌드 분석 전문가입니다.

아래 '${catLabel}' 카테고리 숏폼 콘텐츠의 제목들과 해시태그에서 핵심 트렌드 키워드를 추출하세요.

[제목]
${titlesText}

[해시태그]
${tagsText}

추출 규칙:
- 명사 위주 추출 (동사, 형용사, 조사, 접속사 제외)
- 장르/카테고리 일반명(먹방·뷰티·게임·운동 등)보다 구체적인 키워드 우선
- 여러 콘텐츠에 반복 등장하며 참여도가 높은 키워드 상위 배치
- 해시태그는 # 포함 그대로, 제목 키워드는 # 접두어 추가
- 중복 의미 키워드 통합
- 상위 8개만 반환
- score는 1~100 사이 상대 점수 (1위=100, 이후 상대적 비율)

순수 JSON만 응답 (마크다운 없이):
{"keywords":[{"tag":"#키워드","score":100},{"tag":"#키워드2","score":72}]}`;
}

// ── local fallback (Gemini 불가 시) ──────────────────────────────────────────

const STOP_TAGS = new Set([
  '#먹방', '#뷰티', '#댄스', '#게임', '#운동', '#브이로그', '#요리', '#패션',
  '#여행', '#일상', '#반려동물', '#유머', '#asmr', '#diy', '#음악', '#쇼츠',
  '#shorts', '#릴스', '#틱톡', '#reels', '#youtube', '#viral', '#trending',
]);
const STOP_WORDS = new Set([
  '이', '그', '저', '것', '수', '있', '없', '하다', '되다', '이다',
  '했', '하는', '한', '해', '더', '도', '를', '은', '는', '가',
  '에', '의', '로', '에서', '와', '과', '으로', '으로서', '까지', '부터',
  '때', '때문', '위해', '위한', '통해', '통한', '대한', '관한',
  'the', 'a', 'an', 'and', 'or', 'of', 'in', 'on', 'at', 'to', 'for',
  '하기', '하고', '해서', '해도', '해야', '하면', '하지', '합니다', '했다',
]);

function buildFallback(trends: TrendInput[]): KeywordInsightResponse {
  const map = new Map<string, { count: number; totalER: number }>();

  for (const trend of trends) {
    const er = trend.engagementRate;
    for (const tag of trend.hashtags.split(' ').filter(Boolean)) {
      const key = tag.toLowerCase();
      if (STOP_TAGS.has(key)) continue;
      const clean = key.startsWith('#') ? key : `#${key}`;
      const prev = map.get(clean) ?? { count: 0, totalER: 0 };
      map.set(clean, { count: prev.count + 1, totalER: prev.totalER + er });
    }
    const tokens = trend.title
      .replace(/[^가-힣a-zA-Z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length >= 2 && !STOP_WORDS.has(w.toLowerCase()));
    for (const word of tokens) {
      const key = `#${word}`;
      if (STOP_TAGS.has(word.toLowerCase())) continue;
      const prev = map.get(key) ?? { count: 0, totalER: 0 };
      map.set(key, { count: prev.count + 1, totalER: prev.totalER + er * 0.6 });
    }
  }

  const sorted = [...map.entries()]
    .map(([tag, { count, totalER }]) => ({ tag, raw: count * (totalER / count) }))
    .sort((a, b) => b.raw - a.raw)
    .slice(0, 8);

  const maxRaw = sorted[0]?.raw ?? 1;
  const keywords = sorted.map(k => ({
    tag: k.tag,
    score: parseFloat(((k.raw / maxRaw) * 100).toFixed(1)),
  }));

  return { keywords, source: 'mock' };
}

// ── cache ─────────────────────────────────────────────────────────────────────

const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
interface CacheEntry { data: KeywordInsightResponse; fetchedAt: number }
const cache = new Map<string, CacheEntry>();

export async function POST(req: Request) {
  const body = await req.json() as {
    titles: string[];
    hashtags: string[];
    trends: TrendInput[];
    category: string | null;
  };
  const { titles, hashtags, trends, category } = body;

  const cacheKey = `${category ?? 'all'}:${titles.slice(0, 5).join('|')}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return NextResponse.json(cached.data);
  }

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return NextResponse.json(buildFallback(trends));
  }

  try {
    const { text } = await generateText({
      model: google('gemini-2.5-flash'),
      prompt: buildPrompt(titles, hashtags, category),
    });
    const cleaned = text.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/```\s*$/, '').trim();
    const parsed = JSON.parse(cleaned.slice(cleaned.indexOf('{'))) as { keywords: KeywordEntry[] };
    const result: KeywordInsightResponse = { keywords: parsed.keywords.slice(0, 8), source: 'live' };
    cache.set(cacheKey, { data: result, fetchedAt: Date.now() });
    return NextResponse.json(result);
  } catch (err) {
    console.error('[keyword-insight] failed:', (err as Error).message?.slice(0, 120));
    return NextResponse.json(buildFallback(trends)); // fallback은 캐시하지 않음 — 다음 요청에서 재시도
  }
}
