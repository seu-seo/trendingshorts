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

export type AppPurpose = 'trend' | 'influencer' | 'production';

export interface SurveyAnswers {
  trendUsage: string;
  energy: string;
  targetAudience: string;
}

export interface RecommendConcept {
  title: string;        // 영상 제목/컨셉 (크리에이터가 만들 영상)
  trendBasis: string;   // 어떤 트렌드·키워드를 근거로 했는지
  hook: string;         // 첫 3초 훅 대사
  keywords: string[];   // 추천 해시태그
  expectedReaction: string; // 예상 시청자 반응
}

export interface RecommendResponse {
  concepts: RecommendConcept[];
  source: 'live' | 'mock';
}

export interface PersonaDraft {
  category: Category | null;
  styles: string[];
}

export interface Persona {
  category: Category;
  styles: string[];
  purpose?: AppPurpose;
}

export type Tab = 'dashboard' | 'recommend';

export type SortOrder = 'trending' | 'recent';
