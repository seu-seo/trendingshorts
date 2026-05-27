'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import type { Platform, UploadRecord } from '@/lib/types';

interface Props {
  date: string | null; // "YYYY-MM-DD" — null이면 닫힘
  onClose: () => void;
}

const PLATFORM_OPTIONS: { value: Platform; label: string; color: string }[] = [
  { value: 'instagram', label: '인스타그램', color: '#E1306C' },
  { value: 'youtube',   label: '유튜브',     color: '#FF0000' },
  { value: 'tiktok',    label: '틱톡',       color: '#69C9D0' },
];

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-');
  return `${y}년 ${parseInt(m)}월 ${parseInt(d)}일`;
}

export default function UploadRecordSheet({ date, onClose }: Props) {
  const uploadRecords    = useStore((s) => s.uploadRecords);
  const addUploadRecord  = useStore((s) => s.addUploadRecord);
  const deleteUploadRecord = useStore((s) => s.deleteUploadRecord);

  const [mode, setMode] = useState<'list' | 'add'>('list');
  const [platform, setPlatform] = useState<Platform>('instagram');
  const [title, setTitle]       = useState('');
  const [url, setUrl]           = useState('');
  const [note, setNote]         = useState('');
  const [mounted, setMounted]   = useState(false);

  const dayRecords = date ? uploadRecords.filter((r) => r.date === date) : [];

  // 슬라이드업 애니메이션
  useEffect(() => {
    if (date) {
      const t = setTimeout(() => setMounted(true), 10);
      return () => clearTimeout(t);
    } else {
      setMounted(false);
    }
  }, [date]);

  // 닫힐 때 폼 초기화
  useEffect(() => {
    if (!date) {
      setMode('list');
      setTitle('');
      setUrl('');
      setNote('');
      setPlatform('instagram');
    }
  }, [date]);

  if (!date) return null;

  const handleAdd = () => {
    if (!title.trim()) return;
    addUploadRecord({ date, platform, title: title.trim(), url: url.trim() || undefined, note: note.trim() || undefined });
    setTitle('');
    setUrl('');
    setNote('');
    setMode('list');
  };

  const handleClose = () => {
    setMounted(false);
    setTimeout(onClose, 280);
  };

  return (
    <>
      {/* 딤 배경 */}
      <div
        className="absolute inset-0 z-20 transition-opacity duration-300"
        style={{ background: 'rgba(0,0,0,0.6)', opacity: mounted ? 1 : 0 }}
        onClick={handleClose}
      />

      {/* 바텀 시트 */}
      <div
        className="absolute bottom-0 left-0 right-0 z-30 rounded-t-3xl flex flex-col"
        style={{
          background: '#111114',
          border: '1px solid rgba(255,255,255,0.08)',
          borderBottom: 'none',
          transform: mounted ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.3s cubic-bezier(0.32,0.72,0,1)',
          maxHeight: '80%',
        }}
      >
        {/* 핸들 */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <div>
            <div className="font-mono text-[10px] tracking-widest text-text-faint uppercase">업로드 기록</div>
            <div className="text-text font-semibold text-sm mt-0.5">{formatDate(date)}</div>
          </div>
          <button
            onClick={handleClose}
            className="text-text-faint hover:text-text transition-colors p-1"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* 콘텐츠 */}
        <div className="flex-1 overflow-y-auto">
          {mode === 'list' ? (
            <div className="px-5 py-4 flex flex-col gap-3">
              {/* 기존 기록 목록 */}
              {dayRecords.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-6 text-center">
                  <div className="text-3xl">📋</div>
                  <div className="text-text-dim text-sm">이 날 업로드 기록이 없어요</div>
                  <div className="text-text-faint text-xs">아래 버튼으로 기록을 추가해보세요</div>
                </div>
              ) : (
                dayRecords.map((rec) => <RecordItem key={rec.id} record={rec} onDelete={() => deleteUploadRecord(rec.id)} />)
              )}

              {/* 추가 버튼 */}
              <button
                onClick={() => setMode('add')}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl font-mono text-sm font-semibold transition-all"
                style={{
                  background: 'rgba(200,255,87,0.08)',
                  border: '1px solid rgba(200,255,87,0.2)',
                  color: '#C8FF57',
                }}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                업로드 기록 추가
              </button>
            </div>
          ) : (
            /* ── 추가 폼 ── */
            <div className="px-5 py-4 flex flex-col gap-4">
              {/* 플랫폼 선택 */}
              <div>
                <label className="font-mono text-[10px] tracking-widest text-text-faint uppercase block mb-2">
                  플랫폼
                </label>
                <div className="flex gap-2">
                  {PLATFORM_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setPlatform(opt.value)}
                      className="flex-1 py-2 rounded-xl text-xs font-mono font-semibold transition-all"
                      style={{
                        background: platform === opt.value ? `${opt.color}22` : 'rgba(255,255,255,0.04)',
                        border: platform === opt.value ? `1px solid ${opt.color}55` : '1px solid rgba(255,255,255,0.08)',
                        color: platform === opt.value ? opt.color : '#5A5A62',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 제목 */}
              <div>
                <label className="font-mono text-[10px] tracking-widest text-text-faint uppercase block mb-2">
                  영상 제목 <span className="text-accent-lime">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="예: 직장인 아침 루틴 5분 버전"
                  className="w-full rounded-xl px-4 py-3 text-sm text-text placeholder-text-faint outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = 'rgba(200,255,87,0.4)')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                />
              </div>

              {/* URL (선택) */}
              <div>
                <label className="font-mono text-[10px] tracking-widest text-text-faint uppercase block mb-2">
                  URL <span className="text-text-faint">(선택)</span>
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://www.instagram.com/reel/..."
                  className="w-full rounded-xl px-4 py-3 text-sm text-text placeholder-text-faint outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = 'rgba(200,255,87,0.4)')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                />
              </div>

              {/* 메모 (선택) */}
              <div>
                <label className="font-mono text-[10px] tracking-widest text-text-faint uppercase block mb-2">
                  메모 <span className="text-text-faint">(선택)</span>
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="조회수 반응, 다음에 시도할 것 등..."
                  rows={3}
                  className="w-full rounded-xl px-4 py-3 text-sm text-text placeholder-text-faint outline-none transition-all resize-none"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = 'rgba(200,255,87,0.4)')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                />
              </div>

              {/* 버튼 */}
              <div className="flex gap-2 pb-2">
                <button
                  onClick={() => setMode('list')}
                  className="flex-1 py-3 rounded-2xl font-mono text-sm text-text-dim transition-all"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  취소
                </button>
                <button
                  onClick={handleAdd}
                  disabled={!title.trim()}
                  className="flex-1 py-3 rounded-2xl font-mono text-sm font-bold transition-all"
                  style={{
                    background: title.trim() ? '#C8FF57' : 'rgba(200,255,87,0.15)',
                    color: title.trim() ? '#0A0A0B' : '#5A5A62',
                  }}
                >
                  저장
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ── 개별 기록 카드 ── */
function RecordItem({ record, onDelete }: { record: UploadRecord; onDelete: () => void }) {
  const PLATFORM_COLOR: Record<Platform, string> = {
    instagram: '#E1306C',
    youtube:   '#FF0000',
    tiktok:    '#69C9D0',
  };
  const PLATFORM_LABEL: Record<Platform, string> = {
    instagram: '인스타그램',
    youtube:   '유튜브',
    tiktok:    '틱톡',
  };

  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-2"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div
            className="inline-block font-mono text-[10px] tracking-widest px-2 py-0.5 rounded-full mb-1.5"
            style={{
              background: `${PLATFORM_COLOR[record.platform]}18`,
              color: PLATFORM_COLOR[record.platform],
              border: `1px solid ${PLATFORM_COLOR[record.platform]}30`,
            }}
          >
            {PLATFORM_LABEL[record.platform]}
          </div>
          <div className="text-text text-sm font-medium leading-snug truncate">{record.title}</div>
          {record.url && (
            <a
              href={record.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[10px] text-text-faint hover:text-accent-lime transition-colors truncate block mt-1"
            >
              🔗 {record.url}
            </a>
          )}
          {record.note && (
            <div className="text-text-dim text-xs mt-1.5 leading-relaxed">{record.note}</div>
          )}
        </div>
        <button
          onClick={onDelete}
          className="text-text-faint hover:text-accent-pink transition-colors flex-shrink-0 p-1"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14H6L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4h6v2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
