import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { google } from '@ai-sdk/google';
import { generateText, experimental_generateImage as generateImage } from 'ai';
import type { ScriptOutput, ScriptTone } from '@/lib/prompts';
import type { RecommendConcept } from '@/lib/types';

/**
 * 콘티(스토리보드) 생성 — CONTI-SCREEN.md 설계 기준.
 *
 * 흐름:
 *  1) Gemini(text)로 대본을 **정확히 4컷**(훅/전환/본론/클로징)으로 분해
 *     + 4컷 내내 동일하게 등장할 "주인공 캐릭터 시트"(character)를 1회 정의
 *  2) Imagen으로 컷별 만화 이미지 생성. 매 컷 프롬프트에
 *     [고정 만화 화풍] + [동일 캐릭터 시트] + [컷 장면]을 주입 →
 *     "같은 만화가가 같은 인물을 그린 4컷"처럼 일관되게.
 *  3) 키 없음/Imagen 실패(예: billing 미설정) 시 imageUrl='' → 프론트가 SVG 스케치로 fallback (비용 0)
 *
 * 주의: Imagen은 Google AI 유료(billing) 플랜에서만 동작. 무료 키는 텍스트만 됨 → 이미지 자리는 SVG로 대체됨.
 */

export const maxDuration = 60;

export type SketchType = 'closeup' | 'upper' | 'split' | 'front';

export interface ContiCut {
  index: number;        // 1~4
  part: string;         // 훅 | 전환 | 본론 | 클로징
  timeRange: string;    // "0~3s"
  shotType: string;     // 클로즈업 | 미디엄샷 | 분할 | 정면 …
  sketchType: SketchType;
  visualKo: string;     // 장면 설명 (무엇을 찍는지) — 20자 내외
  visualEn: string;     // 이미지 생성용 영어 장면 묘사
  dialogue: string;     // 대사 / 자막
  shootingMemo: string; // 촬영 메모 한 줄
  imageUrl: string;     // Imagen base64 data URL ('' 면 SVG fallback)
}

export interface ContiRequest {
  script: ScriptOutput;
  tone: ScriptTone;
  concept?: RecommendConcept | null;
}

export interface ContiResponse {
  cuts: ContiCut[];
  trendPoint: string;   // 이 콘티가 트렌드를 어떻게 활용하는지 한 줄
  character: string;    // 4컷 공통 주인공 캐릭터 시트 (디버그/표시용)
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

// 컷별 영어 장면 fallback (텍스트 LLM 실패 시)
const VISUAL_EN_FALLBACK: string[] = [
  'extreme close-up of the character with a surprised, troubled expression, hand near chin',
  'medium shot, character pointing up with index finger, bright eureka expression',
  'split composition: character explaining on one side, the key object shown on the other',
  'front medium shot, character beaming with a big smile, both arms slightly raised toward camera',
];

// ── 일관성의 핵심: 고정 만화 화풍 + 동일 캐릭터를 매 컷 프롬프트에 주입 ──
const MANGA_STYLE =
  'black and white Japanese shonen manga storyboard panel, drawn by a single skilled professional mangaka, ' +
  'clean confident ink linework, dynamic screentone halftone shading, expressive faces, ' +
  'consistent character design and consistent art style across panels, high detail, single comic panel, no text';

const DEFAULT_CHARACTER =
  'the SAME single recurring main character in every panel: a Korean short-form video creator in their early 20s, ' +
  'short tidy dark hair, casual hoodie, friendly expressive face, identical across all 4 panels';

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
- visualEn: 같은 장면을 만화로 그리기 위한 **영어** 묘사. 인물 동작·표정·소품 중심, 15단어 내외. (영어만)
- dialogue: 대본을 반영한 실제 대사/자막 한 줄
- shootingMemo: 초기 크리에이터가 바로 따라 할 촬영 팁 한 줄
- shotType: 클로즈업 | 미디엄샷 | 분할 | 정면 | 풀샷 중 택1

[character — 매우 중요]
4컷 내내 **동일하게 등장할 주인공**을 영어 한 문장으로 정의하세요. (성별·머리·옷·분위기 등 고정 외형)
모든 visualEn은 이 동일 인물을 그린다는 전제로 작성하세요.

[출력 — 순수 JSON만, 설명 금지]
{"trendPoint":"...","character":"a young ... (영어 한 문장)","cuts":[{"index":1,"visualKo":"...","visualEn":"...","dialogue":"...","shootingMemo":"...","shotType":"클로즈업"},{"index":2,...},{"index":3,...},{"index":4,...}]}`;
}

/** LLM 미사용/실패 시 대본에서 직접 4컷 구성 */
function buildFallbackConti(
  script: ScriptOutput,
  concept?: RecommendConcept | null
): { cuts: Omit<ContiCut, 'imageUrl'>[]; trendPoint: string; character: string } {
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

  const cuts = CUT_SKELETON.map((s, i) => ({
    index: i + 1,
    part: s.part,
    timeRange: s.timeRange,
    shotType: s.shotType,
    sketchType: s.sketchType,
    visualKo: visuals[i],
    visualEn: VISUAL_EN_FALLBACK[i],
    dialogue: (dialogues[i] ?? '').slice(0, 120),
    shootingMemo: SHOOTING_MEMO_HINT[i],
  }));

  const trendPoint = concept?.trendBasis
    ? `트렌드 근거: ${concept.trendBasis}`
    : '고민→해결 제목 구조로 트렌드 흐름을 활용합니다.';

  return { cuts, trendPoint, character: DEFAULT_CHARACTER };
}

type ParsedCut = {
  index?: number;
  visualKo?: string;
  visualEn?: string;
  dialogue?: string;
  shootingMemo?: string;
  shotType?: string;
};

function parseConti(
  text: string,
  fallback: { cuts: Omit<ContiCut, 'imageUrl'>[]; trendPoint: string; character: string }
): { cuts: Omit<ContiCut, 'imageUrl'>[]; trendPoint: string; character: string } | null {
  try {
    const cleaned = text.replace(/```json|```/g, '').trim();
    const jsonStr = cleaned.match(/\{[\s\S]*\}/)?.[0];
    if (!jsonStr) return null;
    const parsed = JSON.parse(jsonStr) as { trendPoint?: string; character?: string; cuts?: ParsedCut[] };
    if (!Array.isArray(parsed.cuts) || parsed.cuts.length === 0) return null;

    // 항상 4컷 골격에 맞춰 정규화 — LLM이 컷을 빠뜨려도 구조 유지
    const cuts = CUT_SKELETON.map((skel, i) => {
      const raw = parsed.cuts![i];
      const fb = fallback.cuts[i];
      return {
        index: i + 1,
        part: skel.part,
        timeRange: skel.timeRange,
        shotType: raw?.shotType?.trim() || skel.shotType,
        sketchType: skel.sketchType,
        visualKo: raw?.visualKo?.trim() || fb.visualKo,
        visualEn: raw?.visualEn?.trim() || fb.visualEn,
        dialogue: raw?.dialogue?.trim() || fb.dialogue,
        shootingMemo: raw?.shootingMemo?.trim() || fb.shootingMemo,
      };
    });

    return {
      cuts,
      trendPoint: parsed.trendPoint?.trim() || fallback.trendPoint,
      character: parsed.character?.trim() || fallback.character,
    };
  } catch {
    return null;
  }
}

function buildImagePrompt(cut: Omit<ContiCut, 'imageUrl'>, character: string): string {
  return `${MANGA_STYLE}. ${character}. Panel ${cut.index} of a 4 panel manga sequence. Scene: ${cut.visualEn}. Camera: ${cut.shotType}.`;
}

async function generatePanelImage(prompt: string): Promise<string> {
  try {
    const { image } = await generateImage({
      model: google.imageModel('imagen-4.0-fast-generate-001'),
      prompt,
      aspectRatio: '16:9',
    });
    return `data:image/jpeg;base64,${image.base64}`;
  } catch (e) {
    console.error('[/api/conti] Imagen failed:', e instanceof Error ? e.message : e);
    return '';
  }
}

async function attachImages(
  bases: Omit<ContiCut, 'imageUrl'>[],
  character: string
): Promise<ContiCut[]> {
  return Promise.all(
    bases.map(async (c) => ({
      ...c,
      imageUrl: await generatePanelImage(buildImagePrompt(c, character)),
    }))
  );
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

  // 키 없음 → 텍스트/이미지 모두 mock (프론트 SVG fallback)
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return NextResponse.json({
      cuts: fallback.cuts.map((c) => ({ ...c, imageUrl: '' })),
      trendPoint: fallback.trendPoint,
      character: fallback.character,
      source: 'mock',
    } satisfies ContiResponse);
  }

  // 1) 4컷 분해 + 캐릭터 시트 (Gemini text)
  let parsed = fallback;
  try {
    const { text } = await generateText({
      model: google('gemini-2.5-flash'),
      prompt: buildContiPrompt(script, tone, concept),
    });
    parsed = parseConti(text, fallback) ?? fallback;
  } catch (e) {
    console.error('[/api/conti] Gemini text failed:', e);
  }

  // 2) 컷별 만화 이미지 (동일 화풍·동일 캐릭터). 실패 시 imageUrl='' → SVG fallback
  const cuts = await attachImages(parsed.cuts, parsed.character);

  return NextResponse.json({
    cuts,
    trendPoint: parsed.trendPoint,
    character: parsed.character,
    source: 'live',
  } satisfies ContiResponse);
}
