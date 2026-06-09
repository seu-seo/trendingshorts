'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import type { Handles } from '@/lib/store';

// ── 디자인 토큰 ──────────────────────────────────────────────────

const ACCENT  = '#C8FF57';
const BG      = '#0A0A0A';
const CARD    = '#1A1A1A';
const BORDER  = '#2A2A30';
const TEXT    = '#F2F0EB';
const DIM     = '#8A8A92';
const FAINT   = '#5A5A62';

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
    <div className="flex flex-col px-6 pt-6 pb-10" style={{ background: BG, minHeight: '100%' }}>

      {/* 헤더 */}
      <button onClick={() => router.replace('/my')}
        className="font-mono text-[10px] tracking-wider mb-8 self-start transition-opacity hover:opacity-60"
        style={{ color: FAINT }}>
        ← 마이
      </button>

      <h2 className="leading-[0.9] tracking-tight mb-3"
        style={{ fontFamily: FONT_HEADING, fontSize: '40px', color: TEXT }}>
        계정<br />
        <span style={{ color: ACCENT }}>연결하기</span>
      </h2>
      <p className="text-[13px] leading-[1.6] mb-9" style={{ fontFamily: FONT_BODY, color: DIM }}>
        플랫폼별 핸들을 입력하세요.<br />입력한 채널만 표시됩니다.
      </p>

      {/* 입력 필드 */}
      <div className="flex flex-col gap-6">
        {FIELDS.map(f => (
          <div key={f.key}>
            <label className="flex items-center gap-2 mb-2.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: f.color }} />
              <span className="font-mono text-[10px] tracking-[0.18em] uppercase" style={{ color: DIM }}>
                {f.label}
              </span>
            </label>
            <input type="text" value={draft[f.key]}
              onChange={e => update(f.key, e.target.value)}
              placeholder={f.placeholder}
              autoCapitalize="none" autoCorrect="off" spellCheck={false}
              className="w-full pb-2.5 pt-1 bg-transparent outline-none text-[18px] transition-colors placeholder:text-text-faint"
              style={{
                borderBottom: `2px solid ${draft[f.key].trim() ? ACCENT : BORDER}`,
                color:        TEXT,
                fontFamily:   FONT_BODY,
                caretColor:   ACCENT,
              }} />
          </div>
        ))}
      </div>

      {/* 저장 */}
      <button onClick={handleSave}
        className="w-full py-[18px] rounded-2xl text-[15px] font-semibold mt-12 transition-all active:scale-[0.98]"
        style={{ background: ACCENT, color: BG, fontFamily: FONT_BODY }}>
        저장하기
      </button>
    </div>
  );
}
