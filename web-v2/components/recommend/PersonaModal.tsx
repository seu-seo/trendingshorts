'use client';

import { useStore } from '@/lib/store';
import { CATEGORIES, STYLES } from '@/lib/data/categories';
import type { Category } from '@/lib/types';

const BRAND_PITCH_EXAMPLES = [
  '민감잇몸용 토너치약 — 30대 직장인 타겟 D2C',
  '1만원대 미니멀 홈 프래그런스 (선물용)',
  'AI 영어 회화 앱 — 토익 졸업한 직장인 대상',
  '1인 미용실 — 강남 30대 여성 단골 채널',
];

export default function PersonaModal() {
  const open = useStore((s) => s.personaModalOpen);
  const close = () => useStore.getState().setPersonaModalOpen(false);
  const draft = useStore((s) => s.modalDraft);
  const setModalDraft = useStore((s) => s.setModalDraft);
  const toggleDraftStyle = useStore((s) => s.toggleDraftStyle);
  const setDraftBrandPitch = useStore((s) => s.setDraftBrandPitch);
  const setPersona = useStore((s) => s.setPersona);

  if (!open) return null;

  const trimmedPitch = draft.brandPitch.trim();
  const valid =
    draft.category !== null && draft.styles.length > 0 && trimmedPitch.length >= 6;

  const save = () => {
    if (!valid || !draft.category) return;
    setPersona({
      category: draft.category,
      styles: [...draft.styles],
      brandPitch: trimmedPitch,
    });
    close();
  };

  const placeholder =
    BRAND_PITCH_EXAMPLES[Math.floor(Math.random() * BRAND_PITCH_EXAMPLES.length)];

  return (
    <div
      className="absolute inset-0 z-50 flex items-end animate-fade-in"
      style={{
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
      onClick={close}
    >
      <div
        className="bg-bg w-full max-h-[88%] overflow-y-auto rounded-t-3xl border-t border-border-bright p-6 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-9 h-1 bg-surface-3 rounded-sm mx-auto mb-5" />

        <div className="font-mono text-[10px] tracking-widest text-accent-lime uppercase mb-2">
          BRAND × PERSONA
        </div>
        <div className="font-display text-[28px] leading-tight mb-2">
          어떤 제품을<br />
          마케팅하시나요?
        </div>
        <div className="text-sm text-text-dim mb-6 leading-relaxed">
          제품/브랜드 한 줄 + 카테고리 + 스타일을 알려주시면, 트렌드별로 <span className="text-accent-lime">내 제품을 어떻게 녹일지 대본 3종</span>을 자동으로 만들어드려요.
        </div>

        {/* === Brand pitch (가장 중요) === */}
        <div className="font-mono text-[10px] tracking-widest text-text-faint uppercase mb-2.5">
          내 제품/브랜드 한 줄 소개 <span className="text-accent-pink">*필수</span>
        </div>
        <textarea
          value={draft.brandPitch}
          onChange={(e) => setDraftBrandPitch(e.target.value)}
          placeholder={`예) ${placeholder}`}
          rows={2}
          maxLength={120}
          className="w-full mb-1 px-3.5 py-2.5 bg-surface-1 border border-border rounded-xl text-sm text-text placeholder:text-text-faint resize-none focus:outline-none focus:border-accent-lime transition-colors"
        />
        <div className="flex justify-between mb-6">
          <div className="text-[10px] text-text-faint leading-relaxed">
            제품·타겟·차별점을 한 문장에. 구체적일수록 대본이 정확해집니다.
          </div>
          <div className="text-[10px] text-text-faint font-mono ml-2 flex-shrink-0">
            {draft.brandPitch.length}/120
          </div>
        </div>

        <div className="font-mono text-[10px] tracking-widest text-text-faint uppercase mb-2.5">
          주 카테고리 (1개 선택)
        </div>
        <div className="flex flex-col gap-2 mb-6">
          {CATEGORIES.map((c) => {
            const selected = draft.category === c.value;
            return (
              <button
                key={c.value}
                onClick={() => setModalDraft({ ...draft, category: c.value as Category })}
                className={`flex items-center gap-3 py-3 px-3.5 border rounded-xl cursor-pointer transition-all text-left ${
                  selected
                    ? 'border-accent-lime'
                    : 'bg-surface-1 border-border hover:border-border-bright'
                }`}
                style={selected ? { background: 'rgba(200, 255, 87, 0.08)' } : {}}
              >
                <div
                  className={`text-lg w-8 h-8 grid place-items-center rounded-lg flex-shrink-0 ${
                    selected ? '' : 'bg-surface-2'
                  }`}
                  style={selected ? { background: 'rgba(200, 255, 87, 0.15)' } : {}}
                >
                  {c.emoji}
                </div>
                <div className="flex-1 text-sm font-medium">{c.label}</div>
                <div
                  className={`w-[18px] h-[18px] rounded-full border-[1.5px] grid place-items-center flex-shrink-0 ${
                    selected
                      ? 'bg-accent-lime border-accent-lime'
                      : 'border-border-bright'
                  }`}
                >
                  {selected && (
                    <div
                      className="w-[5px] h-[9px] -mt-0.5"
                      style={{
                        borderRight: '2px solid var(--bg)',
                        borderBottom: '2px solid var(--bg)',
                        transform: 'rotate(45deg)',
                      }}
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="font-mono text-[10px] tracking-widest text-text-faint uppercase mb-2.5">
          콘텐츠 스타일 (최대 3개)
        </div>
        <div className="flex flex-col gap-2 mb-6">
          {STYLES.map((s) => {
            const selected = draft.styles.includes(s.value);
            return (
              <button
                key={s.value}
                onClick={() => toggleDraftStyle(s.value)}
                className={`flex items-center gap-3 py-3 px-3.5 border rounded-xl cursor-pointer transition-all text-left ${
                  selected
                    ? 'border-accent-lime'
                    : 'bg-surface-1 border-border hover:border-border-bright'
                }`}
                style={selected ? { background: 'rgba(200, 255, 87, 0.08)' } : {}}
              >
                <div
                  className={`text-lg w-8 h-8 grid place-items-center rounded-lg flex-shrink-0 ${
                    selected ? '' : 'bg-surface-2'
                  }`}
                  style={selected ? { background: 'rgba(200, 255, 87, 0.15)' } : {}}
                >
                  {s.emoji}
                </div>
                <div className="flex-1 text-sm font-medium">{s.label}</div>
                <div
                  className={`w-[18px] h-[18px] border-[1.5px] grid place-items-center flex-shrink-0 ${
                    selected
                      ? 'bg-accent-lime border-accent-lime rounded'
                      : 'border-border-bright rounded-full'
                  }`}
                >
                  {selected && (
                    <div
                      className="w-[5px] h-[9px] -mt-0.5"
                      style={{
                        borderRight: '2px solid var(--bg)',
                        borderBottom: '2px solid var(--bg)',
                        transform: 'rotate(45deg)',
                      }}
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex gap-2.5 mt-2">
          <button
            onClick={close}
            className="flex-1 py-3.5 rounded-xl border border-border bg-surface-1 text-text-dim font-mono text-xs font-semibold tracking-wider uppercase transition-all hover:bg-surface-2 hover:text-text"
          >
            취소
          </button>
          <button
            onClick={save}
            disabled={!valid}
            className={`flex-1 py-3.5 rounded-xl font-mono text-xs font-semibold tracking-wider uppercase transition-all ${
              valid
                ? 'bg-accent-lime text-bg cursor-pointer'
                : 'bg-surface-2 text-text-faint cursor-not-allowed'
            }`}
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
