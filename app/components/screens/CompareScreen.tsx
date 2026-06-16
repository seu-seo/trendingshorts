'use client';

import { useState } from 'react';

type PlatformTab = 'tt' | 'ig' | 'yt';

const CHARTS: Record<PlatformTab, {
  label: string;
  avgPath: string;
  myPath: string;
  myFill: string;
  gradColor: string;
  gradId: string;
  insight: React.ReactNode;
}> = {
  tt: {
    label: '틱톡',
    avgPath: 'M0,72 L37,68 L75,65 L112,60 L150,58 L187,55 L225,52 L262,50 L300,48',
    myPath: 'M0,78 L37,74 L75,70 L112,60 L150,52 L187,40 L225,30 L262,20 L300,12',
    myFill: 'M0,78 L37,74 L75,70 L112,60 L150,52 L187,40 L225,30 L262,20 L300,12 L300,100 L0,100 Z',
    gradColor: '#FF4274',
    gradId: 'cg-tt',
    insight: <><span className="up">평균보다 빠르게 성장 중이에요.</span> 이 페이스면 상위 20%예요.</>,
  },
  ig: {
    label: '인스타',
    avgPath: 'M0,70 L37,67 L75,64 L112,62 L150,60 L187,57 L225,54 L262,52 L300,50',
    myPath: 'M0,75 L37,78 L75,72 L112,65 L150,68 L187,55 L225,45 L262,35 L300,25',
    myFill: 'M0,75 L37,78 L75,72 L112,65 L150,68 L187,55 L225,45 L262,35 L300,25 L300,100 L0,100 Z',
    gradColor: '#FF4274',
    gradId: 'cg-ig',
    insight: <>최근 <span className="up">4주간 평균 추월</span>했어요. 릴스 업로드 빈도가 효과를 내고 있어요.</>,
  },
  yt: {
    label: '유튜브',
    avgPath: 'M0,65 L37,62 L75,58 L112,55 L150,52 L187,48 L225,44 L262,40 L300,36',
    myPath: 'M0,68 L37,70 L75,72 L112,68 L150,64 L187,61 L225,58 L262,55 L300,52',
    myFill: 'M0,68 L37,70 L75,72 L112,68 L150,64 L187,61 L225,58 L262,55 L300,52 L300,100 L0,100 Z',
    gradColor: '#38B6FF',
    gradId: 'cg-yt',
    insight: <>유튜브는 <span style={{ color: 'var(--blue)' }}>평균 수준</span>이에요. 업로드 주기를 늘리면 격차를 벌릴 수 있어요.</>,
  },
};

interface CompareScreenProps {
  onBack: () => void;
}

export default function CompareScreen({ onBack }: CompareScreenProps) {
  const [tab, setTab] = useState<PlatformTab>('tt');
  const chart = CHARTS[tab];

  return (
    <div className="screen active goal-screen" id="screen-compare">
      <div className="status-bar">
        <span>9:41</span>
        <span style={{ fontSize: '12px' }}>􀙇 􀛪</span>
      </div>
      <div className="screen-header">
        <button className="back-btn" onClick={onBack}>←</button>
        <div className="screen-title">크리에이터 비교</div>
        <div style={{ width: '32px' }} />
      </div>
      <div className="goal-body screen-content">
        <div className="compare-info">
          비슷한 팔로워 규모의 크리에이터 평균과 비교해요.
        </div>

        <div className="compare-tabs">
          {(['tt', 'ig', 'yt'] as PlatformTab[]).map(p => (
            <button key={p} className={`compare-tab${tab === p ? ' active' : ''}`} onClick={() => setTab(p)}>
              {CHARTS[p].label}
            </button>
          ))}
        </div>

        <div className="compare-graph-wrap">
          <div className="compare-legend">
            <span className="compare-legend-dot mine" /><span>나</span>
            <span className="compare-legend-dot avg" /><span>비슷한 크리에이터 평균</span>
          </div>
          <svg className="compare-chart" viewBox="0 0 300 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id={chart.gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chart.gradColor} stopOpacity="0.25" />
                <stop offset="100%" stopColor={chart.gradColor} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path className="compare-line avg" fill="none" strokeDasharray="4 3" d={chart.avgPath} />
            <path fill={`url(#${chart.gradId})`} d={chart.myFill} />
            <path className="compare-line mine" fill="none" d={chart.myPath} />
          </svg>
          <div className="compare-x-labels">
            <span>8주전</span><span>6주전</span><span>4주전</span><span>2주전</span><span>이번주</span>
          </div>
          <div className="compare-insight">{chart.insight}</div>
        </div>
      </div>
    </div>
  );
}
