'use client';

import { useStore } from '@/lib/store';

export default function PersonaSetupCard() {
  const setPersonaModalOpen = useStore((s) => s.setPersonaModalOpen);
  const setModalDraft = useStore((s) => s.setModalDraft);

  const open = () => {
    setModalDraft({ category: null, styles: [], brandPitch: '' });
    setPersonaModalOpen(true);
  };

  return (
    <div
      className="mx-6 mb-6 p-5 border border-dashed border-border-bright rounded-2xl relative overflow-hidden"
      style={{
        background:
          'linear-gradient(135deg, rgba(200, 255, 87, 0.08), rgba(87, 200, 255, 0.06))',
      }}
    >
      <div className="font-mono text-[9px] text-accent-lime tracking-widest uppercase mb-2">
        SETUP
      </div>
      <div className="font-display text-[22px] leading-tight mb-2">
        내 제품을 위한 대본을 받으려면<br />
        브랜드를 먼저 설정해주세요
      </div>
      <div className="text-xs text-text-dim leading-relaxed mb-3.5">
        제품/브랜드 한 줄 + 카테고리 + 스타일 — 30초면 끝납니다. 이 정보로 트렌드별 판매 대본 3종을 자동 생성합니다.
      </div>
      <button
        onClick={open}
        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-accent-lime text-bg border-none rounded-full font-mono text-[11px] font-semibold tracking-wider uppercase cursor-pointer transition-all hover:translate-x-0.5"
      >
        브랜드 설정 →
      </button>
    </div>
  );
}
