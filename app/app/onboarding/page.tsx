'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { applyTheme, clearTheme } from '@/lib/themes/applyTheme';
import type { ThemeName } from '@/lib/themes/types';
import ThemeSwitcher from '@/components/ThemeSwitcher';

// v7 테마 토큰. 색은 globals.css의 [data-theme] 블록이 공급한다.
const ACCENT = 'var(--color-primary)';
const BG = 'var(--color-bg)';
const SURFACE = 'var(--color-surface)';
const BORDER = 'var(--color-border)';
const TEXT = 'var(--color-ink)';
const DIM = 'var(--color-ink-2)';

interface ChatMessage {
  role: 'bot' | 'user';
  text: string;
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
  const scrollRef = useRef<HTMLDivElement>(null);

  // 메시지가 추가되면 항상 맨 아래로 스크롤
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  function startChat() {
    setScreen('chat');
    setMessages([{ role: 'bot', text: '안녕하세요! 같이 콘텐츠 방향을 잡아볼게요 ✦' }]);
  }

  function send() {
    const val = input.trim();
    if (!val) return;
    // 골격 단계: 유저 말풍선 + 임시 봇 응답(에코). 7문답 흐름은 다음 커밋에서.
    setMessages((m) => [...m, { role: 'user', text: val }, { role: 'bot', text: '좋아요, 잘 들었어요!' }]);
    setInput('');
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
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
          <div key={i} className="flex animate-fade-in" style={{ justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
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
            </div>
          </div>
        ))}
      </div>

      {/* 입력 바 */}
      <div className="flex items-end gap-2 px-4 py-3 flex-shrink-0" style={{ borderTop: `1px solid ${BORDER}` }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="여기에 입력하세요…"
          rows={1}
          className="flex-1 bg-transparent outline-none resize-none text-[14px] py-2"
          style={{ color: TEXT, caretColor: ACCENT, maxHeight: 96 }}
        />
        <button
          onClick={send}
          disabled={!input.trim()}
          className="w-9 h-9 flex items-center justify-center rounded-full flex-shrink-0 transition-opacity"
          style={{ background: ACCENT, color: BG, opacity: input.trim() ? 1 : 0.35 }}>
          ↑
        </button>
      </div>
    </div>
  );
}
