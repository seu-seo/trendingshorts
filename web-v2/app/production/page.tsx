'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { ALL_TRENDS } from '@/lib/data/trends';
import type { GenerateResponse, ScriptTone } from '@/lib/prompts';
import SelectedTrendBanner from '@/components/production/SelectedTrendBanner';
import GeneratedScriptCard from '@/components/production/GeneratedScriptCard';

const TONE_ORDER: ScriptTone[] = ['informative', 'story', 'hooking'];

export default function ProductionPage() {
  const setTab = useStore((s) => s.setTab);
  const selectedTrendId = useStore((s) => s.selectedTrendId);
  const persona = useStore((s) => s.persona);

  const [data, setData] = useState<GenerateResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTab('production');
  }, [setTab]);

  const trend = selectedTrendId
    ? ALL_TRENDS.find((t) => t.id === selectedTrendId)
    : null;

  const generate = async () => {
    if (!trend) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trend, persona }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const json = (await res.json()) as GenerateResponse;
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : '대본 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 트렌드가 바뀌면 자동으로 한 번 생성
  useEffect(() => {
    if (trend) {
      setData(null);
      generate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTrendId]);

  // No trend selected — empty state
  if (!trend) {
    return (
      <>
        <div className="px-6 pb-6">
          <div className="font-mono text-[10px] tracking-widest text-accent-blue uppercase mb-2.5 flex items-center gap-2">
            <span
              className="w-1.5 h-1.5 rounded-full bg-accent-blue"
              style={{ boxShadow: '0 0 8px var(--accent-blue)' }}
            />
            CONTENT IDEAS
          </div>
          <div className="font-display text-[38px] leading-none tracking-tight mb-1">
            <span className="text-accent-blue">대본</span>
            <br />
            아이디어
          </div>
          <div className="text-[13px] text-text-dim">먼저 트렌드를 선택해주세요</div>
        </div>

        <div className="px-6">
          <div className="bg-surface-1 border border-dashed border-border-bright rounded-2xl p-6 text-center">
            <div className="text-4xl mb-3">✨</div>
            <div className="font-display text-[22px] leading-tight mb-2.5">
              트렌드를 골라야
              <br />
              대본을 만들 수 있어요
            </div>
            <div className="text-[13px] text-text-dim leading-relaxed mb-[18px]">
              대시보드에서 마음에 드는 트렌드를 선택하면
              <br />
              그에 맞는 추천 프롬프트 3종이 여기에 나타나요.
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-accent-lime text-bg border-none rounded-full font-mono text-[11px] font-semibold tracking-wider uppercase cursor-pointer transition-all hover:translate-x-0.5 no-underline"
            >
              트렌드 보러 가기 →
            </Link>
          </div>
        </div>
      </>
    );
  }

  // Trend selected — show prompts
  return (
    <>
      <SelectedTrendBanner trend={trend} />

      <div className="px-6 pb-5">
        <div className="font-mono text-[10px] tracking-widest text-accent-blue uppercase mb-2.5 flex items-center gap-2">
          <span
            className="w-1.5 h-1.5 rounded-full bg-accent-blue"
            style={{ boxShadow: '0 0 8px var(--accent-blue)' }}
          />
          CONTENT IDEAS
        </div>
        <div className="font-display text-[38px] leading-none tracking-tight mb-1">
          <span className="text-accent-blue">대본</span>
          <br />
          아이디어
        </div>
        <div className="text-[13px] text-text-dim flex items-center justify-between gap-3">
          <span>이 트렌드로 만들 수 있는 대본 스타일 3종</span>
          {data && !loading && (
            <button
              type="button"
              onClick={generate}
              className="font-mono text-[10px] text-accent-blue tracking-wider uppercase border border-border rounded-full px-2.5 py-1 hover:border-accent-blue transition-colors"
            >
              ↻ 재생성
            </button>
          )}
        </div>
      </div>

      {/* Tone signals (LLM 결정 근거) */}
      {data && data.meta.toneSignals.length > 0 && (
        <div
          className="mx-6 mb-4 p-3 rounded-[10px] border"
          style={{
            background: 'rgba(87, 200, 255, 0.05)',
            borderColor: 'rgba(87, 200, 255, 0.2)',
          }}
        >
          <div className="font-mono text-[9px] tracking-widest text-accent-blue uppercase mb-1.5">
            TONE DECISION SIGNALS · {data.meta.source === 'live' ? 'LIVE' : 'MOCK'}
          </div>
          <ul className="text-[11px] text-text-dim leading-relaxed space-y-0.5">
            {data.meta.toneSignals.slice(0, 4).map((s, i) => (
              <li key={i}>· {s}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="px-6 flex flex-col gap-3.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="bg-surface-1 border border-border rounded-[18px] p-[18px] animate-pulse"
            >
              <div className="h-3 w-24 bg-border rounded mb-3" />
              <div className="h-4 w-full bg-border rounded mb-2" />
              <div className="h-4 w-5/6 bg-border rounded mb-4" />
              <div className="h-3 w-full bg-border rounded mb-1.5" />
              <div className="h-3 w-full bg-border rounded mb-1.5" />
              <div className="h-3 w-2/3 bg-border rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="mx-6 p-4 border border-dashed rounded-[12px] mb-4"
          style={{ borderColor: 'rgba(255, 61, 127, 0.4)', background: 'rgba(255, 61, 127, 0.05)' }}
        >
          <div className="font-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: 'var(--accent-pink)' }}>
            GENERATION FAILED
          </div>
          <div className="text-[12px] text-text-dim mb-2.5">{error}</div>
          <button
            type="button"
            onClick={generate}
            className="font-mono text-[10px] text-accent-blue tracking-wider uppercase border border-border rounded-full px-2.5 py-1"
          >
            ↻ 다시 시도
          </button>
        </div>
      )}

      {/* Generated scripts */}
      {data && !loading && !error && (
        <div className="px-6 flex flex-col gap-3.5">
          {TONE_ORDER.map((tone, i) => (
            <GeneratedScriptCard
              key={tone}
              tone={tone}
              script={data.scripts[tone]}
              index={i + 1}
              total={3}
              recommended={data.recommendedTone === tone}
            />
          ))}
        </div>
      )}

      <div
        className="mx-6 my-6 p-3 px-3.5 border border-dashed rounded-[10px] flex gap-2.5 items-start"
        style={{
          background: 'rgba(255, 215, 0, 0.06)',
          borderColor: 'rgba(255, 215, 0, 0.3)',
        }}
      >
        <div
          className="font-mono text-[11px] font-bold py-0.5 px-1.5 rounded flex-shrink-0"
          style={{ color: 'var(--peak)', background: 'rgba(255, 215, 0, 0.15)' }}
        >
          {data?.meta.source === 'live' ? 'LIVE' : 'MOCK'}
        </div>
        <div className="text-[11px] text-text-dim leading-relaxed">
          {data?.meta.source === 'live'
            ? `Claude Sonnet 4.5 단일 호출로 3톤 동시 생성. prompt v${data.meta.promptVersion}.`
            : 'ANTHROPIC_API_KEY 미설정 또는 LLM 호출 실패 — mock fallback. .env.local 에 키 설정 후 재생성 가능.'}
        </div>
      </div>
    </>
  );
}
