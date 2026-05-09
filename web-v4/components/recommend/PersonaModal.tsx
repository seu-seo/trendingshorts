'use client';

import { useStore } from '@/lib/store';
import { CATEGORIES, STYLES } from '@/lib/data/categories';
import type { Category } from '@/lib/types';

export default function PersonaModal() {
  const open = useStore((s) => s.personaModalOpen);
  const close = () => useStore.getState().setPersonaModalOpen(false);
  const draft = useStore((s) => s.modalDraft);
  const setModalDraft = useStore((s) => s.setModalDraft);
  const toggleDraftStyle = useStore((s) => s.toggleDraftStyle);
  const setPersona = useStore((s) => s.setPersona);

  if (!open) return null;

  const valid = draft.category !== null && draft.styles.length > 0;

  const save = () => {
    if (!valid || !draft.category) return;
    setPersona({ category: draft.category, styles: [...draft.styles] });
    close();
  };

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
          SET YOUR PERSONA
        </div>
        <div className="font-display text-[28px] leading-tight mb-2">
          너에게 맞는 추천을<br />
          받아볼래?
        </div>
        <div className="text-sm text-text-dim mb-6 leading-relaxed">
          간단한 정보를 알려주면 추천 정확도가 올라가요. 언제든 변경 가능합니다.
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
