import type { Category, Lifecycle, Platform } from './types';

export function deriveLifecycle(views: number): Lifecycle {
  if (views > 3_000_000) return 'rising';
  if (views > 500_000) return 'peak';
  return 'fading';
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
  '댄스': 'dance',
  '게임': 'gaming',
  '펫': 'pets',
  '운동': 'lifestyle',
  '일상 브이로그': 'lifestyle',
  '유머': 'lifestyle',
  'ASMR': 'lifestyle',
  'DIY': 'lifestyle',
  '음악': 'lifestyle',
  '여행': 'lifestyle',
  '콘텐츠': 'lifestyle',
  '테크': 'lifestyle',
};

export function mapCategory(krCategory: string): Category {
  return KR_CATEGORY_MAP[krCategory] ?? 'lifestyle';
}
