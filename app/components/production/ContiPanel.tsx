'use client';

import { useState } from 'react';
import type { ContiCut, ContiResponse } from '@/app/api/conti/route';
import type { ScriptTone } from '@/lib/prompts';
import { useStore } from '@/lib/store';
import ContiSketch from './ContiSketch';

const TONE_LABEL: Record<ScriptTone, string> = {
  informative: '정보형',
  story: '스토리형',
  hooking: '후킹형',
};

const PART_COLOR: Record<string, string> = {
  훅: 'var(--color-hot)',
  전환: 'var(--color-primary-mid)',
  본론: 'var(--color-primary)',
  클로징: 'var(--peak)',
};

// 이미지가 있으면 만화 이미지, 없거나 로드 실패면 SVG 스케치로 fallback
function CutVisual({ cut }: { cut: ContiCut }) {
  const [imgState, setImgState] = useState<'loading' | 'ok' | 'error'>(cut.imageUrl ? 'loading' : 'error');

  if (!cut.imageUrl || imgState === 'error') {
    return <ContiSketch type={cut.sketchType} label={cut.shotType} />;
  }
  return (
    <div className="relative w-full overflow-hidden rounded-[10px]" style={{ aspectRatio: '16 / 9' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={cut.imageUrl}
        alt={cut.visualKo}
        referrerPolicy="no-referrer"
        className="w-full h-full object-cover"
        style={{ display: imgState === 'ok' ? 'block' : 'none' }}
        onLoad={() => setImgState('ok')}
        onError={() => setImgState('error')}
      />
      {imgState === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'var(--color-border)' }}>
          <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--color-border)', borderTopColor: 'var(--color-primary)' }} />
        </div>
      )}
      <span
        className="absolute bottom-1.5 right-2 font-mono text-[8px] font-bold tracking-wide px-1 rounded-sm"
        style={{ color: 'var(--color-bg)', background: 'var(--color-ink)' }}
      >
        {cut.shotType}
      </span>
    </div>
  );
}

function CutCard({ cut }: { cut: ContiCut }) {
  const accent = PART_COLOR[cut.part] ?? 'var(--color-primary)';
  return (
    <div className="rounded-[14px] border border-border overflow-hidden" style={{ background: 'var(--color-border)' }}>
      {/* CUT 헤더 */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] font-bold tracking-wider" style={{ color: accent }}>
            CUT {cut.index}
          </span>
          <span className="font-mono text-[10px]" style={{ color: 'var(--color-ink-2)' }}>· {cut.part}</span>
        </div>
        <span className="font-mono text-[10px] tracking-wider" style={{ color: 'var(--color-ink-3)' }}>{cut.timeRange}</span>
      </div>

      {/* 장면: 만화 이미지(또는 SVG fallback) */}
      <div className="p-3 pb-2.5">
        <CutVisual cut={cut} />
      </div>

      {/* 대사 + 촬영 메모 */}
      <div className="px-3.5 pb-3.5 space-y-2.5">
        <div>
          <div className="font-mono text-[8px] uppercase tracking-widest mb-1" style={{ color: 'var(--color-ink-3)' }}>대사</div>
          <div className="text-[13px] leading-snug italic" style={{ color: 'var(--color-ink)' }}>&ldquo;{cut.dialogue}&rdquo;</div>
        </div>
        <div className="flex items-start gap-2 pt-2 border-t border-dashed border-border">
          <span
            className="font-mono text-[8px] tracking-widest uppercase px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5"
            style={{ color: accent, background: 'var(--color-border)' }}
          >
            {cut.shotType}
          </span>
          <div className="text-[11px] leading-relaxed" style={{ color: 'var(--color-ink-2)' }}>{cut.shootingMemo}</div>
        </div>
      </div>
    </div>
  );
}

export default function ContiPanel({
  data,
  tone,
  loading,
  onRegenerate,
  onClose,
}: {
  data: ContiResponse;
  tone: ScriptTone;
  loading?: boolean;
  onRegenerate?: () => void;
  onClose: () => void;
}) {
  const [shot, setShot] = useState(false);

  const saveScript = useStore((s) => s.saveScript);
  const savedScripts = useStore((s) => s.savedScripts);
  const contiId = `conti-${data.cuts[0]?.dialogue?.slice(0, 10) ?? tone}-${Date.now().toString(36)}`;
  const [savedId] = useState(contiId);
  const isSaved = savedScripts.some((x) => x.id === savedId);

  const handleSaveConti = () => {
    saveScript({
      id: savedId,
      title: `[콘티·${TONE_LABEL[tone]}] ${data.trendPoint.slice(0, 30)}${data.trendPoint.length > 30 ? '…' : ''}`,
      hook: data.cuts[0]?.dialogue,
      date: new Date().toLocaleDateString('ko-KR'),
      hasConti: true,
    });
  };

  return (
    <div className="mt-4 rounded-[18px] border border-border overflow-hidden" style={{ background: 'color-mix(in srgb, var(--color-primary) 3%, transparent)' }}>
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border" style={{ background: 'color-mix(in srgb, var(--color-primary) 5%, transparent)' }}>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] tracking-widest uppercase" style={{ color: 'var(--color-primary)' }}>
            콘티 가이드 · {TONE_LABEL[tone]}
          </span>
          <span
            className="font-mono text-[8px] px-1.5 py-0.5 rounded"
            style={{
              background: data.source === 'live' ? 'color-mix(in srgb, var(--color-primary) 15%, transparent)' : 'var(--color-border)',
              color: data.source === 'live' ? 'var(--color-primary)' : 'var(--color-ink-3)',
            }}
          >
            {data.source === 'live' ? 'LIVE' : 'MOCK'}
          </span>
        </div>
        <button type="button" onClick={onClose} className="font-mono text-[10px] transition-colors" style={{ color: 'var(--color-ink-3)' }}>
          닫기
        </button>
      </div>

      {/* 트렌드 포인트 */}
      <div className="mx-4 mt-4 mb-1 p-3 rounded-[10px] border" style={{ background: 'color-mix(in srgb, var(--color-primary-mid) 5%, transparent)', borderColor: 'color-mix(in srgb, var(--color-primary-mid) 18%, transparent)' }}>
        <div className="font-mono text-[8px] tracking-widest uppercase mb-1" style={{ color: 'var(--color-primary-mid)' }}>트렌드 포인트</div>
        <div className="text-[11px] leading-relaxed" style={{ color: 'var(--color-ink)' }}>{data.trendPoint}</div>
      </div>

      {/* CUT 카드 (세로) */}
      <div className="p-4 pt-3 flex flex-col gap-3">
        {data.cuts.map((cut) => (
          <CutCard key={cut.index} cut={cut} />
        ))}
      </div>

      {/* 액션 */}
      <div className="px-4 pb-4 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShot((s) => !s)}
          className="flex-1 py-2.5 rounded-full font-semibold text-[12px] tracking-wide transition-all"
          style={
            shot
              ? { background: 'color-mix(in srgb, var(--color-primary) 18%, transparent)', color: 'var(--color-primary)', border: '1px solid color-mix(in srgb, var(--color-primary) 50%, transparent)' }
              : { background: 'var(--color-primary)', color: 'var(--color-bg)', border: '1px solid var(--color-primary)' }
          }
        >
          {shot ? '✓ 촬영 완료' : '촬영했어요'}
        </button>
        <button
          type="button"
          onClick={handleSaveConti}
          disabled={isSaved}
          className="px-4 py-2.5 rounded-full font-mono text-[11px] tracking-wider uppercase border transition-colors disabled:cursor-default"
          style={
            isSaved
              ? { borderColor: 'color-mix(in srgb, var(--color-primary) 40%, transparent)', color: 'var(--color-primary)', background: 'color-mix(in srgb, var(--color-primary) 8%, transparent)' }
              : { borderColor: 'var(--color-border-2)', color: 'var(--color-ink-2)', background: 'transparent' }
          }
        >
          {isSaved ? '✓ 저장됨' : '저장하기'}
        </button>
        {onRegenerate && (
          <button
            type="button"
            onClick={onRegenerate}
            disabled={loading}
            className="px-4 py-2.5 rounded-full font-mono text-[11px] tracking-wider uppercase border border-border transition-colors disabled:opacity-50"
            style={{ color: 'var(--color-ink-2)' }}
          >
            {loading ? '생성 중…' : '↺ 재생성'}
          </button>
        )}
      </div>

      <div className="px-4 pb-3">
        <p className="font-mono text-[9px]" style={{ color: 'var(--color-ink-3)' }}>
          {data.source === 'live'
            ? 'Gemini 4컷 분해 + 만화 생성 (1·4 인물 / 2·3 제품, 동일 화풍). 이미지 실패 시 SVG로 대체'
            : 'GOOGLE_GENERATIVE_AI_API_KEY 미설정 — 대본 기반 mock 콘티 (SVG 스케치)'}
        </p>
      </div>
    </div>
  );
}
