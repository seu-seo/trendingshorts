// state.js
// 원본의 savedTrends 토글, addStamp, submitLog 병합 로직을 순수 함수로 재구성.
// 원본은 전역 배열을 직접 변이(mutate)했지만, 여기서는 입력을 받아 새 상태를 반환하는
// 불변(immutable) 스타일로 바꿔 테스트와 추론을 쉽게 만든다.

/**
 * 저장된 트렌드 토글. 이미 있으면 제거, 없으면 추가.
 * @param {{id:string}[]} saved - 현재 저장 목록
 * @param {{id:string, title?:string, platform?:string, growth?:string}} trend
 * @returns {{saved: object[], isSaved: boolean}} 새 목록과 토글 후 상태
 */
export function toggleSavedTrend(saved, trend) {
  const idx = saved.findIndex((t) => t.id === trend.id);
  if (idx === -1) {
    return { saved: [...saved, trend], isSaved: true };
  }
  return { saved: saved.filter((t) => t.id !== trend.id), isSaved: false };
}

/**
 * id로 저장 항목 제거. 없으면 원본 그대로 반환.
 * @param {{id:string}[]} saved
 * @param {string} id
 * @returns {object[]}
 */
export function removeSavedTrend(saved, id) {
  return saved.filter((t) => t.id !== id);
}

export const STAMP_MAX = 10;

/**
 * 스탬프 추가. 상한(10) 도달 시 그대로 유지.
 * @param {number} count
 * @returns {number}
 */
export function addStamp(count) {
  if (count >= STAMP_MAX) return count;
  return count + 1;
}

/**
 * 스탬프 진행 바 너비(%).
 * @param {number} count
 * @returns {number}
 */
export function stampBarWidth(count) {
  return (count / STAMP_MAX) * 100;
}

/**
 * 업로드 로그 추가/덮어쓰기.
 * 같은 날짜가 이미 있으면 views를 갱신, 없으면 추가.
 * 원본 submitLog()의 병합 규칙과 동일.
 * @param {{date:string, views:number}[]} logs
 * @param {{date:string, views:number}} entry
 * @returns {object[]} 새 로그 배열
 */
export function upsertLog(logs, entry) {
  const idx = logs.findIndex((l) => l.date === entry.date);
  if (idx >= 0) {
    return logs.map((l, i) => (i === idx ? { ...l, views: entry.views } : l));
  }
  return [...logs, entry];
}

/**
 * 주간 목표 진행률(%). 상한 100, 정수 반올림.
 * 원본 saveGoal()의 width 계산과 동일.
 * @param {number} done
 * @param {number} target
 * @returns {number}
 */
export function goalProgress(done, target) {
  if (target <= 0) return 0; // '자유' 모드(0) 방어
  return Math.min(100, Math.round((done / target) * 100));
}
