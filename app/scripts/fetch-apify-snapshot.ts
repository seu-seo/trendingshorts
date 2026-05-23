/**
 * 1회 실행 스크립트: Apify에서 TikTok + Instagram 데이터를 받아 JSON으로 저장
 * 사용법: npx tsx scripts/fetch-apify-snapshot.ts
 */

import { writeFileSync } from 'fs';
import { join } from 'path';

const TOKEN = process.env.APIFY_API_TOKEN;
if (!TOKEN) { console.error('APIFY_API_TOKEN 없음'); process.exit(1); }

const HASHTAGS = [
  '먹방', '뷰티', '댄스', '게임', '운동',
  '브이로그', '요리', '패션', '여행', '일상',
  '반려동물', '유머', 'asmr', 'diy', '음악',
];

const HASHTAG_URLS = [
  'https://www.instagram.com/explore/tags/쇼츠/',
  'https://www.instagram.com/explore/tags/먹방/',
  'https://www.instagram.com/explore/tags/뷰티/',
  'https://www.instagram.com/explore/tags/브이로그/',
  'https://www.instagram.com/explore/tags/게임/',
  'https://www.instagram.com/explore/tags/운동/',
  'https://www.instagram.com/explore/tags/패션/',
  'https://www.instagram.com/explore/tags/여행/',
  'https://www.instagram.com/explore/tags/요리/',
  'https://www.instagram.com/explore/tags/댄스/',
  'https://www.instagram.com/explore/tags/반려동물/',
  'https://www.instagram.com/explore/tags/유머/',
  'https://www.instagram.com/explore/tags/asmr/',
  'https://www.instagram.com/explore/tags/diy/',
  'https://www.instagram.com/explore/tags/음악/',
];

async function fetchTikTok() {
  console.log('TikTok 스크래핑 시작...');
  const url = `https://api.apify.com/v2/acts/clockworks~free-tiktok-scraper/run-sync-get-dataset-items?token=${TOKEN}&memory=256`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hashtags: HASHTAGS, resultsPerPage: 6, shouldDownloadVideos: false, shouldDownloadCovers: false }),
    signal: AbortSignal.timeout(300_000),
  });
  if (!res.ok) throw new Error(`TikTok 실패: ${res.status}`);
  const data = await res.json();
  console.log(`TikTok: ${data.length}개 수신`);
  return data;
}

async function fetchInstagram() {
  console.log('Instagram 스크래핑 시작...');
  const url = `https://api.apify.com/v2/acts/apify~instagram-scraper/run-sync-get-dataset-items?token=${TOKEN}&memory=256`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ directUrls: HASHTAG_URLS, resultsType: 'reels', resultsLimit: 12 }),
    signal: AbortSignal.timeout(300_000),
  });
  if (!res.ok) throw new Error(`Instagram 실패: ${res.status}`);
  const data = await res.json();
  console.log(`Instagram: ${data.length}개 수신`);
  return data;
}

(async () => {
  const [tt, ig] = await Promise.allSettled([fetchTikTok(), fetchInstagram()]);

  if (tt.status === 'fulfilled') {
    const path = join(process.cwd(), 'lib/data/tiktok-snapshot.json');
    writeFileSync(path, JSON.stringify(tt.value, null, 2));
    console.log(`✅ TikTok → lib/data/tiktok-snapshot.json`);
  } else {
    console.error('❌ TikTok 실패:', tt.reason);
  }

  if (ig.status === 'fulfilled') {
    const path = join(process.cwd(), 'lib/data/instagram-snapshot.json');
    writeFileSync(path, JSON.stringify(ig.value, null, 2));
    console.log(`✅ Instagram → lib/data/instagram-snapshot.json`);
  } else {
    console.error('❌ Instagram 실패:', ig.reason);
  }
})();
