export type Platform = 'youtube' | 'tiktok' | 'instagram';
export type PlatformFilter = Platform | 'all';

export type Category = 'food' | 'beauty' | 'dance' | 'lifestyle' | 'gaming' | 'pets';

export type Lifecycle = 'rising' | 'peak' | 'fading';

export interface Trend {
  id: number;
  category: Category;
  lifecycle: Lifecycle;
  platform: Platform;
  platformLabel: string;
  time: string;
  thumb: string;
  title: string;
  creator: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  hashtags: string;
  growth: number;
  duration: string;
  videoUrl?: string;
}

export interface CategoryOption {
  value: Category;
  emoji: string;
  label: string;
}

export interface StyleOption {
  value: string;
  emoji: string;
  label: string;
}

export interface PersonaDraft {
  category: Category | null;
  styles: string[];
  brandPitch: string;
}

export interface Persona {
  category: Category;
  styles: string[];
  /** 한 줄 브랜드/제품 소개. 예) "민감잇몸용 토너치약 — 30대 직장인 타겟 D2C". */
  brandPitch: string;
}

export type Tab = 'dashboard' | 'recommend' | 'production';

export type SortOrder = 'trending' | 'recent';
