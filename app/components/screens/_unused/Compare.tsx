// Preserved markup from the original demo (unused screens).
// Kept verbatim for reference; not wired into the live app.
export default function Compare() {
  return (
    <>
      <div className="screen goal-screen" id="screen-compare">
            <div className="status-bar"></div>
            <div className="screen-header">
              <button className="back-btn">←</button>
              <div className="screen-title">크리에이터 비교</div>
              <div style={{ width: '32px' }}></div>
            </div>
            <div className="goal-body">
      
              <div className="compare-info">
                비슷한 팔로워 규모의 크리에이터 평균과 비교해요.
              </div>
      
              {/* 플랫폼 탭 */}
              <div className="compare-tabs">
                <button className="compare-tab active">틱톡</button>
                <button className="compare-tab">인스타</button>
                <button className="compare-tab">유튜브</button>
              </div>
      
              {/* 비교 그래프 */}
              <div className="compare-graph-wrap" id="compare-graph-tt" style={{ display: 'flex' }}>
                <div className="compare-legend">
                  <span className="compare-legend-dot mine"></span><span>나</span>
                  <span className="compare-legend-dot avg"></span><span>비슷한 크리에이터 평균</span>
                </div>
                <svg className="compare-chart" viewBox="0 0 300 100" preserveAspectRatio="none">
                  {/* 평균 */}
                  <path className="compare-line avg" fill="none" strokeDasharray="4 3" d="M0,72 L37,68 L75,65 L112,60 L150,58 L187,55 L225,52 L262,50 L300,48"/>
                  {/* 나 */}
                  <defs><linearGradient id="cgrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FF4274" stopOpacity="0.25"/><stop offset="100%" stopColor="#FF4274" stopOpacity="0"/></linearGradient></defs>
                  <path fill="url(#cgrad)" d="M0,78 L37,74 L75,70 L112,60 L150,52 L187,40 L225,30 L262,20 L300,12 L300,100 L0,100 Z"/>
                  <path className="compare-line mine" fill="none" d="M0,78 L37,74 L75,70 L112,60 L150,52 L187,40 L225,30 L262,20 L300,12"/>
                </svg>
                <div className="compare-x-labels">
                  <span>8주전</span><span>6주전</span><span>4주전</span><span>2주전</span><span>이번주</span>
                </div>
                <div className="compare-insight">
                  <span className="up">평균보다 빠르게 성장 중이에요.</span> 이 페이스면 상위 20%예요.
                </div>
              </div>
      
              <div className="compare-graph-wrap" id="compare-graph-ig" style={{ display: 'none' }}>
                <div className="compare-legend">
                  <span className="compare-legend-dot mine"></span><span>나</span>
                  <span className="compare-legend-dot avg"></span><span>비슷한 크리에이터 평균</span>
                </div>
                <svg className="compare-chart" viewBox="0 0 300 100" preserveAspectRatio="none">
                  <path className="compare-line avg" fill="none" strokeDasharray="4 3" d="M0,70 L37,67 L75,64 L112,62 L150,60 L187,57 L225,54 L262,52 L300,50"/>
                  <defs><linearGradient id="cgrad2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FF4274" stopOpacity="0.25"/><stop offset="100%" stopColor="#FF4274" stopOpacity="0"/></linearGradient></defs>
                  <path fill="url(#cgrad2)" d="M0,75 L37,78 L75,72 L112,65 L150,68 L187,55 L225,45 L262,35 L300,25 L300,100 L0,100 Z"/>
                  <path className="compare-line mine" fill="none" d="M0,75 L37,78 L75,72 L112,65 L150,68 L187,55 L225,45 L262,35 L300,25"/>
                </svg>
                <div className="compare-x-labels">
                  <span>8주전</span><span>6주전</span><span>4주전</span><span>2주전</span><span>이번주</span>
                </div>
                <div className="compare-insight">
                  최근 <span className="up">4주간 평균 추월</span>했어요. 릴스 업로드 빈도가 효과를 내고 있어요.
                </div>
              </div>
      
              <div className="compare-graph-wrap" id="compare-graph-yt" style={{ display: 'none' }}>
                <div className="compare-legend">
                  <span className="compare-legend-dot mine"></span><span>나</span>
                  <span className="compare-legend-dot avg"></span><span>비슷한 크리에이터 평균</span>
                </div>
                <svg className="compare-chart" viewBox="0 0 300 100" preserveAspectRatio="none">
                  <path className="compare-line avg" fill="none" strokeDasharray="4 3" d="M0,65 L37,62 L75,58 L112,55 L150,52 L187,48 L225,44 L262,40 L300,36"/>
                  <defs><linearGradient id="cgrad3" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#38B6FF" stopOpacity="0.25"/><stop offset="100%" stopColor="#38B6FF" stopOpacity="0"/></linearGradient></defs>
                  <path fill="url(#cgrad3)" d="M0,68 L37,70 L75,72 L112,68 L150,64 L187,61 L225,58 L262,55 L300,52 L300,100 L0,100 Z"/>
                  <path className="compare-line yt" fill="none" d="M0,68 L37,70 L75,72 L112,68 L150,64 L187,61 L225,58 L262,55 L300,52"/>
                </svg>
                <div className="compare-x-labels">
                  <span>8주전</span><span>6주전</span><span>4주전</span><span>2주전</span><span>이번주</span>
                </div>
                <div className="compare-insight">
                  유튜브는 <span style={{ color: 'var(--blue)' }}>평균 수준</span>이에요. 업로드 주기를 늘리면 격차를 벌릴 수 있어요.
                </div>
              </div>
      
            </div>
          </div>
    </>
  );
}
