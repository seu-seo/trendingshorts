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
}

export interface Persona {
  category: Category;
  styles: string[];
}

export interface ProductionPrompt {
  toneClass: 'tone-emotional' | 'tone-info' | 'tone-trend';
  toneLabel: string;
  headline: string;
  meta: string[];
  reason: string;
}

export type Tab = 'dashboard' | 'recommend' | 'production';

export type SortOrder = 'trending' | 'recent';
