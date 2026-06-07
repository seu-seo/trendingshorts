import type { Category, HeatLevel, Platform } from './types';

// erPercent = (likes + comments) / views × 100
export function deriveHeatLevel(erPercent: number): HeatLevel {
  if (erPercent >= 5) return 'HOT';
  if (erPercent >= 2) return 'WARM';
  return 'COLD';
}

export const PLATFORM_LABEL: Record<Platform, string> = {
  youtube: 'SHORTS',
  tiktok: 'TIKTOK',
  instagram: 'REELS',
};

const KR_CATEGORY_MAP: Record<string, Category> = {
  '먹방': 'food',
  '요리': 'food',
  '뷰티': 'beauty',
  '패션': 'beauty',
  '댄스': 'lifestyle',
  '게임': 'gaming',
  '펫': 'lifestyle',
  '반려동물': 'lifestyle',
  '운동': 'fitness',
  '일상 브이로그': 'lifestyle',
  '유머': 'lifestyle',
  'ASMR': 'lifestyle',
  'DIY': 'lifestyle',
  '음악': 'art',
  '여행': 'lifestyle',
  '콘텐츠': 'lifestyle',
  '테크': 'edu',
};

export function mapCategory(krCategory: string): Category {
  return KR_CATEGORY_MAP[krCategory] ?? 'lifestyle';
}
