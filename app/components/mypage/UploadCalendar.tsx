'use client';

import type { UploadRecord } from '@/lib/types';

interface Props {
  records: UploadRecord[];
  onDateClick?: (date: string) => void; // "YYYY-MM-DD"
  viewYear: number;
  viewMonth: number; // 0-indexed
  onPrevMonth: () => void;
  onNextMonth: () => void;
  uploadGoalDays?: number; // 설정에서 가져온 업로드 주기 목표
}

const DAYS = ['일', '월', '화', '수', '목', '금', '토'];
const MONTHS = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

function toDateStr(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function getDaysSinceLastUpload(records: UploadRecord[]): number | null {
  if (records.length === 0) return null;
  const sorted = [...records].sort((a, b) => b.date.localeCompare(a.date));
  const lastDate = new Date(sorted[0].date + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  lastDate.setHours(0, 0, 0, 0);
  return Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
}

export default function UploadCalendar({ records, onDateClick, viewYear, viewMonth, onPrevMonth, onNextMonth, uploadGoalDays }: Props) {
  const today = new Date();
  const recordDates = new Set(records.map((r) => r.date));

  // 첫째 날 요일 offset + 월 총 일수
  const firstDayOffset = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array(firstDayOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const daysSince = getDaysSinceLastUpload(records);
  const isOverdue = uploadGoalDays != null && daysSince != null && daysSince >= uploadGoalDays;

  return (
    <div className="flex flex-col gap-3">
      {/* ── 배너 ── */}
      <div
        className="rounded-2xl p-4 flex flex-col gap-3"
        style={{
          background: isOverdue ? 'rgba(200,255,87,0.05)' : 'rgba(255,255,255,0.03)',
          border: isOverdue ? '1px solid rgba(200,255,87,0.18)' : '1px solid rgba(255,255,255,0.07)',
        }}
      >
        {/* 상단: 메인 메시지 + 목표 뱃지 */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1">
            {daysSince === null ? (
              <>
                <div className="font-mono text-[10px] tracking-widest text-text-faint uppercase">업로드 기록</div>
                <div className="text-text font-semibold text-sm">아직 기록이 없어요 📭</div>
                <div className="text-text-dim text-xs leading-relaxed">
                  달력에서 날짜를 눌러 첫 업로드를 기록해보세요
                </div>
              </>
            ) : daysSince === 0 ? (
              <>
                <div className="font-mono text-[10px] tracking-widest text-text-faint uppercase">마지막 업로드</div>
                <div className="text-accent-lime font-bold text-sm">오늘 업로드했어요 🎉</div>
                <div className="text-text-dim text-xs leading-relaxed">
                  오늘 목표 달성! 내일도 화이팅 🔥
                </div>
              </>
            ) : (
              <>
                <div className="font-mono text-[10px] tracking-widest text-text-faint uppercase">마지막 업로드로부터</div>
                <div
                  className="font-bold leading-snug"
                  style={{ fontSize: '22px', color: '#C8FF57' }}
                >
                  벌써 <span style={{ color: '#FF3D7F' }}>{daysSince}</span>일이 지났어요!
                </div>
              </>
            )}
          </div>

          {/* 목표 주기 뱃지 */}
          {uploadGoalDays != null && (
            <div
              className="flex-shrink-0 inline-flex items-center justify-center px-2 py-0.5 rounded-lg"
              style={{
                background: 'rgba(255,61,127,0.10)',
                border: '1px solid rgba(255,61,127,0.25)',
              }}
            >
              <span className="font-mono text-[9px] tracking-wide whitespace-nowrap leading-none" style={{ color: '#FF3D7F' }}>
                업로드 주기 : {uploadGoalDays}일
              </span>
            </div>
          )}
        </div>

        {/* 하단: 독려 문구 (기간 초과 시) */}
        {isOverdue && (
          <div className="text-text-dim text-xs">
            꾸준한 인게이지먼트를 위해 <span className="text-text font-medium">오늘 편집 한 번 어떨까요?</span> ✏️
          </div>
        )}
      </div>

      {/* ── 달력 ── */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        {/* 월 네비게이션 */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <button
            onClick={onPrevMonth}
            className="text-text-dim hover:text-text transition-colors p-1 rounded-lg hover:bg-white/5"
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div className="font-mono text-sm text-text tracking-wider">
            {viewYear}. {MONTHS[viewMonth]}
          </div>
          <button
            onClick={onNextMonth}
            className="text-text-dim hover:text-text transition-colors p-1 rounded-lg hover:bg-white/5"
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 px-2 pt-3">
          {DAYS.map((d) => (
            <div key={d} className="text-center font-mono text-[10px] text-text-faint pb-2">
              {d}
            </div>
          ))}
        </div>

        {/* 날짜 셀 */}
        <div className="grid grid-cols-7 px-2 pb-4 gap-y-0.5">
          {cells.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} className="py-2" />;

            const dateStr = toDateStr(viewYear, viewMonth, day);
            const hasUpload = recordDates.has(dateStr);
            const uploadCount = records.filter((r) => r.date === dateStr).length;
            const isToday =
              today.getFullYear() === viewYear &&
              today.getMonth() === viewMonth &&
              today.getDate() === day;
            const isFuture =
              new Date(viewYear, viewMonth, day) > today;

            return (
              <button
                key={`day-${i}`}
                onClick={() => !isFuture && onDateClick?.(dateStr)}
                disabled={isFuture}
                className={`
                  relative flex flex-col items-center justify-center py-2 rounded-xl transition-all
                  ${isFuture ? 'opacity-25 cursor-default' : 'cursor-pointer'}
                  ${hasUpload && !isFuture ? 'hover:bg-accent-lime/10' : !isFuture ? 'hover:bg-white/5' : ''}
                  ${isToday ? 'ring-1 ring-inset ring-accent-lime/50' : ''}
                `}
              >
                <span
                  className={`text-[13px] leading-none font-mono ${
                    isToday
                      ? 'text-accent-lime font-bold'
                      : hasUpload
                      ? 'text-text font-medium'
                      : 'text-text-dim'
                  }`}
                >
                  {day}
                </span>
                {/* 업로드 닷 */}
                {hasUpload && (
                  <div className="flex gap-[3px] mt-[4px]">
                    {Array.from({ length: Math.min(uploadCount, 3) }).map((_, ci) => (
                      <div
                        key={ci}
                        className="w-[5px] h-[5px] rounded-full bg-accent-lime"
                        style={{ boxShadow: '0 0 4px rgba(200,255,87,0.6)' }}
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 범례 ── */}
      <div className="flex items-center gap-4 px-1">
        <div className="flex items-center gap-1.5">
          <div
            className="w-[5px] h-[5px] rounded-full bg-accent-lime"
            style={{ boxShadow: '0 0 4px rgba(200,255,87,0.6)' }}
          />
          <span className="font-mono text-[10px] text-text-faint">업로드한 날</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-[14px] h-[14px] rounded-[4px] ring-1 ring-accent-lime/50" />
          <span className="font-mono text-[10px] text-text-faint">오늘</span>
        </div>
      </div>
    </div>
  );
}
