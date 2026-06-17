import type { Trend } from './types';
import { deriveHeatLevel, PLATFORM_LABEL } from './utils';
import type { Category } from './types';

const BASE_URL = 'https://www.googleapis.com/youtube/v3';
const HANGUL_RE = /[가-힣]/;

const SHORTS_CATEGORY_IDS = [
  '23', '24', '20', '26', '22', '15', '10', '19', '17',
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
  '10': 'music',     // Music
  '15': 'pets',      // Pets & Animals
  '19': 'lifestyle', // Travel & Events
  '20': 'gaming',    // Gaming
  '22': 'lifestyle', // People & Blogs
  '23': 'lifestyle', // Comedy
  '24': 'lifestyle', // Entertainment
  '26': 'beauty',    // Howto & Style
};

// YouTube 'Howto & Style'(26)은 뷰티 외 모든 튜토리얼이 섞임 → 키워드로 재분류
const FOOD_KEYWORDS_RE = /먹방|레시피|요리|맛집|쿠킹|식당|반찬|메뉴|음식|먹스타그램|mukbang|asmr.*먹|먹.*asmr/i;
const FITNESS_KEYWORDS_RE = /운동|헬스|홈트|다이어트|필라테스|요가|근육|웨이트|트레이닝|workout|피트니스|하체|복근|크로스핏|스쿼트|런닝|조깅/i;
const BEAUTY_KEYWORDS_RE = /뷰티|메이크업|화장|스킨케어|헤어|네일|향수|피부관리|코디|룩북|ootd|패션|미용|클렌징|파운데이션|립|아이섀도/i;
// YouTube 'Pets & Animals'(15)는 야생동물·농장동물 포함 → 반려동물 키워드 없으면 lifestyle
const PETS_KEYWORDS_RE = /강아지|고양이|반려|puppy|kitten|hamster|햄스터|토끼|앵무|물고기|거북|도마뱀|냥|댕|멍/i;

const THUMBNAIL_MAP: Record<string, string> = {
  '1': '🎬', '10': '🎵', '15': '🐾', '17': '💪', '19': '✈️',
  '20': '🎮', '22': '📹', '23': '😂', '24': '🎭', '25': '📰',
  '26': '💄', '27': '💡', '28': '🖥️',
};

interface VideoDetail {
  id: string;
  snippet: {
    title: string;
    channelTitle: string;
    publishedAt: string;
    categoryId: string;
    tags?: string[];
    thumbnails?: {
      maxres?: { url: string };
      high?: { url: string };
      medium?: { url: string };
    };
  };
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

export async function fetchYouTubeFromSnapshot(): Promise<Trend[]> {
  try {
    const raw = (await import('./data/youtube-snapshot.json')).default as unknown as (VideoDetail & { requestedCid: string })[];
    return processVideos(raw);
  } catch {
    return [];
  }
}

function processVideos(items: (VideoDetail & { requestedCid: string })[]): Trend[] {
  const actualShorts = items.filter((v) => {
    const s = parseDuration(v.contentDetails.duration);
    return s > 0 && s <= 180 && HANGUL_RE.test(v.snippet.title);
  });

  return actualShorts.map((video, index) => {
    const seconds = parseDuration(video.contentDetails.duration);
    const views = parseInt(video.statistics.viewCount || '0');
    const likes = parseInt(video.statistics.likeCount || '0');
    const comments = parseInt(video.statistics.commentCount || '0');
    const tags = (video.snippet.tags ?? []).filter((t) => t.startsWith('#')).slice(0, 4);
    const engagementRate = views >= 1000
      ? parseFloat(((likes + comments) / views * 100).toFixed(2))
      : 0;

    return {
      id: index + 1,
      platform: 'youtube' as const,
      platformLabel: PLATFORM_LABEL.youtube,
      category: (() => {
        const title = video.snippet.title;
        const cid = video.requestedCid;
        if (cid === '26') {
          if (FOOD_KEYWORDS_RE.test(title)) return 'food';
          if (FITNESS_KEYWORDS_RE.test(title)) return 'fitness';
          if (BEAUTY_KEYWORDS_RE.test(title)) return 'beauty';
          return 'lifestyle';
        }
        // Sports(17): 프로스포츠 제외, fitness 키워드 있는 것만 fitness로
        if (cid === '17') return FITNESS_KEYWORDS_RE.test(title) ? 'fitness' : 'lifestyle';
        if (cid === '15') return PETS_KEYWORDS_RE.test(title) ? 'pets' : 'lifestyle';
        return CATEGORY_MAP[cid] ?? 'lifestyle';
      })(),
      heatLevel: deriveHeatLevel(engagementRate),
      title: video.snippet.title,
      creator: `@${video.snippet.channelTitle.replace(/\s+/g, '_')}`,
      views,
      likes,
      comments,
      shares: 0,
      engagementRate,
      duration: formatDuration(seconds),
      thumb: video.snippet.thumbnails?.maxres?.url || video.snippet.thumbnails?.high?.url || video.snippet.thumbnails?.medium?.url || '',
      time: timeAgo(video.snippet.publishedAt),
      hashtags: tags.length ? tags.join(' ') : '#shorts',
      videoUrl: `https://www.youtube.com/shorts/${video.id}`,
    };
  });
}

export async function fetchYouTubeTrends(): Promise<Trend[]> {
  const API_KEY = process.env.YOUTUBE_API_KEY;
  if (!API_KEY) return fetchYouTubeFromSnapshot();

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

  return processVideos(allVideos);
}
