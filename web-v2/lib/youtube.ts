import type { Trend } from './types';
import { deriveLifecycle, mapCategory, PLATFORM_LABEL } from './utils';

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

const CATEGORY_MAP: Record<string, string> = {
  '1': '콘텐츠', '10': '음악', '15': '펫', '17': '운동', '19': '여행',
  '20': '게임', '22': '일상 브이로그', '23': '유머', '24': '댄스',
  '25': '일상 브이로그', '26': '뷰티', '27': 'DIY', '28': '테크',
};

const THUMBNAIL_MAP: Record<string, string> = {
  '1': '🎬', '10': '🎵', '15': '🐾', '17': '🏃', '19': '✈️',
  '20': '🎮', '22': '☀️', '23': '😂', '24': '🎭', '25': '📺',
  '26': '💄', '27': '🔨', '28': '💻',
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

async function isShort(videoId: string): Promise<boolean> {
  try {
    const res = await fetch(`https://www.youtube.com/shorts/${videoId}`, {
      redirect: 'manual',
      headers: { 'User-Agent': 'Mozilla/5.0' },
      cache: 'force-cache',
    });
    return res.status < 300;
  } catch {
    return true;
  }
}

export async function fetchYouTubeTrends(): Promise<Trend[]> {
  const API_KEY = process.env.YOUTUBE_API_KEY;
  if (!API_KEY) return [];

  const categoryResults = await Promise.all(
    SHORTS_CATEGORY_IDS.map((cid) => {
      const params = new URLSearchParams({
        part: 'snippet,statistics,contentDetails',
        chart: 'mostPopular',
        regionCode: 'KR',
        videoCategoryId: cid,
        maxResults: '50',
        key: API_KEY,
      });
      return get<{ items: VideoDetail[] }>(`${BASE_URL}/videos?${params}`);
    })
  );

  const seen = new Set<string>();
  const allVideos: VideoDetail[] = [];
  for (const data of categoryResults) {
    for (const video of data?.items ?? []) {
      if (!seen.has(video.id)) { seen.add(video.id); allVideos.push(video); }
    }
  }

  const candidates = allVideos.filter((v) => {
    const s = parseDuration(v.contentDetails.duration);
    return s > 0 && s <= 180 && HANGUL_RE.test(v.snippet.title);
  });

  const shortFlags = await Promise.all(candidates.map((v) => isShort(v.id)));
  const actualShorts = candidates.filter((_, i) => shortFlags[i]);

  return actualShorts.map((video, index) => {
    const seconds = parseDuration(video.contentDetails.duration);
    const views = parseInt(video.statistics.viewCount || '0');
    const likes = parseInt(video.statistics.likeCount || '0');
    const comments = parseInt(video.statistics.commentCount || '0');
    const krCategory = CATEGORY_MAP[video.snippet.categoryId] || '일상 브이로그';
    const tags = (video.snippet.tags ?? []).filter((t) => t.startsWith('#')).slice(0, 4);

    return {
      id: index + 1,
      platform: 'youtube' as const,
      platformLabel: PLATFORM_LABEL.youtube,
      category: mapCategory(krCategory),
      lifecycle: deriveLifecycle(views),
      title: video.snippet.title,
      creator: `@${video.snippet.channelTitle.replace(/\s+/g, '_')}`,
      views,
      likes,
      comments,
      shares: 0,
      growth: 0,
      duration: formatDuration(seconds),
      thumb: THUMBNAIL_MAP[video.snippet.categoryId] || '🎬',
      time: timeAgo(video.snippet.publishedAt),
      hashtags: tags.length ? tags.join(' ') : '#shorts',
      videoUrl: `https://www.youtube.com/shorts/${video.id}`,
    };
  });
}
