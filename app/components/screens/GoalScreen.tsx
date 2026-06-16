'use client';

import { useEffect, useState } from 'react';

interface UploadLog {
  platform: 'tiktok' | 'instagram' | 'youtube';
  date: string;
  views: number;
}

const LS = {
  goal: 'pulse_weekly_goal',
  logs: 'pulse_upload_logs',
  stamps: 'pulse_stamps',
};

function loadGoal(): number {
  try { return Number(localStorage.getItem(LS.goal)) || 3; } catch { return 3; }
}
function loadLogs(): UploadLog[] {
  try { return JSON.parse(localStorage.getItem(LS.logs) ?? '[]'); } catch { return []; }
}
function loadStamps(): number {
  try { return Number(localStorage.getItem(LS.stamps)) || 0; } catch { return 0; }
}
function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(now.getFullYear(), now.getMonth(), diff).toISOString().split('T')[0];
}

interface GoalScreenProps {
  onBack: () => void;
  onCompare: () => void;
}

export default function GoalScreen({ onBack, onCompare }: GoalScreenProps) {
  const [goal, setGoal] = useState(3);
  const [logs, setLogs] = useState<UploadLog[]>([]);
  const [stamps, setStamps] = useState(7);
  const [logOpen, setLogOpen] = useState(false);
  const [goalOpen, setGoalOpen] = useState(false);
  const [logPlatform, setLogPlatform] = useState<'tiktok' | 'instagram' | 'youtube'>('tiktok');
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [logViews, setLogViews] = useState('');
  const [selectedFreq, setSelectedFreq] = useState(3);

  useEffect(() => {
    setGoal(loadGoal());
    setLogs(loadLogs());
    setStamps(loadStamps());
  }, []);

  const weekStart = getWeekStart();
  const weekLogs = logs.filter(l => l.date >= weekStart);
  const done = weekLogs.length;
  const pct = Math.min(100, Math.round((done / Math.max(goal, 1)) * 100));
  const uploadDayIndices = new Set(weekLogs.map(l => {
    const d = new Date(l.date).getDay();
    return (d + 6) % 7; // 0=Mon
  }));
  const DAYS = ['월', '화', '수', '목', '금', '토', '일'];

  function submitLog() {
    if (!logViews) return;
    const log: UploadLog = { platform: logPlatform, date: logDate, views: Number(logViews) };
    const next = [log, ...logs];
    const nextStamps = stamps + 1;
    setLogs(next);
    setStamps(nextStamps);
    try {
      localStorage.setItem(LS.logs, JSON.stringify(next));
      localStorage.setItem(LS.stamps, String(nextStamps));
    } catch {}
    setLogViews('');
    setLogOpen(false);
  }

  function saveGoal() {
    setGoal(selectedFreq);
    try { localStorage.setItem(LS.goal, String(selectedFreq)); } catch {}
    setGoalOpen(false);
  }

  function addStamp() {
    const next = Math.min(10, stamps + 1);
    setStamps(next);
    try { localStorage.setItem(LS.stamps, String(next)); } catch {}
  }

  return (
    <div className="screen active goal-screen" id="screen-goal">
      <div className="status-bar">
        <span>9:41</span>
        <span style={{ fontSize: '12px' }}>􀙇 􀛪</span>
      </div>
      <div className="screen-header">
        <button className="back-btn" onClick={onBack}>←</button>
        <div className="screen-title">목표 트래커</div>
        <div style={{ width: '32px' }} />
      </div>
      <div className="goal-body screen-content">

        {/* 이번 주 목표 */}
        <div className="goal-week-card">
          <div className="goal-week-top">
            <div className="goal-week-label">이번 주 목표</div>
            <button className="goal-edit-btn" onClick={() => { setSelectedFreq(goal); setGoalOpen(true); }}>수정</button>
          </div>
          <div className="goal-week-main">
            <span className="goal-week-num">{done}</span>
            <span className="goal-week-sep">/</span>
            <span className="goal-week-total">{goal}</span>
            <span className="goal-week-unit">회 업로드</span>
          </div>
          <div className="goal-week-bar-wrap">
            <div className="goal-week-bar" style={{ width: `${pct}%` }} />
          </div>
          <div className="goal-week-days">
            {DAYS.map((d, i) => (
              <div key={i} className={`goal-day${uploadDayIndices.has(i) ? ' done' : ''}`}>{d}</div>
            ))}
          </div>
        </div>

        {/* Creator Pass 스탬프 */}
        <div className="stamp-card">
          <div className="stamp-card-header">
            <div className="stamp-card-title">Creator Pass</div>
            <div className="stamp-card-serial">크리에이터 님 · #{String(stamps).padStart(3, '0')}</div>
          </div>
          <div className="stamp-grid">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className={`stamp${i < stamps ? ' filled' : i === stamps && stamps < 10 ? '' : ' empty'}`}
                id={i === stamps && stamps < 10 ? 'stamp-next' : undefined}
                onClick={i === stamps && stamps < 10 ? addStamp : undefined}
              >
                {i < stamps ? i + 1 : i === stamps && stamps < 10 ? '+' : ''}
              </div>
            ))}
          </div>
          <div className="stamp-card-footer">
            <div className="stamp-bar-wrap">
              <div className="stamp-bar" style={{ width: `${(stamps / 10) * 100}%` }} />
            </div>
            <div className="stamp-bar-label"><span>{stamps}</span> / 10</div>
          </div>
        </div>

        {/* 업로드 기록 버튼 */}
        <button className="goal-log-btn" onClick={() => setLogOpen(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          업로드 기록하기
        </button>

        {/* 플랫폼별 성장 */}
        <div className="goal-section">
          <div className="goal-section-head">
            <div className="goal-section-title">내 채널 성장</div>
            <div className="goal-section-meta">최근 8주</div>
          </div>
          <div className="platform-graphs">
            <div className="platform-graph-item">
              <div className="platform-graph-label">
                <span className="platform-dot insta" />인스타그램
                <span className="platform-graph-val">+18%</span>
              </div>
              <svg className="mini-line-chart" viewBox="0 0 200 50" preserveAspectRatio="none">
                <defs><linearGradient id="grad-ig-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#E1306C" stopOpacity="0.3" /><stop offset="100%" stopColor="#E1306C" stopOpacity="0" /></linearGradient></defs>
                <path className="chart-area" fill="url(#grad-ig-g)" d="M0,42 L25,44 L50,40 L75,35 L100,38 L125,30 L150,25 L175,20 L200,15 L200,50 L0,50 Z" />
                <path className="chart-line ig" fill="none" d="M0,42 L25,44 L50,40 L75,35 L100,38 L125,30 L150,25 L175,20 L200,15" />
              </svg>
            </div>
            <div className="platform-graph-item">
              <div className="platform-graph-label">
                <span className="platform-dot tiktok" />틱톡
                <span className="platform-graph-val">+24%</span>
              </div>
              <svg className="mini-line-chart" viewBox="0 0 200 50" preserveAspectRatio="none">
                <defs><linearGradient id="grad-tt-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#69C9D0" stopOpacity="0.3" /><stop offset="100%" stopColor="#69C9D0" stopOpacity="0" /></linearGradient></defs>
                <path className="chart-area" fill="url(#grad-tt-g)" d="M0,45 L25,40 L50,38 L75,32 L100,28 L125,22 L150,18 L175,12 L200,8 L200,50 L0,50 Z" />
                <path className="chart-line tt" fill="none" d="M0,45 L25,40 L50,38 L75,32 L100,28 L125,22 L150,18 L175,12 L200,8" />
              </svg>
            </div>
            <div className="platform-graph-item">
              <div className="platform-graph-label">
                <span className="platform-dot youtube" />유튜브
                <span className="platform-graph-val" style={{ color: '#FF0000' }}>+5%</span>
              </div>
              <svg className="mini-line-chart" viewBox="0 0 200 50" preserveAspectRatio="none">
                <defs><linearGradient id="grad-yt-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FF0000" stopOpacity="0.25" /><stop offset="100%" stopColor="#FF0000" stopOpacity="0" /></linearGradient></defs>
                <path className="chart-area" fill="url(#grad-yt-g)" d="M0,40 L25,42 L50,44 L75,41 L100,38 L125,36 L150,34 L175,32 L200,30 L200,50 L0,50 Z" />
                <path className="chart-line yt" fill="none" d="M0,40 L25,42 L50,44 L75,41 L100,38 L125,36 L150,34 L175,32 L200,30" />
              </svg>
            </div>
          </div>
        </div>

        {/* 리워드 */}
        <div className="goal-section">
          <div className="goal-section-head">
            <div className="goal-section-title">리워드</div>
          </div>
          <div className="reward-list">
            {[
              { threshold: 1, title: '첫 스탬프 달성', desc: 'AI 니치 분석 1회 추가 잠금 해제', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg> },
              { threshold: 5, title: '5회 연속 달성', desc: '트렌드 심화 리포트 잠금 해제', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> },
              { threshold: 10, title: '10회 달성', desc: 'AI 대본 생성 무제한 1주일', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> },
            ].map(({ threshold, title, desc, icon }) => {
              const unlocked = stamps >= threshold;
              const remaining = threshold - stamps;
              return (
                <div key={threshold} className={`reward-item${unlocked ? ' unlocked' : ' locked'}`}>
                  <div className="reward-icon">{icon}</div>
                  <div className="reward-body">
                    <div className="reward-title">{title}</div>
                    <div className="reward-desc">{desc}</div>
                  </div>
                  <div className={`reward-badge${unlocked ? '' : ' locked'}`}>
                    {unlocked ? '완료' : `${remaining}개 남음`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 비교 버튼 */}
        <button className="compare-entry-btn" onClick={onCompare}>
          비슷한 크리에이터와 비교해보기
          <span className="compare-entry-arrow">→</span>
        </button>

      </div>

      {/* 업로드 기록 시트 */}
      {logOpen && <div className="log-overlay" onClick={() => setLogOpen(false)} />}
      <div className="log-sheet" style={{ transform: logOpen ? 'translateY(0)' : 'translateY(100%)' }}>
        <div className="log-sheet-handle" />
        <div className="log-sheet-title">업로드 기록하기</div>
        <div className="log-platforms">
          {(['tiktok', 'instagram', 'youtube'] as const).map(p => (
            <button key={p} className={`log-platform-btn${logPlatform === p ? ' active' : ''}`} onClick={() => setLogPlatform(p)}>
              {p === 'tiktok' ? '틱톡' : p === 'instagram' ? '인스타' : '유튜브'}
            </button>
          ))}
        </div>
        <div className="log-input-row">
          <div className="log-input-label">날짜</div>
          <input className="log-input log-date-input" type="date" value={logDate} onChange={e => setLogDate(e.target.value)} />
        </div>
        <div className="log-input-row">
          <div className="log-input-label">조회수</div>
          <input className="log-input" type="number" placeholder="12,400" inputMode="numeric" value={logViews} onChange={e => setLogViews(e.target.value)} />
        </div>
        <button className="log-submit-btn" onClick={submitLog}>기록 완료</button>
      </div>

      {/* 목표 설정 시트 */}
      {goalOpen && <div className="log-overlay" onClick={() => setGoalOpen(false)} />}
      <div className="goal-set-sheet" style={{ transform: goalOpen ? 'translateY(0)' : 'translateY(100%)' }}>
        <div className="log-sheet-handle" />
        <div className="goal-set-title">목표 설정하기</div>
        <div className="goal-set-sub">일주일에 몇 번 업로드할 건가요?</div>
        <div className="goal-freq-grid">
          {[1, 2, 3, 4, 5, 6, 7].map(n => (
            <button key={n} className={`goal-freq-btn${selectedFreq === n ? ' selected' : ''}`} onClick={() => setSelectedFreq(n)}>
              {n}<span>회/주</span>
            </button>
          ))}
          <button className={`goal-freq-btn${selectedFreq === 0 ? ' selected' : ''}`} onClick={() => setSelectedFreq(0)}>
            자유<span>직접설정</span>
          </button>
        </div>
        <button className="goal-set-save" onClick={saveGoal}>목표 저장하기</button>
      </div>
    </div>
  );
}
