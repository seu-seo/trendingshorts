import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import type { ScriptOutput, ScriptTone } from '@/lib/prompts';
import type { RecommendConcept } from '@/lib/types';

/**
 * 콘티(스토리보드) 생성 — CONTI-SCREEN.md 설계 기준.
 *
 * 기존 /api/storyboard 와의 차이:
 *  - 5컷 → 4컷 고정 (훅 / 전환 / 본론 / 클로징)
 *  - 컷별 시간 구간(0~3s …) + 촬영 메모 추가
 *  - 유료 이미지 생성(Imagen) 제거 → 프론트 SVG 스케치(sketchType)로 대체, 비용 0
 *  - 기획 단계 정보만 (초단위 타임라인·자막·BGM 등 편집 단계 정보 제외)
 */

export type SketchType = 'closeup' | 'upper' | 'split' | 'front';

export interface ContiCut {
  index: number;        // 1~4
  part: string;         // 훅 | 전환 | 본론 | 클로징
  timeRange: string;    // "0~3s"
  shotType: string;     // 클로즈업 | 미디엄샷 | 분할 | 정면 …
  sketchType: SketchType;
  visualKo: string;     // 장면 설명 (무엇을 찍는지) — 20자 내외
  dialogue: string;     // 대사 / 자막
  shootingMemo: string; // 촬영 메모 한 줄
}

export interface ContiRequest {
  script: ScriptOutput;
  tone: ScriptTone;
  concept?: RecommendConcept | null;
}

export interface ContiResponse {
  cuts: ContiCut[];
  trendPoint: string;   // 이 콘티가 트렌드를 어떻게 활용하는지 한 줄
  source: 'live' | 'mock';
}

// 15초 숏폼 4컷 골격 (CONTI-SCREEN.md 표 기준)
const CUT_SKELETON: { part: string; timeRange: string; shotType: string; sketchType: SketchType }[] = [
  { part: '훅', timeRange: '0~3s', shotType: '클로즈업', sketchType: 'closeup' },
  { part: '전환', timeRange: '3~6s', shotType: '미디엄샷', sketchType: 'upper' },
  { part: '본론', timeRange: '6~12s', shotType: '분할', sketchType: 'split' },
  { part: '클로징', timeRange: '12~15s', shotType: '정면', sketchType: 'front' },
];

const SHOOTING_MEMO_HINT: string[] = [
  '표정 클로즈업 — 첫 컷에서 시선 고정',
  '제스처를 크게, 다음 내용 예고',
  '핵심을 화면 분할/자막으로 강조',
  '카메라 정면으로 밝게 마무리 + CTA',
];

function buildContiPrompt(
  script: ScriptOutput,
  tone: ScriptTone,
  concept?: RecommendConcept | null
): string {
  const conceptSection = concept
    ? `\n[영상 컨셉]\n제목: ${concept.title}\n트렌드 근거: ${concept.trendBasis}\n`
    : '';

  return `당신은 숏폼 영상 콘티(스토리보드) 전문가입니다.
아래 대본을 15초 숏폼 기준 **정확히 4컷** 콘티로 분해하세요.
기획 단계 정보만 담고, 초단위 타임라인·자막 스타일·BGM 같은 편집 단계 정보는 넣지 마세요.
${conceptSection}
[대본 · 톤: ${tone}]
훅: ${script.hook}
본문: ${script.body}
CTA: ${script.cta}

[4컷 구조 — 고정]
1. 훅 (0~3s): 공감/놀람으로 이탈 방지 — 표정 클로즈업
2. 전환 (3~6s): 본론 예고, 궁금증 유발 — 상반신/제스처
3. 본론 (6~12s): 핵심 전달 — 분할 또는 설명 샷
4. 클로징 (12~15s): CTA·참여 유도 — 정면 밝은 표정

[각 컷 작성 규칙]
- visualKo: 무엇을 찍는지 한국어 20자 내외 (예: "고민하는 표정 클로즈업")
- dialogue: 대본을 반영한 실제 대사/자막 한 줄
- shootingMemo: 초기 크리에이터가 바로 따라 할 촬영 팁 한 줄
- shotType: 클로즈업 | 미디엄샷 | 분할 | 정면 | 풀샷 중 택1

[출력 — 순수 JSON만, 설명 금지]
{"trendPoint":"이 콘티가 트렌드를 어떻게 활용하는지 한 줄","cuts":[{"index":1,"visualKo":"...","dialogue":"...","shootingMemo":"...","shotType":"클로즈업"},{"index":2,...},{"index":3,...},{"index":4,...}]}`;
}

/** LLM 미사용/실패 시 대본에서 직접 4컷 구성 */
function buildFallbackConti(
  script: ScriptOutput,
  concept?: RecommendConcept | null
): { cuts: ContiCut[]; trendPoint: string } {
  const bodyLines = script.body.split('\n').map((l) => l.trim()).filter(Boolean);
  const bodyMid = bodyLines.length > 0 ? bodyLines[Math.floor(bodyLines.length / 2)] : script.body;
  const bodyFirst = bodyLines[0] ?? script.body;
  const dialogues = [script.hook, bodyFirst, bodyMid, script.cta];

  const visuals = [
    '고민/놀란 표정 클로즈업',
    '아이디어 떠오르는 상반신 컷',
    '핵심 보여주는 분할 화면',
    '환하게 웃으며 정면 마무리',
  ];

  const cuts: ContiCut[] = CUT_SKELETON.map((s, i) => ({
    index: i + 1,
    part: s.part,
    timeRange: s.timeRange,
    shotType: s.shotType,
    sketchType: s.sketchType,
    visualKo: visuals[i],
    dialogue: (dialogues[i] ?? '').slice(0, 120),
    shootingMemo: SHOOTING_MEMO_HINT[i],
  }));

  const trendPoint = concept?.trendBasis
    ? `트렌드 근거: ${concept.trendBasis}`
    : '고민→해결 제목 구조로 트렌드 흐름을 활용합니다.';

  return { cuts, trendPoint };
}

type ParsedCut = {
  index?: number;
  visualKo?: string;
  dialogue?: string;
  shootingMemo?: string;
  shotType?: string;
};

function parseConti(
  text: string,
  fallback: { cuts: ContiCut[]; trendPoint: string }
): { cuts: ContiCut[]; trendPoint: string } | null {
  try {
    const cleaned = text.replace(/```json|```/g, '').trim();
    const jsonStr = cleaned.match(/\{[\s\S]*\}/)?.[0];
    if (!jsonStr) return null;
    const parsed = JSON.parse(jsonStr) as { trendPoint?: string; cuts?: ParsedCut[] };
    if (!Array.isArray(parsed.cuts) || parsed.cuts.length === 0) return null;

    // 항상 4컷 골격에 맞춰 정규화 — LLM이 컷을 빠뜨려도 구조 유지
    const cuts: ContiCut[] = CUT_SKELETON.map((skel, i) => {
      const raw = parsed.cuts![i];
      const fb = fallback.cuts[i];
      return {
        index: i + 1,
        part: skel.part,
        timeRange: skel.timeRange,
        shotType: raw?.shotType?.trim() || skel.shotType,
        sketchType: skel.sketchType,
        visualKo: raw?.visualKo?.trim() || fb.visualKo,
        dialogue: raw?.dialogue?.trim() || fb.dialogue,
        shootingMemo: raw?.shootingMemo?.trim() || fb.shootingMemo,
      };
    });

    return { cuts, trendPoint: parsed.trendPoint?.trim() || fallback.trendPoint };
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  let body: ContiRequest;
  try {
    body = (await req.json()) as ContiRequest;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { script, tone, concept } = body;
  if (!script || !tone) {
    return NextResponse.json({ error: 'Missing script or tone' }, { status: 400 });
  }

  const fallback = buildFallbackConti(script, concept);

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return NextResponse.json({
      cuts: fallback.cuts,
      trendPoint: fallback.trendPoint,
      source: 'mock',
    } satisfies ContiResponse);
  }

  try {
    const { text } = await generateText({
      model: google('gemini-2.5-flash'),
      prompt: buildContiPrompt(script, tone, concept),
    });
    const result = parseConti(text, fallback) ?? fallback;
    return NextResponse.json({
      cuts: result.cuts,
      trendPoint: result.trendPoint,
      source: 'live',
    } satisfies ContiResponse);
  } catch (e) {
    console.error('[/api/conti] Gemini failed:', e);
    return NextResponse.json({
      cuts: fallback.cuts,
      trendPoint: fallback.trendPoint,
      source: 'mock',
    } satisfies ContiResponse);
  }
}
