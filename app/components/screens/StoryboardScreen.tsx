'use client';

import type { ContiCut } from '@/app/api/conti/route';

interface StoryboardScreenProps {
  conti: ContiCut[];
  onNext: () => void;
  onBack?: () => void;
  subtitle?: string;
}

export default function StoryboardScreen({ conti, onNext, onBack, subtitle }: StoryboardScreenProps) {
  const total = conti.at(-1)?.timeRange.split('~').at(-1) ?? '';

  return (
    <div className="screen active content-screen" id="screen-storyboard">
      <div className="status-bar">
        <span>9:41</span>
        <span style={{ fontSize: '12px' }}>􀙇 􀛪</span>
      </div>
      <div className="content-header">
        <button className="back-btn" onClick={onBack}>←</button>
        <div className="content-header-title">콘티 추천</div>
        <div className="content-header-tag">AI GENERATED</div>
      </div>
      <div className="content-body">
        <div className="content-niche-label" id="storyboard-niche-title">4컷 콘티</div>
        <div className="content-subtitle" id="storyboard-subtitle">{subtitle ?? '이 순서로 찍어보세요'}</div>
        <div id="scene-list">
          {conti.map((cut) => (
            <div className="scene-card" key={cut.index}>
              <div className="scene-num">{cut.index}</div>
              <div className="scene-body">
                <div className="scene-shot">{cut.shotType}</div>
                <div className="scene-desc">{cut.visualKo}</div>
                <div className="scene-caption">{cut.dialogue}</div>
                <div className="scene-duration">{cut.timeRange}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="scene-total">
          <div className="scene-total-label">총 영상 길이</div>
          <div className="scene-total-val" id="scene-total-duration">{total}</div>
        </div>
        <div className="save-content-wrap">
          <button className="save-content-btn" id="storyboard-save-btn" onClick={onNext}>이 콘티 저장하기</button>
          <button className="save-content-btn" style={{ marginTop: '8px', background: 'transparent', borderColor: 'var(--line-strong)', color: 'var(--ink-soft)' }} onClick={onNext}>마이페이지로 돌아가기</button>
        </div>
      </div>
    </div>
  );
}
