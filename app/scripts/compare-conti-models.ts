/**
 * 콘티 이미지 모델 비교 테스트
 *
 * 서비스 스크립트 생성 로직을 그대로 따라가면서
 * 이미지 생성 단계만 3개 모델로 비교합니다.
 *
 * 플로우:
 *   실 트렌드 데이터 → Gemini: 샷 설명(visualEn) 생성 → 3개 모델 병렬 이미지 생성 → HTML 리포트
 *
 * 모델:
 *   A. Imagen 4.0 Fast  (현재 서비스 사용 중)
 *   B. DALL-E 3         (OpenAI)
 *   C. Flux Schnell     (Replicate)
 *
 * 실행:
 *   cd app
 *   npx tsx scripts/compare-conti-models.ts
 *
 * 필요 환경변수 (.env.local):
 *   GOOGLE_GENERATIVE_AI_API_KEY
 *   OPENAI_API_KEY
 *   REPLICATE_API_TOKEN
 */

import { google } from '@ai-sdk/google';
import { openai } from '@ai-sdk/openai';
import { generateText, generateImage } from 'ai';
import Replicate from 'replicate';
import * as fs from 'fs';
import * as path from 'path';

// ─── 환경변수 로드 ────────────────────────────────────────────

function loadEnv() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const [key, ...rest] = line.split('=');
    if (key && rest.length && !process.env[key.trim()]) {
      process.env[key.trim()] = rest.join('=').trim().replace(/^["']|["']$/g, '');
    }
  }
}

loadEnv();

// ─── 타입 ────────────────────────────────────────────────────

interface ShotBase {
  index: number;
  shotType: string;
  visualKo: string;
  visualEn: string;
  dialogue: string;
  camera: string;
}

interface ModelResult {
  model: string;
  imageUrl: string; // base64 data URL or https URL
  promptUsed: string;
  durationMs: number;
  error?: string;
}

interface ShotResult extends ShotBase {
  results: ModelResult[];
}

// ─── 샘플 트렌드 (tiktok-snapshot.json 1위 영상 기반) ─────────

const SAMPLE_TREND = {
  id: 1,
  platform: 'tiktok' as const,
  platformLabel: 'TikTok',
  category: 'food' as const,
  lifecycle: 'rising' as const,
  title: '우삼겹 숙주볶음 레시피 — 이자카야 메뉴',
  creator: '맛있는휴식(맛휴)',
  views: 1100000,
  likes: 18400,
  comments: 157,
  shares: 10800,
  hashtags: '#우삼겹숙주볶음 #이자카야메뉴 #우삼겹요리 #쉬운요리 #초간편요리',
  growth: 340,
  duration: '0:36',
  time: '2026-04-27',
  thumb: '',
};

// ─── 샘플 대본 (Gemini 생성 결과와 동일한 구조) ───────────────

const SAMPLE_SCRIPT = {
  hook: '이자카야 메뉴, 집에서 5분이면 됩니다',
  body: '우삼겹은 먼저 노릇하게 볶아서 따로 빼두세요.\n기름 남긴 팬에 대파 + 고춧가루로 향 내고\n양파, 청양고추, 마늘 순서로 강불 볶음\n숙주 넣고 굴소스·간장·맛술 붓고 최고 화력으로 빠르게\n우삼겹 합쳐서 참기름 한 방울, 끝',
  cta: '만들어 보신 분 맛 어땠는지 댓글 남겨주세요',
};

const TONE = 'informative' as const;

// ─── 프롬프트 스타일 ─────────────────────────────────────────

function buildSketchPrompt(visualEn: string): string {
  return [
    'advertising storyboard sketch',
    'black and white pencil line art',
    'professional Korean ad agency illustration style',
    'single vertical frame 9:16',
    visualEn,
    'clean ink lines, minimal hatching, simple background',
    'editorial storyboard panel, no color, no photorealism',
  ].join(', ');
}

// ─── Gemini: 샷 설명 생성 (서비스 /api/storyboard 로직 그대로) ──

const TONE_STYLE: Record<string, string> = {
  informative: 'clean bright educational YouTube Shorts style',
  story: 'cinematic emotional personal vlog style warm',
  hooking: 'dynamic high-contrast bold TikTok style',
};

function buildStoryboardPrompt(): string {
  return `당신은 숏폼 영상 콘티 전문가입니다. 아래 대본을 5컷 콘티로 분해해주세요.

[대본]
훅: ${SAMPLE_SCRIPT.hook}
본문: ${SAMPLE_SCRIPT.body}
CTA: ${SAMPLE_SCRIPT.cta}

[트렌드]
제목: ${SAMPLE_TREND.title}
해시태그: ${SAMPLE_TREND.hashtags}

[요구사항]
- 정확히 5컷 (index 1~5)
- 각 컷은 대본 내용을 반영한 구체적 장면
- 세로 포맷 9:16 기준
- visualEn: 반드시 영어, 영숫자·공백·쉼표만 사용, 15단어 이내
  형식: "cinematic vertical short-form video, ${TONE_STYLE[TONE]}, [장면 묘사 영어]"

[출력 — 순수 JSON만]
{"shots":[{"index":1,"shotType":"클로즈업|미디엄샷|풀샷|오버더숄더|POV|텍스트오버레이","visualKo":"20자 이내","visualEn":"영어만","dialogue":"대사 한국어","camera":"고정|줌인|줌아웃|패닝|틸트업|핸드헬드"}]}`;
}

async function generateShotBases(): Promise<ShotBase[]> {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    console.log('⚠️  GOOGLE_GENERATIVE_AI_API_KEY 없음 — mock 샷 사용');
    return getMockShots();
  }

  console.log('🤖 Gemini로 샷 설명 생성 중...');
  try {
    const { text } = await generateText({
      model: google('gemini-2.5-flash'),
      prompt: buildStoryboardPrompt(),
    });

    const cleaned = text.replace(/```json|```/g, '').trim();
    const jsonStr = cleaned.match(/\{[\s\S]*\}/)?.[0];
    if (!jsonStr) throw new Error('JSON 없음');
    const parsed = JSON.parse(jsonStr) as { shots: ShotBase[] };
    if (!Array.isArray(parsed.shots) || parsed.shots.length === 0) throw new Error('shots 배열 비어있음');

    console.log(`✅ ${parsed.shots.length}컷 생성 완료`);
    return parsed.shots.slice(0, 5);
  } catch (e) {
    console.warn('⚠️  Gemini 실패, mock 사용:', e);
    return getMockShots();
  }
}

function getMockShots(): ShotBase[] {
  return [
    { index: 1, shotType: '클로즈업', visualKo: '팬에 우삼겹 볶는 장면', visualEn: 'cinematic vertical video, close-up of beef slices sizzling in pan, Korean home cooking, steam rising', dialogue: '우삼겹은 먼저 노릇하게', camera: '고정' },
    { index: 2, shotType: '미디엄샷', visualKo: '대파 고춧가루 향 내기', visualEn: 'cinematic vertical video, medium shot adding green onion and chili powder to pan, Korean stir fry', dialogue: '기름 남긴 팬에 대파 넣고', camera: '줌인' },
    { index: 3, shotType: '오버더숄더', visualKo: '재료 투하 순서', visualEn: 'cinematic vertical video, overhead shot of vegetables and garlic being added to wok, Korean cooking', dialogue: '양파, 청양고추, 마늘 순서로', camera: '고정' },
    { index: 4, shotType: '풀샷', visualKo: '숙주 볶음 완성', visualEn: 'cinematic vertical video, full shot of bean sprouts and beef stir fry, high heat Korean wok cooking', dialogue: '최고 화력으로 빠르게 볶아요', camera: '패닝' },
    { index: 5, shotType: '클로즈업', visualKo: '완성된 우삼겹숙주볶음', visualEn: 'cinematic vertical video, close-up of finished Korean beef sprout stir fry dish, sesame oil drizzle', dialogue: '참기름 한 방울, 완성', camera: '줌아웃' },
  ];
}

// ─── 이미지 생성: 모델별 ──────────────────────────────────────

async function generateWithImagen(prompt: string): Promise<{ url: string; error?: string }> {
  try {
    const { image } = await generateImage({
      model: google.imageModel('imagen-4.0-fast-generate-001'),
      prompt,
      aspectRatio: '9:16',
    });
    return { url: `data:image/jpeg;base64,${image.base64}` };
  } catch (e: unknown) {
    return { url: '', error: String(e) };
  }
}

async function generateWithDallE3(prompt: string): Promise<{ url: string; error?: string }> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return { url: '', error: 'OPENAI_API_KEY 없음' };

  try {
    const openai = new OpenAI({ apiKey });
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt,
      size: '1024x1792', // 9:16에 가장 가까운 DALL-E 3 지원 사이즈
      quality: 'standard',
      n: 1,
    });
    return { url: response.data[0]?.url ?? '' };
  } catch (e: unknown) {
    return { url: '', error: String(e) };
  }
}

async function generateWithFluxSchnell(prompt: string): Promise<{ url: string; error?: string }> {
  const apiKey = process.env.REPLICATE_API_TOKEN;
  if (!apiKey) return { url: '', error: 'REPLICATE_API_TOKEN 없음' };

  try {
    const replicate = new Replicate({ auth: apiKey });
    const output = await replicate.run('black-forest-labs/flux-schnell', {
      input: {
        prompt,
        aspect_ratio: '9:16',
        num_outputs: 1,
        output_format: 'webp',
        output_quality: 90,
      },
    }) as string[];
    return { url: output[0] ?? '' };
  } catch (e: unknown) {
    return { url: '', error: String(e) };
  }
}

// ─── 샷별 3모델 병렬 생성 ────────────────────────────────────

async function generateShotResults(shots: ShotBase[]): Promise<ShotResult[]> {
  const results: ShotResult[] = [];

  for (const shot of shots) {
    console.log(`\n📸 컷 ${shot.index}/5: ${shot.visualKo}`);

    const sketchPrompt = buildSketchPrompt(shot.visualEn);
    console.log(`   프롬프트: ${sketchPrompt.slice(0, 80)}...`);

    const modelResults = await Promise.all([
      (async (): Promise<ModelResult> => {
        if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
          return { model: 'Imagen 4.0 Fast', imageUrl: '', promptUsed: sketchPrompt, durationMs: 0, error: 'API 키 없음' };
        }
        const t = Date.now();
        console.log(`   [Imagen]      요청 중...`);
        const r = await generateWithImagen(sketchPrompt);
        const ms = Date.now() - t;
        console.log(`   [Imagen]      ${r.error ? `❌ ${r.error.slice(0, 60)}` : `✅ ${ms}ms`}`);
        return { model: 'Imagen 4.0 Fast', imageUrl: r.url, promptUsed: sketchPrompt, durationMs: ms, error: r.error };
      })(),

      (async (): Promise<ModelResult> => {
        if (!process.env.OPENAI_API_KEY) {
          return { model: 'DALL-E 3', imageUrl: '', promptUsed: sketchPrompt, durationMs: 0, error: 'API 키 없음' };
        }
        const t = Date.now();
        console.log(`   [DALL-E 3]    요청 중...`);
        const r = await generateWithDallE3(sketchPrompt);
        const ms = Date.now() - t;
        console.log(`   [DALL-E 3]    ${r.error ? `❌ ${r.error.slice(0, 60)}` : `✅ ${ms}ms`}`);
        return { model: 'DALL-E 3', imageUrl: r.url, promptUsed: sketchPrompt, durationMs: ms, error: r.error };
      })(),

      (async (): Promise<ModelResult> => {
        if (!process.env.REPLICATE_API_TOKEN) {
          return { model: 'Flux Schnell', imageUrl: '', promptUsed: sketchPrompt, durationMs: 0, error: 'API 키 없음' };
        }
        const t = Date.now();
        console.log(`   [Flux Schnell] 요청 중...`);
        const r = await generateWithFluxSchnell(sketchPrompt);
        const ms = Date.now() - t;
        console.log(`   [Flux Schnell] ${r.error ? `❌ ${r.error.slice(0, 60)}` : `✅ ${ms}ms`}`);
        return { model: 'Flux Schnell', imageUrl: r.url, promptUsed: sketchPrompt, durationMs: ms, error: r.error };
      })(),
    ]);

    results.push({ ...shot, results: modelResults });
  }

  return results;
}

// ─── HTML 리포트 생성 ─────────────────────────────────────────

function buildHtml(shotResults: ShotResult[]): string {
  const models = ['Imagen 4.0 Fast', 'DALL-E 3', 'Flux Schnell'];
  const costs: Record<string, string> = {
    'Imagen 4.0 Fast': '~$0.002/컷',
    'DALL-E 3': '~$0.040/컷',
    'Flux Schnell': '~$0.003/컷',
  };

  const shotRows = shotResults.map((shot) => {
    const cells = models.map((modelName) => {
      const r = shot.results.find((x) => x.model === modelName);
      if (!r) return `<td class="cell"><div class="no-img">결과 없음</div></td>`;

      const imgTag = r.imageUrl
        ? `<img src="${r.imageUrl}" alt="${modelName} 컷${shot.index}" />`
        : `<div class="no-img">${r.error ?? '이미지 없음'}</div>`;

      const badge = r.durationMs > 0 ? `<span class="badge">${(r.durationMs / 1000).toFixed(1)}s</span>` : '';

      return `
        <td class="cell">
          ${imgTag}
          ${badge}
        </td>`;
    }).join('');

    return `
      <tr>
        <td class="shot-info">
          <div class="cut-num">컷 ${shot.index}</div>
          <div class="shot-type">${shot.shotType}</div>
          <div class="visual-ko">${shot.visualKo}</div>
          <div class="dialogue">"${shot.dialogue}"</div>
          <div class="camera">카메라: ${shot.camera}</div>
        </td>
        ${cells}
      </tr>`;
  }).join('');

  const headerCells = models.map((m) => `
    <th>
      <div class="model-name">${m}</div>
      <div class="model-cost">${costs[m]}</div>
    </th>`).join('');

  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>콘티 AI 모델 비교 — Shortform Pulse</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #0f0f0f; color: #e0e0e0; padding: 24px; }
  h1 { font-size: 20px; margin-bottom: 4px; color: #fff; }
  .subtitle { font-size: 13px; color: #888; margin-bottom: 24px; }
  .trend-box { background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 8px; padding: 14px 18px; margin-bottom: 24px; font-size: 12px; color: #aaa; }
  .trend-box strong { color: #fff; }
  .prompt-box { background: #111; border: 1px solid #222; border-radius: 6px; padding: 12px; margin-bottom: 24px; font-size: 11px; color: #666; font-family: monospace; }
  .prompt-box span { color: #c8ff57; }

  table { width: 100%; border-collapse: collapse; }
  th, td { border: 1px solid #222; padding: 12px; vertical-align: top; }
  th { background: #161616; text-align: center; }
  .model-name { font-size: 14px; font-weight: bold; color: #fff; margin-bottom: 4px; }
  .model-cost { font-size: 11px; color: #888; }

  .shot-info { width: 160px; background: #141414; }
  .cut-num { font-size: 22px; font-weight: bold; color: #c8ff57; margin-bottom: 6px; }
  .shot-type { font-size: 11px; color: #888; margin-bottom: 4px; }
  .visual-ko { font-size: 12px; color: #ccc; margin-bottom: 6px; }
  .dialogue { font-size: 11px; color: #aaa; font-style: italic; margin-bottom: 4px; border-left: 2px solid #333; padding-left: 6px; }
  .camera { font-size: 10px; color: #555; }

  .cell { position: relative; background: #111; width: 220px; text-align: center; }
  .cell img { width: 100%; max-width: 200px; height: auto; border-radius: 6px; display: block; margin: 0 auto; }
  .no-img { min-height: 120px; display: flex; align-items: center; justify-content: center; font-size: 11px; color: #444; padding: 12px; }
  .badge { position: absolute; bottom: 8px; right: 8px; background: rgba(0,0,0,0.7); color: #888; font-size: 10px; padding: 2px 6px; border-radius: 4px; }

  .cost-summary { margin-top: 24px; background: #1a1a1a; border-radius: 8px; padding: 16px; font-size: 12px; }
  .cost-summary h2 { font-size: 14px; margin-bottom: 12px; color: #fff; }
  .cost-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #222; }
  .cost-row:last-child { border-bottom: none; }
</style>
</head>
<body>
<h1>콘티 AI 모델 비교</h1>
<p class="subtitle">Shortform Pulse — experiment/conti-ai-comparison | ${new Date().toLocaleString('ko-KR')}</p>

<div class="trend-box">
  <strong>트렌드:</strong> ${SAMPLE_TREND.title} &nbsp;|&nbsp;
  <strong>조회수:</strong> ${(SAMPLE_TREND.views / 10000).toFixed(0)}만 &nbsp;|&nbsp;
  <strong>플랫폼:</strong> ${SAMPLE_TREND.platformLabel} &nbsp;|&nbsp;
  <strong>해시태그:</strong> ${SAMPLE_TREND.hashtags}<br/><br/>
  <strong>훅:</strong> ${SAMPLE_SCRIPT.hook}
</div>

<div class="prompt-box">
  프롬프트 스타일: <span>storyboard sketch</span><br/>
  "advertising storyboard sketch, black and white pencil line art, professional Korean ad agency illustration style, single vertical frame 9:16, [visualEn], clean ink lines, minimal hatching, simple background, editorial storyboard panel"
</div>

<table>
  <thead>
    <tr>
      <th>샷 정보</th>
      ${headerCells}
    </tr>
  </thead>
  <tbody>
    ${shotRows}
  </tbody>
</table>

<div class="cost-summary">
  <h2>비용 비교 (5컷 콘티 1개 기준)</h2>
  <div class="cost-row"><span>Imagen 4.0 Fast</span><span>~$0.010 (약 14원)</span></div>
  <div class="cost-row"><span>DALL-E 3</span><span>~$0.200 (약 280원)</span></div>
  <div class="cost-row"><span>Flux Schnell</span><span>~$0.015 (약 21원)</span></div>
  <div class="cost-row" style="color:#c8ff57"><span>Flux Schnell + Claude 텍스트</span><span>~$0.025 (약 35원)</span></div>
</div>
</body>
</html>`;
}

// ─── 메인 ────────────────────────────────────────────────────

async function main() {
  console.log('=== 콘티 AI 모델 비교 테스트 시작 ===\n');
  console.log('트렌드:', SAMPLE_TREND.title);
  console.log('훅:', SAMPLE_SCRIPT.hook);

  const missingKeys: string[] = [];
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) missingKeys.push('GOOGLE_GENERATIVE_AI_API_KEY');
  if (!process.env.OPENAI_API_KEY) missingKeys.push('OPENAI_API_KEY');
  if (!process.env.REPLICATE_API_TOKEN) missingKeys.push('REPLICATE_API_TOKEN');

  if (missingKeys.length > 0) {
    console.log(`\n⚠️  없는 API 키: ${missingKeys.join(', ')}`);
    console.log('   해당 모델은 건너뜁니다.\n');
  }

  const shots = await generateShotBases();
  const shotResults = await generateShotResults(shots);

  const outDir = path.join(process.cwd(), 'scripts', 'output');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const htmlPath = path.join(outDir, 'conti-comparison.html');
  fs.writeFileSync(htmlPath, buildHtml(shotResults), 'utf-8');

  console.log(`\n✅ 완료! 리포트 저장: ${htmlPath}`);
  console.log(`   open ${htmlPath}`);
}

main().catch((e) => {
  console.error('❌ 에러:', e);
  process.exit(1);
});
