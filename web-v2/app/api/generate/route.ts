import { NextResponse } from 'next/server';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
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

export async function POST(req: Request) {
  let body: GenerateRequest;
  try {
    body = (await req.json()) as GenerateRequest;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON in request body.' }, { status: 400 });
  }

  const { trend, persona, direction } = body;
  if (!trend) {
    return NextResponse.json({ error: 'Missing required field: trend.' }, { status: 400 });
  }

  const recommendation = recommendTone(trend, persona ?? null);
  const finalDirection = direction?.trim() || buildDefaultDirection(trend, persona ?? null);

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    const response: GenerateResponse = {
      recommendedTone: recommendation.tone,
      toneScore: 5,
      scripts: buildFallbackScripts(persona?.brandPitch),
      meta: { promptVersion: PROMPT_METADATA.version, toneSignals: recommendation.signals, source: 'mock' },
    };
    return NextResponse.json(response);
  }

  let scripts: Record<ScriptTone, ScriptOutput>;
  let success = true;
  try {
    const { text } = await generateText({
      model: google('gemini-2.5-flash'),
      system: buildSystemPrompt({ trend, persona: persona ?? null, direction: finalDirection, recommendation }),
      prompt: '위 컨텍스트를 바탕으로 informative / story / hooking 3가지 톤 대본을 JSON 스키마에 맞춰 한 번에 생성하세요.',
    });
    scripts = parseAllScripts(text);
  } catch (e) {
    console.error('[/api/generate] Gemini call failed:', e);
    scripts = buildFallbackScripts(persona?.brandPitch);
    success = false;
  }

  const successFactor = success ? 3 : 0;
  const toneScore = Math.round(Math.min(10, recommendation.confidence / 20 + successFactor) * 10) / 10;

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
