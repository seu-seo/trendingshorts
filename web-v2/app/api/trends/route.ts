import { NextResponse, type NextRequest } from 'next/server';
import { fetchYouTubeTrends } from '@/lib/youtube';
import { fetchTikTokTrends } from '@/lib/tiktok';
import { fetchInstagramTrends } from '@/lib/instagram';
import type { Trend } from '@/lib/types';

const CACHE_TTL_MS = 30 * 60 * 1000; // 30분

interface CacheEntry {
  data: Trend[];
  fetchedAt: number;
}

// 서버 메모리 캐시 (dev server 재시작 전까지 유지)
const cache: { yt?: CacheEntry; tt?: CacheEntry; ig?: CacheEntry } = {};

function isFresh(entry?: CacheEntry): boolean {
  return !!entry && Date.now() - entry.fetchedAt < CACHE_TTL_MS;
}

async function getCached(
  key: 'yt' | 'tt' | 'ig',
  fetcher: () => Promise<Trend[]>,
): Promise<Trend[]> {
  if (isFresh(cache[key])) return cache[key]!.data;
  const data = await fetcher();
  if (data.length > 0) cache[key] = { data, fetchedAt: Date.now() };
  return data;
}

// 캐시 만료 시 백그라운드 갱신 (응답 블로킹 없이)
function refreshInBackground(key: 'yt' | 'tt' | 'ig', fetcher: () => Promise<Trend[]>) {
  if (isFresh(cache[key])) return;
  fetcher()
    .then((data) => { if (data.length > 0) cache[key] = { data, fetchedAt: Date.now() }; })
    .catch(() => {});
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const platform = searchParams.get('platform');
  const category = searchParams.get('category');

  const needsYT = !platform || platform === 'all' || platform === 'youtube';
  const needsTT = !platform || platform === 'all' || platform === 'tiktok';
  const needsIG = !platform || platform === 'all' || platform === 'instagram';

  // 캐시 있으면 즉시 반환 + 백그라운드 갱신 트리거
  if (
    (!needsYT || isFresh(cache.yt)) &&
    (!needsTT || isFresh(cache.tt)) &&
    (!needsIG || isFresh(cache.ig))
  ) {
    if (needsYT) refreshInBackground('yt', fetchYouTubeTrends);
    if (needsTT) refreshInBackground('tt', fetchTikTokTrends);
    if (needsIG) refreshInBackground('ig', fetchInstagramTrends);

    let results: Trend[] = [
      ...(needsYT ? cache.yt!.data : []),
      ...(needsTT ? cache.tt!.data : []),
      ...(needsIG ? cache.ig!.data : []),
    ];
    if (category) results = results.filter((t) => t.category === category);
    return NextResponse.json({ data: results, source: 'live' });
  }

  // 캐시 없으면 실제 fetch (병렬)
  const [ytResult, ttResult, igResult] = await Promise.allSettled([
    needsYT ? getCached('yt', fetchYouTubeTrends) : Promise.resolve([] as Trend[]),
    needsTT ? getCached('tt', fetchTikTokTrends) : Promise.resolve([] as Trend[]),
    needsIG ? getCached('ig', fetchInstagramTrends) : Promise.resolve([] as Trend[]),
  ]);

  const ytData = ytResult.status === 'fulfilled' ? ytResult.value : (cache.yt?.data ?? []);
  const ttData = ttResult.status === 'fulfilled' ? ttResult.value : (cache.tt?.data ?? []);
  const igData = igResult.status === 'fulfilled' ? igResult.value : (cache.ig?.data ?? []);

  let results: Trend[] = [...ytData, ...ttData, ...igData];
  if (category) results = results.filter((t) => t.category === category);

  const source = results.length > 0 ? 'live' : 'mock';
  return NextResponse.json({ data: results, source });
}
