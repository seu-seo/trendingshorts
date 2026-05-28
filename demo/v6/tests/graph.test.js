import { describe, it, expect } from 'vitest';
import {
  fmtDate,
  lastEightSorted,
  computePoints,
  pointsToLinePath,
  lineToAreaPath,
  growthPercent,
  formatGrowth,
} from '../src/graph.js';

describe('fmtDate', () => {
  it('YYYY-MM-DD를 M/D로 변환', () => {
    expect(fmtDate('2026-05-20')).toBe('5/20');
  });

  it('한 자리 월/일도 그대로', () => {
    expect(fmtDate('2026-01-03')).toBe('1/3');
  });
});

describe('lastEightSorted', () => {
  it('날짜순 정렬 후 마지막 8개를 반환', () => {
    const logs = Array.from({ length: 12 }, (_, i) => ({
      date: `2026-04-${String(i + 1).padStart(2, '0')}`,
      views: i,
    }));
    const result = lastEightSorted(logs);
    expect(result).toHaveLength(8);
    expect(result[0].date).toBe('2026-04-05');
    expect(result[7].date).toBe('2026-04-12');
  });

  it('정렬되지 않은 입력도 정렬', () => {
    const logs = [
      { date: '2026-05-03', views: 3 },
      { date: '2026-05-01', views: 1 },
      { date: '2026-05-02', views: 2 },
    ];
    const result = lastEightSorted(logs);
    expect(result.map((l) => l.views)).toEqual([1, 2, 3]);
  });

  it('원본 배열을 변이하지 않는다', () => {
    const logs = [
      { date: '2026-05-03', views: 3 },
      { date: '2026-05-01', views: 1 },
    ];
    const before = JSON.stringify(logs);
    lastEightSorted(logs);
    expect(JSON.stringify(logs)).toBe(before);
  });
});

describe('computePoints', () => {
  it('첫 점 x=0, 마지막 점 x=W', () => {
    const pts = computePoints([10, 20, 30]);
    expect(pts[0][0]).toBe(0);
    expect(pts[2][0]).toBe(200);
  });

  it('최댓값은 y가 가장 작다(위쪽), 최솟값은 y가 가장 크다(아래쪽)', () => {
    const pts = computePoints([10, 50, 30]);
    // index 1이 최댓값(50) → y 최소
    const ys = pts.map((p) => p[1]);
    expect(Math.min(...ys)).toBe(pts[1][1]);
    expect(Math.max(...ys)).toBe(pts[0][1]); // 10이 최소 → y 최대
  });

  it('모든 값이 같으면 0 나눗셈 없이 동작 (range=1 방어)', () => {
    const pts = computePoints([100, 100, 100]);
    expect(pts.every((p) => Number.isFinite(p[1]))).toBe(true);
  });

  it('좌표는 소수점 1자리로 반올림', () => {
    const pts = computePoints([1, 2, 3, 4, 5, 6, 7]);
    pts.forEach((p) => {
      expect(p[0]).toBe(Math.round(p[0] * 10) / 10);
      expect(p[1]).toBe(Math.round(p[1] * 10) / 10);
    });
  });

  it('커스텀 viewBox 옵션 적용', () => {
    const pts = computePoints([1, 2], { W: 100, H: 40, pad: 0 });
    expect(pts[1][0]).toBe(100);
  });
});

describe('pointsToLinePath', () => {
  it('첫 점은 M, 이후는 L', () => {
    const path = pointsToLinePath([[0, 10], [50, 20], [100, 5]]);
    expect(path).toBe('M0,10 L50,20 L100,5');
  });
});

describe('lineToAreaPath', () => {
  it('line 끝에 하단 닫힘 경로를 추가', () => {
    const line = 'M0,10 L200,5';
    expect(lineToAreaPath(line)).toBe('M0,10 L200,5 L200,50 L0,50 Z');
  });
});

describe('growthPercent', () => {
  it('상승률을 정수로 계산', () => {
    expect(growthPercent([100, 124])).toBe(24);
  });

  it('하락률은 음수', () => {
    expect(growthPercent([100, 80])).toBe(-20);
  });

  it('마지막 두 값만 사용', () => {
    expect(growthPercent([1, 2, 3, 100, 150])).toBe(50);
  });
});

describe('formatGrowth', () => {
  it('양수는 + 접두사', () => {
    expect(formatGrowth(24)).toBe('+24%');
  });

  it('0도 + 접두사 (원본 동작)', () => {
    expect(formatGrowth(0)).toBe('+0%');
  });

  it('음수는 - 그대로', () => {
    expect(formatGrowth(-12)).toBe('-12%');
  });
});
