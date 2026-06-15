import type { RivalSurvey, RivalCandidate, RivalChannelSize } from './types';
import { generateTextResilient } from './ai';

const BASE_URL = 'https://www.googleapis.com/youtube/v3';

function getSubscriberRange(size: RivalChannelSize): [number, number] {
  const ranges: Record<RivalChannelSize, [number, number]> = {
    nano:  [0,      1_000],
    micro: [1_000,  10_000],
    mid:   [10_000, 50_000],
  };
  return ranges[size];
}

async function ytGet<T>(path: string, params: Record<string, string>): Promise<T | null> {
  const API_KEY = process.env.YOUTUBE_API_KEY;
  if (!API_KEY) return null;
  const url = new URL(`${BASE_URL}/${path}`);
  Object.entries({ ...params, key: API_KEY }).forEach(([k, v]) => url.searchParams.set(k, v));
  try {
    const res = await fetch(url.toString());
    if (!res.ok) return null;
    return res.json() as Promise<T>;
  } catch {
    return null;
  }
}

async function buildSearchQueries(survey: RivalSurvey): Promise<string[]> {
  const { text } = await generateTextResilient({
    system: '당신은 YouTube 검색 쿼리 전문가입니다.',
    prompt: `다음 크리에이터 정보를 바탕으로 유사 채널 검색에 적합한 YouTube 검색 쿼리 3개를 생성하세요.
주제 키워드: ${survey.topics.join(', ')}
콘텐츠 톤: ${survey.contentTone === 'info' ? '정보 전달형' : survey.contentTone === 'vlog' ? '감성/브이로그형' : '오락/유머형'}
언어 타겟: ${survey.lang === 'ko' ? '한국어 콘텐츠' : '글로벌'}

JSON 배열로만 응답 (한국어 쿼리): ["쿼리1", "쿼리2", "쿼리3"]`,
  });

  try {
    const jsonMatch = text.match(/\[[\s\S]*?\]/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    return Array.isArray(parsed) ? (parsed as string[]).slice(0, 3) : [survey.topics[0] ?? ''];
  } catch {
    return [survey.topics.join(' ')];
  }
}

function calcAvgUploadDays(publishedDates: string[]): number {
  if (publishedDates.length < 2) return 7;
  const sorted = publishedDates.map((d) => new Date(d).getTime()).sort((a, b) => b - a);
  const intervals: number[] = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    intervals.push((sorted[i] - sorted[i + 1]) / 86_400_000);
  }
  return intervals.reduce((s, v) => s + v, 0) / intervals.length;
}

interface YTSearchItem {
  snippet: { channelId: string };
}

interface YTChannelItem {
  id: string;
  snippet: {
    title: string;
    description: string;
    customUrl?: string;
    thumbnails: { default: { url: string } };
  };
  statistics: {
    subscriberCount?: string;
    videoCount?: string;
    hiddenSubscriberCount?: boolean;
  };
  contentDetails: { relatedPlaylists: { uploads: string } };
}

interface YTPlaylistItem {
  snippet: {
    title: string;
    publishedAt: string;
    thumbnails?: { medium?: { url: string } };
  };
}

export async function searchRivalCandidates(survey: RivalSurvey): Promise<RivalCandidate[]> {
  const queries = await buildSearchQueries(survey);

  // Stage 1-A: 영상 검색으로 채널 ID 수집 (shorts 고정)
  const videoSearches = await Promise.all(
    queries.map((q) =>
      ytGet<{ items: YTSearchItem[] }>('search', {
        part: 'snippet',
        q,
        type: 'video',
        regionCode: survey.lang === 'ko' ? 'KR' : '',
        maxResults: '15',
        order: 'relevance',
        videoDuration: 'short',
      })
    )
  );

  const seen = new Set<string>();
  const channelIds: string[] = [];
  for (const result of videoSearches) {
    for (const item of result?.items ?? []) {
      const cid = item.snippet.channelId;
      if (cid && !seen.has(cid)) {
        seen.add(cid);
        channelIds.push(cid);
      }
    }
  }

  if (channelIds.length === 0) return [];

  // Stage 1-B: 채널 정보 배치 조회
  const channelsData = await ytGet<{ items: YTChannelItem[] }>('channels', {
    part: 'snippet,statistics,contentDetails',
    id: channelIds.slice(0, 40).join(','),
  });

  const [minSubs, maxSubs] = getSubscriberRange(survey.channelSize);
  // ±1 tier 여유
  const looseLow  = Math.max(0, minSubs / 3);
  const looseHigh = maxSubs * 3;

  const filtered = (channelsData?.items ?? []).filter((ch) => {
    if (ch.statistics.hiddenSubscriberCount) return false;
    const subs   = parseInt(ch.statistics.subscriberCount ?? '0');
    const videos = parseInt(ch.statistics.videoCount ?? '0');
    return subs >= looseLow && subs <= looseHigh && videos >= 10;
  });

  // Stage 1-C: 최근 영상 제목 + 업로드 날짜 + 썸네일 수집
  const candidates = await Promise.all(
    filtered.slice(0, 25).map(async (ch): Promise<RivalCandidate> => {
      const uploadsId = ch.contentDetails.relatedPlaylists.uploads;
      const recent = await ytGet<{ items: YTPlaylistItem[] }>('playlistItems', {
        part: 'snippet',
        playlistId: uploadsId,
        maxResults: '10',
      });

      const items = recent?.items ?? [];
      const recentTitles     = items.map((v) => v.snippet.title);
      const publishedDates   = items.map((v) => v.snippet.publishedAt).filter(Boolean);
      const sampleThumbnails = items
        .map((v) => v.snippet.thumbnails?.medium?.url)
        .filter((u): u is string => Boolean(u))
        .slice(0, 3);

      return {
        channelId:    ch.id,
        channelTitle: ch.snippet.title,
        handle:       ch.snippet.customUrl ?? `@${ch.snippet.title.replace(/\s+/g, '')}`,
        description:  ch.snippet.description.slice(0, 300),
        subscribers:  parseInt(ch.statistics.subscriberCount ?? '0'),
        videoCount:   parseInt(ch.statistics.videoCount ?? '0'),
        avgUploadDays: calcAvgUploadDays(publishedDates),
        recentTitles,
        thumbnailUrl:     ch.snippet.thumbnails.default.url,
        sampleThumbnails,
      };
    })
  );

  return candidates;
}
