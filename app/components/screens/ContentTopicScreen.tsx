'use client';

import { useState } from 'react';
import type { Trend } from '@/lib/types';

interface ContentTopicScreenProps {
  trend: Trend;
  onNext: (topic: string) => void;
  onBack?: () => void;
  onSkip?: () => void;
}

const MAX = 150;

export default function ContentTopicScreen({ trend, onNext, onBack, onSkip }: ContentTopicScreenProps) {
  const [topic, setTopic] = useState(trend.title);
  const ready = topic.trim().length > 0;

  return (
    <div className="screen active deep-screen" id="screen-content-topic">
      <div className="status-bar">
        <span>9:41</span>
        <span style={{ fontSize: '12px' }}>􀙇 􀛪</span>
      </div>
      <div className="deep-header">
        <button className="back-btn" onClick={onBack}>←</button>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--ink-soft)', letterSpacing: '0.06em', flex: '1' }}>콘텐츠 만들기</span>
        <button className="skip-btn" onClick={onSkip}>나중에</button>
      </div>
      <div className="deep-steps">
        <div className="deep-step" id="topic-step">
          <div className="deep-category">TOPIC · 주제</div>
          <div className="deep-q">어떤 영상을<br />만들고 싶어요?</div>
          <div className="deep-hint">구체적일수록 더 딱 맞게 나와요.</div>
          <textarea
            className="deep-textarea"
            id="topic-input"
            placeholder="예: 냉장고 파먹기 30분 레시피, 공복 홈트, 성수동 카페 3곳…"
            maxLength={MAX}
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
          <div className="deep-char-hint"><span id="topic-char">{topic.length}</span> / {MAX}</div>
        </div>
      </div>
      <div className="cta-wrap">
        <button className="cta" id="topic-next-btn" disabled={!ready} onClick={() => onNext(topic.trim())}>추천 받기</button>
      </div>
    </div>
  );
}
