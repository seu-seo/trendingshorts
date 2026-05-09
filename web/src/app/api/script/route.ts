import { NextResponse } from "next/server";
import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import type {
  ScriptRequest,
  ScriptResponse,
  ScriptTone,
  ScriptOutput,
} from "@/lib/types";
import {
  buildSystemPrompt,
  parseAllScripts,
  recommendTone,
  PROMPT_METADATA,
} from "@/lib/script";

// ============================================================
// /api/script  — v2
// Owner: feature/script (경재)
//
// v1 → v2 변경점
// - 3개 톤 병렬 호출(3 LLM calls) → 단일 호출로 3톤 동시 생성 (비용 1/3)
// - typeIndex 기반 톤 결정 → reference metric + persona styles 데이터 신호 기반
// - 톤 결정 근거(signals)를 응답에 포함하여 사용자에게 노출 가능
// - 환경변수 검증 + meta 응답 (prompt_version, usage 토큰 수)
// ============================================================

interface ExtendedScriptRequest extends ScriptRequest {
  // onboarding 측에서 styles와 followerCount를 전달하면 더 정확한 톤 추천 가능.
  // 미전달 시 기존 동작 호환 (styles 없이 score 계산).
  persona: ScriptRequest["persona"] & {
    styles?: string[];
    followerCount?: number;
  };
}

function buildFallback(): Record<ScriptTone, ScriptOutput> {
  const fallback: ScriptOutput = {
    hook: "대본 생성에 실패했습니다.",
    body: "잠시 후 다시 시도해주세요.\n네트워크 또는 LLM 응답 오류가 발생했을 수 있습니다.",
    cta: "다시 생성하기",
  };
  return {
    informative: fallback,
    story: fallback,
    hooking: fallback,
  };
}

export async function POST(req: Request) {
  // 환경변수 검증
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      {
        error: "ANTHROPIC_API_KEY is not configured.",
        hint: ".env.local 에 키를 설정하세요. (gitignore 됨)",
      },
      { status: 500 }
    );
  }

  let body: ExtendedScriptRequest;
  try {
    body = (await req.json()) as ExtendedScriptRequest;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body." },
      { status: 400 }
    );
  }

  const { direction, reference, persona } = body;
  if (!direction || !reference || !persona) {
    return NextResponse.json(
      { error: "Missing required fields: direction, reference, persona." },
      { status: 400 }
    );
  }

  // 데이터 신호 기반 톤 추천 (typeIndex 의존 제거)
  const recommendation = recommendTone(reference, {
    styles: persona.styles,
    typeIndex: persona.typeIndex,
    followerCount: persona.followerCount,
  });

  // 단일 LLM 호출로 3톤 동시 생성
  let scripts: Record<ScriptTone, ScriptOutput>;
  let success = true;
  try {
    const { text } = await generateText({
      model: anthropic("claude-sonnet-4.5"),
      system: buildSystemPrompt({
        reference,
        direction,
        persona,
        recommendation,
      }),
      prompt:
        "위 컨텍스트를 바탕으로 informative / story / hooking 3가지 톤 대본을 JSON 스키마에 맞춰 한 번에 생성하세요.",
      maxOutputTokens: 2400, // 3톤 분량 + 여유
    });
    scripts = parseAllScripts(text);
  } catch (e) {
    console.error("[/api/script] generation failed:", e);
    scripts = buildFallback();
    success = false;
  }

  // 적합도 점수: confidence(데이터 기반) + 인게이지먼트 보너스 + 호출 성공 여부
  const erBonus =
    reference.engagement_rate && reference.category_avg_engagement
      ? Math.min(2, (reference.engagement_rate / reference.category_avg_engagement) * 1)
      : 1;
  const successFactor = success ? 2 : 0;
  const toneScore =
    Math.round(
      Math.min(10, recommendation.confidence / 20 + erBonus + successFactor) * 10
    ) / 10;

  const response: ScriptResponse & {
    meta?: {
      promptVersion: string;
      toneSignals: string[];
      success: boolean;
    };
  } = {
    recommendedTone: recommendation.tone,
    toneScore,
    scripts,
    meta: {
      promptVersion: PROMPT_METADATA.version,
      toneSignals: recommendation.signals,
      success,
    },
  };

  return NextResponse.json(response);
}
