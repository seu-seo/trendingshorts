import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import {
  recommendTone,
  buildSystemPrompt,
  buildDefaultDirection,
  parseAllScripts,
  buildFallbackScripts,
  PROMPT_METADATA,
  type GenerateRequest,
  type GenerateResponse,
  type ScriptTone,
  type ScriptOutput,
} from '@/lib/prompts';

/**
 * POST /api/generate
 *
 * Body: GenerateRequest { trend, persona, direction? }
 * Response: GenerateResponse
 *
 * 동작:
 * - ANTHROPIC_API_KEY 미설정 시 mock fallback (UI 동일 형태로 렌더 가능)
 * - 설정되면 단일 LLM 호출로 informative/story/hooking 3톤 동시 생성
 * - 톤 추천은 트렌드 메타+페르소나 신호로 사전 계산 (LLM 응답 전에 결정)
 */
export async function POST(req: Request) {
  let body: GenerateRequest;
  try {
    body = (await req.json()) as GenerateRequest;
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON in request body.' },
      { status: 400 },
    );
  }

  const { trend, persona, direction } = body;
  if (!trend) {
    return NextResponse.json(
      { error: 'Missing required field: trend.' },
      { status: 400 },
    );
  }

  const recommendation = recommendTone(trend, persona ?? null);
  const finalDirection = direction?.trim() || buildDefaultDirection(trend);

  // API 키 미설정 → mock fallback (데모/리뷰 환경에서 사용)
  if (!process.env.ANTHROPIC_API_KEY) {
    const response: GenerateResponse = {
      recommendedTone: recommendation.tone,
      toneScore: 5,
      scripts: buildFallbackScripts(),
      meta: {
        promptVersion: PROMPT_METADATA.version,
        toneSignals: recommendation.signals,
        source: 'mock',
      },
    };
    return NextResponse.json(response);
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  let scripts: Record<ScriptTone, ScriptOutput>;
  let success = true;
  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 2400,
      system: buildSystemPrompt({
        trend,
        persona: persona ?? null,
        direction: finalDirection,
        recommendation,
      }),
      messages: [
        {
          role: 'user',
          content:
            '위 컨텍스트를 바탕으로 informative / story / hooking 3가지 톤 대본을 JSON 스키마에 맞춰 한 번에 생성하세요.',
        },
      ],
    });

    const text = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('');

    scripts = parseAllScripts(text);
  } catch (e) {
    console.error('[/api/generate] LLM call failed:', e);
    scripts = buildFallbackScripts();
    success = false;
  }

  // toneScore: confidence + 호출 성공 여부 가중
  const successFactor = success ? 3 : 0;
  const toneScore =
    Math.round(Math.min(10, recommendation.confidence / 20 + successFactor) * 10) /
    10;

  const response: GenerateResponse = {
    recommendedTone: recommendation.tone,
    toneScore,
    scripts,
    meta: {
      promptVersion: PROMPT_METADATA.version,
      toneSignals: recommendation.signals,
      source: success ? 'live' : 'mock',
    },
  };

  return NextResponse.json(response);
}
