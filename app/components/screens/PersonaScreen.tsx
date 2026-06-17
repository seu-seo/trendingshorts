'use client';

import { useEffect, useState } from 'react';
import type { PersonaResult } from '@/lib/types';
import { loadUserProfile } from '@/lib/user-profile';
import CreatorTypeCard from '@/components/CreatorTypeCard';

interface PersonaScreenProps {
  personaResult: PersonaResult;
  answers?: string[];
  onNext: () => void;
  onRetryChat?: () => void;
  onLogin?: (name: string) => void;
}

const TAG_TONES = ['phero-lime', 'phero-pink', 'phero-blue'];

export default function PersonaScreen({ personaResult, answers, onNext, onRetryChat, onLogin }: PersonaScreenProps) {
  const [name, setName] = useState('');

  useEffect(() => {
    const saved = loadUserProfile();
    if (saved?.name) setName(saved.name);
  }, []);

  const chatAnswers = (answers ?? []).map((a) => a.trim()).filter(Boolean);
  const heroTags = personaResult.topTrends
    .slice(0, 3)
    .map((t) => t.keyword.replace(/^#/, ''));
  const strengths = personaResult.hookPatterns.map((h) => h.type);
  const target = personaResult.actionItems[0]?.title ?? '내 콘텐츠 시청자';
  const format = personaResult.topTrends[0]?.state === 'rising' ? '15초 · 자막 중심' : '30초 · 정보 중심';

  const trimmed = name.trim();

  return (
    <div className="screen active persona-screen" id="screen-persona">
      <div className="status-bar"><span>9:41</span><span style={{ fontSize: '12px' }}>􀙇 􀛪</span></div>
      <div className="persona-content">
        {/* 이름 입력 — 최상단 */}
        <div style={{ marginBottom: '20px', background: 'rgba(255,255,255,0.04)', border: `1px solid ${trimmed ? 'rgba(200,255,87,0.4)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '16px', padding: '14px 18px', transition: 'border-color 0.2s' }}>
          <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'rgba(200,255,87,0.7)', letterSpacing: '0.08em', marginBottom: '8px' }}>YOUR NAME</div>
          <input
            type="text"
            placeholder="닉네임을 입력해주세요"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={20}
            style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', fontSize: '15px', fontWeight: 600, color: 'var(--ink)', fontFamily: 'var(--font-body)', caretColor: 'var(--primary)' }}
          />
        </div>
        <span className="persona-eyebrow">대화 분석 완료</span>
        <div className="persona-title">이런 <em>크리에이터</em>가<br />되면 어울려요</div>
        <div className="persona-sub">방금 답해주신 내용을 바탕으로 정리했어요</div>
        <div className="persona-hero">
          <div className="persona-hero-label">CONTENT PROFILE</div>
          <div className="persona-hero-type" id="persona-hero-type">{personaResult.personaType}</div>
          <div className="persona-hero-tags" id="persona-hero-tags">
            {heroTags.map((tag, i) => (
              <span key={i} className={`persona-hero-tag ${TAG_TONES[i % TAG_TONES.length]}`}>{tag}</span>
            ))}
          </div>
        </div>
        <div className="pstat-wide">
          <div className="pstat-wide-label">콘텐츠 방향</div>
          <div className="pstat-wide-value" id="persona-direction">{personaResult.personaTagline}</div>
        </div>
        <div className="pstat-grid">
          <div className="pstat pink">
            <div className="pstat-label">추천 타깃</div>
            <div className="pstat-value" id="persona-target">{target}</div>
          </div>
          <div className="pstat blue">
            <div className="pstat-label">추천 포맷</div>
            <div className="pstat-value" id="persona-format">{format}</div>
          </div>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gray)', marginBottom: '8px' }}>당신의 강점</div>
          <div className="profile-chips" id="persona-strengths">
            {strengths.map((s, i) => (
              <span key={i} className="profile-chip">{s}</span>
            ))}
          </div>
        </div>
        {chatAnswers.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <CreatorTypeCard answers={chatAnswers} onRetry={onRetryChat} />
          </div>
        )}
        <div className="persona-chat-insight" id="persona-chat-insight">{personaResult.personaSummary}</div>
        <div className="persona-nudge">
          <div className="persona-nudge-title">자, 그럼 첫 영상 찍어볼까요?</div>
          <div className="persona-nudge-sub">당신 주제로 지금 반응 좋은 영상을 모아왔어요</div>
          <button
            className="welcome-start-btn"
            onClick={() => { onLogin?.(trimmed); onNext(); }}
            disabled={!trimmed}
            style={{ maxWidth: '100%', margin: 0, opacity: trimmed ? 1 : 0.4, cursor: trimmed ? 'pointer' : 'not-allowed' }}
          >
            트렌드 보러가기 →
          </button>
        </div>
      </div>
    </div>
  );
}
