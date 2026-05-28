import { describe, it, expect } from 'vitest';
import { deriveLifecycle, mapCategory, PLATFORM_LABEL } from '../utils';

describe('deriveLifecycle', () => {
  it('returns rising when engagement >= 100', () => {
    expect(deriveLifecycle(100)).toBe('rising');
    expect(deriveLifecycle(250)).toBe('rising');
  });

  it('returns peak when engagement is 30–99', () => {
    expect(deriveLifecycle(30)).toBe('peak');
    expect(deriveLifecycle(99)).toBe('peak');
  });

  it('returns fading when engagement < 30', () => {
    expect(deriveLifecycle(0)).toBe('fading');
    expect(deriveLifecycle(29)).toBe('fading');
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
