'use client';

interface WelcomeScreenProps {
  onStart: () => void;
}

export default function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="screen active welcome-screen" id="screen-welcome">
      <div className="status-bar">
        <span>9:41</span>
        <span style={{ fontSize: '12px' }}>􀙇 􀛪</span>
      </div>
      <div className="welcome-content">
        {/* 식별 라인 */}
        <div className="welcome-id-row">
          <div className="welcome-logo">Pulse<span className="dot">.</span></div>
          <div className="welcome-id-meta">05.26 · REPORT</div>
        </div>

        {/* 태그라인 */}
        <div className="welcome-pitch">
          <div className="welcome-pitch-en">CREATE<br />YOUR OWN<br /><span className="pitch-strike">CONTENT</span><span className="pitch-correction">STORY.</span></div>
          <div className="welcome-pitch-divider"></div>
          <div className="welcome-pitch-ko">
            내가 만들어서 특별한<br />
            <strong>1인 크리에이터를 꿈꾸는 당신에게.</strong>
          </div>
        </div>

        <div className="welcome-actions">
          <button className="welcome-start-btn" onClick={onStart}>시작하기</button>
          <button className="welcome-login-btn" onClick={onStart}>이미 계정이 있나요? 로그인</button>
        </div>
      </div>
    </div>
  );
}
