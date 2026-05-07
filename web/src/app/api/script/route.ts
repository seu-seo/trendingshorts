import { NextResponse } from "next/server";
import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import type { ScriptRequest, ScriptResponse, ScriptTone, ScriptOutput } from "@/lib/types";
import { TONE_DEFS, buildSystemPrompt, parseScript, recommendedToneByType } from "@/lib/script";

function buildFallback(tone: ScriptTone): ScriptOutput {
  const labels: Record<ScriptTone, string> = {
    informative: "정보형",
    story: "스토리형",
    hooking: "후킹형",
  };
  return {
    hook: `[${labels[tone]}] 대본 생성에 실패했습니다.`,
    body: "잠시 후 다시 시도해주세요.",
    cta: "다시 생성하기",
  };
}

export async function POST(req: Request) {
  const body: ScriptRequest = await req.json();
  const { direction, reference, persona } = body;

  const recommendedTone = recommendedToneByType(persona.typeIndex);

  // 3가지 톤 병렬 생성
  const results = await Promise.allSettled(
    TONE_DEFS.map((tone) =>
      generateText({
        model: anthropic("claude-sonnet-4.5"),
        system: buildSystemPrompt(reference, direction, tone),
        prompt: `위 레퍼런스와 콘텐츠 방향을 바탕으로 "${tone.label}" 톤의 대본 초안을 JSON으로 생성해주세요.`,
        maxOutputTokens: 1024,
      }).then(({ text }) => parseScript(text))
    )
  );

  const scripts = Object.fromEntries(
    TONE_DEFS.map((tone, i) => {
      const result = results[i];
      return [
        tone.id,
        result.status === "fulfilled" ? result.value : buildFallback(tone.id),
      ];
    })
  ) as Record<ScriptTone, ScriptOutput>;

  // 레퍼런스 인게이지먼트 기반 적합도 점수
  const engagementBonus =
    reference.engagement_rate && reference.category_avg_engagement
      ? Math.min(3, (reference.engagement_rate / reference.category_avg_engagement) * 1.5)
      : 1.5;
  const successRate = results.filter((r) => r.status === "fulfilled").length / TONE_DEFS.length;
  const toneScore = Math.round(Math.min(10, 5 + engagementBonus + successRate * 2) * 10) / 10;

  const response: ScriptResponse = { recommendedTone, toneScore, scripts };
  return NextResponse.json(response);
}
