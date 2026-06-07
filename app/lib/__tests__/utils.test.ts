import { describe, it, expect } from 'vitest';
import { deriveHeatLevel, mapCategory, PLATFORM_LABEL } from '../utils';

describe('deriveHeatLevel', () => {
  it('returns HOT when engagementRate >= 5', () => {
    expect(deriveHeatLevel(5)).toBe('HOT');
    expect(deriveHeatLevel(10)).toBe('HOT');
  });

  it('returns WARM when engagementRate is 2–4.99', () => {
    expect(deriveHeatLevel(2)).toBe('WARM');
    expect(deriveHeatLevel(4.99)).toBe('WARM');
  });

  it('returns COLD when engagementRate < 2', () => {
    expect(deriveHeatLevel(0)).toBe('COLD');
    expect(deriveHeatLevel(1.99)).toBe('COLD');
  });
});

describe('mapCategory', () => {
  it('maps Korean category labels to English slugs', () => {
    expect(mapCategory('먹방')).toBe('food');
    expect(mapCategory('뷰티')).toBe('beauty');
    expect(mapCategory('게임')).toBe('gaming');
    expect(mapCategory('운동')).toBe('fitness');
  });

  it('falls back to lifestyle for unknown categories', () => {
    expect(mapCategory('알수없는카테고리')).toBe('lifestyle');
  });
});

describe('PLATFORM_LABEL', () => {
  it('has labels for all three platforms', () => {
    expect(PLATFORM_LABEL.youtube).toBe('SHORTS');
    expect(PLATFORM_LABEL.tiktok).toBe('TIKTOK');
    expect(PLATFORM_LABEL.instagram).toBe('REELS');
  });
});
