import type { RivalCandidate, RivalSurvey } from './types';
import { generateTextResilient } from './ai';

export type AnalyzedCandidate = RivalCandidate & {
  score: number;
  niche: string;
  matchReasons: string[];
};

interface RawAnalysis {
  channelId: string;
  score: number;
  niche: string;
  matchReasons: string[];
}

function uploadFreqLabel(avgDays: number): string {
  if (avgDays <= 2)  return '거의 매일';
  if (avgDays <= 4)  return '주 3-5편';
  if (avgDays <= 10) return '주 1-2편';
  return '월 1-2편';
}

export async function analyzeRivals(
  candidates: RivalCandidate[],
  survey: RivalSurvey
): Promise<AnalyzedCandidate[]> {
  if (candidates.length === 0) return [];

  const profilesText = candidates
    .map(
      (c, i) => `[${i}] id:${c.channelId}
채널명: ${c.channelTitle}
설명: ${c.description || '(없음)'}
구독자: ${c.subscribers.toLocaleString()}명
업로드 주기: ${uploadFreqLabel(c.avgUploadDays)}
최근영상: ${c.recentTitles.slice(0, 3).join(' / ') || '(없음)'}`
    )
    .join('\n\n');

  const toneLabel =
    survey.contentTone === 'info'          ? '정보 전달형' :
    survey.contentTone === 'vlog'          ? '감성/브이로그형' :
                                             '오락/유머형';

  const freqLabel =
    survey.uploadFreq === 'daily'          ? '매일' :
    survey.uploadFreq === 'weekly-mid'     ? '주 3-5편' :
                                             '주 1-2편';

  const genderLabel =
    survey.gender === 'male'   ? '남성 타겟' :
    survey.gender === 'female' ? '여성 타겟' :
                                 '성별 무관';

  const surveyText = [
    `주제: ${survey.topics.join(', ')}`,
    `콘텐츠 톤: ${toneLabel}`,
    `업로드 주기: ${freqLabel}`,
    `타겟 성별: ${genderLabel}`,
    `언어: ${survey.lang === 'ko' ? '한국어' : '글로벌'}`,
  ].join(' / ');

  const { text } = await generateTextResilient({
    system: '당신은 YouTube 채널 유사도 분석 전문가입니다. 반드시 유효한 JSON 배열만 응답하세요.',
    prompt: `사용자 콘텐츠 특성:
${surveyText}

아래 ${candidates.length}개 채널의 유사도를 평가하세요.
평가 기준: 주제 일치도, 콘텐츠 톤 유사도, 업로드 주기 유사도
- score: 0-100
- niche: 채널 특성 한 줄 (15자 이내)
- matchReasons: 유사 이유 2-3개 (각 20자 이내)
상위 8개만 반환.

채널 목록:
${profilesText}

JSON 배열로만 응답:
[{"channelId":"...","score":85,"niche":"홈트 정보형 숏폼","matchReasons":["매일 업로드 패턴 일치","정보 전달 톤 동일"]}]`,
  });

  let raw: RawAnalysis[] = [];
  try {
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    raw = jsonMatch ? (JSON.parse(jsonMatch[0]) as RawAnalysis[]) : [];
  } catch {
    return candidates.slice(0, 8).map((c) => ({
      ...c,
      score: 50,
      niche: c.channelTitle,
      matchReasons: ['키워드 일치'],
    }));
  }

  return raw
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .flatMap((r) => {
      const candidate = candidates.find((c) => c.channelId === r.channelId);
      if (!candidate) return [];
      return [{ ...candidate, score: r.score, niche: r.niche, matchReasons: r.matchReasons }];
    });
}
