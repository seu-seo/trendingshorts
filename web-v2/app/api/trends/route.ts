import { NextResponse, type NextRequest } from 'next/server';
import { fetchYouTubeTrends } from '@/lib/youtube';
import { fetchTikTokTrends } from '@/lib/tiktok';
import { fetchInstagramTrends } from '@/lib/instagram';
import { ALL_TRENDS } from '@/lib/data/trends';
import type { Trend } from '@/lib/types';

// Apify 토큰 없거나 명시적으로 비활성화된 경우 mock 데이터 사용
const APIFY_DISABLED = process.env.DISABLE_APIFY === 'true' || !process.env.APIFY_API_TOKEN;

// Vercel Edge Cache: 30분마다 재검증
export const revalidate = 1800;

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24시간

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

  // 이 요청이 각 플랫폼 데이터를 원하는지 (platform 파라미터와 무관한 판단)
  const wantsYT = !platform || platform === 'all' || platform === 'youtube';
  const wantsTT = !platform || platform === 'all' || platform === 'tiktok';
  const wantsIG = !platform || platform === 'all' || platform === 'instagram';

  // Apify 활성 시에만 실제 fetch 시도
  const fetchTT = !APIFY_DISABLED && wantsTT;
  const fetchIG = !APIFY_DISABLED && wantsIG;

  // 캐시 있으면 즉시 반환 + 백그라운드 갱신 트리거
  if (
    (!wantsYT || isFresh(cache.yt)) &&
    (!fetchTT || isFresh(cache.tt)) &&
    (!fetchIG || isFresh(cache.ig))
  ) {
    if (wantsYT) refreshInBackground('yt', fetchYouTubeTrends);
    if (fetchTT) refreshInBackground('tt', fetchTikTokTrends);
    if (fetchIG) refreshInBackground('ig', fetchInstagramTrends);

    let results: Trend[] = [
      ...(wantsYT ? (cache.yt?.data ?? []) : []),
      ...(wantsTT ? (fetchTT ? cache.tt!.data : ALL_TRENDS.filter((t) => t.platform === 'tiktok')) : []),
      ...(wantsIG ? (fetchIG ? cache.ig!.data : ALL_TRENDS.filter((t) => t.platform === 'instagram')) : []),
    ];
    if (category) results = results.filter((t) => t.category === category);
    return NextResponse.json({ data: results, source: 'live' });
  }

  // 캐시 없으면 실제 fetch (병렬)
  const [ytResult, ttResult, igResult] = await Promise.allSettled([
    wantsYT ? getCached('yt', fetchYouTubeTrends) : Promise.resolve([] as Trend[]),
    fetchTT ? getCached('tt', fetchTikTokTrends) : Promise.resolve([] as Trend[]),
    fetchIG ? getCached('ig', fetchInstagramTrends) : Promise.resolve([] as Trend[]),
  ]);

  const ytData = wantsYT
    ? (ytResult.status === 'fulfilled' ? ytResult.value : (cache.yt?.data ?? []))
    : [];
  const ttMock = ALL_TRENDS.filter((t) => t.platform === 'tiktok');
  const igMock = ALL_TRENDS.filter((t) => t.platform === 'instagram');

  const ttLive = fetchTT && ttResult.status === 'fulfilled' ? ttResult.value : (cache.tt?.data ?? []);
  const igLive = fetchIG && igResult.status === 'fulfilled' ? igResult.value : (cache.ig?.data ?? []);

  // Apify 결과가 비어 있으면 mock으로 fallback
  const ttData = wantsTT ? (ttLive.length > 0 ? ttLive : ttMock) : [];
  const igData = wantsIG ? (igLive.length > 0 ? igLive : igMock) : [];

  let results: Trend[] = [...ytData, ...ttData, ...igData];
  if (category) results = results.filter((t) => t.category === category);

  const source = results.length > 0 ? 'live' : 'mock';
  return NextResponse.json({ data: results, source });
}
