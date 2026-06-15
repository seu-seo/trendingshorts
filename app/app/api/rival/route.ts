import type { NextRequest } from 'next/server';
import type { RivalSurvey } from '@/lib/types';
import { searchRivalCandidates } from '@/lib/rival-search';
import { analyzeRivals } from '@/lib/rival-analyze';
import { visionRankRivals } from '@/lib/rival-vision';

function sseChunk(data: object): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`);
}

export async function POST(req: NextRequest) {
  const survey: RivalSurvey = await req.json();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => controller.enqueue(sseChunk(data));
      try {
        send({ stage: 1, status: 'searching' });
        const candidates = await searchRivalCandidates(survey);
        send({ stage: 1, status: 'done', count: candidates.length });
        if (candidates.length === 0) {
          send({ stage: 0, status: 'error', message: '조건에 맞는 채널을 찾지 못했습니다.' });
          controller.close(); return;
        }
        send({ stage: 2, status: 'analyzing' });
        const analyzed = await analyzeRivals(candidates, survey);
        send({ stage: 2, status: 'done', count: analyzed.length });
        send({ stage: 3, status: 'vision' });
        const results = await visionRankRivals(analyzed, { contentTone: survey.contentTone, topics: survey.topics, gender: survey.gender });
        send({ stage: 3, status: 'done', results });
      } catch (e) {
        send({ stage: 0, status: 'error', message: e instanceof Error ? e.message : '오류 발생' });
      } finally {
        controller.close();
      }
    },
  });
  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache, no-transform', Connection: 'keep-alive', 'X-Accel-Buffering': 'no' },
  });
}
