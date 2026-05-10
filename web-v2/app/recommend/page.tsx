'use client';

import { useEffect, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { CATEGORY_LABELS } from '@/lib/data/categories';
import PersonaSetupCard from '@/components/recommend/PersonaSetupCard';
import PersonaModal from '@/components/recommend/PersonaModal';
import RecoTrendCard from '@/components/recommend/RecoTrendCard';

export default function RecommendPage() {
  const setTab = useStore((s) => s.setTab);
  const trends = useStore((s) => s.trends);
  const persona = useStore((s) => s.persona);
  const setPersonaModalOpen = useStore((s) => s.setPersonaModalOpen);
  const setModalDraft = useStore((s) => s.setModalDraft);

  useEffect(() => {
    setTab('recommend');
  }, [setTab]);

  const recos = useMemo(() => {
    if (!persona) return [];
    return [...trends]
      .filter((t) => t.category === persona.category)
      .sort((a, b) => b.growth - a.growth)
      .slice(0, 3);
  }, [trends, persona]);

  const openEdit = () => {
    if (persona) {
      setModalDraft({
        category: persona.category,
        styles: [...persona.styles],
        brandPitch: persona.brandPitch ?? '',
      });
    } else {
      setModalDraft({ category: null, styles: [], brandPitch: '' });
    }
    setPersonaModalOpen(true);
  };

  return (
    <>
      <div className="px-6 pb-5">
        <div className="font-mono text-[10px] tracking-widest text-accent-pink uppercase mb-2.5 flex items-center gap-2">
          <span
            className="w-1.5 h-1.5 rounded-full bg-accent-pink"
            style={{ boxShadow: '0 0 8px var(--accent-pink)' }}
          />
          FOR YOU
        </div>
        <div className="font-display text-[38px] leading-none tracking-tight mb-1">
          <span className="text-accent-pink">맞춤</span>
          <br />
          추천
        </div>
        <div className="text-[13px] text-text-dim">
          {persona
            ? `${CATEGORY_LABELS[persona.category]} 카테고리에서 너에게 어울리는 트렌드`
            : '페르소나를 설정하면 너에게 맞는 추천이 나타나요'}
        </div>
      </div>

      {!persona ? (
        <PersonaSetupCard />
      ) : (
        <div
          className="mx-6 mb-6 p-4 px-[18px] border border-border rounded-2xl relative overflow-hidden"
          style={{
            background:
              'linear-gradient(135deg, rgba(200, 255, 87, 0.1), rgba(255, 61, 127, 0.06))',
          }}
        >
          <div
            className="absolute -top-10 -right-10 w-32 h-32 rounded-full"
            style={{
              background:
                'radial-gradient(circle, rgba(200, 255, 87, 0.2), transparent 70%)',
            }}
          />
          <div className="flex justify-between items-start relative gap-3">
            <div className="flex-1 min-w-0">
              <div className="font-mono text-[9px] text-text-faint tracking-widest uppercase mb-1">
                YOUR BRAND · {CATEGORY_LABELS[persona.category]}
              </div>
              <div className="text-[15px] leading-snug text-text font-medium mb-1">
                {persona.brandPitch || '(브랜드 한 줄 미설정 — EDIT으로 추가)'}
              </div>
              {persona.styles.length > 0 && (
                <div className="font-mono text-[9px] text-accent-lime tracking-wider uppercase">
                  {persona.styles.join(' · ')}
                </div>
              )}
            </div>
            <button
              onClick={openEdit}
              className="bg-transparent border border-border-bright text-text-dim py-1.5 px-2.5 rounded-full font-mono text-[9px] tracking-wider cursor-pointer uppercase hover:text-text hover:border-text flex-shrink-0"
            >
              EDIT
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-between items-baseline px-6 pt-2 pb-3.5">
        <div className="font-display text-lg tracking-wide">RECOMMENDED FOR YOU</div>
        <div className="font-mono text-[10px] text-text-faint tracking-wider uppercase">
          {recos.length} 건
        </div>
      </div>

      {recos.length === 0 ? (
        <div className="text-center py-16 px-8 text-text-faint">
          <div className="text-4xl mb-4 opacity-50">✨</div>
          <div className="text-xs leading-relaxed text-text-faint">
            {persona ? '추천할 트렌드가 없어요' : '페르소나를 먼저 설정해주세요'}
          </div>
        </div>
      ) : (
        <div className="px-6 flex flex-col gap-2.5">
          {recos.map((t, i) => (
            <RecoTrendCard key={t.id} trend={t} rank={i + 1} />
          ))}
        </div>
      )}

      <PersonaModal />
    </>
  );
}
