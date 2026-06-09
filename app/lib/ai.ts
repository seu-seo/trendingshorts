import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

/**
 * 모델 폴백 래퍼.
 * gemini-2.5-flash 가 503("high demand")으로 자주 과부하 → 그때 mock으로 떨어지는 걸 방지.
 * 순서대로 시도하고, 앞 모델이 실패하면 다음(더 여유로운) 모델로 재시도한다.
 */
const MODELS = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-3.5-flash'] as const;

export async function generateTextResilient(opts: {
  system?: string;
  prompt: string;
}): Promise<{ text: string }> {
  let lastErr: unknown;
  for (const model of MODELS) {
    try {
      const { text } = await generateText({ model: google(model), ...opts });
      return { text };
    } catch (e) {
      lastErr = e;
      console.error(`[ai] ${model} 실패, 다음 모델로 재시도:`, e instanceof Error ? e.message : e);
    }
  }
  throw lastErr;
}
