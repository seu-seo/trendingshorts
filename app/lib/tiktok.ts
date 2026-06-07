import type { Trend } from './types';
import { deriveHeatLevel, mapCategory, PLATFORM_LABEL } from './utils';

const HANGUL_RE = /[가-힣]/;

const HASHTAGS = [
  '먹방', '뷰티', '댄스', '게임', '운동',
  '브이로그', '요리', '패션', '여행', '일상',
  '반려동물', '유머', 'asmr', 'diy', '음악',
];

const HASHTAG_CATEGORY: Record<string, string> = {
  // 음식
  '먹방': '먹방', '요리': '먹방', '레시피': '먹방', '맛집': '먹방', '먹스타그램': '먹방',
  '쿠킹': '먹방', '홈쿡': '먹방', '밥': '먹방', '음식': '먹방', '식당': '먹방',
  // 뷰티
  '뷰티': '뷰티', '패션': '뷰티', '메이크업': '뷰티', '스킨케어': '뷰티', '코디': '뷰티',
  '화장': '뷰티', '피부': '뷰티', '룩북': '뷰티', 'ootd': '뷰티', '옷': '뷰티',
  // 운동/피트니스
  '운동': '운동', '헬스': '운동', '다이어트': '운동', '홈트': '운동', '필라테스': '운동',
  '요가': '운동', '힙': '운동', '근육': '운동', '식단': '운동', '체력': '운동',
  'workout': '운동', '피트니스': '운동', '하체': '운동', '복근': '운동',
  // 게임
  '게임': '게임', '롤': '게임', '배그': '게임', '마인크래프트': '게임', '오버워치': '게임',
  // 음악/댄스
  '음악': '음악', '댄스': '댄스', '춤': '댄스', '커버댄스': '댄스', '안무': '댄스',
  // 라이프스타일
  '브이로그': '일상 브이로그', '일상': '일상 브이로그', '반려동물': '펫', '강아지': '펫',
  '고양이': '펫', '유머': '유머', '개그': '유머', '여행': '여행', '해외': '여행',
  'asmr': 'ASMR', 'diy': 'DIY',
};

const THUMBNAIL_MAP: Record<string, string> = {
  '먹방': '🍽️', '뷰티': '💄', '댄스': '🎭', '게임': '🎮', '운동': '🏃',
  '일상 브이로그': '☀️', '음악': '🎵', '펫': '🐾', '유머': '😂',
  'ASMR': '🎧', 'DIY': '🔨', '여행': '✈️',
};

interface TikTokPost {
  id: string;
  text?: string;
  createTimeISO: string;
  isAd?: boolean;
  isSponsored?: boolean;
  playCount: number;
  diggCount: number;
  commentCount: number;
  shareCount: number;
  hashtags?: { name: string }[];
  authorMeta?: { name?: string };
  videoMeta?: { duration?: number };
  webVideoUrl: string;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1) return '방금 전';
  if (hours < 24) return `${hours}시간 전`;
  return `${Math.floor(hours / 24)}일 전`;
}

function formatDuration(seconds?: number): string {
  if (!seconds) return '0:30';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function krCategoryFromHashtags(tags: string[]): string {
  for (const [kw, cat] of Object.entries(HASHTAG_CATEGORY)) {
    if (tags.some((t) => t.includes(kw))) return cat;
  }
  return '일상 브이로그';
}

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

function processPosts(posts: TikTokPost[]): Trend[] {
  const seen = new Set<string>();
  const results: Trend[] = [];
  const cutoff = Date.now() - THIRTY_DAYS_MS;
  for (const post of posts) {
    if (post.isAd || post.isSponsored) continue;
    if (seen.has(post.id)) continue;
    if (new Date(post.createTimeISO).getTime() < cutoff) continue;
    seen.add(post.id);
    const tagNames = (post.hashtags ?? []).map((h) => h.name);
    const krCategory = krCategoryFromHashtags(tagNames);
    const views = post.playCount ?? 0;
    const likes = post.diggCount ?? 0;
    const comments = post.commentCount ?? 0;
    const engagementRate = views >= 1000
      ? parseFloat(((likes + comments) / views * 100).toFixed(2))
      : 0;
    results.push({
      id: results.length + 1,
      platform: 'tiktok' as const,
      platformLabel: PLATFORM_LABEL.tiktok,
      category: mapCategory(krCategory),
      heatLevel: deriveHeatLevel(engagementRate),
      title: (post.text ?? '').replace(/\n/g, ' ').trim().slice(0, 60) || 'TikTok',
      creator: `@${post.authorMeta?.name ?? 'unknown'}`,
      views,
      likes,
      comments,
      shares: post.shareCount ?? 0,
      engagementRate,
      duration: formatDuration(post.videoMeta?.duration),
      thumb: THUMBNAIL_MAP[krCategory] ?? '♪',
      time: timeAgo(post.createTimeISO),
      hashtags: tagNames.map((t) => `#${t}`).slice(0, 4).join(' ') || '#틱톡',
      videoUrl: post.webVideoUrl,
    });
  }
  return results;
}

// DISABLE_APIFY=true 시 스냅샷 JSON을 fallback으로 사용
export async function fetchTikTokFromSnapshot(): Promise<Trend[]> {
  try {
    const raw = (await import('./data/tiktok-snapshot.json')).default as unknown as TikTokPost[];
    return processPosts(raw);
  } catch {
    return [];
  }
}

export async function fetchTikTokTrends(): Promise<Trend[]> {
  const API_TOKEN = process.env.APIFY_API_TOKEN;
  if (!API_TOKEN) return [];
  const url = `https://api.apify.com/v2/acts/clockworks~free-tiktok-scraper/run-sync-get-dataset-items?token=${API_TOKEN}&memory=256`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hashtags: HASHTAGS, resultsPerPage: 6, shouldDownloadVideos: false, shouldDownloadCovers: false }),
      next: { revalidate: 86400 },
    });
    if (!res.ok) return [];
    return processPosts(await res.json());
  } catch {
    return [];
  }
}
