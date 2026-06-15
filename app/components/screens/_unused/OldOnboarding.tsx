// Preserved markup from the original demo (unused screens).
// Kept verbatim for reference; not wired into the live app.
export default function OldOnboarding() {
  return (
    <>
      <div className="screen q-screen q-all-screen" id="screen-q-all">
            <div className="status-bar">
              <span>9:41</span>
              <span style={{ fontSize: '12px' }}>􀙇 􀛪</span>
            </div>
            <div className="q-header">
              <button className="back-btn">←</button>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: '600', color: 'var(--ink)', flex: '1', textAlign: 'center' }}>취향 설정</span>
              <button className="skip-btn">건너뛰기</button>
            </div>
            <div className="q-all-scroll">
      
              {/* Q1: 플랫폼 */}
              <div className="q-all-section">
                <div className="q-all-section-label">플랫폼</div>
                <div className="q-all-section-title">어떤 플랫폼 자주 봐요?</div>
                <div className="simple-chips" id="platform-chips">
                  <div className="chip" data-val="tiktok">틱톡</div>
                  <div className="chip" data-val="instagram">인스타그램</div>
                  <div className="chip" data-val="youtube">유튜브</div>
                </div>
              </div>
      
              <div className="q-all-divider"></div>
      
              {/* Q2: 카테고리 */}
              <div className="q-all-section">
                <div className="q-all-section-label">카테고리</div>
                <div className="q-all-section-title">어떤 분야가 궁금해요?</div>
                <div className="simple-chips" id="cat-chips">
                  <div className="chip chip-sm cat-chip" data-cat="food">먹방</div>
                  <div className="chip chip-sm cat-chip" data-cat="beauty">뷰티</div>
                  <div className="chip chip-sm cat-chip" data-cat="fitness">운동</div>
                  <div className="chip chip-sm cat-chip" data-cat="travel">여행</div>
                  <div className="chip chip-sm cat-chip" data-cat="game">게임</div>
                  <div className="chip chip-sm cat-chip" data-cat="fashion">패션</div>
                </div>
                <div className="cat-or-divider">또는</div>
                <input
                  id="cat-custom-input"
                  className="cat-custom-input"
                  type="text"
                  placeholder="직접 입력 (예: 반려동물, 댄스...)"
                />
              </div>
      
              <div className="q-all-divider"></div>
      
              {/* Q3: 연령대 */}
              <div className="q-all-section">
                <div className="q-all-section-label">시청자 연령</div>
                <div className="q-all-section-title">타깃 연령대가 어떻게 돼요?</div>
                <div className="age-segment" id="age-segment-all">
                  <div className="age-segment-slider" id="age-slider-all"></div>
                  <div className="age-seg-opt" data-val="10s">10대</div>
                  <div className="age-seg-opt" data-val="20s">20대</div>
                  <div className="age-seg-opt" data-val="30s">30대</div>
                  <div className="age-seg-opt" data-val="40s">40대</div>
                  <div className="age-seg-opt" data-val="50s">50+</div>
                </div>
              </div>
      
              <div style={{ height: '24px' }}></div>
            </div>
            <div className="cta-wrap">
              <button className="cta" id="cta-all" disabled>트렌드 보러가기</button>
            </div>
          </div>
      <div className="screen q-screen" id="screen-q1">
            <div className="status-bar">
              <span>9:41</span>
              <span style={{ fontSize: '12px' }}>􀙇 􀛪</span>
            </div>
            <div className="q-header">
              <button className="back-btn">←</button>
              <div className="progress-track"><div className="progress-fill" style={{ width: '33%' }}></div></div>
              <div className="step-text">1<span className="total">/3</span></div>
              <button className="skip-btn">건너뛰기</button>
            </div>
            <div className="screen-content">
              <div className="q-prompt">
                <div className="q-step-label">첫 번째 질문이에요</div>
                <div className="q-title">어떤 플랫폼<br/>자주 보세요?</div>
              </div>
              <div className="toss-list">
                <div className="toss-item" data-val="tiktok">
                  <div className="toss-item-left">
                    <div className="toss-item-title">틱톡</div>
                    <div className="toss-item-meta">
                      <span>TikTok</span>
                    </div>
                  </div>
                  <div className="toss-radio"><div className="toss-radio-inner"></div></div>
                </div>
                <div className="toss-divider"></div>
      
                <div className="toss-item" data-val="instagram">
                  <div className="toss-item-left">
                    <div className="toss-item-title">인스타그램</div>
                    <div className="toss-item-meta">
                      <span>Instagram</span>
                      <span className="bullet"></span>
                      <span>릴스 · 스토리</span>
                    </div>
                  </div>
                  <div className="toss-radio"><div className="toss-radio-inner"></div></div>
                </div>
                <div className="toss-divider"></div>
      
                <div className="toss-item" data-val="youtube">
                  <div className="toss-item-left">
                    <div className="toss-item-title">유튜브</div>
                    <div className="toss-item-meta">
                      <span>YouTube</span>
                      <span className="bullet"></span>
                      <span>쇼츠 · 일반 영상</span>
                    </div>
                  </div>
                  <div className="toss-radio"><div className="toss-radio-inner"></div></div>
                </div>
                <div className="toss-divider"></div>
      
                <div className="toss-item" data-val="all">
                  <div className="toss-item-left">
                    <div className="toss-item-title">모두 다 봐요</div>
                    <div className="toss-item-meta">
                      <span>All</span>
                      <span className="bullet"></span>
                      <span className="accent">⭐ 추천</span>
                    </div>
                  </div>
                  <div className="toss-radio"><div className="toss-radio-inner"></div></div>
                </div>
              </div>
            </div>
            <div className="cta-wrap">
              <button className="cta" id="cta-q1" disabled>다음</button>
            </div>
          </div>
      <div className="screen q-screen" id="screen-q2">
            <div className="status-bar">
              <span>9:41</span>
              <span style={{ fontSize: '12px' }}>􀙇 􀛪</span>
            </div>
            <div className="q-header">
              <button className="back-btn">←</button>
              <div className="progress-track"><div className="progress-fill" style={{ width: '66%' }}></div></div>
              <div className="step-text">2<span className="total">/3</span></div>
              <button className="skip-btn">건너뛰기</button>
            </div>
            <div className="screen-content">
              <div className="q-prompt">
                <div className="q-step-label">두 번째 질문이에요</div>
                <div className="q-title">어떤 분야가<br/>궁금해요?</div>
                <div className="q-helper">관심 있는 분야를 자유롭게 적어주세요</div>
              </div>
              <div className="category-input-wrap">
                <textarea
                  id="category-input"
                  className="category-textarea"
                  placeholder="예: 먹방, 여행, 뷰티, 게임..."
                  rows={4}
                ></textarea>
              </div>
              <div style={{ height: '24px' }}></div>
            </div>
            <div className="cta-wrap">
              <button className="cta" id="cta-q2" disabled>다음</button>
            </div>
          </div>
      <div className="screen age-screen" id="screen-q3">
            <div className="status-bar">
              <span>9:41</span>
              <span style={{ fontSize: '12px' }}>􀙇 􀛪</span>
            </div>
            <div className="q-header">
              <button className="back-btn">←</button>
              <div className="progress-track"><div className="progress-fill" style={{ width: '100%' }}></div></div>
              <div className="step-text">3<span className="total">/3</span></div>
              <button className="skip-btn">건너뛰기</button>
            </div>
            <div className="q-prompt">
              <div className="q-step-label">마지막 질문이에요</div>
              <div className="q-title">시청자가<br/>몇 살이에요?</div>
            </div>
            <div className="age-display">
              <div className="age-big-number" id="age-big">—</div>
              <div className="age-helper-text" id="age-helper">연령대를 골라주세요</div>
            </div>
            <div className="age-options-wrap">
              <div className="age-segment" id="age-segment">
                <div className="age-segment-slider" id="age-slider"></div>
                <div className="age-seg-opt" data-val="10s" data-num="10" data-text="10대를 주로 봐요">10대</div>
                <div className="age-seg-opt" data-val="20s" data-num="20" data-text="20대를 주로 봐요">20대</div>
                <div className="age-seg-opt" data-val="30s" data-num="30" data-text="30대를 주로 봐요">30대</div>
                <div className="age-seg-opt" data-val="40s" data-num="40" data-text="40대를 주로 봐요">40대</div>
                <div className="age-seg-opt" data-val="50s" data-num="50" data-text="50대 이상이에요">50+</div>
              </div>
            </div>
            <div className="cta-wrap">
              <button className="cta" id="cta-q3" disabled>트렌드 보러가기</button>
            </div>
          </div>
    </>
  );
}
