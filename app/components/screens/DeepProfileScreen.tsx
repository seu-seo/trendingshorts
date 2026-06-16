'use client';

import { useEffect, useRef, useState } from 'react';
import type { PersonaResult } from '@/lib/types';

interface Message {
  role: 'bot' | 'user';
  text: string;
}

const QUESTIONS = [
  '안녕하세요! AI 니치 분석을 시작할게요. 어떤 콘텐츠를 만들고 싶으신가요?',
  '좋아요! 나만의 강점이나 잘 할 수 있는 게 있다면 알려주세요.',
  '마지막으로, 누구에게 보여주고 싶으신가요? (예: 20대 직장인, 요리 초보자 등)',
];

interface NicheCard {
  title: string;
  desc: string;
  tags: string[];
  format: string;
  platform: string;
}

function buildNiche(answers: string[], persona: PersonaResult | null): NicheCard {
  const words = answers.join(' ').split(/[\s,]+/).filter(w => w.length >= 2);
  const kw = words[0] ?? '콘텐츠';
  return {
    title: persona?.personaType ? `${persona.personaType} 크리에이터` : `${kw} 전문 크리에이터`,
    desc: persona?.personaSummary
      ? persona.personaSummary
      : `${answers[0] ?? '콘텐츠'} 분야에서 ${answers[1] ?? '나만의 강점'}으로 ${answers[2] ?? '타겟 시청자'}를 공략하는 니치입니다.`,
    tags: persona?.hookPatterns?.slice(0, 3).map(h => `#${h.type.replace(/\s+/g, '_')}`) ?? [`#${kw}`, '#숏폼', '#크리에이터'],
    format: '숏폼 (60초 이내)',
    platform: persona ? 'YouTube Shorts · Instagram Reels' : 'YouTube Shorts',
  };
}

interface DeepProfileScreenProps {
  onBack: () => void;
  onScript: () => void;
  onStoryboard: () => void;
  personaResult?: PersonaResult | null;
}

export default function DeepProfileScreen({ onBack, onScript, onStoryboard, personaResult }: DeepProfileScreenProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [step, setStep] = useState(0);
  const [input, setInput] = useState('');
  const [answers, setAnswers] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [niche, setNiche] = useState<NicheCard | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setMessages([{ role: 'bot', text: QUESTIONS[0] }]), 400);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  function send() {
    const val = input.trim();
    if (!val) return;
    const nextAnswers = [...answers, val];
    const nextMsgs: Message[] = [...messages, { role: 'user', text: val }];
    setInput('');
    setAnswers(nextAnswers);
    setMessages(nextMsgs);

    if (step + 1 < QUESTIONS.length) {
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'bot', text: QUESTIONS[step + 1] }]);
        setStep(s => s + 1);
      }, 600);
    } else {
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'bot', text: '분석 완료! 니치 카드를 만들었어요 ✦' }]);
        setNiche(buildNiche(nextAnswers, personaResult ?? null));
        setDone(true);
      }, 800);
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  }

  return (
    <div className="screen active deep-screen" id="screen-deep-profile">
      <div className="status-bar">
        <span>9:41</span>
        <span style={{ fontSize: '12px' }}>􀙇 􀛪</span>
      </div>
      <div className="deep-header">
        <button className="back-btn" onClick={onBack}>←</button>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: '600', color: 'var(--ink)', flex: 1, textAlign: 'center' }}>
          AI 니치 분석
        </span>
        <button className="skip-btn" onClick={onBack}>나중에</button>
      </div>

      {!done ? (
        <>
          <div className="deep-form-scroll chat-scroll" ref={scrollRef}>
            <div className="chat-messages">
              {messages.map((m, i) => (
                <div key={i} className={`chat-bubble ${m.role}`}>{m.text}</div>
              ))}
            </div>
          </div>
          <div className="chat-input-bar">
            <textarea
              className="chat-input"
              placeholder="여기에 입력하세요…"
              rows={1}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
            />
            <button className="chat-send-btn" onClick={send} disabled={!input.trim()}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
        </>
      ) : niche && (
        <div className="deep-form-scroll screen-content">
          <div style={{ padding: '8px 0 24px' }}>
            <div className="deep-result-label">AI 니치 분석 완료</div>
            <div className="deep-niche-card">
              <div className="deep-niche-title">{niche.title}</div>
              <div className="deep-niche-desc">{niche.desc}</div>
              <div className="deep-niche-tags">
                {niche.tags.map((t, i) => (
                  <span key={i} className="deep-niche-tag">{t}</span>
                ))}
              </div>
              <div className="deep-niche-meta">
                <div className="deep-niche-meta-item">
                  <div className="deep-niche-meta-label fmt">FORMAT</div>
                  <div className="deep-niche-meta-value">{niche.format}</div>
                </div>
                <div className="deep-niche-meta-item">
                  <div className="deep-niche-meta-label plt">PLATFORM</div>
                  <div className="deep-niche-meta-value">{niche.platform}</div>
                </div>
              </div>
            </div>
            <div className="deep-result-cta">
              <div className="deep-action-row">
                <div className="deep-action-btn deep-action-btn-script" onClick={onScript} style={{ cursor: 'pointer' }}>
                  <div className="deep-action-btn-icon">✦</div>
                  <div className="deep-action-btn-title">대본 추천 받기</div>
                  <div className="deep-action-btn-desc">훅 · 본문 · 아웃트로</div>
                </div>
                <div className="deep-action-btn deep-action-btn-storyboard" onClick={onStoryboard} style={{ cursor: 'pointer' }}>
                  <div className="deep-action-btn-icon">▤</div>
                  <div className="deep-action-btn-title">콘티 추천 받기</div>
                  <div className="deep-action-btn-desc">씬별 샷 구성 · 자막</div>
                </div>
              </div>
              <button
                className="cta"
                style={{ background: 'var(--bg-card)', color: 'var(--ink)', border: '1.5px solid var(--line)' }}
                onClick={onBack}
              >
                마이페이지로 돌아가기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
