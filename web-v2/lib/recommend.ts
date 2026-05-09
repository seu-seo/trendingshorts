/**
 * 톤 추천 + 프롬프트 빌더 — v2-prompt demo (demo/v2-prompt/index.html) 단순화 포팅.
 *
 * 원본 차이:
 * - 6 signals → 3 signals (ER, comment/like, follower segment 제외 — Trend/Persona 타입에 없음)
 * - 카테고리×스타일×톤 elaborate 스크립트 생성 → 톤별 1 headline 템플릿 + 신호 기반 reason
 * - 톱 1톤 추천 → 3톤 모두 점수 매겨 점수순 카드 배열
 */
import type {
  Category,
  Persona,
  ProductionPrompt,
  Trend,
} from './types';

export type Tone = 'informative' | 'story' | 'hooking';

export interface Signal {
  id: 'growth' | 'category' | 'styles';
  active: boolean;
  text: string;
  effect: string;
}

export interface Recommendation {
  scores: Record<Tone, number>;
  signals: Signal[];
  topTone: Tone;
}

const TONE_TO_CLASS: Record<Tone, ProductionPrompt['toneClass']> = {
  informative: 'tone-info',
  story: 'tone-emotional',
  hooking: 'tone-trend',
};

const TONE_LABEL: Record<Tone, string> = {
  informative: '정보형 · INFORMATIVE',
  story: '감성형 · STORY',
  hooking: '후킹형 · TRENDING HOOK',
};

// 카테고리 → 톤 친화도. 원본은 정규식이었지만 web-v2의 Category enum에 맞춰 단순화.
const CATEGORY_AFFINITY: Record<Category, Tone | null> = {
  beauty: 'informative',
  gaming: 'informative',
  food: 'story',
  lifestyle: 'story',
  pets: 'story',
  dance: 'hooking',
};

// 스타일 → 톤 가중치 (페르소나 styles는 자유 문자열이라 키워드 매칭).
const STYLE_TO_TONE: Record<string, Tone> = {
  education: 'informative',
  emotion: 'story',
  authenticity: 'story',
  humor: 'hooking',
  impact: 'hooking',
  // aesthetic 등은 효과 없음 처리
};

export function recommendTones(trend: Trend, persona: Persona | null): Recommendation {
  let informative = 0;
  let story = 0;
  let hooking = 0;
  const signals: Signal[] = [];

  // 1) growth — growthNum 사용 (rising/peak/fading 라이프사이클로 derive할 수도 있지만 직접 수치가 더 정확)
  const growth = trend.growthNum ?? 0;
  if (growth > 300) {
    hooking += 25;
    signals.push({
      id: 'growth',
      active: true,
      text: `24h 성장률 +${growth}% — 빠르게 떡상 중. 첫 3초 후킹이 결정적`,
      effect: 'hooking +25',
    });
  } else if (growth > 0) {
    story += 10;
    signals.push({
      id: 'growth',
      active: true,
      text: `성장률 +${growth}% — 안정 구간. 스토리 전개에 유리`,
      effect: 'story +10',
    });
  } else {
    signals.push({
      id: 'growth',
      active: false,
      text: `성장률 ${growth}% — 정체 또는 하락`,
      effect: '효과 없음',
    });
  }

  // 2) category match
  const catTone = CATEGORY_AFFINITY[trend.category] ?? null;
  if (catTone) {
    if (catTone === 'informative') informative += 15;
    else if (catTone === 'story') story += 15;
    else hooking += 15;
    signals.push({
      id: 'category',
      active: true,
      text: `카테고리 '${trend.category}' — ${TONE_LABEL[catTone].split(' · ')[0]} 친화`,
      effect: `${catTone} +15`,
    });
  } else {
    signals.push({
      id: 'category',
      active: false,
      text: `카테고리 '${trend.category}' — 중립`,
      effect: '효과 없음',
    });
  }

  // 3) persona styles
  if (persona && persona.styles.length > 0) {
    const effects: string[] = [];
    for (const s of persona.styles) {
      const tone = STYLE_TO_TONE[s];
      if (!tone) continue;
      if (tone === 'informative') informative += 15;
      else if (tone === 'story') story += 15;
      else hooking += 15;
      effects.push(`${tone} +15`);
    }
    if (effects.length > 0) {
      signals.push({
        id: 'styles',
        active: true,
        text: `페르소나 스타일: ${persona.styles.join(', ')}`,
        effect: effects.join(' · '),
      });
    } else {
      signals.push({
        id: 'styles',
        active: false,
        text: `페르소나 스타일 — 톤 매핑 없음`,
        effect: '효과 없음',
      });
    }
  } else {
    signals.push({
      id: 'styles',
      active: false,
      text: '페르소나 미설정',
      effect: '효과 없음',
    });
  }

  const scores: Record<Tone, number> = { informative, story, hooking };
  const sorted = (Object.entries(scores) as [Tone, number][]).sort((a, b) => b[1] - a[1]);
  const topTone = sorted[0][1] > 0 ? sorted[0][0] : 'hooking';

  return { scores, signals, topTone };
}

// 톤별 헤드라인 템플릿 — 트렌드 제목을 기반으로 스타일링
function buildHeadline(tone: Tone, trend: Trend): string {
  const t = trend.title;
  switch (tone) {
    case 'informative':
      return `${t} — 핵심만 정리`;
    case 'story':
      return `"${t}" 진짜 해본 후기`;
    case 'hooking':
      return `이거 모르고 시작하면 손해 — ${t}`;
  }
}

// reason 생성 — 활성 신호 요약 + 해당 톤이 적합한 이유
function buildReason(tone: Tone, rec: Recommendation, trend: Trend): string {
  const activeSignals = rec.signals.filter((s) => s.active).map((s) => s.text);
  const signalText = activeSignals.length > 0
    ? activeSignals.join(' · ')
    : '활성 신호 부족';

  const ratio = rec.scores[tone];
  const isTop = rec.topTone === tone;
  const stamp = isTop ? '⭐ 최우선 추천' : '대안';

  switch (tone) {
    case 'informative':
      return `${stamp} (점수 ${ratio}). 단계별·비교·표 포맷이 강점. ${signalText}.`;
    case 'story':
      return `${stamp} (점수 ${ratio}). 솔직한 1인칭 후기, 감정 흐름이 강점. ${signalText}.`;
    case 'hooking':
      return `${stamp} (점수 ${ratio}). 강한 첫 3초 + 단정적 명제 → 반전 → 솔루션. ${signalText}.`;
  }
}

function buildMeta(trend: Trend): string[] {
  const firstHashtag = trend.hashtags.split(/\s+/).find((h) => h.startsWith('#')) ?? '';
  const lifecycle = trend.lifecycle.toUpperCase();
  return [firstHashtag, trend.platformLabel, lifecycle].filter(Boolean);
}

export function buildPrompts(trend: Trend, persona: Persona | null): ProductionPrompt[] {
  const rec = recommendTones(trend, persona);
  const tones: Tone[] = ['informative', 'story', 'hooking'];

  // 점수순 정렬 — 동점이면 informative > story > hooking 순서 유지
  const sorted = tones
    .slice()
    .sort((a, b) => (rec.scores[b] - rec.scores[a]) || tones.indexOf(a) - tones.indexOf(b));

  return sorted.map((tone) => ({
    toneClass: TONE_TO_CLASS[tone],
    toneLabel: TONE_LABEL[tone],
    headline: buildHeadline(tone, trend),
    meta: buildMeta(trend),
    reason: buildReason(tone, rec, trend),
  }));
}
