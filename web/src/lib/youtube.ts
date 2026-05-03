import { TrendItem } from "./mock-data";

const BASE_URL = "https://www.googleapis.com/youtube/v3";
const HANGUL_RE = /[가-힣]/;

// Shorts가 주로 올라오는 카테고리 (Music 제외 — K-pop MV 위주)
const SHORTS_CATEGORY_IDS = [
  "23", // Comedy
  "24", // Entertainment
  "1",  // Film & Animation
  "17", // Sports
  "20", // Gaming
  "26", // Howto & Style (뷰티·패션·요리)
  "22", // People & Blogs (일상)
  "15", // Pets & Animals
  "28", // Science & Technology
];

function parseDuration(iso: string): number {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const [, h, m, s] = match;
  return (parseInt(h || "0") * 3600) + (parseInt(m || "0") * 60) + parseInt(s || "0");
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function timeAgo(publishedAt: string): string {
  const diff = Date.now() - new Date(publishedAt).getTime();
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1) return "방금 전";
  if (hours < 24) return `${hours}시간 전`;
  return `${Math.floor(hours / 24)}일 전`;
}

const CATEGORY_MAP: Record<string, string> = {
  "1":  "일상 브이로그",
  "10": "음악",
  "15": "펫",
  "17": "운동",
  "20": "게임",
  "22": "일상 브이로그",
  "23": "유머",
  "24": "댄스",
  "25": "일상 브이로그",
  "26": "뷰티",
  "28": "테크",
};

const THUMBNAIL_MAP: Record<string, string> = {
  "1":  "🎬",
  "10": "🎵",
  "15": "🐾",
  "17": "🏃",
  "20": "🎮",
  "22": "📱",
  "23": "😂",
  "24": "🎭",
  "25": "📺",
  "26": "💄",
  "28": "💻",
};

interface VideoDetail {
  id: string;
  snippet: {
    title: string;
    channelTitle: string;
    publishedAt: string;
    categoryId: string;
    tags?: string[];
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

async function get<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { next: { revalidate: 900 } });
    if (!res.ok) {
      console.error("[youtube] HTTP error:", res.status, await res.text());
      return null;
    }
    return res.json();
  } catch (e) {
    console.error("[youtube] fetch error:", e);
    return null;
  }
}

// /shorts/ URL 리다이렉트 여부로 세로형 Shorts 판별
// 200 → Shorts 플레이어 (세로형), 3xx → /watch 리다이렉트 (가로형)
async function isShort(videoId: string): Promise<boolean> {
  try {
    const res = await fetch(`https://www.youtube.com/shorts/${videoId}`, {
      redirect: "manual",
      headers: { "User-Agent": "Mozilla/5.0" },
      cache: "force-cache",
    });
    return res.status < 300;
  } catch {
    return true;
  }
}

export async function fetchYouTubeTrends(): Promise<TrendItem[]> {
  const API_KEY = process.env.YOUTUBE_API_KEY;
  if (!API_KEY) return [];

  // 카테고리별 mostPopular 병렬 호출 (카테고리당 1 unit, 총 4 units)
  const categoryResults = await Promise.all(
    SHORTS_CATEGORY_IDS.map((cid) => {
      const params = new URLSearchParams({
        part: "snippet,statistics,contentDetails",
        chart: "mostPopular",
        regionCode: "KR",
        videoCategoryId: cid,
        maxResults: "50",
        key: API_KEY,
      });
      return get<{ items: VideoDetail[] }>(`${BASE_URL}/videos?${params}`);
    })
  );

  // 중복 제거 후 병합
  const seen = new Set<string>();
  const allVideos: VideoDetail[] = [];
  for (const data of categoryResults) {
    for (const video of data?.items ?? []) {
      if (!seen.has(video.id)) {
        seen.add(video.id);
        allVideos.push(video);
      }
    }
  }

  // 한국어 타이틀 + 180초 이하로 후보 추림
  const candidates = allVideos.filter((video) => {
    const seconds = parseDuration(video.contentDetails.duration);
    return seconds > 0 && seconds <= 180 && HANGUL_RE.test(video.snippet.title);
  });

  // /shorts/ URL 체크로 세로형 Shorts 확인
  const shortFlags = await Promise.all(candidates.map((v) => isShort(v.id)));
  const actualShorts = candidates.filter((_, i) => shortFlags[i]);

  return actualShorts.map((video, index) => {
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
      shares: 0,
      category,
      growth: 0,
      duration: formatDuration(seconds),
      thumbnail: THUMBNAIL_MAP[video.snippet.categoryId] || "🎬",
      trending_since: timeAgo(video.snippet.publishedAt),
      tags: tags.length ? tags : ["#shorts"],
      videoUrl: `https://www.youtube.com/shorts/${video.id}`,
    };
  });
}
