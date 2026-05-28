import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from '@/lib/store';

// 각 테스트 전 필터 상태 초기화
beforeEach(() => {
  useStore.setState({
    filterPlatform: 'youtube',
    filterCategory: null,
    searchQuery: '',
  });
});

// ─── 플랫폼 필터 ───────────────────────────────────────────
describe('filterPlatform', () => {
  it('기본값은 youtube', () => {
    expect(useStore.getState().filterPlatform).toBe('youtube');
  });

  it('tiktok으로 변경', () => {
    useStore.getState().setFilterPlatform('tiktok');
    expect(useStore.getState().filterPlatform).toBe('tiktok');
  });

  it('instagram으로 변경', () => {
    useStore.getState().setFilterPlatform('instagram');
    expect(useStore.getState().filterPlatform).toBe('instagram');
  });

  it('all로 변경', () => {
    useStore.getState().setFilterPlatform('all');
    expect(useStore.getState().filterPlatform).toBe('all');
  });
});

// ─── 카테고리 필터 ─────────────────────────────────────────
describe('filterCategory', () => {
  it('기본값은 null (전체)', () => {
    expect(useStore.getState().filterCategory).toBeNull();
  });

  it('카테고리 선택', () => {
    useStore.getState().setFilterCategory('fitness');
    expect(useStore.getState().filterCategory).toBe('fitness');
  });

  it('null로 되돌리면 전체(전체 탭)', () => {
    useStore.getState().setFilterCategory('food');
    useStore.getState().setFilterCategory(null);
    expect(useStore.getState().filterCategory).toBeNull();
  });
});

// ─── 검색 쿼리 ─────────────────────────────────────────────
describe('searchQuery', () => {
  it('기본값은 빈 문자열', () => {
    expect(useStore.getState().searchQuery).toBe('');
  });

  it('검색어 설정', () => {
    useStore.getState().setSearchQuery('런닝');
    expect(useStore.getState().searchQuery).toBe('런닝');
  });

  it('검색어 초기화', () => {
    useStore.getState().setSearchQuery('먹방');
    useStore.getState().setSearchQuery('');
    expect(useStore.getState().searchQuery).toBe('');
  });
});

// ─── 필터 전체 초기화 ──────────────────────────────────────
describe('clearAllFilters', () => {
  it('플랫폼·카테고리 동시 초기화', () => {
    useStore.getState().setFilterPlatform('tiktok');
    useStore.getState().setFilterCategory('gaming');

    useStore.getState().clearAllFilters();

    expect(useStore.getState().filterPlatform).toBe('youtube');
    expect(useStore.getState().filterCategory).toBeNull();
  });

  it('검색어는 clearAllFilters에 포함 안 됨 (별도 관리)', () => {
    useStore.getState().setSearchQuery('테스트');
    useStore.getState().clearAllFilters();
    // searchQuery는 clearAllFilters 범위 밖
    expect(useStore.getState().searchQuery).toBe('테스트');
  });
});

// ─── 온보딩 상태 ───────────────────────────────────────────
describe('onboarding', () => {
  it('completeOnboarding 후 onboardingDone = true', () => {
    const mockInput = {
      platform: 'instagram' as const,
      category: 'fitness' as const,
      experience: 1 as const,
      goal: 'growth' as const,
      styles: ['vlog'],
      pain: 'consistency' as const,
      uploadFreq: 'mid' as const,
    };
    const mockResult = {
      personaType: '성장형 크리에이터',
      personaTagline: '꾸준함이 무기',
      personaSummary: '요약',
      topTrends: [],
      hookPatterns: [],
      actionItems: [],
      weeklyPlan: '주 2회 업로드',
      typeIndex: 0 as const,
    };

    useStore.getState().completeOnboarding(mockInput, mockResult, 'produce');
    expect(useStore.getState().onboardingDone).toBe(true);
    expect(useStore.getState().personaInput?.category).toBe('fitness');
    expect(useStore.getState().appIntent).toBe('produce');
  });

  it('resetOnboarding 후 onboardingDone = false', () => {
    useStore.setState({ onboardingDone: true });
    useStore.getState().resetOnboarding();

    expect(useStore.getState().onboardingDone).toBe(false);
    expect(useStore.getState().personaInput).toBeNull();
    expect(useStore.getState().personaResult).toBeNull();
  });
});

// ─── 탭 전환 ───────────────────────────────────────────────
describe('setTab', () => {
  it('recommend 탭으로 이동', () => {
    useStore.setState({ currentTab: 'dashboard' });
    useStore.getState().setTab('recommend');
    expect(useStore.getState().currentTab).toBe('recommend');
  });

  it('dashboard 탭으로 복귀', () => {
    useStore.getState().setTab('recommend');
    useStore.getState().setTab('dashboard');
    expect(useStore.getState().currentTab).toBe('dashboard');
  });
});
