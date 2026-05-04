import { NextResponse } from "next/server";
import { fetchYouTubeTrends } from "@/lib/youtube";
import { fetchInstagramTrends } from "@/lib/instagram";
import { fetchTikTokTrends } from "@/lib/tiktok";
import { TRENDS_DATA, TrendItem } from "@/lib/mock-data";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const platform = searchParams.get("platform") || "all";

  let results: TrendItem[] = [];

  // YouTube: API 키 있으면 실데이터, 없으면 mock
  if (platform === "all" || platform === "youtube") {
    const youtubeData = await fetchYouTubeTrends();
    if (youtubeData.length > 0) {
      results.push(...youtubeData);
    } else {
      results.push(...TRENDS_DATA.filter((i) => i.platform === "youtube"));
    }
  }

  // Instagram: Apify 토큰 있으면 실데이터, 없으면 mock
  if (platform === "all" || platform === "instagram") {
    const instagramData = await fetchInstagramTrends();
    if (instagramData.length > 0) {
      results.push(...instagramData);
    } else {
      results.push(...TRENDS_DATA.filter((i) => i.platform === "instagram"));
    }
  }

  // TikTok: Apify 토큰 있으면 실데이터, 없으면 mock
  if (platform === "all" || platform === "tiktok") {
    const tiktokData = await fetchTikTokTrends();
    if (tiktokData.length > 0) {
      results.push(...tiktokData);
    } else {
      results.push(...TRENDS_DATA.filter((i) => i.platform === "tiktok"));
    }
  }

  return NextResponse.json({ data: results, source: process.env.YOUTUBE_API_KEY ? "live" : "mock" });
}
