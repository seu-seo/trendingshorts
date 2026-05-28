// onboarding.js
// updateProgressUI()의 퍼센트/링 오프셋 계산을 분리.

// 원본: circumference = 2 * π * 15 ≈ 94.25 (r=15 progress ring)
export const RING_CIRCUMFERENCE = 94.25;

/**
 * 답한 질문 수 → 완성도 퍼센트(정수 반올림).
 * @param {number} answered
 * @param {number} total
 * @returns {number}
 */
export function progressPercent(answered, total) {
  if (total <= 0) return 0;
  return Math.round((answered / total) * 100);
}

/**
 * 퍼센트 → SVG stroke-dashoffset.
 * 0% → 전체 둘레(빈 원), 100% → 0(꽉 찬 원).
 * @param {number} percent
 * @returns {number}
 */
export function ringDashOffset(percent) {
  return RING_CIRCUMFERENCE - (RING_CIRCUMFERENCE * percent) / 100;
}
