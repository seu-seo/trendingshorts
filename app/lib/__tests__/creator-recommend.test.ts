import { describe, it, expect } from 'vitest';
import {
  experienceToFollowerTier,
  getNextTier,
  getCreatorRecommendations,
  TIER_LABELS,
} from '../creator-recommend';

describe('experienceToFollowerTier', () => {
  it('maps experience 0 → tier 1', () => {
    expect(experienceToFollowerTier(0)).toBe(1);
  });

  it('maps experience 1 → tier 1', () => {
    expect(experienceToFollowerTier(1)).toBe(1);
  });

  it('maps experience 2 → tier 2', () => {
    expect(experienceToFollowerTier(2)).toBe(2);
  });

  it('maps experience 3 → tier 3', () => {
    expect(experienceToFollowerTier(3)).toBe(3);
  });

  it('maps experience 4 → tier 4', () => {
    expect(experienceToFollowerTier(4)).toBe(4);
  });

  it('maps experience 5 → tier 5', () => {
    expect(experienceToFollowerTier(5)).toBe(5);
  });
});

describe('getNextTier', () => {
  it('returns tier+1 for tiers 1-4', () => {
    expect(getNextTier(1)).toBe(2);
    expect(getNextTier(2)).toBe(3);
    expect(getNextTier(3)).toBe(4);
    expect(getNextTier(4)).toBe(5);
  });

  it('caps at tier 5 for tier 5', () => {
    expect(getNextTier(5)).toBe(5);
  });
});

describe('TIER_LABELS', () => {
  it('has labels for all 5 tiers', () => {
    expect(TIER_LABELS[1]).toBe('< 1K');
    expect(TIER_LABELS[2]).toBe('1K – 10K');
    expect(TIER_LABELS[3]).toBe('10K – 100K');
    expect(TIER_LABELS[4]).toBe('100K – 500K');
    expect(TIER_LABELS[5]).toBe('500K+');
  });
});

describe('getCreatorRecommendations', () => {
  it('returns up to 3 creators by default', () => {
    const result = getCreatorRecommendations('food', 0);
    expect(result.length).toBeLessThanOrEqual(3);
    expect(result.length).toBeGreaterThan(0);
  });

  it('respects the limit parameter', () => {
    const result = getCreatorRecommendations('food', 0, 1);
    expect(result).toHaveLength(1);
  });

  it('returns creators from the next tier for food category', () => {
    // experience 0 → currentTier 1 → targetTier 2 (1K–10K)
    const result = getCreatorRecommendations('food', 0);
    result.forEach((c) => {
      expect(c.tier).toBe(2);
    });
  });

  it('returns creators sorted by score descending', () => {
    const result = getCreatorRecommendations('beauty', 2, 3);
    for (let i = 1; i < result.length; i++) {
      expect(result[i - 1].score).toBeGreaterThanOrEqual(result[i].score);
    }
  });

  it('works for all 7 categories', () => {
    const categories = ['food', 'beauty', 'lifestyle', 'edu', 'gaming', 'fitness', 'art'] as const;
    for (const cat of categories) {
      const result = getCreatorRecommendations(cat, 2);
      expect(result.length).toBeGreaterThan(0);
    }
  });

  it('handles experience 5 (tier 5 → stays tier 5) with fallback', () => {
    // experience 5 → tier 5, getNextTier(5) = 5
    const result = getCreatorRecommendations('gaming', 5);
    expect(result.length).toBeGreaterThan(0);
    result.forEach((c) => {
      expect(c.tier).toBe(5);
    });
  });

  it('each creator has required fields', () => {
    const result = getCreatorRecommendations('lifestyle', 2);
    result.forEach((c) => {
      expect(c.handle).toBeTruthy();
      expect(c.followersLabel).toBeTruthy();
      expect(c.followers).toBeGreaterThan(0);
      expect(c.niche).toBeTruthy();
      expect(c.uploadFreq).toBeTruthy();
      expect(c.tier).toBeGreaterThanOrEqual(1);
      expect(c.tier).toBeLessThanOrEqual(5);
      expect(c.growth).toBeGreaterThan(0);
      expect(c.score).toBeGreaterThanOrEqual(0);
      expect(c.score).toBeLessThanOrEqual(100);
      expect(c.reason).toBeTruthy();
    });
  });
});
