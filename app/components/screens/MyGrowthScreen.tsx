'use client';

import UploadCalendar from '@/components/UploadCalendar';

interface MyGrowthScreenProps {
  onBack: () => void;
}

export default function MyGrowthScreen({ onBack }: MyGrowthScreenProps) {
  return (
    <div className="screen active" id="screen-my-growth" style={{ flexDirection: 'column' }}>
      <div className="status-bar">
        <span>9:41</span>
        <span style={{ fontSize: '12px' }}>􀙇 􀛪</span>
      </div>
      <div className="screen-content">
        {/* 헤더 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '20px 20px 8px' }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--ink)', fontSize: '20px', cursor: 'pointer', padding: '4px 8px 4px 0', lineHeight: '1' }}>←</button>
          <div>
            <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--ink)', fontFamily: 'var(--font-body)' }}>내 채널 성장</div>
            <div style={{ fontSize: '11px', color: 'var(--gray)', fontFamily: 'var(--font-mono)', marginTop: '2px', letterSpacing: '0.04em' }}>첫 일주일 조회수 추이</div>
          </div>
          <button style={{ marginLeft: 'auto', background: 'var(--primary)', color: 'var(--on-primary)', border: 'none', borderRadius: '20px', padding: '6px 14px', fontSize: '12px', fontWeight: '700', fontFamily: 'var(--font-body)', cursor: 'pointer' }}>기록하기 +</button>
        </div>

        {/* 업로드 달력 트래커 */}
        <UploadCalendar />

        {/* 플랫폼별 개별 차트 */}
        <div className="platform-graphs" style={{ margin: '8px 16px 16px' }}>
          <div className="platform-graph-item">
            <div className="platform-graph-label">
              <span className="platform-dot insta"></span>인스타그램
              <span className="platform-graph-val" id="my-graph-val-instagram">+18%</span>
            </div>
            <svg id="my-graph-svg-instagram" className="mini-line-chart" viewBox="0 0 200 50" preserveAspectRatio="none">
              <defs><linearGradient id="grad-ig-my" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#E1306C" stopOpacity="0.3" /><stop offset="100%" stopColor="#E1306C" stopOpacity="0" /></linearGradient></defs>
              <path id="my-graph-area-instagram" className="chart-area" fill="url(#grad-ig-my)" d="M0,42 L25,44 L50,40 L75,35 L100,38 L125,30 L150,25 L175,20 L200,15 L200,50 L0,50 Z" />
              <path id="my-graph-line-instagram" className="chart-line ig" fill="none" d="M0,42 L25,44 L50,40 L75,35 L100,38 L125,30 L150,25 L175,20 L200,15" />
            </svg>
            <div id="my-graph-dates-instagram" className="graph-date-labels"></div>
          </div>

          <div className="platform-graph-item">
            <div className="platform-graph-label">
              <span className="platform-dot tiktok"></span>틱톡
              <span className="platform-graph-val" id="my-graph-val-tiktok">+24%</span>
            </div>
            <svg id="my-graph-svg-tiktok" className="mini-line-chart" viewBox="0 0 200 50" preserveAspectRatio="none">
              <defs><linearGradient id="grad-tt-my" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#69C9D0" stopOpacity="0.3" /><stop offset="100%" stopColor="#69C9D0" stopOpacity="0" /></linearGradient></defs>
              <path id="my-graph-area-tiktok" className="chart-area" fill="url(#grad-tt-my)" d="M0,45 L25,40 L50,38 L75,32 L100,28 L125,22 L150,18 L175,12 L200,8 L200,50 L0,50 Z" />
              <path id="my-graph-line-tiktok" className="chart-line tt" fill="none" d="M0,45 L25,40 L50,38 L75,32 L100,28 L125,22 L150,18 L175,12 L200,8" />
            </svg>
            <div id="my-graph-dates-tiktok" className="graph-date-labels"></div>
          </div>

          <div className="platform-graph-item">
            <div className="platform-graph-label">
              <span className="platform-dot youtube"></span>유튜브
              <span className="platform-graph-val" id="my-graph-val-youtube" style={{ color: '#FF0000' }}>+5%</span>
            </div>
            <svg id="my-graph-svg-youtube" className="mini-line-chart" viewBox="0 0 200 50" preserveAspectRatio="none">
              <defs><linearGradient id="grad-yt-my" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FF0000" stopOpacity="0.25" /><stop offset="100%" stopColor="#FF0000" stopOpacity="0" /></linearGradient></defs>
              <path id="my-graph-area-youtube" className="chart-area" fill="url(#grad-yt-my)" d="M0,40 L25,42 L50,44 L75,41 L100,38 L125,36 L150,34 L175,32 L200,30 L200,50 L0,50 Z" />
              <path id="my-graph-line-youtube" className="chart-line yt" fill="none" d="M0,40 L25,42 L50,44 L75,41 L100,38 L125,36 L150,34 L175,32 L200,30" />
            </svg>
            <div id="my-graph-dates-youtube" className="graph-date-labels"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
