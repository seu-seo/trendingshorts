import { describe, it, expect } from 'vitest';
import {
  progressPercent,
  ringDashOffset,
  RING_CIRCUMFERENCE,
} from '../src/onboarding.js';

describe('progressPercent', () => {
  it('0/3 → 0%', () => {
    expect(progressPercent(0, 3)).toBe(0);
  });

  it('1/3 → 33% (반올림)', () => {
    expect(progressPercent(1, 3)).toBe(33);
  });

  it('3/3 → 100%', () => {
    expect(progressPercent(3, 3)).toBe(100);
  });

  it('total 0 방어', () => {
    expect(progressPercent(0, 0)).toBe(0);
  });
});

describe('ringDashOffset', () => {
  it('0% → 전체 둘레 (빈 원)', () => {
    expect(ringDashOffset(0)).toBe(RING_CIRCUMFERENCE);
  });

  it('100% → 0 (꽉 찬 원)', () => {
    expect(ringDashOffset(100)).toBeCloseTo(0, 5);
  });

  it('50% → 둘레의 절반', () => {
    expect(ringDashOffset(50)).toBeCloseTo(RING_CIRCUMFERENCE / 2, 5);
  });
});
