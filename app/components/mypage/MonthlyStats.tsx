'use client';

import { useStore } from '@/lib/store';

const PLATFORM_LABELS: Record<string, string> = {
  youtube: 'YouTube',
  instagram: 'Instagram',
  tiktok: 'TikTok',
};

const PLATFORM_COLORS: Record<string, string> = {
  youtube: '#FF3D7F',
  instagram: '#C8FF57',
  tiktok: '#00CFFF',
};

export default function MonthlyStats() {
  const uploadRecords = useStore((s) => s.uploadRecords);
  const uploadGoalDays = useStore((s) => s.uploadGoalDays);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed

  // 이번 달 레코드 필터
  const monthKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
  const thisMonthRecords = uploadRecords.filter((r) => r.date.startsWith(monthKey));

  // 월 목표: 30 / uploadGoalDays (올림)
  const monthlyGoal = Math.ceil(30 / uploadGoalDays);
  const uploadCount = thisMonthRecords.length;
  const achievementRate = Math.min(Math.round((uploadCount / monthlyGoal) * 100), 100);

  // 플랫폼별 breakdown
  const platformCounts: Record<string, number> = {};
  for (const record of thisMonthRecords) {
    platformCounts[record.platform] = (platformCounts[record.platform] ?? 0) + 1;
  }
  const activePlatforms = Object.entries(platformCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-3"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <div className="font-mono text-[10px] tracking-widest text-text-faint uppercase">
            이번 달 통계
          </div>
          <div className="text-text font-semibold text-sm mt-0.5">
            {currentMonth + 1}월 요약
          </div>
        </div>
        <div
          className="px-2 py-0.5 rounded-lg"
          style={{
            background: 'rgba(200,255,87,0.08)',
            border: '1px solid rgba(200,255,87,0.2)',
          }}
        >
          <span
            className="font-mono text-[10px]"
            style={{ color: '#C8FF57' }}
          >
            목표 {monthlyGoal}회
          </span>
        </div>
      </div>

      {/* 업로드 수 */}
      <div className="flex items-end gap-1">
        <span
          className="text-3xl font-bold font-mono"
          style={{ color: '#C8FF57' }}
          data-testid="upload-count"
        >
          {uploadCount}
        </span>
        <span className="text-text-dim text-sm mb-1">/ {monthlyGoal}회</span>
      </div>

      {/* Progress bar */}
      <div>
        <div
          className="h-2 rounded-full overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.08)' }}
        >
          <div
            className="h-full rounded-full transition-all"
            data-testid="progress-bar"
            style={{
              width: `${achievementRate}%`,
              background:
                achievementRate >= 100
                  ? '#C8FF57'
                  : 'rgba(200,255,87,0.7)',
            }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="font-mono text-[10px] text-text-faint">달성률</span>
          <span
            className="font-mono text-[10px]"
            style={{ color: '#C8FF57' }}
            data-testid="achievement-rate"
          >
            {achievementRate}%
          </span>
        </div>
      </div>

      {/* 플랫폼별 breakdown */}
      {activePlatforms.length > 0 && (
        <div className="flex flex-col gap-1.5 pt-1 border-t border-white/5">
          <div className="font-mono text-[10px] tracking-widest text-text-faint uppercase">
            플랫폼별
          </div>
          {activePlatforms.map(([platform, count]) => (
            <div key={platform} className="flex items-center justify-between">
              <span className="text-xs text-text-dim">
                {PLATFORM_LABELS[platform] ?? platform}
              </span>
              <div className="flex items-center gap-2">
                <div
                  className="w-16 h-1 rounded-full overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.08)' }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.round((count / uploadCount) * 100)}%`,
                      background: PLATFORM_COLORS[platform] ?? '#888',
                    }}
                  />
                </div>
                <span className="font-mono text-[11px] text-text-dim w-4 text-right">
                  {count}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
