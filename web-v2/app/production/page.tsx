'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useStore } from '@/lib/store';
import { ALL_TRENDS } from '@/lib/data/trends';
import { PRODUCTION_PROMPTS } from '@/lib/data/prompts';
import SelectedTrendBanner from '@/components/production/SelectedTrendBanner';
import PromptCard from '@/components/production/PromptCard';

export default function ProductionPage() {
  const setTab = useStore((s) => s.setTab);
  const selectedTrendId = useStore((s) => s.selectedTrendId);

  useEffect(() => {
    setTab('production');
  }, [setTab]);

  const trend = selectedTrendId ? ALL_TRENDS.find((t) => t.id === selectedTrendId) : null;

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
        <div className="text-[13px] text-text-dim">이 트렌드로 만들 수 있는 대본 스타일 3종</div>
      </div>

      <div className="px-6 flex flex-col gap-3.5">
        {PRODUCTION_PROMPTS.map((p, i) => (
          <PromptCard key={i} prompt={p} index={i + 1} total={PRODUCTION_PROMPTS.length} />
        ))}
      </div>

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
          TBD
        </div>
        <div className="text-[11px] text-text-dim leading-relaxed">
          대본 생성 컨텍스트(페르소나·카테고리·트렌드 메타데이터의 활용 방식)는 향후 팀 합의 후 확정합니다. 현재 화면은 가설 데이터.
        </div>
      </div>
    </>
  );
}
