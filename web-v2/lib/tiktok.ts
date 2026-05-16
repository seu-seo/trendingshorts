import type { Trend } from './types';
import { deriveLifecycle, mapCategory, PLATFORM_LABEL } from './utils';

const HANGUL_RE = /[가-힣]/;

const HASHTAGS = [
  '먹방', '뷰티', '댄스', '게임', '운동',
  '브이로그', '요리', '패션', '여행', '일상',
  '반려동물', '유머', 'asmr', 'diy', '음악',
];

const HASHTAG_CATEGORY: Record<string, string> = {
  '먹방': '먹방', '뷰티': '뷰티', '댄스': '댄스', '게임': '게임', '운동': '운동',
  '브이로그': '일상 브이로그', '요리': '먹방', '패션': '뷰티', '여행': '여행',
  '일상': '일상 브이로그', '반려동물': '펫', '유머': '유머',
  'asmr': 'ASMR', 'diy': 'DIY', '음악': '음악',
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

export async function fetchTikTokTrends(): Promise<Trend[]> {
  const API_TOKEN = process.env.APIFY_API_TOKEN;
  if (!API_TOKEN) return [];

  const url = `https://api.apify.com/v2/acts/clockworks~free-tiktok-scraper/run-sync-get-dataset-items?token=${API_TOKEN}&memory=256`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hashtags: HASHTAGS,
        resultsPerPage: 6,
        shouldDownloadVideos: false,
        shouldDownloadCovers: false,
      }),
      next: { revalidate: 86400 },
    });

    if (!res.ok) return [];

    const posts: TikTokPost[] = await res.json();
    const seen = new Set<string>();
    const results: Trend[] = [];

    for (const post of posts) {
      if (post.isAd || post.isSponsored) continue;
      if (!HANGUL_RE.test(post.text || '')) continue;
      if (seen.has(post.id)) continue;
      seen.add(post.id);

      const tagNames = (post.hashtags ?? []).map((h) => h.name);
      const krCategory = krCategoryFromHashtags(tagNames);
      const views = post.playCount ?? 0;

      results.push({
        id: results.length + 1,
        platform: 'tiktok' as const,
        platformLabel: PLATFORM_LABEL.tiktok,
        category: mapCategory(krCategory),
        lifecycle: deriveLifecycle(views > 0 ? Math.round(((post.diggCount ?? 0) + (post.commentCount ?? 0)) / views * 1000) : 0),
        title: (post.text ?? '').replace(/\n/g, ' ').trim().slice(0, 60) || 'TikTok',
        creator: `@${post.authorMeta?.name ?? 'unknown'}`,
        views,
        likes: post.diggCount ?? 0,
        comments: post.commentCount ?? 0,
        shares: post.shareCount ?? 0,
        growth: views > 0 ? Math.round(((post.diggCount ?? 0) + (post.commentCount ?? 0)) / views * 1000) : 0,
        duration: formatDuration(post.videoMeta?.duration),
        thumb: THUMBNAIL_MAP[krCategory] ?? '♪',
        time: timeAgo(post.createTimeISO),
        hashtags: tagNames.map((t) => `#${t}`).slice(0, 4).join(' ') || '#틱톡',
        videoUrl: post.webVideoUrl,
      });
    }

    return results;
  } catch {
    return [];
  }
}
