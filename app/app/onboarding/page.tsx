'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { applyTheme, clearTheme } from '@/lib/themes/applyTheme';
import type { ThemeName } from '@/lib/themes/types';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import chatConfig from '@/lib/onboarding/chat-questions.json';

// v7 테마 토큰. 색은 globals.css의 [data-theme] 블록이 공급한다.
const ACCENT = 'var(--color-primary)';
const BG = 'var(--color-bg)';
const SURFACE = 'var(--color-surface)';
const BORDER = 'var(--color-border)';
const TEXT = 'var(--color-ink)';
const DIM = 'var(--color-ink-2)';

// 니치 발굴용 7문답 + 인사말/완료멘트 (feature/pulse-chatbot 의 데이터에서 흡수).
const CHAT_QUESTIONS = chatConfig.questions;
const INTRO_TEXT = chatConfig.messages.intro;
const COMPLETE_TEXT = chatConfig.messages.complete;
const INPUT_PLACEHOLDER = chatConfig.inputPlaceholder;

interface ChatMessage {
  role: 'bot' | 'user';
  text: string;
  hint?: string;
  badge?: { n: number; total: number; category: string };
}

// 특정 스텝의 질문을 봇 말풍선 메시지로 (단계뱃지 포함).
function botQuestion(i: number): ChatMessage {
  const q = CHAT_QUESTIONS[i];
  return {
    role: 'bot',
    text: q.q,
    hint: q.hint,
    badge: { n: i + 1, total: CHAT_QUESTIONS.length, category: q.category },
  };
}

export default function OnboardingPage() {
  const router = useRouter();
  const completeOnboarding = useStore((s) => s.completeOnboarding);

  // v7 PoC: A(인디고)/C(퍼플) 테마 전환. 이탈 시 해제.
  const [theme, setTheme] = useState<ThemeName>('indigo');
  useEffect(() => {
    applyTheme(theme);
    return () => clearTheme();
  }, [theme]);

  const [screen, setScreen] = useState<'welcome' | 'chat'>('welcome');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const done = step >= CHAT_QUESTIONS.length;
  const currentQ = CHAT_QUESTIONS[step];

  // 메시지/타이핑 상태가 바뀌면 항상 맨 아래로 스크롤
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  // 타이핑 인디케이터를 잠깐 보여준 뒤 봇 메시지를 추가 (v6 mock 연출).
  function botSay(msg: ChatMessage, delay = 700, after?: () => void) {
    setTyping(true);
    setTimeout(() => {
      setMessages((m) => [...m, msg]);
      setTyping(false);
      after?.();
    }, delay);
  }

  function startChat() {
    setScreen('chat');
    setStep(0);
    setAnswers([]);
    setMessages([]);
    botSay({ role: 'bot', text: INTRO_TEXT }, 600, () => {
      botSay(botQuestion(0), 700);
    });
  }

  function send() {
    const val = input.trim();
    if (!val || done || typing) return;
    const nextStep = step + 1;
    setMessages((m) => [...m, { role: 'user', text: val }]);
    setAnswers((a) => [...a, val]);
    setStep(nextStep);
    setInput('');
    if (nextStep < CHAT_QUESTIONS.length) {
      botSay(botQuestion(nextStep));
    } else {
      // 마지막 답변까지 받음 → 결과 정리 후 저장/이동
      const allAnswers = [...answers, val];
      botSay({ role: 'bot', text: `${COMPLETE_TEXT} 분석 결과를 정리하고 있어요…` }, 700, () => {
        setTimeout(() => finish(allAnswers), 1000);
      });
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  // mock 니치 분류: 답변 키워드로 카테고리 추론 (demo/v6 buildDeepResult 참고).
  function deriveCategory(all: string[]): string {
    const text = all.join(' ').toLowerCase();
    const groups: { cat: string; kws: string[] }[] = [
      { cat: 'food', kws: ['요리', '음식', '레시피', '먹', '카페', '밥', '식당', '쿠킹', '베이킹'] },
      { cat: 'fitness', kws: ['운동', '헬스', '다이어트', '요가', '필라', '러닝', '등산', '홈트'] },
      { cat: 'beauty', kws: ['뷰티', '화장', '메이크업', '패션', '스킨', '코스메'] },
      { cat: 'gaming', kws: ['게임', '롤', '배그', '스팀', '콘솔', '플스'] },
      { cat: 'art', kws: ['음악', '예술', '그림', '드로잉', '악기', '노래', '댄스', '춤'] },
      { cat: 'edu', kws: ['정보', '꿀팁', '공부', '자기계발', '책', '독서', '생산성', '재테크', '짠테크', '코딩', '개발', 'ai'] },
    ];
    let best = 'lifestyle';
    let bestScore = 0;
    for (const g of groups) {
      const score = g.kws.filter((k) => text.includes(k.toLowerCase())).length;
      if (score > bestScore) {
        bestScore = score;
        best = g.cat;
      }
    }
    return best;
  }

  // 대화 결과를 store에 저장하고 대시보드로 이동.
  function finish(all: string[]) {
    const category = deriveCategory(all);
    completeOnboarding(['youtube', 'tiktok', 'instagram'], category, '20s', null);
    router.replace('/');
  }

  function skip() {
    completeOnboarding(['youtube', 'tiktok', 'instagram'], 'lifestyle', '20s', null);
    router.replace('/');
  }

  // ── Welcome ──────────────────────────────────────────────────
  if (screen === 'welcome') return (
    <div className="flex flex-col justify-between px-6 pt-14 pb-10" style={{ background: BG, minHeight: '100%' }}>
      <ThemeSwitcher value={theme} onChange={setTheme} options={['indigo', 'purple']} />
      <div>
        <div className="font-mono text-[10px] tracking-[0.28em] uppercase mb-14" style={{ color: ACCENT }}>
          SHORTFORM PULSE
        </div>
        <div className="leading-[0.86] tracking-tight"
          style={{ fontFamily: "'Cafe24 Dangdanghae', Impact, sans-serif", fontSize: '72px', color: TEXT }}>
          CREATE<br />YOUR<br /><span style={{ color: ACCENT }}>STORY.</span>
        </div>
        <p className="mt-6 text-[14px] leading-[1.65]" style={{ color: DIM }}>
          내가 만들어서 특별한<br />1인 크리에이터를 꿈꾸는 당신에게.
        </p>
      </div>
      <div className="flex flex-col gap-3 mt-14">
        <button
          onClick={startChat}
          className="w-full py-[18px] rounded-2xl text-[15px] font-semibold tracking-wide"
          style={{ background: ACCENT, color: BG }}>
          시작하기
        </button>
        <button
          onClick={skip}
          className="w-full py-3 font-mono text-[11px] tracking-widest"
          style={{ color: DIM }}>
          건너뛰기
        </button>
      </div>
    </div>
  );

  // ── Chat ─────────────────────────────────────────────────────
  return (
    <div className="flex flex-col" style={{ background: BG, height: '100%' }}>
      <ThemeSwitcher value={theme} onChange={setTheme} options={['indigo', 'purple']} />

      {/* 헤더 */}
      <div className="flex items-center justify-between px-5 py-3.5 flex-shrink-0">
        <button onClick={() => setScreen('welcome')}
          className="w-9 h-9 flex items-center justify-center rounded-xl text-[20px]"
          style={{ color: TEXT }}>
          ←
        </button>
        <span className="text-[14px] font-semibold" style={{ color: TEXT }}>콘텐츠 방향 잡기</span>
        <button onClick={skip} className="font-mono text-[12px] tracking-wider" style={{ color: DIM }}>
          건너뛰기
        </button>
      </div>

      {/* 메시지 영역 */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3" style={{ scrollbarWidth: 'none' }}>
        {messages.map((m, i) => (
          <div key={i} className="flex flex-col animate-fade-in" style={{ alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            {m.badge && (
              <div className="flex items-center gap-2 mb-1 px-1">
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded"
                  style={{ background: 'var(--color-primary-soft)', color: ACCENT }}>
                  {m.badge.n} / {m.badge.total}
                </span>
                <span className="font-mono text-[9px] tracking-[0.12em] uppercase" style={{ color: DIM }}>
                  {m.badge.category}
                </span>
              </div>
            )}
            <div
              className="max-w-[78%] px-4 py-2.5 text-[14px] leading-[1.5]"
              style={{
                borderRadius: 'var(--radius, 16px)',
                background: m.role === 'user' ? ACCENT : SURFACE,
                color: m.role === 'user' ? BG : TEXT,
                border: m.role === 'user' ? 'none' : `1px solid ${BORDER}`,
                whiteSpace: 'pre-wrap',
              }}>
              {m.text}
              {m.hint && (
                <div className="mt-1.5 text-[12px] leading-[1.4]" style={{ color: DIM }}>
                  {m.hint}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* 타이핑 인디케이터 */}
        {typing && (
          <div className="flex" style={{ justifyContent: 'flex-start' }}>
            <div className="px-4 py-3 flex items-center gap-1"
              style={{ borderRadius: 'var(--radius, 16px)', background: SURFACE, border: `1px solid ${BORDER}` }}>
              {[0, 1, 2].map((d) => (
                <span key={d}
                  style={{ width: 6, height: 6, borderRadius: '50%', background: DIM, animation: 'pulse 1s ease-in-out infinite', animationDelay: `${d * 0.18}s` }} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 입력 바 */}
      <div className="flex items-end gap-2 px-4 py-3 flex-shrink-0" style={{ borderTop: `1px solid ${BORDER}` }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={done ? '답변이 모두 끝났어요' : (currentQ?.placeholder ?? INPUT_PLACEHOLDER)}
          rows={1}
          className="flex-1 bg-transparent outline-none resize-none text-[14px] py-2"
          style={{ color: TEXT, caretColor: ACCENT, maxHeight: 96 }}
        />
        <button
          onClick={send}
          disabled={!input.trim() || done || typing}
          className="w-9 h-9 flex items-center justify-center rounded-full flex-shrink-0 transition-opacity"
          style={{ background: ACCENT, color: BG, opacity: input.trim() && !done && !typing ? 1 : 0.35 }}>
          ↑
        </button>
      </div>
    </div>
  );
}
