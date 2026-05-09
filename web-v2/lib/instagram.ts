import type { Trend } from './types';
import { deriveLifecycle, mapCategory, PLATFORM_LABEL } from './utils';

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
  '쇼츠': '일상 브이로그', '먹방': '먹방', '뷰티': '뷰티', '브이로그': '일상 브이로그',
  '게임': '게임', '운동': '운동', '패션': '뷰티', '여행': '여행', '요리': '먹방',
  '댄스': '댄스', '반려동물': '펫', '유머': '유머', 'asmr': 'ASMR', 'diy': 'DIY', '음악': '음악',
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

    const posts: ApifyPost[] = await res.json();
    const seen = new Set<string>();
    const results: Trend[] = [];

    for (const post of posts) {
      if (post.type !== 'Video') continue;
      if (!HANGUL_RE.test(post.caption || '')) continue;
      if ((post.hashtags ?? []).some((t) => ['광고', 'ad', 'sponsored'].includes(t))) continue;
      if (/광고|협찬|유료광고|제품제공|PR\b/i.test(post.caption || '')) continue;
      if (seen.has(post.id)) continue;
      seen.add(post.id);

      const views = post.videoViewCount ?? post.igPlayCount ?? post.videoPlayCount ?? 0;
      const tags = post.hashtags ?? [];
      const krCategory = krCategoryFromHashtags(tags);

      results.push({
        id: results.length + 1,
        platform: 'instagram' as const,
        platformLabel: PLATFORM_LABEL.instagram,
        category: mapCategory(krCategory),
        lifecycle: deriveLifecycle(views),
        title: (post.caption ?? '').replace(/\n/g, ' ').trim().slice(0, 60) || 'Instagram Reel',
        creator: `@${post.ownerUsername}`,
        views,
        likes: post.likesCount ?? 0,
        comments: post.commentsCount ?? 0,
        shares: 0,
        growth: 0,
        duration: '0:30',
        thumb: THUMBNAIL_MAP[krCategory] ?? '📱',
        time: timeAgo(post.timestamp),
        hashtags: tags.map((t) => `#${t}`).slice(0, 4).join(' ') || '#릴스',
        videoUrl: post.url,
      });
    }

    return results;
  } catch {
    return [];
  }
}
