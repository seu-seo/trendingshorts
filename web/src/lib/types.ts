// ============================================================
// 공통 타입 정의 — 모든 팀원이 이 파일을 기준으로 사용합니다
// TrendItem, PersonaInput, PersonaResult, API Request/Response
// ============================================================

// ── 플랫폼 & 트렌드 (규동) ──────────────────────────────────

export type Platform = "youtube" | "tiktok" | "instagram";

export interface TrendItem {
  id: number;
  platform: Platform;
  title: string;
  creator: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  category: string;
  subcategory?: string;
  growth: number;
  duration: string;
  thumbnail: string;
  trending_since: string;
  tags: string[];
  videoUrl?: string;
  // API 연동 시 추가 필드
  engagement_rate?: number;
  category_avg_engagement?: number;
  duration_sec?: number;
}

// ── 온보딩 설문 & 페르소나 (지은) ──────────────────────────

// Q1~Q7 설문 응답값
export interface PersonaInput {
  platform: Platform | "multi";
  category: string;
  experience: 0 | 1 | 2 | 3 | 4 | 5;
  goal: "growth" | "monetize" | "brand" | "community";
  styles: string[];
  pain: "idea" | "trend" | "reach" | "consistency";
  uploadFreq: number; // 1~14 (주당 편수)
}

// Claude API 페르소나 분석 결과
export interface PersonaResult {
  personaType: string;       // 예: "THE TRENDSETTER"
  personaTagline: string;    // 20자 이내 한국어
  personaSummary: string;
  topTrends: {
    keyword: string;         // "#해시태그"
    state: "rising" | "peak" | "fading";
    fitScore: number;        // 0~100
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
  typeIndex: 0 | 1 | 2 | 3; // accent color 결정
}

// ── 추천 탭 API (규동) ───────────────────────────────────────

// POST /api/recommend
export interface RecommendRequest {
  persona: {
    personaType: string;
    category: string;
    platform: string;
    styles: string[];
  };
  references: TrendItem[]; // 3~5개
}

export interface RecommendResponse {
  direction: string;       // LLM 추천 방향 (사용자 수정 가능)
  suggestedTopic: string;
  hookPattern: string;
}

// ── 대본 생성 API (경재) ─────────────────────────────────────

export type ScriptTone = "informative" | "story" | "hooking";

// POST /api/script
export interface ScriptRequest {
  direction: string;       // 사용자 수정 반영된 최종 방향
  reference: TrendItem;
  persona: {
    personaType: string;
    typeIndex: number;
  };
  tone?: ScriptTone;       // 미지정 시 페르소나 기반 자동 결정
}

export interface ScriptOutput {
  hook: string;
  body: string;
  cta: string;
}

export interface ScriptResponse {
  recommendedTone: ScriptTone;
  toneScore: number;       // 0~10
  scripts: Record<ScriptTone, ScriptOutput>;
}
