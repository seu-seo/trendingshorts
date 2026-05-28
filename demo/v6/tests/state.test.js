import { describe, it, expect } from 'vitest';
import {
  toggleSavedTrend,
  removeSavedTrend,
  addStamp,
  stampBarWidth,
  upsertLog,
  goalProgress,
  STAMP_MAX,
} from '../src/state.js';

describe('toggleSavedTrend', () => {
  it('없던 항목은 추가하고 isSaved=true', () => {
    const { saved, isSaved } = toggleSavedTrend([], { id: 't1', title: 'A' });
    expect(saved).toHaveLength(1);
    expect(isSaved).toBe(true);
  });

  it('있던 항목은 제거하고 isSaved=false', () => {
    const start = [{ id: 't1', title: 'A' }];
    const { saved, isSaved } = toggleSavedTrend(start, { id: 't1' });
    expect(saved).toHaveLength(0);
    expect(isSaved).toBe(false);
  });

  it('원본 배열을 변이하지 않는다', () => {
    const start = [{ id: 't1' }];
    toggleSavedTrend(start, { id: 't2' });
    expect(start).toHaveLength(1);
  });

  it('다른 id는 공존', () => {
    let state = [];
    state = toggleSavedTrend(state, { id: 't1' }).saved;
    state = toggleSavedTrend(state, { id: 't2' }).saved;
    expect(state.map((t) => t.id)).toEqual(['t1', 't2']);
  });
});

describe('removeSavedTrend', () => {
  it('id로 제거', () => {
    const result = removeSavedTrend([{ id: 'a' }, { id: 'b' }], 'a');
    expect(result.map((t) => t.id)).toEqual(['b']);
  });

  it('없는 id면 그대로', () => {
    const result = removeSavedTrend([{ id: 'a' }], 'x');
    expect(result).toHaveLength(1);
  });
});

describe('addStamp', () => {
  it('1 증가', () => {
    expect(addStamp(7)).toBe(8);
  });

  it('상한(10)에서 멈춤', () => {
    expect(addStamp(10)).toBe(10);
    expect(addStamp(11)).toBe(11); // 이미 초과해도 증가 안 함
  });

  it('상한 직전 → 상한', () => {
    expect(addStamp(STAMP_MAX - 1)).toBe(STAMP_MAX);
  });
});

describe('stampBarWidth', () => {
  it('7/10 → 70%', () => {
    expect(stampBarWidth(7)).toBe(70);
  });

  it('0 → 0%, 10 → 100%', () => {
    expect(stampBarWidth(0)).toBe(0);
    expect(stampBarWidth(10)).toBe(100);
  });
});

describe('upsertLog', () => {
  it('새 날짜는 추가', () => {
    const logs = [{ date: '2026-05-01', views: 100 }];
    const result = upsertLog(logs, { date: '2026-05-02', views: 200 });
    expect(result).toHaveLength(2);
  });

  it('기존 날짜는 views 덮어쓰기', () => {
    const logs = [{ date: '2026-05-01', views: 100 }];
    const result = upsertLog(logs, { date: '2026-05-01', views: 999 });
    expect(result).toHaveLength(1);
    expect(result[0].views).toBe(999);
  });

  it('원본 배열을 변이하지 않는다', () => {
    const logs = [{ date: '2026-05-01', views: 100 }];
    upsertLog(logs, { date: '2026-05-01', views: 999 });
    expect(logs[0].views).toBe(100);
  });

  it('여러 항목 중 일치하는 것만 갱신하고 나머지는 보존', () => {
    const logs = [
      { date: '2026-05-01', views: 100 },
      { date: '2026-05-02', views: 200 },
      { date: '2026-05-03', views: 300 },
    ];
    const result = upsertLog(logs, { date: '2026-05-02', views: 999 });
    expect(result.map((l) => l.views)).toEqual([100, 999, 300]);
  });
});

describe('goalProgress', () => {
  it('2/3 → 67% (반올림)', () => {
    expect(goalProgress(2, 3)).toBe(67);
  });

  it('초과 달성도 100 상한', () => {
    expect(goalProgress(5, 3)).toBe(100);
  });

  it('target 0(자유 모드)는 0 방어', () => {
    expect(goalProgress(2, 0)).toBe(0);
  });
});
