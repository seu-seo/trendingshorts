import type { Trend, Persona } from '@/lib/types';
import type { ScriptTone, ToneRecommendation } from './types';

/**
 * 데이터 신호 기반 톤 추천.
 *
 * web-v2 Trend는 engagement_rate / comments 가 없으므로
 * growthNum, lifecycle, category, persona styles 4종 신호로 결정.
 *
 * v2 (`feature/script-prompt-v2`)의 6 신호 중 web-v2에서 사용 가능한
 * 신호만 사용. 추후 실제 API 연결 후 신호 확장 예정.
 */
export function recommendTone(
  trend: Trend,
  persona: Persona | null,
): ToneRecommendation {
  const signals: string[] = [];
  let scoreInformative = 0;
  let scoreStory = 0;
  let scoreHooking = 0;

  // --- 신호 1: 반응률 ER% (likes+comments / views × 100) ---
  if (trend.engagementRate >= 10) {
    scoreHooking += 25;
    signals.push(`반응률 ${trend.engagementRate}% (바이럴 패턴 — 빠른 어그로 필요)`);
  } else if (trend.engagementRate >= 5) {
    scoreHooking += 15;
    scoreInformative += 5;
    signals.push(`반응률 ${trend.engagementRate}% (높은 참여 — 강한 반응 유도)`);
  } else if (trend.engagementRate >= 2) {
    scoreStory += 10;
    signals.push(`반응률 ${trend.engagementRate}% (보통 — 스토리 전개에 유리)`);
  } else {
    scoreHooking += 10;
    signals.push(`반응률 ${trend.engagementRate}% (낮음 — 차별화된 훅 필요)`);
  }

  // --- 신호 2: heatLevel ---
  if (trend.heatLevel === 'HOT') {
    scoreHooking += 10;
    signals.push(`참여 열도 HOT — 후킹형 가중`);
  } else if (trend.heatLevel === 'WARM') {
    scoreInformative += 10;
    signals.push(`참여 열도 WARM — 정보 정리에 적합`);
  } else if (trend.heatLevel === 'COLD') {
    scoreStory += 5;
    signals.push(`참여 열도 COLD — 회고/스토리 각도 가능`);
  }

  // --- 신호 3: 카테고리 (구조적 적합도) ---
  const cat = trend.category;
  if (cat === 'beauty' || cat === 'gaming') {
    scoreInformative += 15;
    signals.push(`카테고리 '${cat}' — 정보형 친화 (튜토리얼/공략 포맷)`);
  }
  if (cat === 'food' || cat === 'lifestyle') {
    scoreStory += 15;
    signals.push(`카테고리 '${cat}' — 스토리형 친화 (일상 내러티브)`);
  }
  if (cat === 'fitness' || cat === 'art') {
    scoreHooking += 15;
    signals.push(`카테고리 '${cat}' — 후킹형 친화 (챌린지/비주얼 포맷)`);
  }

  // --- 신호 4: 페르소나 styles (있을 때만) ---
  const styles = persona?.styles ?? [];
  if (styles.some((s) => /education|expert|info/i.test(s))) {
    scoreInformative += 15;
    signals.push("페르소나 스타일 'education/expert' → 정보형 가중");
  }
  if (styles.some((s) => /emotion|authent|story|일상/i.test(s))) {
    scoreStory += 15;
    signals.push("페르소나 스타일 'emotion/authentic' → 스토리형 가중");
  }
  if (styles.some((s) => /humor|impact|funny|trend/i.test(s))) {
    scoreHooking += 15;
    signals.push("페르소나 스타일 'humor/impact' → 후킹형 가중");
  }

  // --- 결정 ---
  const scores = {
    informative: scoreInformative,
    story: scoreStory,
    hooking: scoreHooking,
  };
  const sorted = (Object.entries(scores) as [ScriptTone, number][]).sort(
    (a, b) => b[1] - a[1],
  );
  const [topTone, topScore] = sorted[0];
  const [, secondScore] = sorted[1];
  const total = topScore + secondScore + sorted[2][1];
  const confidence =
    total > 0
      ? Math.round(((topScore - secondScore) / Math.max(total, 1)) * 100 + 50)
      : 50;

  return {
    tone: topScore > 0 ? topTone : 'hooking',
    confidence: Math.min(100, Math.max(0, confidence)),
    signals: signals.length > 0 ? signals : ['데이터 신호 부족 — 기본 후킹형 적용'],
  };
}
