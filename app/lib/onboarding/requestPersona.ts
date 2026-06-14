import type { PersonaInput, PersonaResult } from '@/lib/types';

/**
 * 온보딩 페르소나 분석 API 호출.
 * /api/persona 는 GOOGLE_GENERATIVE_AI_API_KEY 가 있으면 실제 Gemini 응답을,
 * 없거나 에러면 mock fallback(PersonaResult)을 돌려준다. 즉 키만 채우면 바로 실제 동작.
 */
export async function requestPersona(input: PersonaInput): Promise<PersonaResult> {
  const res = await fetch('/api/persona', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`persona API failed: ${res.status}`);
  return res.json() as Promise<PersonaResult>;
}
