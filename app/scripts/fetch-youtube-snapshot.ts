/**
 * 1회 실행 스크립트: YouTube Data API로 카테고리별 인기 영상을 받아 JSON으로 저장
 * 사용법: YOUTUBE_API_KEY=<key> npx tsx scripts/fetch-youtube-snapshot.ts
 */

import { writeFileSync } from 'fs';
import { join } from 'path';

const API_KEY = process.env.YOUTUBE_API_KEY;
if (!API_KEY) { console.error('YOUTUBE_API_KEY 없음'); process.exit(1); }

const BASE_URL = 'https://www.googleapis.com/youtube/v3';
const CATEGORY_IDS = ['23', '24', '1', '17', '20', '26', '22', '15', '28', '10', '19', '27'];

interface VideoDetail {
  id: string;
  snippet: { title: string; channelTitle: string; publishedAt: string; categoryId: string; tags?: string[] };
  statistics: { viewCount?: string; likeCount?: string; commentCount?: string };
  contentDetails: { duration: string };
}

async function fetchCategory(cid: string): Promise<(VideoDetail & { requestedCid: string })[]> {
  const params = new URLSearchParams({
    part: 'snippet,statistics,contentDetails',
    chart: 'mostPopular',
    regionCode: 'KR',
    videoCategoryId: cid,
    maxResults: '10',
    key: API_KEY!,
  });
  const res = await fetch(`${BASE_URL}/videos?${params}`);
  if (!res.ok) { console.warn(`카테고리 ${cid} 실패: ${res.status}`); return []; }
  const data = await res.json() as { items?: VideoDetail[] };
  return (data.items ?? []).map((v) => ({ ...v, requestedCid: cid }));
}

(async () => {
  console.log('YouTube 스냅샷 수집 시작...');
  const results = await Promise.allSettled(CATEGORY_IDS.map(fetchCategory));

  const seen = new Set<string>();
  const allVideos: (VideoDetail & { requestedCid: string })[] = [];
  for (const r of results) {
    if (r.status === 'fulfilled') {
      for (const v of r.value) {
        if (!seen.has(v.id)) { seen.add(v.id); allVideos.push(v); }
      }
    }
  }

  const path = join(process.cwd(), 'lib/data/youtube-snapshot.json');
  writeFileSync(path, JSON.stringify(allVideos, null, 2));
  console.log(`✅ YouTube → lib/data/youtube-snapshot.json (${allVideos.length}개)`);
})();
