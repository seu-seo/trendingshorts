import { TrendItem } from "./mock-data";

const API_KEY = process.env.YOUTUBE_API_KEY;
const BASE_URL = "https://www.googleapis.com/youtube/v3";

// ISO 8601 duration (PT1M30S) → seconds
function parseDuration(iso: string): number {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const [, h, m, s] = match;
  return (parseInt(h || "0") * 3600) + (parseInt(m || "0") * 60) + parseInt(s || "0");
}

// seconds → "M:SS"
function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// publishedAt → "N시간 전" 형태
function timeAgo(publishedAt: string): string {
  const diff = Date.now() - new Date(publishedAt).getTime();
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1) return "방금 전";
  if (hours < 24) return `${hours}시간 전`;
  return `${Math.floor(hours / 24)}일 전`;
}

// YouTube categoryId → 한국어 카테고리
const CATEGORY_MAP: Record<string, string> = {
  "10": "음악",
  "15": "펫",
  "17": "운동",
  "20": "게임",
  "22": "일상 브이로그",
  "23": "유머",
  "24": "댄스",
  "26": "뷰티",
  "1":  "일상 브이로그",
  "25": "일상 브이로그",
};

interface YouTubeVideo {
  id: string;
  snippet: {
    title: string;
    channelTitle: string;
    publishedAt: string;
    categoryId: string;
    tags?: string[];
    description: string;
    thumbnails: { default: { url: string } };
  };
  statistics: {
    viewCount?: string;
    likeCount?: string;
    commentCount?: string;
  };
  contentDetails: {
    duration: string;
  };
}

interface YouTubeResponse {
  items: YouTubeVideo[];
  nextPageToken?: string;
}

export async function fetchYouTubeTrends(categoryId?: string): Promise<TrendItem[]> {
  if (!API_KEY) return [];

  const params = new URLSearchParams({
    part: "snippet,statistics,contentDetails",
    chart: "mostPopular",
    regionCode: "KR",
    maxResults: "50",
    key: API_KEY,
    ...(categoryId ? { videoCategoryId: categoryId } : {}),
  });

  // Next.js 내장 fetch 캐싱 — 15분 revalidate (Vercel 배포 환경에서도 유효)
  const res = await fetch(`${BASE_URL}/videos?${params}`, {
    next: { revalidate: 900 },
  });

  if (!res.ok) {
    console.error("YouTube API error:", res.status, await res.text());
    return [];
  }

  const data: YouTubeResponse = await res.json();

  return data.items
    .filter((video) => {
      const seconds = parseDuration(video.contentDetails.duration);
      const hasShortTag =
        video.snippet.title.toLowerCase().includes("#shorts") ||
        video.snippet.description.toLowerCase().includes("#shorts") ||
        video.snippet.tags?.some((t) => t.toLowerCase() === "#shorts");
      // Shorts 조건: 60초 이하 OR #shorts 태그
      return seconds <= 60 || hasShortTag;
    })
    .map((video, index) => {
      const seconds = parseDuration(video.contentDetails.duration);
      const views = parseInt(video.statistics.viewCount || "0");
      const likes = parseInt(video.statistics.likeCount || "0");
      const comments = parseInt(video.statistics.commentCount || "0");
      const category = CATEGORY_MAP[video.snippet.categoryId] || "일상 브이로그";
      const tags = (video.snippet.tags ?? [])
        .filter((t) => t.startsWith("#"))
        .slice(0, 4);

      return {
        id: index + 1,
        platform: "youtube" as const,
        title: video.snippet.title,
        creator: `@${video.snippet.channelTitle.replace(/\s+/g, "_")}`,
        views,
        likes,
        comments,
        shares: 0, // YouTube API는 공유 수 미제공
        category,
        growth: 0,  // 시계열 저장 후 계산 예정
        duration: formatDuration(seconds),
        thumbnail: "▶",
        trending_since: timeAgo(video.snippet.publishedAt),
        tags: tags.length ? tags : ["#shorts"],
      };
    });
}
