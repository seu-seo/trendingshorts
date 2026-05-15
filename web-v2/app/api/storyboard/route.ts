import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { google } from '@ai-sdk/google';
import { generateText, experimental_generateImage as generateImage } from 'ai';
import type { ScriptOutput, ScriptTone } from '@/lib/prompts';
import type { RecommendConcept } from '@/lib/types';

export interface StoryboardShot {
  index: number;
  shotType: string;
  visualKo: string;
  visualEn: string;
  dialogue: string;
  camera: string;
  imageUrl: string; // base64 data URL from Imagen
}

export interface StoryboardRequest {
  script: ScriptOutput;
  tone: ScriptTone;
  concept?: RecommendConcept | null;
}

export interface StoryboardResponse {
  shots: StoryboardShot[];
  source: 'live' | 'mock';
}

const TONE_STYLE: Record<ScriptTone, string> = {
  informative: 'clean bright educational YouTube Shorts style',
  story: 'cinematic emotional personal vlog style warm',
  hooking: 'dynamic high-contrast bold TikTok style',
};

async function generateImageBase64(promptEn: string): Promise<string> {
  try {
    const { image } = await generateImage({
      model: google.imageModel('imagen-4.0-fast-generate-001'),
      prompt: promptEn,
      aspectRatio: '9:16',
    });
    return `data:image/jpeg;base64,${image.base64}`;
  } catch (e) {
    console.error('[storyboard] Imagen failed:', e);
    return '';
  }
}

function buildStoryboardPrompt(
  script: ScriptOutput,
  tone: ScriptTone,
  concept?: RecommendConcept | null
): string {
  const conceptSection = concept
    ? `\n[영상 컨셉]\n${concept.title}\n훅: ${concept.hook}\n`
    : '';

  return `당신은 숏폼 영상 콘티 전문가입니다. 아래 대본을 5컷 콘티로 분해해주세요.
${conceptSection}
[대본]
훅: ${script.hook}
본문: ${script.body}
CTA: ${script.cta}

[요구사항]
- 정확히 5컷 (index 1~5)
- 각 컷은 대본 내용을 반영한 구체적 장면
- 세로 포맷 9:16 기준
- visualEn: 반드시 영어, 영숫자·공백·쉼표만 사용, 15단어 이내
  형식: "cinematic vertical short-form video, ${TONE_STYLE[tone]}, [장면 묘사 영어]"

[출력 — 순수 JSON만]
{"shots":[{"index":1,"shotType":"클로즈업|미디엄샷|풀샷|오버더숄더|POV|텍스트오버레이","visualKo":"20자 이내","visualEn":"영어만","dialogue":"대사 한국어","camera":"고정|줌인|줌아웃|패닝|틸트업|핸드헬드"}]}`;
}

function buildShotBases(
  script: ScriptOutput,
  concept?: RecommendConcept | null
): Omit<StoryboardShot, 'imageUrl'>[] {
  const lines = script.body.split('\n').filter(Boolean);
  const dialogues = [script.hook, ...lines.slice(0, 3), script.cta];
  const shotTypes = ['클로즈업', '미디엄샷', '텍스트오버레이', '풀샷', '클로즈업'];
  const cameras = ['고정', '줌인', '고정', '패닝', '줌아웃'];
  const toneStyle = 'cinematic vertical video';
  const visualsEn = [
    `${toneStyle}, person reacting with surprise, close-up face, phone camera`,
    `${toneStyle}, person explaining enthusiastically, medium shot, bright light`,
    `${toneStyle}, bold text overlay on dark background, Korean subtitle style`,
    `${toneStyle}, person demonstrating action, full body shot, natural light`,
    `${toneStyle}, person smiling at camera, warm tones, call to action`,
  ];

  return Array.from({ length: 5 }, (_, i) => ({
    index: i + 1,
    shotType: shotTypes[i],
    visualKo: concept ? `${concept.title.slice(0, 8)} 장면 ${i + 1}` : `장면 ${i + 1}`,
    visualEn: visualsEn[i],
    dialogue: dialogues[i] ?? '',
    camera: cameras[i],
  }));
}

function parseShotBases(
  text: string,
  tone: ScriptTone
): Omit<StoryboardShot, 'imageUrl'>[] | null {
  try {
    const cleaned = text.replace(/```json|```/g, '').trim();
    const jsonStr = cleaned.match(/\{[\s\S]*\}/)?.[0];
    if (!jsonStr) return null;
    const parsed = JSON.parse(jsonStr) as { shots: Omit<StoryboardShot, 'imageUrl'>[] };
    if (!Array.isArray(parsed.shots) || parsed.shots.length === 0) return null;

    return parsed.shots.slice(0, 5).map((s, i) => ({
      ...s,
      index: i + 1,
      visualEn: s.visualEn?.length > 5
        ? s.visualEn
        : `cinematic vertical short-form video, ${TONE_STYLE[tone]}, scene ${i + 1}`,
    }));
  } catch {
    return null;
  }
}

async function attachImages(
  bases: Omit<StoryboardShot, 'imageUrl'>[]
): Promise<StoryboardShot[]> {
  return Promise.all(
    bases.map(async (s) => ({
      ...s,
      imageUrl: await generateImageBase64(s.visualEn),
    }))
  );
}

export async function POST(req: NextRequest) {
  let body: StoryboardRequest;
  try {
    body = (await req.json()) as StoryboardRequest;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { script, tone, concept } = body;
  if (!script || !tone) {
    return NextResponse.json({ error: 'Missing script or tone' }, { status: 400 });
  }

  let shotBases: Omit<StoryboardShot, 'imageUrl'>[];
  let isLive = false;

  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    try {
      const { text } = await generateText({
        model: google('gemini-2.5-flash'),
        prompt: buildStoryboardPrompt(script, tone, concept),
      });
      shotBases = parseShotBases(text, tone) ?? buildShotBases(script, concept);
      isLive = true;
    } catch (e) {
      console.error('[/api/storyboard] Gemini failed:', e);
      shotBases = buildShotBases(script, concept);
    }
  } else {
    shotBases = buildShotBases(script, concept);
  }

  const shots = await attachImages(shotBases);
  return NextResponse.json({
    shots,
    source: isLive ? 'live' : 'mock',
  } satisfies StoryboardResponse);
}
