// graph.js
// 원본 renderPlatformGraph()의 SVG path 좌표 계산과 증감률 로직을 분리.
// DOM(setAttribute, innerHTML)은 제거하고 계산 결과만 반환.

/**
 * "YYYY-MM-DD" → "M/D" 포맷. 원본 fmtDate()와 동일.
 * @param {string} dateStr
 * @returns {string}
 */
export function fmtDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.getMonth() + 1 + '/' + d.getDate();
}

/**
 * 마지막 8개 로그를 날짜순 정렬해서 가져온다.
 * @param {{date:string, views:number}[]} logs
 * @returns {{date:string, views:number}[]}
 */
export function lastEightSorted(logs) {
  return [...logs].sort((a, b) => a.date.localeCompare(b.date)).slice(-8);
}

/**
 * views 배열을 SVG viewBox 좌표(점 배열)로 정규화.
 * 원본과 동일: W=200, H=50, pad=4, y는 위가 0이라 반전.
 * @param {number[]} views
 * @param {object} [opts]
 * @returns {[number, number][]} [x, y] 점 배열
 */
export function computePoints(views, opts = {}) {
  const { W = 200, H = 50, pad = 4 } = opts;
  const maxV = Math.max(...views);
  const minV = Math.min(...views);
  const range = maxV - minV || 1; // 전부 같으면 0 나눗셈 방지
  const n = views.length;
  return views.map((v, i) => {
    const x = (i / (n - 1)) * W;
    const y = H - pad - ((v - minV) / range) * (H - pad * 2);
    return [Math.round(x * 10) / 10, Math.round(y * 10) / 10];
  });
}

/**
 * 점 배열 → SVG line path 문자열.
 * @param {[number, number][]} pts
 * @returns {string}
 */
export function pointsToLinePath(pts) {
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ');
}

/**
 * line path → 닫힌 area path (하단까지 채움).
 * @param {string} line
 * @param {object} [opts]
 * @returns {string}
 */
export function lineToAreaPath(line, opts = {}) {
  const { W = 200, H = 50 } = opts;
  return line + ` L${W},${H} L0,${H} Z`;
}

/**
 * 마지막 두 값의 증감률(%). 원본과 동일하게 정수 반올림.
 * @param {number[]} views
 * @returns {number}
 */
export function growthPercent(views) {
  const last = views[views.length - 1];
  const prev = views[views.length - 2];
  return Math.round(((last - prev) / prev) * 100);
}

/**
 * 증감률을 표시용 문자열로. 양수면 + 접두사.
 * @param {number} pct
 * @returns {string}
 */
export function formatGrowth(pct) {
  return (pct >= 0 ? '+' : '') + pct + '%';
}
