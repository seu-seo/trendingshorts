export type Platform = 'youtube' | 'tiktok' | 'instagram';
export type PlatformFilter = Platform | 'all';

export type Category = 'food' | 'beauty' | 'dance' | 'music' | 'gaming' | 'pets' | 'fitness' | 'lifestyle';

export type HeatLevel = 'HOT' | 'WARM' | 'COLD';

export interface Trend {
  id: number;
  category: Category;
  heatLevel: HeatLevel;
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
  engagementRate: number;
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

export type Tab = 'dashboard' | 'recommend' | 'my' | 'rivals';

export type SortOrder = 'trending' | 'recent';

// ── 온보딩 설문 & 페르소나 ──────────────────────────────────

export type OnboardingCategory = Category;

export interface PersonaInput {
  platform: Platform | 'multi';
  category: OnboardingCategory;
  experience: 0 | 1 | 2 | 3 | 4 | 5;
  goal: 'growth' | 'monetize' | 'brand' | 'community';
  styles: string[];
  pain: 'idea' | 'trend' | 'reach' | 'consistency';
  uploadFreq: 'low' | 'mid' | 'high' | 'undecided';
}

export interface PersonaResult {
  personaType: string;
  personaTagline: string;
  personaSummary: string;
  topTrends: {
    keyword: string;
    state: 'rising' | 'peak' | 'fading';
    fitScore: number;
    reason: string;
  }[];
  hookPatterns: {
    type: string;
    example: string;
  }[];
  actionItems: {
    title: string;
    desc: string;
  }[];
  weeklyPlan: string;
  typeIndex: 0 | 1 | 2 | 3;
}

export type AppIntent = 'explore' | 'produce';

export type AgeGroup = '10s' | '20s' | '30s' | '40s' | '50+';

// 온보딩 취향설정 (screen-q-all)
export interface OnboardingPrefs {
  platform: PlatformFilter;       // 틱톡/인스타/유튜브/전체
  categories: string[];           // 멀티선택 카테고리 (preset value 또는 직접 입력)
  age: AgeGroup | null;           // 타깃 연령대
}

export type FollowerTier = 1 | 2 | 3 | 4 | 5;

export interface Creator {
  handle: string;
  followersLabel: string;
  followers: number;
  niche: string;
  uploadFreq: string;
  tier: FollowerTier;
  growth: number;
  score: number;
  reason: string;
}

export type RivalChannelSize = 'nano' | 'micro' | 'mid';
export type RivalUploadFreq = 'daily' | 'weekly-mid' | 'weekly-low';
export type RivalContentTone = 'info' | 'vlog' | 'entertainment';
export type RivalGender = 'male' | 'female' | 'any';

export interface RivalSurvey {
  topics: string[];
  channelSize: RivalChannelSize;
  uploadFreq: RivalUploadFreq;
  contentTone: RivalContentTone;
  gender: RivalGender;
  lang: 'ko' | 'global';
}

export interface RivalCandidate {
  channelId: string;
  channelTitle: string;
  handle: string;
  description: string;
  subscribers: number;
  videoCount: number;
  avgUploadDays: number;
  recentTitles: string[];
  thumbnailUrl: string;
  sampleThumbnails: string[];
}

export interface RivalResult {
  channelId: string;
  channelTitle: string;
  handle: string;
  subscribers: number;
  subscribersLabel: string;
  thumbnail: string;
  niche: string;
  similarityScore: number;
  matchReasons: string[];
  sampleThumbnails: string[];
  channelUrl: string;
}
