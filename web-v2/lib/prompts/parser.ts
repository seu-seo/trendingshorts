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
      hook: '[Mock] 팔로워 0에서 1만까지 — 핵심 3가지',
      body: '1. 가장 흔한 오해 1가지\n2. 실제 데이터로 본 차이\n3. 따라하기 좋은 한 줄 가이드\n\n실제 LLM 호출 시 트렌드 + 페르소나 컨텍스트가 반영된 풍부한 본문이 생성됩니다.',
      cta: '도움이 됐다면 저장하고 나중에 참고하세요',
    },
    story: {
      hook: '[Mock] 처음 영상 올렸을 때 조회수 12였어요',
      body: '1. 시작했을 때의 막연함\n2. 시도 → 실패 → 재시도\n3. 지금은 이렇게 합니다\n\n실제 LLM 호출 시 1인칭 화법으로 트렌드를 자연스럽게 녹여줍니다.',
      cta: '비슷한 경험 있으신 분 댓글 남겨주세요',
    },
    hooking: {
      hook: '[Mock] 이거 모르고 쇼츠 올리면 알고리즘이 안 밀어줘요',
      body: '단정적 명제 → 반전 → 솔루션 구조.\n\n트렌딩 음원 매칭, 첫 3초 시청 유지율 극대화 패턴.\n\n실제 LLM 호출 시 트렌드 컨텍스트로 생성됩니다.',
      cta: '어떻게 올리는지 댓글로 알려주세요',
    },
  };
}
