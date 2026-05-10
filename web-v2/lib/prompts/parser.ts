import type { ScriptOutput, ScriptTone } from './types';

const TONES: ScriptTone[] = ['informative', 'story', 'hooking'];

/**
 * Strict JSON 파서 — Claude가 코드블록·설명문을 섞어 보내는 케이스 방어.
 * 3톤 모두 존재해야 통과. body가 배열이면 join.
 */
export function parseAllScripts(raw: string): Record<ScriptTone, ScriptOutput> {
  let cleaned = raw.trim();
  cleaned = cleaned.replace(/^```json\s*/i, '').replace(/^```\s*/, '');
  cleaned = cleaned.replace(/```\s*$/, '');
  const start = cleaned.indexOf('{');
  if (start < 0) throw new Error('No JSON object found in response');

  const parsed = JSON.parse(cleaned.slice(start)) as Record<
    ScriptTone,
    { hook: string; body: string | string[]; cta: string }
  >;

  const result = {} as Record<ScriptTone, ScriptOutput>;
  for (const tone of TONES) {
    const v = parsed[tone];
    if (!v || typeof v !== 'object') {
      throw new Error(`Missing tone '${tone}' in response`);
    }
    const body = Array.isArray(v.body) ? v.body.join('\n') : v.body;
    result[tone] = { hook: v.hook, body, cta: v.cta };
  }
  return result;
}

/**
 * API 키 미설정/오류 시 사용. UI에서 동일 카드 형태로 렌더링됨.
 * brandPitch가 있으면 mock도 그 컨텍스트를 반영해서 표시 (데모 신뢰도).
 */
export function buildFallbackScripts(brandPitch?: string): Record<ScriptTone, ScriptOutput> {
  const brand = brandPitch?.trim();
  const brandLine = brand ? `\n\n💼 BRAND: ${brand}` : '';
  const brandTag = brand ? ` (브랜드: ${brand.slice(0, 30)}...)` : '';

  return {
    informative: {
      hook: brand
        ? `[Mock] "${brand.slice(0, 22)}" — 사람들이 모르는 핵심 3가지`
        : '[Mock] 핵심 정보 3가지를 30초 안에 정리합니다',
      body: `1. 가장 흔한 오해 1가지\n2. 실제 데이터로 본 차이\n3. 따라하기 좋은 한 줄 가이드${brandLine}\n\n실제 LLM 호출 시 브랜드 컨텍스트가 반영된 풍부한 본문이 생성됩니다.`,
      cta: brand
        ? '제 경험이 궁금하시면 댓글에 "사용기" 남겨주세요'
        : '도움이 됐다면 다른 정보도 댓글에 남겨주세요',
    },
    story: {
      hook: brand
        ? `[Mock] 제가 처음 ${brand.split(' ')[0]} 써봤을 때...`
        : '[Mock] 처음 시도했을 때 제가 헷갈렸던 부분',
      body: `1. 시작했을 때의 막연함\n2. 시도 → 실패 → 재시도\n3. 지금은 이렇게 합니다${brandLine}\n\n실제 LLM 호출 시 1인칭 화법으로 자연스럽게 제품을 녹여줍니다.`,
      cta: '비슷한 경험 있으신 분 댓글 남겨주세요',
    },
    hooking: {
      hook: brand
        ? `[Mock] 이거 모르고 ${brand.split(' ')[0]} 사면 무조건 후회해요`
        : '[Mock] 이거 모르고 시작하면 무조건 시간 낭비예요',
      body: `단정적 명제 → 반전 → 솔루션 구조.${brandTag}\n\n트렌딩 음원 매칭, 첫 3초 시청 유지율 극대화 패턴.${brandLine}\n\n실제 LLM 호출 시 트렌드 + 브랜드 컨텍스트로 생성됩니다.`,
      cta: '본인은 어떻게 골라쓰는지 댓글로 알려주세요',
    },
  };
}
