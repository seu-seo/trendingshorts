// Preserved markup from the original demo (unused screens).
// Kept verbatim for reference; not wired into the live app.
export default function ContentTopic() {
  return (
    <>
      <div className="screen deep-screen" id="screen-content-topic">
            <div className="status-bar">
              <span>9:41</span>
              <span style={{ fontSize: '12px' }}>􀙇 􀛪</span>
            </div>
            <div className="deep-header">
              <button className="back-btn">←</button>
              <span id="topic-action-label" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--ink-soft)', letterSpacing: '0.06em', flex: '1' }}></span>
              <button className="skip-btn">나중에</button>
            </div>
            <div className="deep-steps">
              <div className="deep-step" id="topic-step">
                <div className="deep-category">TOPIC · 주제</div>
                <div className="deep-q">어떤 영상을<br />만들고 싶어요?</div>
                <div className="deep-hint">구체적일수록 더 딱 맞게 나와요.</div>
                <textarea className="deep-textarea" id="topic-input" placeholder="예: 냉장고 파먹기 30분 레시피, 공복 홈트, 성수동 카페 3곳…" maxLength={150}></textarea>
                <div className="deep-char-hint"><span id="topic-char">0</span> / 150</div>
              </div>
            </div>
            <div className="cta-wrap">
              <button className="cta" id="topic-next-btn" disabled>추천 받기</button>
              <div id="topic-dual-cta" style={{ display: 'none', gap: '10px' }}>
                <button className="cta" style={{ flex: '1', background: 'var(--bg-card)', color: 'var(--primary)', border: '1px solid var(--primary)' }}>대본 만들기</button>
                <button className="cta" style={{ flex: '1' }}>콘티 만들기</button>
              </div>
            </div>
          </div>
    </>
  );
}
