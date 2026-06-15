// Preserved markup from the original demo (unused screens).
// Kept verbatim for reference; not wired into the live app.
export default function DeepProfile() {
  return (
    <>
      <div className="screen deep-screen" id="screen-deep-profile">
            <div className="status-bar">
              <span>9:41</span>
              <span style={{ fontSize: '12px' }}>􀙇 􀛪</span>
            </div>
            <div className="deep-header">
              <button className="back-btn" id="deep-back-btn">←</button>
              <span id="deep-header-title" style={{ fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: '600', color: 'var(--ink)', flex: '1', textAlign: 'center' }}>콘텐츠 만들기</span>
              <button className="skip-btn" id="deep-skip-btn">나중에</button>
            </div>
      
            {/* FORM VIEW */}
            <div className="deep-form-scroll chat-scroll" id="deep-form-view">
              <div className="chat-messages" id="chat-messages"></div>
            </div>
      
            {/* RESULT VIEW */}
            <div className="deep-form-scroll" id="deep-result-view" style={{ display: 'none' }}>
              <div style={{ padding: '8px 0 24px' }}>
                <div className="deep-result-label">AI 니치 분석 완료</div>
                <div className="deep-niche-card">
                  <div className="deep-niche-title" id="deep-niche-title">분석 중…</div>
                  <div className="deep-niche-desc" id="deep-niche-desc"></div>
                  <div className="deep-niche-tags" id="deep-niche-tags"></div>
                  <div className="deep-niche-meta">
                    <div className="deep-niche-meta-item">
                      <div className="deep-niche-meta-label fmt">FORMAT</div>
                      <div className="deep-niche-meta-value" id="deep-insight-format"></div>
                    </div>
                    <div className="deep-niche-meta-item">
                      <div className="deep-niche-meta-label plt">PLATFORM</div>
                      <div className="deep-niche-meta-value" id="deep-insight-platform"></div>
                    </div>
                  </div>
                </div>
                <div className="deep-result-cta">
                  <div className="deep-action-row">
                    <div className="deep-action-btn deep-action-btn-script">
                      <div className="deep-action-btn-icon">✦</div>
                      <div className="deep-action-btn-title">대본 추천 받기</div>
                      <div className="deep-action-btn-desc">훅 · 본문 · 아웃트로</div>
                    </div>
                    <div className="deep-action-btn deep-action-btn-storyboard">
                      <div className="deep-action-btn-icon">▤</div>
                      <div className="deep-action-btn-title">콘티 추천 받기</div>
                      <div className="deep-action-btn-desc">씬별 샷 구성 · 자막</div>
                    </div>
                  </div>
                  <button className="cta" style={{ background: 'var(--bg-card)', color: 'var(--ink)', border: '1.5px solid var(--line)' }}>대시보드로 돌아가기</button>
                </div>
              </div>
            </div>
      
            <div className="chat-input-bar" id="chat-input-bar">
              <button className="chat-emoji-btn">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M8 13s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
              </button>
              <textarea className="chat-input" id="chat-input" placeholder="여기에 입력하세요…" rows={1}></textarea>
              <button className="chat-send-btn" id="chat-send-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </button>
            </div>
      
            <div className="cta-wrap" id="deep-cta-wrap" style={{ display: 'none' }}>
              <button className="cta" id="deep-cta" disabled>AI 분석 시작</button>
            </div>
          </div>
    </>
  );
}
