'use client';

// ─────────────────────────────────────────────────────────────
// UploadCalendar
//
// 플랫폼별 업로드 날짜를 기록하는 달력 트래커입니다.
// 날짜 셀 클릭 → 현재 선택된 플랫폼 업로드 토글
// 상단 버튼으로 플랫폼 전환, ‹ › 로 월 이동
//
// 사용법:
//   <UploadCalendar />
//
// 상태 영속성이 필요하면 uploadCalendar를 localStorage나
// 상위 컴포넌트 state로 끌어올려 props로 내려주세요.
// ─────────────────────────────────────────────────────────────

import { useState, useCallback } from 'react';

type Platform = 'tiktok' | 'instagram' | 'youtube';

// 'YYYY-MM-DD' → Set<Platform>
type UploadMap = Record<string, Set<Platform>>;

const CAL_COLORS: Record<Platform, string> = {
  tiktok:    '#5CE1E6',
  instagram: '#FF4274',
  youtube:   '#FF5555',
};

const CAL_ACTIVE: Record<Platform, string> = {
  tiktok:    'active-tt',
  instagram: 'active-ig',
  youtube:   'active-yt',
};

const CAL_LABELS: Record<Platform, string> = {
  tiktok:    '틱톡',
  instagram: '인스타',
  youtube:   '유튜브',
};

const PLATFORMS: Platform[] = ['tiktok', 'instagram', 'youtube'];

const DAY_HEADERS = ['일', '월', '화', '수', '목', '금', '토'];

// ── 플랫폼 버튼 ───────────────────────────────────────────────
function PlatBtn({ platform, active, onClick }: { platform: Platform; active: boolean; onClick: () => void }) {
  const color = CAL_COLORS[platform];
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: '5px 0',
        fontSize: '11px',
        fontWeight: 600,
        fontFamily: 'var(--font-body)',
        borderRadius: '20px',
        border: active ? `1.5px solid ${color}` : '1.5px solid var(--line)',
        background: active ? `${color}1A` : 'none',
        color: active ? color : 'var(--gray)',
        cursor: 'pointer',
        transition: 'all .2s',
      }}
    >
      {CAL_LABELS[platform]}
    </button>
  );
}

// ── 날짜 셀 ──────────────────────────────────────────────────
function CalCell({
  day,
  dateStr,
  plats,
  isToday,
  activePlatform,
  onToggle,
}: {
  day: number;
  dateStr: string;
  plats: Platform[];
  isToday: boolean;
  activePlatform: Platform;
  onToggle: (dateStr: string) => void;
}) {
  const color = CAL_COLORS[activePlatform];
  const hasActive = plats.includes(activePlatform);

  const bgColor =
    plats.length === 1 ? `${CAL_COLORS[plats[0]]}22` :
    plats.length > 1   ? 'rgba(255,255,255,0.07)' :
    'none';

  return (
    <button
      onClick={() => onToggle(dateStr)}
      style={{
        aspectRatio: '1',
        borderRadius: '50%',
        border: isToday ? `1.5px solid var(--primary)` : 'none',
        background: bgColor,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '11px',
        fontFamily: 'var(--font-body)',
        color: isToday ? 'var(--primary)' : 'var(--ink)',
        fontWeight: isToday || plats.length > 0 ? 700 : 400,
        position: 'relative',
        transition: 'background .15s',
        gap: '1px',
        boxShadow: hasActive ? `0 0 0 1.5px ${color}` : 'none',
      }}
    >
      <span
        style={{
          color: plats.length === 1 ? CAL_COLORS[plats[0]] : undefined,
          fontWeight: plats.length > 0 ? 700 : undefined,
        }}
      >
        {day}
      </span>
      {plats.length > 0 && (
        <div style={{ display: 'flex', gap: '2px', justifyContent: 'center' }}>
          {plats.map((p) => (
            <div
              key={p}
              style={{ width: '3px', height: '3px', borderRadius: '50%', background: CAL_COLORS[p] }}
            />
          ))}
        </div>
      )}
    </button>
  );
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────
export default function UploadCalendar() {
  const now = new Date();
  const [uploadMap, setUploadMap]       = useState<UploadMap>({});
  const [calYear, setCalYear]           = useState(now.getFullYear());
  const [calMonth, setCalMonth]         = useState(now.getMonth());
  const [activePlatform, setActivePlatform] = useState<Platform>('tiktok');

  const today = now.toISOString().split('T')[0];

  // 월 이동
  const changeMonth = useCallback((dir: 1 | -1) => {
    setCalMonth((m) => {
      const next = m + dir;
      if (next < 0)  { setCalYear((y) => y - 1); return 11; }
      if (next > 11) { setCalYear((y) => y + 1); return 0; }
      return next;
    });
  }, []);

  // 날짜 클릭 → 플랫폼 토글
  const toggleDate = useCallback((dateStr: string) => {
    setUploadMap((prev) => {
      const next = { ...prev };
      const existing = new Set(next[dateStr] ?? []);
      if (existing.has(activePlatform)) {
        existing.delete(activePlatform);
        if (existing.size === 0) delete next[dateStr];
        else next[dateStr] = existing;
      } else {
        existing.add(activePlatform);
        next[dateStr] = existing;
      }
      return next;
    });
  }, [activePlatform]);

  // 달력 날짜 계산
  const firstDay    = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

  // 이번 달 플랫폼별 업로드 횟수
  const counts: Record<Platform, number> = { tiktok: 0, instagram: 0, youtube: 0 };
  Object.entries(uploadMap).forEach(([date, platSet]) => {
    const [y, m] = date.split('-').map(Number);
    if (y === calYear && m === calMonth + 1) {
      platSet.forEach((p) => counts[p]++);
    }
  });

  return (
    <div style={{ margin: '4px 16px 16px', background: 'var(--bg-card)', borderRadius: '16px', padding: '16px', border: '1px solid var(--line)' }}>
      {/* 월 네비게이션 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <button
          onClick={() => changeMonth(-1)}
          style={{ background: 'none', border: 'none', color: 'var(--ink-soft)', fontSize: '18px', cursor: 'pointer', padding: '4px 8px', lineHeight: 1, borderRadius: '8px' }}
        >
          ‹
        </button>
        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-body)' }}>
          {calYear}년 {calMonth + 1}월
        </span>
        <button
          onClick={() => changeMonth(1)}
          style={{ background: 'none', border: 'none', color: 'var(--ink-soft)', fontSize: '18px', cursor: 'pointer', padding: '4px 8px', lineHeight: 1, borderRadius: '8px' }}
        >
          ›
        </button>
      </div>

      {/* 플랫폼 선택 */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
        {PLATFORMS.map((p) => (
          <PlatBtn
            key={p}
            platform={p}
            active={activePlatform === p}
            onClick={() => setActivePlatform(p)}
          />
        ))}
      </div>

      {/* 요일 헤더 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', textAlign: 'center', marginBottom: '4px' }}>
        {DAY_HEADERS.map((d, i) => (
          <div
            key={d}
            style={{ fontSize: '9px', color: i === 0 ? '#FF6B6B' : i === 6 ? '#6BA3FF' : 'var(--gray)', fontFamily: 'var(--font-mono)', padding: '2px 0' }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '3px' }}>
        {/* 첫 주 빈 칸 */}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`blank-${i}`} style={{ aspectRatio: '1' }} />
        ))}

        {/* 날짜 셀 */}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
          const mm      = String(calMonth + 1).padStart(2, '0');
          const dd      = String(day).padStart(2, '0');
          const dateStr = `${calYear}-${mm}-${dd}`;
          const plats   = uploadMap[dateStr] ? [...uploadMap[dateStr]] : [];

          return (
            <CalCell
              key={dateStr}
              day={day}
              dateStr={dateStr}
              plats={plats as Platform[]}
              isToday={dateStr === today}
              activePlatform={activePlatform}
              onToggle={toggleDate}
            />
          );
        })}
      </div>

      {/* 이번 달 업로드 횟수 범례 */}
      {PLATFORMS.some((p) => counts[p] > 0) && (
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
          {PLATFORMS.filter((p) => counts[p] > 0).map((p) => (
            <div
              key={p}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontFamily: 'var(--font-mono)', color: CAL_COLORS[p] }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: CAL_COLORS[p], display: 'inline-block' }} />
              {CAL_LABELS[p]} {counts[p]}회
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
