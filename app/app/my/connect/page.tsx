'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import type { Handles } from '@/lib/store';
import { applyTheme, clearTheme } from '@/lib/themes/applyTheme';
import type { ThemeName } from '@/lib/themes/types';
import ThemeSwitcher from '@/components/ThemeSwitcher';

// ── 디자인 토큰 ──────────────────────────────────────────────────

const FONT_HEADING = "'Cafe24 Dangdanghae', Impact, sans-serif";
const FONT_BODY    = "'Pretendard', 'Instrument Sans', sans-serif";

const FIELDS: { key: keyof Handles; label: string; color: string; placeholder: string }[] = [
  { key: 'youtube',   label: 'YouTube Shorts', color: '#FF4466', placeholder: '@handle' },
  { key: 'tiktok',    label: 'TikTok',          color: '#69C9D0', placeholder: '@handle' },
  { key: 'instagram', label: 'Instagram Reels', color: '#FF6699', placeholder: '@handle' },
];

// 입력값 정규화: 공백 제거, @ 1개만 유지
function normalize(v: string): string {
  const trimmed = v.trim().replace(/\s+/g, '');
  if (!trimmed) return '';
  return '@' + trimmed.replace(/^@+/, '');
}

export default function ConnectPage() {
  const router     = useRouter();
  const handles    = useStore((s) => s.handles);
  const setHandles = useStore((s) => s.setHandles);

  const [draft, setDraft] = useState<Handles>(handles);

  const [theme, setTheme] = useState<ThemeName>('indigo');
  useEffect(() => { applyTheme(theme); return () => clearTheme(); }, [theme]);

  function update(key: keyof Handles, value: string) {
    setDraft(prev => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    setHandles({
      youtube:   normalize(draft.youtube),
      tiktok:    normalize(draft.tiktok),
      instagram: normalize(draft.instagram),
    });
    router.replace('/my');
  }

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100%' }}>
      <ThemeSwitcher value={theme} onChange={setTheme} options={['indigo', 'purple']} />
      <div className="flex flex-col px-6 pt-6 pb-10">

        {/* 헤더 */}
        <button onClick={() => router.replace('/my')}
          className="font-mono text-[10px] tracking-wider mb-8 self-start transition-opacity hover:opacity-60"
          style={{ color: 'var(--color-ink-3)' }}>
          ← 마이
        </button>

        <h2 className="leading-[0.9] tracking-tight mb-3"
          style={{ fontFamily: FONT_HEADING, fontSize: '40px', color: 'var(--color-ink)' }}>
          계정<br />
          <span style={{ color: 'var(--color-primary)' }}>연결하기</span>
        </h2>
        <p className="text-[13px] leading-[1.6] mb-9" style={{ fontFamily: FONT_BODY, color: 'var(--color-ink-2)' }}>
          플랫폼별 핸들을 입력하세요.<br />입력한 채널만 표시됩니다.
        </p>

        {/* 입력 필드 */}
        <div className="flex flex-col gap-6">
          {FIELDS.map(f => (
            <div key={f.key}>
              <label className="flex items-center gap-2 mb-2.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: f.color }} />
                <span className="font-mono text-[10px] tracking-[0.18em] uppercase" style={{ color: 'var(--color-ink-2)' }}>
                  {f.label}
                </span>
              </label>
              <input type="text" value={draft[f.key]}
                onChange={e => update(f.key, e.target.value)}
                placeholder={f.placeholder}
                autoCapitalize="none" autoCorrect="off" spellCheck={false}
                className="w-full pb-2.5 pt-1 bg-transparent outline-none text-[18px] transition-colors placeholder:text-[color:var(--color-ink-3)]"
                style={{
                  borderBottom: `2px solid ${draft[f.key].trim() ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  color:        'var(--color-ink)',
                  fontFamily:   FONT_BODY,
                  caretColor:   'var(--color-primary)',
                }} />
            </div>
          ))}
        </div>

        {/* 저장 */}
        <button onClick={handleSave}
          className="w-full py-[18px] rounded-2xl text-[15px] font-semibold mt-12 transition-all active:scale-[0.98]"
          style={{ background: 'var(--color-primary)', color: 'var(--color-bg)', fontFamily: FONT_BODY }}>
          저장하기
        </button>
      </div>
    </div>
  );
}
