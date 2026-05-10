import type { Trend, Persona } from '@/lib/types';

export type ScriptTone = 'informative' | 'story' | 'hooking';

export interface ScriptOutput {
  hook: string;
  body: string;
  cta: string;
}

export interface ToneRecommendation {
  tone: ScriptTone;
  /** 0-100, 추천 톤이 다른 두 톤보다 얼마나 더 적합한가 */
  confidence: number;
  /** 의사결정에 사용된 신호들 (사용자에게 노출 가능) */
  signals: string[];
}

export interface GenerateRequest {
  trend: Trend;
  persona: Persona | null;
  /** 사용자 수정 반영된 콘텐츠 방향. 없으면 트렌드 제목 기반 자동 생성. */
  direction?: string;
}

export interface GenerateResponse {
  recommendedTone: ScriptTone;
  toneScore: number;
  scripts: Record<ScriptTone, ScriptOutput>;
  meta: {
    promptVersion: string;
    toneSignals: string[];
    source: 'live' | 'mock';
  };
}

export const PROMPT_METADATA = {
  version: '2.1.0-web-v2',
  changedAt: '2026-05-10',
  owner: 'feature/prompt-generator (kyungjae)',
} as const;
