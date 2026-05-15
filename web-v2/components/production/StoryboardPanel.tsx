'use client';

import { useState } from 'react';
import type { StoryboardShot } from '@/app/api/storyboard/route';

const CARD_W = 160;
const CARD_H = Math.round(CARD_W * 16 / 9); // 284 — exact 9:16

const SHOT_TYPE_COLOR: Record<string, string> = {
  클로즈업: 'rgba(200,255,87,0.9)',
  미디엄샷: 'rgba(87,200,255,0.9)',
  풀샷: 'rgba(255,87,200,0.9)',
  오버더숄더: 'rgba(255,200,87,0.9)',
  POV: 'rgba(200,87,255,0.9)',
  텍스트오버레이: 'rgba(255,255,87,0.9)',
};

function ShotCard({ shot }: { shot: StoryboardShot }) {
  const [imgState, setImgState] = useState<'loading' | 'ok' | 'error'>('loading');
  const typeColor = SHOT_TYPE_COLOR[shot.shotType] ?? 'rgba(200,255,87,0.9)';

  return (
    <div
      className="flex-shrink-0 rounded-[14px] overflow-hidden border border-border"
      style={{ width: CARD_W, background: 'rgba(255,255,255,0.03)' }}
    >
      {/* Image — strict 9:16 */}
      <div className="relative" style={{ width: CARD_W, height: CARD_H }}>
        {imgState !== 'error' && (
          /* referrerpolicy="no-referrer": <img> doesn't send Referer → bypasses localhost blocking */
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={shot.imageUrl}
            alt={shot.visualKo}
            referrerPolicy="no-referrer"
            style={{
              width: CARD_W,
              height: CARD_H,
              objectFit: 'cover',
              display: imgState === 'ok' ? 'block' : 'none',
            }}
            onLoad={() => setImgState('ok')}
            onError={() => setImgState('error')}
          />
        )}

        {/* Loading spinner */}
        {imgState === 'loading' && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.04)' }}
          >
            <div className="w-5 h-5 border-2 border-border border-t-accent-lime rounded-full animate-spin" />
          </div>
        )}

        {/* Fallback */}
        {imgState === 'error' && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-3"
            style={{ background: 'rgba(255,255,255,0.04)' }}
          >
            <span className="text-2xl">🎬</span>
            <span className="font-mono text-[9px] text-text-faint text-center leading-snug">
              {shot.visualKo}
            </span>
          </div>
        )}

        {/* Index badge */}
        <div
          className="absolute top-2 left-2 font-mono text-[10px] font-bold leading-none px-1.5 py-0.5 rounded"
          style={{ background: 'rgba(0,0,0,0.75)', color: typeColor }}
        >
          {String(shot.index).padStart(2, '0')}
        </div>

        {/* Shot type — bottom gradient */}
        <div
          className="absolute bottom-0 left-0 right-0 px-2 py-2"
          style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.88))' }}
        >
          <div className="font-mono text-[9px] font-bold" style={{ color: typeColor }}>
            {shot.shotType}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="px-3 py-2.5 space-y-1.5">
        <div>
          <div className="font-mono text-[8px] text-text-faint uppercase tracking-widest mb-0.5">대사</div>
          <div className="text-[11px] text-text leading-snug line-clamp-3">{shot.dialogue}</div>
        </div>
        <div>
          <div className="font-mono text-[8px] text-text-faint uppercase tracking-widest mb-0.5">카메라</div>
          <div className="font-mono text-[9px] text-text-dim">{shot.camera}</div>
        </div>
      </div>
    </div>
  );
}

export default function StoryboardPanel({
  shots,
  source,
  onClose,
}: {
  shots: StoryboardShot[];
  source: 'live' | 'mock';
  onClose: () => void;
}) {
  return (
    <div
      className="mt-4 rounded-[18px] border border-border overflow-hidden"
      style={{ background: 'rgba(200,255,87,0.03)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b border-border"
        style={{ background: 'rgba(200,255,87,0.05)' }}
      >
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] tracking-widest uppercase" style={{ color: 'var(--accent-lime)' }}>
            콘티 · STORYBOARD
          </span>
          <span
            className="font-mono text-[8px] px-1.5 py-0.5 rounded"
            style={{
              background: source === 'live' ? 'rgba(200,255,87,0.15)' : 'rgba(255,255,255,0.06)',
              color: source === 'live' ? 'var(--accent-lime)' : 'var(--text-faint)',
            }}
          >
            {source === 'live' ? 'LIVE' : 'MOCK'}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="font-mono text-[10px] text-text-faint hover:text-text transition-colors"
        >
          닫기
        </button>
      </div>

      {/* Horizontal scroll */}
      <div className="overflow-x-auto">
        <div className="flex gap-3 p-4" style={{ width: 'max-content' }}>
          {shots.map((shot) => (
            <ShotCard key={shot.index} shot={shot} />
          ))}
        </div>
      </div>

      <div className="px-4 pb-3">
        <p className="font-mono text-[9px] text-text-faint">
          이미지: Pollinations AI (무료) · Gemini 5컷 분석
        </p>
      </div>
    </div>
  );
}
