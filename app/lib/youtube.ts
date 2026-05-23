import type { Trend } from './types';
import { deriveLifecycle, PLATFORM_LABEL } from './utils';
import type { Category } from './types';

const BASE_URL = 'https://www.googleapis.com/youtube/v3';
const HANGUL_RE = /[가-힣]/;

const SHORTS_CATEGORY_IDS = [
  '23', '24', '1', '17', '20', '26', '22', '15', '28', '10', '19', '27',
];

function parseDuration(iso: string): number {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const [, h, m, s] = match;
  return (parseInt(h || '0') * 3600) + (parseInt(m || '0') * 60) + parseInt(s || '0');
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function timeAgo(publishedAt: string): string {
  const diff = Date.now() - new Date(publishedAt).getTime();
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1) return '방금 전';
  if (hours < 24) return `${hours}시간 전`;
  return `${Math.floor(hours / 24)}일 전`;
}

// YouTube Data API v3 categoryId → 온보딩 카테고리 직접 매핑
const CATEGORY_MAP: Record<string, Category> = {
  '1':  'art',       // Film & Animation
  '10': 'art',       // Music
  '15': 'lifestyle', // Pets & Animals (온보딩에 pets 없음 → lifestyle)
  '17': 'fitness',   // Sports
  '19': 'lifestyle', // Travel & Events
  '20': 'gaming',    // Gaming
  '22': 'lifestyle', // People & Blogs
  '23': 'lifestyle', // Comedy
  '24': 'lifestyle', // Entertainment
  '25': 'edu',       // News & Politics
  '26': 'beauty',    // Howto & Style
  '27': 'edu',       // Education
  '28': 'edu',       // Science & Technology
};

const THUMBNAIL_MAP: Record<string, string> = {
  '1': '🎬', '10': '🎵', '15': '🐾', '17': '💪', '19': '✈️',
  '20': '🎮', '22': '📹', '23': '😂', '24': '🎭', '25': '📰',
  '26': '💄', '27': '💡', '28': '🖥️',
};

interface VideoDetail {
  id: string;
  snippet: { title: string; channelTitle: string; publishedAt: string; categoryId: string; tags?: string[] };
  statistics: { viewCount?: string; likeCount?: string; commentCount?: string };
  contentDetails: { duration: string };
}

async function get<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function fetchYouTubeTrends(): Promise<Trend[]> {
  const API_KEY = process.env.YOUTUBE_API_KEY;
  if (!API_KEY) return [];

  const categoryResults = await Promise.all(
    SHORTS_CATEGORY_IDS.map(async (cid) => {
      const params = new URLSearchParams({
        part: 'snippet,statistics,contentDetails',
        chart: 'mostPopular',
        regionCode: 'KR',
        videoCategoryId: cid,
        maxResults: '10',
        key: API_KEY,
      });
      const data = await get<{ items: VideoDetail[] }>(`${BASE_URL}/videos?${params}`);
      return { cid, items: data?.items ?? [] };
    })
  );

  const seen = new Set<string>();
  const allVideos: (VideoDetail & { requestedCid: string })[] = [];
  for (const { cid, items } of categoryResults) {
    for (const video of items) {
      if (!seen.has(video.id)) { seen.add(video.id); allVideos.push({ ...video, requestedCid: cid }); }
    }
  }

  // isShort() HTTP 체크 제거 — 개별 요청 수백 개로 타임아웃 발생
  // 60초 이하 = Shorts, 61~180초 = 짧은 영상도 포함
  const actualShorts = allVideos.filter((v) => {
    const s = parseDuration(v.contentDetails.duration);
    return s > 0 && s <= 180 && HANGUL_RE.test(v.snippet.title);
  });

  return actualShorts.map((video, index) => {
    const seconds = parseDuration(video.contentDetails.duration);
    const views = parseInt(video.statistics.viewCount || '0');
    const likes = parseInt(video.statistics.likeCount || '0');
    const comments = parseInt(video.statistics.commentCount || '0');
    const tags = (video.snippet.tags ?? []).filter((t) => t.startsWith('#')).slice(0, 4);

    return {
      id: index + 1,
      platform: 'youtube' as const,
      platformLabel: PLATFORM_LABEL.youtube,
      category: CATEGORY_MAP[video.requestedCid] ?? 'lifestyle',
      lifecycle: deriveLifecycle(views > 0 ? Math.round((likes + comments) / views * 1000) : 0),
      title: video.snippet.title,
      creator: `@${video.snippet.channelTitle.replace(/\s+/g, '_')}`,
      views,
      likes,
      comments,
      shares: 0,
      growth: views > 0 ? Math.round((likes + comments) / views * 1000) : 0,
      duration: formatDuration(seconds),
      thumb: THUMBNAIL_MAP[video.requestedCid] || '🎬',
      time: timeAgo(video.snippet.publishedAt),
      hashtags: tags.length ? tags.join(' ') : '#shorts',
      videoUrl: `https://www.youtube.com/shorts/${video.id}`,
    };
  });
}
