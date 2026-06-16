import type { Trend } from './types';
import { deriveHeatLevel, mapCategory, PLATFORM_LABEL } from './utils';

const HANGUL_RE = /[가-힣]/;

const HASHTAG_URLS = [
  'https://www.instagram.com/explore/tags/쇼츠/',
  'https://www.instagram.com/explore/tags/먹방/',
  'https://www.instagram.com/explore/tags/뷰티/',
  'https://www.instagram.com/explore/tags/브이로그/',
  'https://www.instagram.com/explore/tags/게임/',
  'https://www.instagram.com/explore/tags/운동/',
  'https://www.instagram.com/explore/tags/패션/',
  'https://www.instagram.com/explore/tags/여행/',
  'https://www.instagram.com/explore/tags/요리/',
  'https://www.instagram.com/explore/tags/댄스/',
  'https://www.instagram.com/explore/tags/반려동물/',
  'https://www.instagram.com/explore/tags/유머/',
  'https://www.instagram.com/explore/tags/asmr/',
  'https://www.instagram.com/explore/tags/diy/',
  'https://www.instagram.com/explore/tags/음악/',
];

const HASHTAG_CATEGORY: Record<string, string> = {
  // 음식
  '먹방': '먹방', '요리': '먹방', '레시피': '먹방', '맛집': '먹방', '쿠킹': '먹방',
  '홈쿡': '먹방', '밥': '먹방', '음식': '먹방', '먹스타그램': '먹방',
  // 뷰티
  '뷰티': '뷰티', '패션': '뷰티', '메이크업': '뷰티', '스킨케어': '뷰티', '코디': '뷰티',
  '화장': '뷰티', '피부': '뷰티', '룩북': '뷰티', 'ootd': '뷰티', '옷': '뷰티',
  // 운동/피트니스
  '운동': '운동', '헬스': '운동', '다이어트': '운동', '홈트': '운동', '필라테스': '운동',
  '요가': '운동', '힙업': '운동', '근육': '운동', '식단': '운동', 'workout': '운동',
  '피트니스': '운동', '하체': '운동',
  // 게임
  '게임': '게임',
  // 음악/댄스
  '음악': '음악', '댄스': '댄스', '춤': '댄스', '커버댄스': '댄스', '안무': '댄스',
  // 라이프스타일
  '쇼츠': '일상 브이로그', '브이로그': '일상 브이로그', '일상': '일상 브이로그',
  '반려동물': '펫', '강아지': '펫', '고양이': '펫',
  '유머': '유머', '여행': '여행', '해외': '여행', 'asmr': 'ASMR', 'diy': 'DIY',
};

const THUMBNAIL_MAP: Record<string, string> = {
  '먹방': '🍽️', '뷰티': '💄', '댄스': '🎭', '게임': '🎮', '운동': '🏃',
  '일상 브이로그': '☀️', '음악': '🎵', '펫': '🐾', '유머': '😂',
  'ASMR': '🎧', 'DIY': '🔨', '여행': '✈️',
};

interface ApifyPost {
  id: string;
  type: string;
  caption?: string;
  commentsCount: number;
  likesCount: number;
  videoViewCount?: number;
  videoPlayCount?: number;
  igPlayCount?: number;
  timestamp: string;
  url: string;
  ownerUsername: string;
  hashtags?: string[];
  displayUrl?: string;
}

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1) return '방금 전';
  if (hours < 24) return `${hours}시간 전`;
  return `${Math.floor(hours / 24)}일 전`;
}

function krCategoryFromHashtags(tags: string[]): string {
  for (const [kw, cat] of Object.entries(HASHTAG_CATEGORY)) {
    if (tags.some((t) => t.includes(kw))) return cat;
  }
  return '일상 브이로그';
}

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

function processPosts(posts: ApifyPost[], skipExpiry = false): Trend[] {
  const seen = new Set<string>();
  const results: Trend[] = [];
  const cutoff = Date.now() - THIRTY_DAYS_MS;
  for (const post of posts) {
    if (post.type !== 'Video') continue;
    if ((post.hashtags ?? []).some((t) => ['광고', 'ad', 'sponsored'].includes(t))) continue;
    if (/광고|협찬|유료광고|제품제공|PR\b/i.test(post.caption || '')) continue;
    if (seen.has(post.id)) continue;
    if (!skipExpiry && new Date(post.timestamp).getTime() < cutoff) continue;
    seen.add(post.id);
    const views = post.videoViewCount ?? post.igPlayCount ?? post.videoPlayCount ?? 0;
    const likes = post.likesCount ?? 0;
    const comments = post.commentsCount ?? 0;
    const engagementRate = views >= 1000
      ? parseFloat(((likes + comments) / views * 100).toFixed(2))
      : 0;
    const tags = post.hashtags ?? [];
    const krCategory = krCategoryFromHashtags(tags);
    results.push({
      id: results.length + 1,
      platform: 'instagram' as const,
      platformLabel: PLATFORM_LABEL.instagram,
      category: mapCategory(krCategory),
      heatLevel: deriveHeatLevel(engagementRate),
      title: (post.caption ?? '').replace(/\n/g, ' ').trim().slice(0, 60) || 'Instagram Reel',
      creator: `@${post.ownerUsername}`,
      views,
      likes,
      comments,
      shares: 0,
      engagementRate,
      duration: '0:30',
      thumb: post.displayUrl || THUMBNAIL_MAP[krCategory] || '📱',
      time: timeAgo(post.timestamp),
      hashtags: tags.map((t) => `#${t}`).slice(0, 4).join(' ') || '#릴스',
      videoUrl: post.url,
    });
  }
  return results;
}

export async function fetchInstagramFromSnapshot(): Promise<Trend[]> {
  try {
    const raw = (await import('./data/instagram-snapshot.json')).default as unknown as ApifyPost[];
    return processPosts(raw, true); // 스냅샷은 날짜 만료 없이 처리
  } catch {
    return [];
  }
}

export async function fetchInstagramTrends(): Promise<Trend[]> {
  const API_TOKEN = process.env.APIFY_API_TOKEN;
  if (!API_TOKEN) return [];

  const url = `https://api.apify.com/v2/acts/apify~instagram-scraper/run-sync-get-dataset-items?token=${API_TOKEN}&memory=256`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ directUrls: HASHTAG_URLS, resultsType: 'reels', resultsLimit: 12 }),
      next: { revalidate: 86400 },
    });

    if (!res.ok) return [];

    return processPosts(await res.json());
  } catch {
    return [];
  }
}
