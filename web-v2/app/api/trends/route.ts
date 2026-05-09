import { NextResponse, type NextRequest } from 'next/server';
import { fetchYouTubeTrends } from '@/lib/youtube';
import { fetchTikTokTrends } from '@/lib/tiktok';
import { fetchInstagramTrends } from '@/lib/instagram';
import { ALL_TRENDS } from '@/lib/data/trends';
import type { Trend } from '@/lib/types';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const platform = searchParams.get('platform');
  const category = searchParams.get('category');

  let results: Trend[] = [];

  if (!platform || platform === 'all' || platform === 'youtube') {
    const live = await fetchYouTubeTrends();
    results.push(...(live.length > 0 ? live : ALL_TRENDS.filter((t) => t.platform === 'youtube')));
  }

  if (!platform || platform === 'all' || platform === 'tiktok') {
    const live = await fetchTikTokTrends();
    results.push(...(live.length > 0 ? live : ALL_TRENDS.filter((t) => t.platform === 'tiktok')));
  }

  if (!platform || platform === 'all' || platform === 'instagram') {
    const live = await fetchInstagramTrends();
    results.push(...(live.length > 0 ? live : ALL_TRENDS.filter((t) => t.platform === 'instagram')));
  }

  if (category) {
    results = results.filter((t) => t.category === category);
  }

  const source = process.env.YOUTUBE_API_KEY ? 'live' : 'mock';
  return NextResponse.json({ data: results, source });
}
