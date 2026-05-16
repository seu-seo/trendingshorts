import type { CategoryOption, StyleOption, Category } from '../types';

export const CATEGORIES: CategoryOption[] = [
  { value: 'food', emoji: '🍔', label: '요리 / 먹방' },
  { value: 'beauty', emoji: '💄', label: '뷰티 / 패션' },
  { value: 'lifestyle', emoji: '📹', label: '라이프스타일' },
  { value: 'gaming', emoji: '🎮', label: '게임 / 엔터' },
  { value: 'edu', emoji: '💡', label: '자기계발 / 정보' },
  { value: 'fitness', emoji: '💪', label: '운동 / 건강' },
  { value: 'art', emoji: '🎨', label: '예술 / 음악' },
];

export const STYLES: StyleOption[] = [
  { value: 'humor', emoji: '🎭', label: '유머 / 웃음' },
  { value: 'info', emoji: '💡', label: '정보 / 교육' },
  { value: 'emotion', emoji: '🤍', label: '감성 / 공감' },
  { value: 'impact', emoji: '⚡', label: '자극 / 임팩트' },
  { value: 'honest', emoji: '📝', label: '솔직 / 현실' },
  { value: 'visual', emoji: '✨', label: '비주얼 / 심미' },
  { value: 'challenge', emoji: '🔥', label: '챌린지 / 트렌드' },
  { value: 'creative', emoji: '🧪', label: '실험 / 독창성' },
];

export const CATEGORY_LABELS: Record<Category, string> = {
  food: '요리/먹방',
  beauty: '뷰티/패션',
  lifestyle: '라이프스타일',
  gaming: '게임',
  edu: '자기계발',
  fitness: '운동/건강',
  art: '예술/음악',
};
