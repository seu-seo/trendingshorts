/**
 * Service integration tests — hits the running dev server at localhost:3000.
 * Run: npm run test:api
 * Requires: npm run dev (or TEST_BASE_URL env var for staging/prod)
 */
import { describe, it, expect, beforeAll } from 'vitest';
import type { Trend } from '@/lib/types';

const BASE = process.env.TEST_BASE_URL ?? 'http://localhost:3000';

const MOCK_TREND: Trend = {
  id: 1,
  title: '편의점 리뷰 챌린지',
  platform: 'youtube',
  category: 'food',
  views: 2_500_000,
  engagementRate: 6.2,
  heatLevel: 'HOT',
  hashtags: '#편의점 #리뷰',
  videoUrl: '',
  thumb: '',
  description: '',
  postedAt: '',
};

beforeAll(async () => {
  try {
    const res = await fetch(BASE, { signal: AbortSignal.timeout(5000) });
    if (!res) throw new Error();
  } catch {
    throw new Error(
      `Dev server not running at ${BASE}.\nRun: cd app && npm run dev`
    );
  }
});

// ── GET /api/trends ──────────────────────────────────────
describe('GET /api/trends', () => {
  it('returns 200 with data array', async () => {
    const res = await fetch(`${BASE}/api/trends`);
    expect(res.status).toBe(200);
    const json = await res.json() as { data: Trend[] };
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data.length).toBeGreaterThan(0);
  }, 15_000);

  it('each trend has required fields', async () => {
    const res = await fetch(`${BASE}/api/trends`);
    const json = await res.json() as { data: Trend[] };
    const first = json.data[0];
    expect(first).toHaveProperty('id');
    expect(first).toHaveProperty('title');
    expect(first).toHaveProperty('platform');
    expect(first).toHaveProperty('category');
    expect(first).toHaveProperty('heatLevel');
    expect(['HOT', 'WARM', 'COLD']).toContain(first.heatLevel);
    expect(typeof first.views).toBe('number');
    expect(typeof first.engagementRate).toBe('number');
  }, 15_000);

  it('categories match allowed values', async () => {
    const ALLOWED = ['food', 'beauty', 'lifestyle', 'edu', 'gaming', 'fitness', 'art'];
    const res = await fetch(`${BASE}/api/trends`);
    const json = await res.json() as { data: Trend[] };
    for (const trend of json.data) {
      expect(ALLOWED).toContain(trend.category);
    }
  }, 15_000);
});

// ── POST /api/persona ────────────────────────────────────
describe('POST /api/persona', () => {
  it('returns persona card with required fields', async () => {
    const res = await fetch(`${BASE}/api/persona`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        platform: 'multi',
        category: 'food',
        experience: 1,
        goal: 'growth',
        styles: ['먹방', '일상'],
        pain: 'idea',
        uploadFreq: 'mid',
      }),
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty('personaType');
    expect(json).toHaveProperty('personaTagline');
    expect(json).toHaveProperty('personaSummary');
    expect(json).toHaveProperty('topTrends');
    expect(json).toHaveProperty('hookPatterns');
    expect(json).toHaveProperty('actionItems');
    expect(Array.isArray(json.topTrends)).toBe(true);
    expect(json.topTrends.length).toBeGreaterThan(0);
  }, 45_000);

  it('topTrends have keyword and fitScore', async () => {
    const res = await fetch(`${BASE}/api/persona`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        platform: 'youtube', category: 'beauty', experience: 2,
        goal: 'monetize', styles: ['뷰티'], pain: 'trend', uploadFreq: 'mid',
      }),
    });
    const json = await res.json();
    const trend = json.topTrends?.[0];
    expect(trend).toBeDefined();
    expect(trend).toHaveProperty('keyword');
    expect(trend).toHaveProperty('fitScore');
    expect(trend.fitScore).toBeGreaterThanOrEqual(0);
    expect(trend.fitScore).toBeLessThanOrEqual(100);
  }, 45_000);
});

// ── POST /api/generate ───────────────────────────────────
describe('POST /api/generate', () => {
  it('returns scripts object with informative/story/hooking keys', async () => {
    const res = await fetch(`${BASE}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trend: MOCK_TREND }),
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty('scripts');
    // scripts is {informative, story, hooking}, not an array
    expect(typeof json.scripts).toBe('object');
    expect(Object.keys(json.scripts).length).toBeGreaterThan(0);
  }, 45_000);

  it('each script has hook, body, cta', async () => {
    const res = await fetch(`${BASE}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trend: MOCK_TREND }),
    });
    const json = await res.json();
    for (const script of Object.values(json.scripts) as Array<Record<string, unknown>>) {
      expect(script).toHaveProperty('hook');
      expect(script).toHaveProperty('body');
      expect(script).toHaveProperty('cta');
      expect(typeof script.hook).toBe('string');
      expect(typeof script.body).toBe('string');
      expect(typeof script.cta).toBe('string');
    }
  }, 45_000);

  it('returns 400 when trend is missing', async () => {
    const res = await fetch(`${BASE}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
  }, 10_000);
});

// ── POST /api/rival (SSE) ────────────────────────────────
describe('POST /api/rival', () => {
  it('responds with text/event-stream content-type', async () => {
    const res = await fetch(`${BASE}/api/rival`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topics: ['먹방', '편의점'],
        channelSize: 'micro',
        uploadFreq: 'weekly-mid',
        contentTone: 'info',
        gender: 'any',
        lang: 'ko',
      }),
    });
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/event-stream');
    res.body?.cancel();
  }, 15_000);

  it('first SSE chunk contains stage:1', async () => {
    const res = await fetch(`${BASE}/api/rival`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topics: ['뷰티', '메이크업'],
        channelSize: 'micro',
        uploadFreq: 'weekly-mid',
        contentTone: 'fun',
        gender: 'female',
        lang: 'ko',
      }),
    });
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    const { value } = await reader.read();
    const text = decoder.decode(value);
    expect(text).toContain('data:');
    expect(text).toContain('"stage":1');
    await reader.cancel();
  }, 20_000);
});

