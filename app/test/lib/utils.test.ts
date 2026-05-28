import { describe, it, expect } from 'vitest';
import { deriveLifecycle, PLATFORM_LABEL, mapCategory } from '@/lib/utils';

describe('deriveLifecycle', () => {
  it('engagement >= 100 이면 rising 반환', () => {
    expect(deriveLifecycle(100)).toBe('rising');
    expect(deriveLifecycle(200)).toBe('rising');
    expect(deriveLifecycle(999)).toBe('rising');
  });

  it('30 <= engagement < 100 이면 peak 반환', () => {
    expect(deriveLifecycle(30)).toBe('peak');
    expect(deriveLifecycle(50)).toBe('peak');
    expect(deriveLifecycle(99)).toBe('peak');
  });

  it('engagement < 30 이면 fading 반환', () => {
    expect(deriveLifecycle(29)).toBe('fading');
    expect(deriveLifecycle(0)).toBe('fading');
    expect(deriveLifecycle(1)).toBe('fading');
  });

  it('경계값: engagement 정확히 30은 peak', () => {
    expect(deriveLifecycle(30)).toBe('peak');
  });

  it('경계값: engagement 정확히 100은 rising', () => {
    expect(deriveLifecycle(100)).toBe('rising');
  });
});

describe('PLATFORM_LABEL', () => {
  it('youtube → SHORTS', () => {
    expect(PLATFORM_LABEL.youtube).toBe('SHORTS');
  });

  it('tiktok → TIKTOK', () => {
    expect(PLATFORM_LABEL.tiktok).toBe('TIKTOK');
  });

  it('instagram → REELS', () => {
    expect(PLATFORM_LABEL.instagram).toBe('REELS');
  });
});

describe('mapCategory', () => {
  it('한국어 카테고리 → 영문 카테고리 변환', () => {
    expect(mapCategory('먹방')).toBe('food');
    expect(mapCategory('요리')).toBe('food');
    expect(mapCategory('뷰티')).toBe('beauty');
    expect(mapCategory('게임')).toBe('gaming');
    expect(mapCategory('운동')).toBe('fitness');
    expect(mapCategory('음악')).toBe('art');
    expect(mapCategory('테크')).toBe('edu');
  });

  it('매핑 없는 카테고리는 lifestyle 기본값 반환', () => {
    expect(mapCategory('알수없음')).toBe('lifestyle');
    expect(mapCategory('')).toBe('lifestyle');
    expect(mapCategory('???')).toBe('lifestyle');
  });

  it('패션 → beauty', () => {
    expect(mapCategory('패션')).toBe('beauty');
  });

  it('댄스, 펫, 반려동물, 일상 브이로그, 유머 → lifestyle', () => {
    expect(mapCategory('댄스')).toBe('lifestyle');
    expect(mapCategory('펫')).toBe('lifestyle');
    expect(mapCategory('반려동물')).toBe('lifestyle');
    expect(mapCategory('일상 브이로그')).toBe('lifestyle');
    expect(mapCategory('유머')).toBe('lifestyle');
  });
});
