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
 */
export function buildFallbackScripts(): Record<ScriptTone, ScriptOutput> {
  return {
    informative: {
      hook: '[Mock] 핵심 정보 3가지를 30초 안에 정리합니다',
      body: '1. 가장 흔한 오해 1가지\n2. 실제 데이터로 본 차이\n3. 따라하기 좋은 한 줄 가이드\n\n실제 LLM 호출 시 더 풍부한 본문이 생성됩니다.',
      cta: '도움이 됐다면 다른 정보도 댓글에 남겨주세요',
    },
    story: {
      hook: '[Mock] 처음 시도했을 때 제가 헷갈렸던 부분',
      body: '1. 시작했을 때의 막연함\n2. 시도 → 실패 → 재시도\n3. 지금은 이렇게 합니다\n\n실제 LLM 호출 시 페르소나 맞춤형으로 변형됩니다.',
      cta: '여러분의 첫 시도는 어땠나요? 댓글로 들려주세요',
    },
    hooking: {
      hook: '[Mock] 이거 모르고 시작하면 무조건 시간 낭비예요',
      body: '단정적 명제 → 반전 → 솔루션 구조.\n\n트렌딩 음원 매칭, 첫 3초 시청 유지율 극대화 패턴.\n\n실제 LLM 호출 시 트렌드 컨텍스트 기반으로 생성됩니다.',
      cta: '본인은 어떻게 하고 있는지 댓글로 알려주세요',
    },
  };
}
