// Preserved markup from the original demo (unused screens).
// Kept verbatim for reference; not wired into the live app.
export default function MyGrowth() {
  return (
    <>
      <div className="screen" id="screen-my-growth" style={{ flexDirection: 'column' }}>
            <div className="screen-content">
              {/* 헤더 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '20px 20px 8px' }}>
                <button style={{ background: 'none', border: 'none', color: 'var(--ink)', fontSize: '20px', cursor: 'pointer', padding: '4px 8px 4px 0', lineHeight: '1' }}>←</button>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--ink)', fontFamily: 'var(--font-body)' }}>내 채널 성장</div>
                  <div style={{ fontSize: '11px', color: 'var(--gray)', fontFamily: 'var(--font-mono)', marginTop: '2px', letterSpacing: '0.04em' }}>첫 일주일 조회수 추이</div>
                </div>
                <button style={{ marginLeft: 'auto', background: 'var(--primary)', color: 'var(--on-primary)', border: 'none', borderRadius: '20px', padding: '6px 14px', fontSize: '12px', fontWeight: '700', fontFamily: 'var(--font-body)', cursor: 'pointer' }}>기록하기 +</button>
              </div>
      
              {/* 업로드 달력 트래커 */}
              <div style={{ margin: '4px 16px 16px', background: 'var(--bg-card)', borderRadius: '16px', padding: '16px', border: '1px solid var(--line)' }}>
                <div className="cal-header">
                  <button className="cal-nav-btn">‹</button>
                  <div id="cal-month-label" className="cal-month-label">2025년 6월</div>
                  <button className="cal-nav-btn">›</button>
                </div>
                <div className="cal-plat-row">
                  <button className="cal-plat-btn active-tt" id="cal-btn-tiktok">틱톡</button>
                  <button className="cal-plat-btn" id="cal-btn-instagram">인스타</button>
                  <button className="cal-plat-btn" id="cal-btn-youtube">유튜브</button>
                </div>
                <div className="cal-day-headers">
                  <div className="cal-day-hdr" style={{ color: '#FF6B6B' }}>일</div>
                  <div className="cal-day-hdr">월</div>
                  <div className="cal-day-hdr">화</div>
                  <div className="cal-day-hdr">수</div>
                  <div className="cal-day-hdr">목</div>
                  <div className="cal-day-hdr">금</div>
                  <div className="cal-day-hdr" style={{ color: '#6BA3FF' }}>토</div>
                </div>
                <div id="cal-grid" className="cal-grid"></div>
                <div id="cal-legend" style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}></div>
              </div>
      
              {/* 플랫폼별 개별 차트 */}
              <div className="platform-graphs" style={{ margin: '8px 16px 16px' }}>
      
                <div className="platform-graph-item">
                  <div className="platform-graph-label">
                    <span className="platform-dot insta"></span>인스타그램
                    <span className="platform-graph-val" id="my-graph-val-instagram">+18%</span>
                  </div>
                  <svg id="my-graph-svg-instagram" className="mini-line-chart" viewBox="0 0 200 50" preserveAspectRatio="none">
                    <defs><linearGradient id="grad-ig-my" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#E1306C" stopOpacity="0.3"/><stop offset="100%" stopColor="#E1306C" stopOpacity="0"/></linearGradient></defs>
                    <path id="my-graph-area-instagram" className="chart-area" fill="url(#grad-ig-my)" d="M0,42 L25,44 L50,40 L75,35 L100,38 L125,30 L150,25 L175,20 L200,15 L200,50 L0,50 Z"/>
                    <path id="my-graph-line-instagram" className="chart-line ig" fill="none" d="M0,42 L25,44 L50,40 L75,35 L100,38 L125,30 L150,25 L175,20 L200,15"/>
                  </svg>
                  <div id="my-graph-dates-instagram" className="graph-date-labels"></div>
                </div>
      
                <div className="platform-graph-item">
                  <div className="platform-graph-label">
                    <span className="platform-dot tiktok"></span>틱톡
                    <span className="platform-graph-val" id="my-graph-val-tiktok">+24%</span>
                  </div>
                  <svg id="my-graph-svg-tiktok" className="mini-line-chart" viewBox="0 0 200 50" preserveAspectRatio="none">
                    <defs><linearGradient id="grad-tt-my" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#69C9D0" stopOpacity="0.3"/><stop offset="100%" stopColor="#69C9D0" stopOpacity="0"/></linearGradient></defs>
                    <path id="my-graph-area-tiktok" className="chart-area" fill="url(#grad-tt-my)" d="M0,45 L25,40 L50,38 L75,32 L100,28 L125,22 L150,18 L175,12 L200,8 L200,50 L0,50 Z"/>
                    <path id="my-graph-line-tiktok" className="chart-line tt" fill="none" d="M0,45 L25,40 L50,38 L75,32 L100,28 L125,22 L150,18 L175,12 L200,8"/>
                  </svg>
                  <div id="my-graph-dates-tiktok" className="graph-date-labels"></div>
                </div>
      
                <div className="platform-graph-item">
                  <div className="platform-graph-label">
                    <span className="platform-dot youtube"></span>유튜브
                    <span className="platform-graph-val" id="my-graph-val-youtube" style={{ color: '#FF0000' }}>+5%</span>
                  </div>
                  <svg id="my-graph-svg-youtube" className="mini-line-chart" viewBox="0 0 200 50" preserveAspectRatio="none">
                    <defs><linearGradient id="grad-yt-my" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FF0000" stopOpacity="0.25"/><stop offset="100%" stopColor="#FF0000" stopOpacity="0"/></linearGradient></defs>
                    <path id="my-graph-area-youtube" className="chart-area" fill="url(#grad-yt-my)" d="M0,40 L25,42 L50,44 L75,41 L100,38 L125,36 L150,34 L175,32 L200,30 L200,50 L0,50 Z"/>
                    <path id="my-graph-line-youtube" className="chart-line yt" fill="none" d="M0,40 L25,42 L50,44 L75,41 L100,38 L125,36 L150,34 L175,32 L200,30"/>
                  </svg>
                  <div id="my-graph-dates-youtube" className="graph-date-labels"></div>
                </div>
      
              </div>
            </div>
      
            {/* 조회수 기록 시트 */}
            <div className="log-sheet" id="log-sheet-my">
              <div className="log-sheet-handle"></div>
              <div className="log-sheet-header">
                <div className="log-sheet-title" style={{ marginBottom: '0' }}>조회수 기록하기</div>
                <button className="log-sheet-close">✕</button>
              </div>
              <div className="log-platforms" id="my-log-platforms">
                <button className="log-platform-btn active">틱톡</button>
                <button className="log-platform-btn">인스타</button>
                <button className="log-platform-btn">유튜브</button>
              </div>
              <div className="log-input-row">
                <div className="log-input-label">날짜</div>
                <input className="log-input log-date-input" id="my-log-date-input" type="date"/>
              </div>
              <div className="log-input-row">
                <div className="log-input-label">조회수</div>
                <input className="log-input" id="my-log-views-input" type="number" placeholder="12,400" inputMode="numeric"/>
              </div>
              <button className="log-submit-btn">기록 완료</button>
            </div>
            <div className="log-overlay" id="log-overlay-my"></div>
          </div>
    </>
  );
}
