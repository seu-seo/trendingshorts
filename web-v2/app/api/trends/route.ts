import { NextResponse } from 'next/server';
import { ALL_TRENDS } from '@/lib/data/trends';

/**
 * GET /api/trends
 *
 * Query params:
 *   platform = youtube | tiktok | instagram | all
 *   category = food | beauty | dance | lifestyle | gaming | pets
 *
 * Response:
 *   { data: Trend[], source: 'live' | 'mock' }
 *
 * Note: Currently returns mock data only.
 * Live data integration (YouTube Data API + Apify) is TBD per spec §9.2.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const platform = searchParams.get('platform');
  const category = searchParams.get('category');

  let data = ALL_TRENDS;

  if (platform && platform !== 'all') {
    data = data.filter((t) => t.platform === platform);
  }
  if (category) {
    data = data.filter((t) => t.category === category);
  }

  return NextResponse.json({
    data,
    source: 'mock',
  });
}
