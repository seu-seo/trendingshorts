import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { generateTextResilient } from '@/lib/ai';
import type { ScriptOutput, ScriptTone } from '@/lib/prompts';
import type { RecommendConcept } from '@/lib/types';

/**
 * 콘티(스토리보드) 생성 — CONTI-SCREEN.md 설계 기준.
 *
 * 흐름:
 *  1) Gemini(text)로 대본을 **정확히 4컷**(훅/전환/본론/클로징)으로 분해 +
 *     - character: 1·4컷에 등장하는 주인공 (한국 20대 여성 크리에이터, 외형 고정)
 *     - subject:   이 영상이 소개하는 대상(제품/트렌드/주제) — 2·3컷의 주인공
 *  2) Gemini 이미지 모델(nano-banana, gemini-2.5-flash-image)로 컷별 만화 생성.
 *     - 컷 구성: 1=인물 훅 / 2=제품 클로즈업 / 3=제품 시연 / 4=인물 CTA
 *     - 16:9, **이미지에 글자/말풍선 금지**(대사는 UI에 한글로 표시), 동일 화풍·캐릭터
 *  3) 키 없음/이미지 실패 시 imageUrl='' → 프론트가 SVG 스케치로 fallback (비용 0)
 */

export const maxDuration = 300;

export type SketchType = 'closeup' | 'upper' | 'split' | 'front';

export interface ContiCut {
  index: number;        // 1~4
  part: string;         // 훅 | 전환 | 본론 | 클로징
  timeRange: string;    // "0~3s"
  shotType: string;     // 클로즈업 | 미디엄샷 | 분할 | 정면 …
  sketchType: SketchType;
  visualKo: string;     // 장면 설명 (무엇을 찍는지) — 20자 내외
  visualEn: string;     // 이미지 생성용 영어 장면 묘사
  dialogue: string;     // 대사 / 자막 (UI에 한국어로 표시)
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
  character: string;    // 4컷 공통 주인공 (디버그/표시용)
  subject: string;      // 소개 대상(제품/트렌드)
  source: 'live' | 'mock';
}

// 15초 숏폼 4컷 골격 — 인물(크리에이터)은 시작/끝 2컷만, 가운데 2컷은 제품 중심
// focus: 'creator' → 인물 등장 / 'product' → 소개 대상(제품/주제)이 주인공
const CUT_SKELETON: { part: string; timeRange: string; shotType: string; sketchType: SketchType; focus: 'creator' | 'product' }[] = [
  { part: '훅', timeRange: '0~3s', shotType: '인물 클로즈업', sketchType: 'closeup', focus: 'creator' },
  { part: '전환', timeRange: '3~6s', shotType: '제품 클로즈업', sketchType: 'split', focus: 'product' },
  { part: '본론', timeRange: '6~12s', shotType: '제품 시연', sketchType: 'split', focus: 'product' },
  { part: '클로징', timeRange: '12~15s', shotType: '인물 정면', sketchType: 'front', focus: 'creator' },
];

// 1·4컷에만 크리에이터 등장
const CREATOR_CUTS = new Set([1, 4]);

const SHOOTING_MEMO_HINT: string[] = [
  '인물 표정 클로즈업 — 첫 컷에서 시선 고정',
  '제품을 화면 가득 클로즈업 — 인물보다 제품',
  '제품 사용/시연 장면 — 제품에 맞는 손·연출',
  '다시 등장해 정면으로 밝게 마무리 + CTA',
];

// 컷별 영어 장면 fallback (텍스트 LLM 실패 시) — 1·4 인물 / 2·3 제품
const VISUAL_EN_FALLBACK: string[] = [
  'extreme close-up of the woman creator with a surprised, curious expression, hooking the viewer',
  'close-up of the product/subject itself presented prominently, hands holding or pointing at it, no face',
  'detailed scene of the product/subject in use with an appropriate model or hands, product is the focus',
  'front medium shot of the woman creator beaming and waving at the camera, call to action',
];

// ── 일관성의 핵심: 고정 만화 화풍 + 동일(여성) 캐릭터 + 소개 대상 ──
const MANGA_STYLE =
  'black and white Japanese shonen manga storyboard panel, drawn by a single skilled professional mangaka, ' +
  'clean confident ink linework, dynamic screentone halftone shading, expressive faces, ' +
  'consistent character design and consistent art style across panels, high detail, single comic panel';

// 이미지 안에 글자가 들어가지 않도록 강하게 차단 (일본어/한글 말풍선 방지)
// 프롬프트 맨 앞(가중치 높음)에 두는 선언
const NO_TEXT_LEAD =
  'A completely WORDLESS manga illustration. Critical hard constraint: NO text, NO letters, NO words, ' +
  'NO speech bubbles, NO dialogue balloons, NO captions, NO sound effects, NO onomatopoeia, ' +
  'NO Japanese characters, NO Korean characters, NO writing of any kind anywhere. Convey everything through expression and action only.';
// 끝에서 한 번 더 강조
const NO_TEXT_TAIL =
  'Reminder: the panel must contain ZERO text and ZERO speech bubbles.';

const DEFAULT_CHARACTER =
  'the SAME single recurring FEMALE main character in every panel: a young Korean woman in her early 20s, ' +
  'short wavy dark hair, casual oversized hoodie, friendly expressive face, identical appearance across all 4 panels';

const DEFAULT_SUBJECT = 'the main product or topic that the video introduces';

function buildContiPrompt(
  script: ScriptOutput,
  tone: ScriptTone,
  concept?: RecommendConcept | null
): string {
  const conceptSection = concept
    ? `\n[영상 컨셉]\n제목: ${concept.title}\n트렌드 근거: ${concept.trendBasis}\n키워드: ${concept.keywords?.join(', ') ?? ''}\n`
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
1. 훅 (0~3s): **크리에이터(인물) 등장** — 표정 클로즈업으로 시선 잡기
2. 전환 (3~6s): **소개 대상(제품/주제) 클로즈업** — 인물 얼굴 대신 제품을 보여주며 전환
3. 본론 (6~12s): **제품 시연/디테일** — 제품 특성에 맞는 적절한 모델·연출(손·사용 장면·대상 자체)로 제품 중심
4. 클로징 (12~15s): **크리에이터(인물) 다시 등장** — 정면 미소 + CTA

[인물 등장 규칙 — 매우 중요]
크리에이터(여성) 얼굴은 **시작(1컷)과 끝(4컷)에만** 등장합니다.
**2·3컷은 인물 얼굴이 아니라 소개 대상(제품/주제)이 주인공**입니다. 사람이 필요하면 제품에 맞는 모델(손·사용 장면 등)만 쓰고, 제품이 화면 중심이 되게 하세요.

[character — 매우 중요]
1·4컷에 등장할 **주인공**을 영어 한 문장으로 정의하세요.
반드시 **한국 20대 여성 크리에이터**, 고정 외형(머리·옷·분위기). 1컷과 4컷에 같은 인물.

[subject — 매우 중요]
이 영상이 **소개하는 대상**(제품/트렌드/주제)을 영어 한 문장으로 정의하세요. 2·3컷의 주인공입니다.

[각 컷 작성 규칙]
- visualKo: 무엇을 찍는지 한국어 20자 내외 (1·4컷=인물, 2·3컷=제품 예: "제품 클로즈업")
- visualEn: 같은 장면을 만화로 그리기 위한 **영어** 묘사 15단어 내외. 1·4컷은 여성 크리에이터, 2·3컷은 소개 대상(제품)이 화면 중심. (영어만, 글자/말풍선 묘사 금지)
- dialogue: 대본을 반영한 실제 대사/자막 한 줄 (한국어)
- shootingMemo: 초기 크리에이터가 바로 따라 할 촬영 팁 한 줄
- shotType: 클로즈업 | 미디엄샷 | 분할 | 정면 | 풀샷 중 택1

[출력 — 순수 JSON만, 설명 금지]
{"trendPoint":"...","character":"a young Korean woman ... (영어 한 문장)","subject":"... (영어 한 문장)","cuts":[{"index":1,"visualKo":"...","visualEn":"...","dialogue":"...","shootingMemo":"...","shotType":"클로즈업"},{"index":2,...},{"index":3,...},{"index":4,...}]}`;
}

/** LLM 미사용/실패 시 대본에서 직접 4컷 구성 */
function buildFallbackConti(
  script: ScriptOutput,
  concept?: RecommendConcept | null
): { cuts: Omit<ContiCut, 'imageUrl'>[]; trendPoint: string; character: string; subject: string } {
  const bodyLines = script.body.split('\n').map((l) => l.trim()).filter(Boolean);
  const bodyMid = bodyLines.length > 0 ? bodyLines[Math.floor(bodyLines.length / 2)] : script.body;
  const bodyFirst = bodyLines[0] ?? script.body;
  const dialogues = [script.hook, bodyFirst, bodyMid, script.cta];

  const visuals = [
    '크리에이터 표정 클로즈업',
    '제품 클로즈업 (인물 X)',
    '제품 시연/디테일',
    '크리에이터 정면 마무리',
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

  const subject = concept?.title
    ? `the topic of the video: ${concept.title}`
    : DEFAULT_SUBJECT;

  return { cuts, trendPoint, character: DEFAULT_CHARACTER, subject };
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
  fallback: { cuts: Omit<ContiCut, 'imageUrl'>[]; trendPoint: string; character: string; subject: string }
): { cuts: Omit<ContiCut, 'imageUrl'>[]; trendPoint: string; character: string; subject: string } | null {
  try {
    const cleaned = text.replace(/```json|```/g, '').trim();
    const jsonStr = cleaned.match(/\{[\s\S]*\}/)?.[0];
    if (!jsonStr) return null;
    const parsed = JSON.parse(jsonStr) as {
      trendPoint?: string;
      character?: string;
      subject?: string;
      cuts?: ParsedCut[];
    };
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
      subject: parsed.subject?.trim() || fallback.subject,
    };
  } catch {
    return null;
  }
}

function buildImagePrompt(
  cut: Omit<ContiCut, 'imageUrl'>,
  character: string,
  subject: string
): string {
  const base = `${NO_TEXT_LEAD} ${MANGA_STYLE}. Panel ${cut.index} of a 4 panel manga sequence. Scene: ${cut.visualEn}. Camera: ${cut.shotType}.`;

  if (CREATOR_CUTS.has(cut.index)) {
    // 1·4컷: 크리에이터(여성) 등장 — 말하는 장면이라도 말풍선 없이 표정/제스처로
    return `${base} Feature the recurring main character prominently (keep her identical in both her panels): ${character}. ` +
      `Even if she is speaking, show it only through facial expression and gesture — no speech bubble. ${NO_TEXT_TAIL}`;
  }
  // 2·3컷: 제품/소개 대상이 주인공, 인물 얼굴은 배제
  return `${base} PRODUCT-FOCUSED panel: the subject must dominate the frame — ${subject}. ` +
    `Do NOT show the creator's face; if a person is needed use only hands or a model appropriate to the product. The product is the hero of this panel. ${NO_TEXT_TAIL}`;
}

// Gemini 이미지 모델(nano-banana). Imagen보다 "글자 금지" 준수 + 캐릭터 일관성이 좋고 16:9 지원.
// ai-sdk가 이 모델의 imageConfig를 확실히 노출하지 않아 REST로 직접 호출.
const GEMINI_IMAGE_MODEL = 'gemini-2.5-flash-image';

async function generatePanelImage(prompt: string): Promise<string> {
  const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!key) return '';
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25_000);
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_IMAGE_MODEL}:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseModalities: ['IMAGE'],
            imageConfig: { aspectRatio: '16:9' },
          },
        }),
      }
    );
    if (!res.ok) {
      console.error('[/api/conti] gemini-image HTTP', res.status);
      return '';
    }
    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { inlineData?: { mimeType?: string; data?: string } }[] } }[];
    };
    const part = data.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
    if (!part?.inlineData?.data) return '';
    return `data:${part.inlineData.mimeType ?? 'image/png'};base64,${part.inlineData.data}`;
  } catch (e) {
    console.error('[/api/conti] gemini-image failed:', e instanceof Error ? e.message : e);
    return '';
  } finally {
    clearTimeout(timer);
  }
}

async function attachImages(
  bases: Omit<ContiCut, 'imageUrl'>[],
  character: string,
  subject: string
): Promise<ContiCut[]> {
  return Promise.all(
    bases.map(async (c) => ({
      ...c,
      imageUrl: await generatePanelImage(buildImagePrompt(c, character, subject)),
    }))
  );
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
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
      subject: fallback.subject,
      source: 'mock',
    } satisfies ContiResponse, { headers: CORS_HEADERS });
  }

  // 1) 4컷 분해 + 캐릭터/소개대상 시트 (Gemini text)
  let parsed = fallback;
  try {
    const { text } = await generateTextResilient({
      prompt: buildContiPrompt(script, tone, concept),
    });
    parsed = parseConti(text, fallback) ?? fallback;
  } catch (e) {
    console.error('[/api/conti] Gemini text failed:', e);
  }

  // 2) 컷별 만화 이미지 (동일 화풍·동일 여성 캐릭터·소개 대상 포함, 글자 없음)
  const cuts = await attachImages(parsed.cuts, parsed.character, parsed.subject);

  return NextResponse.json({
    cuts,
    trendPoint: parsed.trendPoint,
    character: parsed.character,
    subject: parsed.subject,
    source: 'live',
  } satisfies ContiResponse, { headers: CORS_HEADERS });
}
