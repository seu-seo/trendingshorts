import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import type { RivalResult } from './types';
import type { AnalyzedCandidate } from './rival-analyze';

function formatSubscribers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

interface VisionResult {
  styleScore: number;
  detectedGender: 'male' | 'female' | 'unknown';
}

async function visionAnalyze(
  channel: AnalyzedCandidate,
  contentTone: string,
  topics: string[]
): Promise<VisionResult> {
  const fallback: VisionResult = { styleScore: channel.score, detectedGender: 'unknown' };

  // 채널 프로필 이미지(성별 판별용) + 영상 썸네일(스타일 판별용) 합산
  const imageUrls = [
    channel.thumbnailUrl,          // 프로필 사진 — 얼굴 노출로 성별 판별
    ...channel.sampleThumbnails.slice(0, 1), // 영상 썸네일 1장 — 편집 스타일
  ].filter(Boolean);

  if (imageUrls.length === 0) return fallback;

  try {
    const imageContents = imageUrls.map((url) => ({
      type: 'image' as const,
      image: new URL(url),
    }));

    const { text } = await generateText({
      model: google('gemini-2.5-flash-lite'),
      messages: [
        {
          role: 'user',
          content: [
            ...imageContents,
            {
              type: 'text',
              text: `첫 번째 이미지는 채널 프로필 사진, 두 번째(있으면)는 영상 썸네일입니다.

[분석 요청]
1. gender: 프로필 사진에 사람 얼굴이 보이면 "male" 또는 "female" 판별. 얼굴이 없거나 불분명하면 "unknown".
2. styleScore: 아래 기준으로 썸네일 스타일 유사도 0-100 평가.
   - 비교 대상: ${contentTone} 톤, 주제: ${topics.join(', ')}
   - 편집 스타일(자막/비주얼), 색감, 텍스트 구성 유사도 기준

JSON만 응답 (예시): {"gender":"female","styleScore":72}`,
            },
          ],
        },
      ],
    });

    const jsonMatch = text.match(/\{[\s\S]*?\}/);
    if (!jsonMatch) return fallback;
    const parsed = JSON.parse(jsonMatch[0]) as { gender?: string; styleScore?: number };

    const detectedGender: VisionResult['detectedGender'] =
      parsed.gender === 'male' ? 'male' :
      parsed.gender === 'female' ? 'female' : 'unknown';

    const styleScore = typeof parsed.styleScore === 'number' && !isNaN(parsed.styleScore)
      ? Math.max(0, Math.min(100, parsed.styleScore))
      : channel.score;

    return { styleScore, detectedGender };
  } catch {
    return fallback;
  }
}

function genderPenalty(
  detectedGender: VisionResult['detectedGender'],
  surveyGender: string
): number {
  if (surveyGender === 'any' || detectedGender === 'unknown') return 0;
  // 성별 불일치 시 패널티 (-20점)
  if (surveyGender === 'male' && detectedGender === 'female') return -20;
  if (surveyGender === 'female' && detectedGender === 'male') return -20;
  return 0;
}

export async function visionRankRivals(
  analyzed: AnalyzedCandidate[],
  survey: { contentTone: string; topics: string[]; gender: string }
): Promise<RivalResult[]> {
  // 채널별 병렬 분석 (프로필 + 썸네일)
  const scored = await Promise.all(
    analyzed.map(async (ch) => {
      const { styleScore, detectedGender } = await visionAnalyze(ch, survey.contentTone, survey.topics);
      // stage2 60% + 비전 스타일 40% + 성별 패널티
      const base = Math.round(ch.score * 0.6 + styleScore * 0.4);
      const finalScore = Math.max(0, Math.min(100, base + genderPenalty(detectedGender, survey.gender)));
      return { channel: ch, finalScore, detectedGender };
    })
  );

  return scored
    .sort((a, b) => b.finalScore - a.finalScore)
    .slice(0, 5)
    .map(({ channel, finalScore }) => ({
      channelId: channel.channelId,
      channelTitle: channel.channelTitle,
      handle: channel.handle,
      subscribers: channel.subscribers,
      subscribersLabel: formatSubscribers(channel.subscribers),
      thumbnail: channel.thumbnailUrl,
      niche: channel.niche,
      similarityScore: finalScore,
      matchReasons: channel.matchReasons,
      sampleThumbnails: channel.sampleThumbnails,
      channelUrl: `https://www.youtube.com/${channel.handle.startsWith('@') ? channel.handle : `@${channel.handle}`}`,
    }));
}
