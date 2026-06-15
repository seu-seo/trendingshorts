'use client';

import type { GenerateResponse } from '@/lib/prompts/types';

interface ScriptScreenProps {
  script: GenerateResponse;
  onNext: () => void;
  onBack?: () => void;
}

export default function ScriptScreen({ script, onNext, onBack }: ScriptScreenProps) {
  const tone = script.recommendedTone;
  const chosen = script.scripts[tone];
  const toneLabel: Record<string, string> = { informative: '정보형', story: '스토리형', hooking: '훅형' };

  return (
    <div className="screen active content-screen" id="screen-script">
      <div className="status-bar">
        <span>9:41</span>
        <span style={{ fontSize: '12px' }}>􀙇 􀛪</span>
      </div>
      <div className="content-header">
        <button className="back-btn" onClick={onBack}>←</button>
        <div className="content-header-title">대본 추천</div>
        <div className="content-header-tag">AI GENERATED</div>
      </div>
      <div className="content-body">
        <div className="content-niche-label" id="script-niche-title">{toneLabel[tone] ?? tone} 추천 대본</div>
        <div className="content-subtitle" id="script-subtitle">톤 적합도 {script.toneScore} / 10 · {script.meta.source === 'live' ? 'AI 생성' : '미리보기'}</div>

        <div className="script-section">
          <div className="script-section-label">
            <div className="sec-num">1</div>
            HOOK — 첫 3초
          </div>
          <div className="script-card">
            <div className="script-line" id="script-hook">{chosen.hook}</div>
            <div className="script-tip">TIP: <span>첫 문장을 질문으로 시작하면 이탈률 -30%</span></div>
          </div>
        </div>

        <div className="script-section">
          <div className="script-section-label">
            <div className="sec-num">2</div>
            BODY — 핵심 내용
          </div>
          <div className="script-card">
            <div className="script-line" id="script-body">{chosen.body}</div>
          </div>
        </div>

        <div className="script-section">
          <div className="script-section-label">
            <div className="sec-num">3</div>
            CTA — 행동 유도
          </div>
          <div className="script-card">
            <div className="script-line" id="script-cta">{chosen.cta}</div>
            <div className="script-tip">TIP: <span>저장 유도 CTA는 좋아요보다 2.4배 효과적</span></div>
          </div>
        </div>

        <div className="save-content-wrap">
          <button className="save-content-btn" id="script-save-btn" onClick={onNext}>이 대본 저장하기</button>
          <button className="save-content-btn" style={{ marginTop: '8px', background: 'transparent', borderColor: 'var(--line-strong)', color: 'var(--ink-soft)' }} onClick={onNext}>마이페이지로 돌아가기</button>
        </div>
      </div>
    </div>
  );
}
