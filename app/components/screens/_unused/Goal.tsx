// Preserved markup from the original demo (unused screens).
// Kept verbatim for reference; not wired into the live app.
export default function Goal() {
  return (
    <>
      <div className="screen goal-screen" id="screen-goal">
            <div className="status-bar"></div>
            <div className="screen-header">
              <button className="back-btn">←</button>
              <div className="screen-title">목표 트래커</div>
              <div style={{ width: '32px' }}></div>
            </div>
            <div className="goal-body">
      
              {/* 이번 주 목표 */}
              <div className="goal-week-card">
                <div className="goal-week-top">
                  <div className="goal-week-label">이번 주 목표</div>
                  <button className="goal-edit-btn">수정</button>
                </div>
                <div className="goal-week-main">
                  <span className="goal-week-num" id="goal-done-count">2</span>
                  <span className="goal-week-sep">/</span>
                  <span className="goal-week-total" id="goal-target-count">3</span>
                  <span className="goal-week-unit">회 업로드</span>
                </div>
                <div className="goal-week-bar-wrap">
                  <div className="goal-week-bar" id="goal-week-bar" style={{ width: '66%' }}></div>
                </div>
                <div className="goal-week-days">
                  <div className="goal-day done">월</div>
                  <div className="goal-day done">수</div>
                  <div className="goal-day">금</div>
                </div>
              </div>
      
              {/* 스탬프 카드 */}
              <div className="stamp-card">
                <div className="stamp-card-header">
                  <div className="stamp-card-title">Creator Pass</div>
                  <div className="stamp-card-serial">수진님 · #001</div>
                </div>
                <div className="stamp-grid">
                  <div className="stamp filled">1</div>
                  <div className="stamp filled">2</div>
                  <div className="stamp filled">3</div>
                  <div className="stamp filled">4</div>
                  <div className="stamp filled">5</div>
                  <div className="stamp filled">6</div>
                  <div className="stamp filled">7</div>
                  <div className="stamp" id="stamp-next">+</div>
                  <div className="stamp empty"></div>
                  <div className="stamp empty"></div>
                </div>
                <div className="stamp-card-footer">
                  <div className="stamp-bar-wrap">
                    <div className="stamp-bar" id="stamp-bar" style={{ width: '70%' }}></div>
                  </div>
                  <div className="stamp-bar-label"><span id="stamp-count">7</span> / 10</div>
                </div>
              </div>
              <div className="stamp-progress-text"></div>
      
              {/* 업로드 일지 입력 */}
              <button className="goal-log-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                업로드 기록하기
              </button>
      
              {/* 플랫폼별 조회수 그래프 */}
              <div className="goal-section">
                <div className="goal-section-head">
                  <div className="goal-section-title">내 채널 성장</div>
                  <div className="goal-section-meta">최근 8주</div>
                </div>
                <div className="platform-graphs">
      
                  <div className="platform-graph-item">
                    <div className="platform-graph-label">
                      <span className="platform-dot insta"></span>인스타그램
                      <span className="platform-graph-val" id="graph-val-instagram">+18%</span>
                    </div>
                    <svg id="graph-svg-instagram" className="mini-line-chart" viewBox="0 0 200 50" preserveAspectRatio="none">
                      <defs><linearGradient id="grad-ig" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#E1306C" stopOpacity="0.3"/><stop offset="100%" stopColor="#E1306C" stopOpacity="0"/></linearGradient></defs>
                      <path id="graph-area-instagram" className="chart-area" fill="url(#grad-ig)" d="M0,42 L25,44 L50,40 L75,35 L100,38 L125,30 L150,25 L175,20 L200,15 L200,50 L0,50 Z"/>
                      <path id="graph-line-instagram" className="chart-line ig" fill="none" d="M0,42 L25,44 L50,40 L75,35 L100,38 L125,30 L150,25 L175,20 L200,15"/>
                    </svg>
                    <div id="graph-dates-instagram" className="graph-date-labels"></div>
                  </div>
      
                  <div className="platform-graph-item">
                    <div className="platform-graph-label">
                      <span className="platform-dot tiktok"></span>틱톡
                      <span className="platform-graph-val" id="graph-val-tiktok">+24%</span>
                    </div>
                    <svg id="graph-svg-tiktok" className="mini-line-chart" viewBox="0 0 200 50" preserveAspectRatio="none">
                      <defs><linearGradient id="grad-tt" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#69C9D0" stopOpacity="0.3"/><stop offset="100%" stopColor="#69C9D0" stopOpacity="0"/></linearGradient></defs>
                      <path id="graph-area-tiktok" className="chart-area" fill="url(#grad-tt)" d="M0,45 L25,40 L50,38 L75,32 L100,28 L125,22 L150,18 L175,12 L200,8 L200,50 L0,50 Z"/>
                      <path id="graph-line-tiktok" className="chart-line tt" fill="none" d="M0,45 L25,40 L50,38 L75,32 L100,28 L125,22 L150,18 L175,12 L200,8"/>
                    </svg>
                    <div id="graph-dates-tiktok" className="graph-date-labels"></div>
                  </div>
      
                  <div className="platform-graph-item">
                    <div className="platform-graph-label">
                      <span className="platform-dot youtube"></span>유튜브
                      <span className="platform-graph-val" id="graph-val-youtube" style={{ color: '#FF0000' }}>+5%</span>
                    </div>
                    <svg id="graph-svg-youtube" className="mini-line-chart" viewBox="0 0 200 50" preserveAspectRatio="none">
                      <defs><linearGradient id="grad-yt" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FF0000" stopOpacity="0.25"/><stop offset="100%" stopColor="#FF0000" stopOpacity="0"/></linearGradient></defs>
                      <path id="graph-area-youtube" className="chart-area" fill="url(#grad-yt)" d="M0,40 L25,42 L50,44 L75,41 L100,38 L125,36 L150,34 L175,32 L200,30 L200,50 L0,50 Z"/>
                      <path id="graph-line-youtube" className="chart-line yt" fill="none" d="M0,40 L25,42 L50,44 L75,41 L100,38 L125,36 L150,34 L175,32 L200,30"/>
                    </svg>
                    <div id="graph-dates-youtube" className="graph-date-labels"></div>
                  </div>
      
                </div>
              </div>
      
              {/* 리워드 */}
              <div className="goal-section">
                <div className="goal-section-head">
                  <div className="goal-section-title">리워드</div>
                </div>
                <div className="reward-list">
                  <div className="reward-item unlocked">
                    <div className="reward-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
                    </div>
                    <div className="reward-body">
                      <div className="reward-title">첫 스탬프 달성</div>
                      <div className="reward-desc">AI 니치 분석 1회 추가 잠금 해제</div>
                    </div>
                    <div className="reward-badge">완료</div>
                  </div>
                  <div className="reward-item unlocked">
                    <div className="reward-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    </div>
                    <div className="reward-body">
                      <div className="reward-title">5회 연속 달성</div>
                      <div className="reward-desc">트렌드 심화 리포트 잠금 해제</div>
                    </div>
                    <div className="reward-badge">완료</div>
                  </div>
                  <div className="reward-item locked">
                    <div className="reward-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </div>
                    <div className="reward-body">
                      <div className="reward-title">10회 달성</div>
                      <div className="reward-desc">AI 대본 생성 무제한 1주일</div>
                    </div>
                    <div className="reward-badge locked">3개 남음</div>
                  </div>
                </div>
              </div>
      
              {/* 비교 버튼 */}
              <button className="compare-entry-btn">
                비슷한 크리에이터와 비교해보기
                <span className="compare-entry-arrow">→</span>
              </button>
      
            </div>
      
            {/* 업로드 기록 시트 */}
            <div className="log-sheet" id="log-sheet">
              <div className="log-sheet-handle"></div>
              <div className="log-sheet-title">업로드 기록하기</div>
              <div className="log-platforms">
                <button className="log-platform-btn active">틱톡</button>
                <button className="log-platform-btn">인스타</button>
                <button className="log-platform-btn">유튜브</button>
              </div>
              <div className="log-input-row">
                <div className="log-input-label">날짜</div>
                <input className="log-input log-date-input" id="log-date-input" type="date"/>
              </div>
              <div className="log-input-row">
                <div className="log-input-label">조회수</div>
                <input className="log-input" id="log-views-input" type="number" placeholder="12,400" inputMode="numeric"/>
              </div>
              <button className="log-submit-btn">기록 완료</button>
            </div>
            <div className="log-overlay" id="log-overlay"></div>
      
            {/* 목표 설정 시트 */}
            <div className="goal-set-sheet" id="goal-set-sheet">
              <div className="log-sheet-handle"></div>
              <div className="goal-set-title">목표 설정하기</div>
              <div className="goal-set-sub">일주일에 몇 번 업로드할 건가요?</div>
              <div className="goal-freq-grid">
                <button className="goal-freq-btn">1<span>회/주</span></button>
                <button className="goal-freq-btn">2<span>회/주</span></button>
                <button className="goal-freq-btn selected">3<span>회/주</span></button>
                <button className="goal-freq-btn">4<span>회/주</span></button>
                <button className="goal-freq-btn">5<span>회/주</span></button>
                <button className="goal-freq-btn">6<span>회/주</span></button>
                <button className="goal-freq-btn">7<span>회/주</span></button>
                <button className="goal-freq-btn">자유<span>직접설정</span></button>
              </div>
              <button className="goal-set-save">목표 저장하기</button>
            </div>
            <div className="log-overlay" id="goal-set-overlay"></div>
          </div>
    </>
  );
}
