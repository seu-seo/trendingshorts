'use client';

import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';

export default function TrendActionSheet() {
  const router = useRouter();
  const trend = useStore((s) => s.actionSheetTrend);
  const setActionSheetTrend = useStore((s) => s.setActionSheetTrend);
  const setSelectedTrendId = useStore((s) => s.setSelectedTrendId);
  const setTab = useStore((s) => s.setTab);
  const savedTrendIds = useStore((s) => s.savedTrendIds);
  const toggleSaveTrend = useStore((s) => s.toggleSaveTrend);

  if (!trend) return null;

  const isSaved = savedTrendIds.includes(trend.id);
  const close = () => setActionSheetTrend(null);

  const handleProduce = () => {
    setSelectedTrendId(trend.id);
    setTab('recommend');
    close();
    router.push('/recommend');
  };

  const handleWatch = () => {
    if (trend.videoUrl) window.open(trend.videoUrl, '_blank', 'noopener,noreferrer');
    close();
  };

  return (
    <>
      {/* 딤 배경 */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(0,0,0,0.6)' }}
        onClick={close}
      />

      {/* 바텀 시트 */}
      <div
        className="fixed bottom-0 z-50 w-full max-w-[420px] rounded-t-3xl px-5 pt-5 pb-8"
        style={{
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--color-surface)',
          borderTop: '1px solid var(--color-border)',
        }}
      >
        {/* 핸들 */}
        <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: 'var(--color-border-2)' }} />

        {/* 영상 정보 */}
        <div className="flex gap-3 items-center mb-5 px-1">
          <div className="text-3xl w-12 h-12 rounded-xl grid place-items-center flex-shrink-0" style={{ background: 'var(--color-soft)' }}>
            {trend.thumb}
          </div>
          <div className="min-w-0">
            <div className="text-[13px] font-semibold leading-snug line-clamp-2 mb-0.5" style={{ color: 'var(--color-ink)' }}>
              {trend.title}
            </div>
            <div className="font-mono text-[10px]" style={{ color: 'var(--color-ink-3)' }}>
              {trend.creator} · {trend.platformLabel}
            </div>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={handleProduce}
            className="w-full py-4 rounded-2xl font-semibold text-[15px] tracking-wide transition-all"
            style={{ background: 'var(--color-primary)', color: 'var(--color-bg)' }}
          >
            이 트렌드로 콘텐츠 만들기 →
          </button>
          <button
            onClick={handleWatch}
            disabled={!trend.videoUrl}
            className="w-full py-4 rounded-2xl font-semibold text-[15px] tracking-wide transition-all"
            style={{
              background: 'var(--color-soft)',
              border: '1px solid var(--color-border)',
              color: trend.videoUrl ? 'var(--color-ink)' : 'var(--color-ink-3)',
              cursor: trend.videoUrl ? 'pointer' : 'not-allowed',
            }}
          >
            원본 보기
          </button>
          {isSaved ? (
            <button
              onClick={() => { toggleSaveTrend(trend.id); close(); }}
              className="w-full py-4 rounded-2xl font-semibold text-[15px] tracking-wide transition-all"
              style={{
                background: 'color-mix(in srgb, var(--color-hot) 8%, transparent)',
                border: '1px solid color-mix(in srgb, var(--color-hot) 25%, transparent)',
                color: 'var(--color-hot)',
              }}
            >
              영상 저장 취소
            </button>
          ) : (
            <button
              onClick={() => { toggleSaveTrend(trend.id); close(); }}
              className="w-full py-4 rounded-2xl font-semibold text-[15px] tracking-wide transition-all"
              style={{
                background: 'var(--color-soft)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-ink)',
              }}
            >
              이 영상 저장하기
            </button>
          )}
        </div>
      </div>
    </>
  );
}
