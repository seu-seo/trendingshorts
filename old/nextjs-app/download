export type Platform = 'youtube' | 'tiktok' | 'instagram' | 'multi';
export type Category = 'food' | 'beauty' | 'lifestyle' | 'edu' | 'gaming' | 'fitness' | 'art';
export type Goal = 'growth' | 'monetize' | 'brand' | 'community';
export type Pain = 'idea' | 'consistency' | 'quality' | 'time';
export type Intent = 'explore' | 'reference' | 'produce';

export interface Answers {
  platform?: Platform;
  category?: Category;
  experience?: number;
  goal?: Goal;
  style?: string[];
  pain?: Pain;
  frequency?: number;
  intent?: Intent;
}

export interface Persona {
  name: string;
  tag: string;
  color: string;
}

export interface VideoItem {
  thumb: string;
  title: string;
  views: string;
  likes: string;
  time: string;
  tags: string[];
}

export interface KeywordItem {
  text: string;
  type: 'hot' | 'rising' | '';
}

export interface Creator {
  name: string;
  followers: string;
  niche: string;
  uploads: string;
  score: number;
  growth: number;
  reason: string;
}

export interface CategoryDataItem {
  title: string;
  videos: VideoItem[];
  keywords: KeywordItem[];
  insight: string;
  creators: Creator[];
}
