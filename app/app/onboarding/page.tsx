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

// 니치 발굴용 7문답 (demo/v6 chatQuestions 참고).
const CHAT_QUESTIONS = [
  { category: '열정 · PASSION', q: '조회수 0이어도 1년 내내 만들고 싶은 게 있나요?', hint: '잘 될지 몰라도, 그냥 좋아서 하게 되는 것.', placeholder: '예: 오래된 물건 고치는 법, 새벽 혼밥 레시피…' },
  { category: '소비 · SPENDING', q: '지난 1년, 가장 많이 돈 쓴 취미는?', hint: '카드 내역에 가장 자주 뜨는 카테고리가 힌트예요.', placeholder: '예: 카페 투어, 등산 장비, 보드게임…' },
  { category: '강점 · STRENGTH', q: '주변에서 자주 묻거나 칭찬받는 게 있어요?', hint: '"너 그거 어떻게 해?" 라는 말을 듣는 것.', placeholder: '예: 여행 코스 짜기, 다이어트 식단…' },
  { category: '오디언스 · AUDIENCE', q: '내 영상을 누가 봐줬으면 좋겠어요?', hint: '팔로워 한 명의 모습을 구체적으로 떠올려보세요.', placeholder: '예: 자취 2년 차 직장인, 육아 중인 30대 엄마…' },
  { category: '주제 · TOPIC', q: '이번에 만들고 싶은 영상 주제가 있나요?', hint: '트렌드 키워드와 내 니치를 엮어도 좋아요.', placeholder: '예: 짠테크 직장인 점심 도시락 5분 컷…' },
  { category: '포맷 · FORMAT', q: '어떤 형식으로 만들 건가요?', hint: '촬영 환경과 편집 수준도 같이 적어주면 더 정확해요.', placeholder: '예: 60초 쇼츠, 집에서 혼자, 편집 초보…' },
  { category: '훅 · HOOK', q: '첫 3초를 어떻게 열고 싶어요?', hint: '훅이 조회수의 70%를 결정해요.', placeholder: "예: 공감형 '나만 이런가요?', 충격형 '이걸 몰랐다면'…" },
] as const;

interface ChatMessage {
  role: 'bot' | 'user';
  text: string;
  hint?: string;
}

// 특정 스텝의 질문을 봇 말풍선 메시지로.
function botQuestion(i: number): ChatMessage {
  const q = CHAT_QUESTIONS[i];
  return { role: 'bot', text: q.q, hint: q.hint };
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
  const scrollRef = useRef<HTMLDivElement>(null);

  const done = step >= CHAT_QUESTIONS.length;
  const currentQ = CHAT_QUESTIONS[step];

  // 메시지가 추가되면 항상 맨 아래로 스크롤
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  function startChat() {
    setScreen('chat');
    setStep(0);
    setAnswers([]);
    setMessages([
      { role: 'bot', text: '안녕하세요! 같이 콘텐츠 방향을 잡아볼게요 ✦' },
      botQuestion(0),
    ]);
  }

  function send() {
    const val = input.trim();
    if (!val || done) return;
    const nextStep = step + 1;
    const newMsgs: ChatMessage[] = [{ role: 'user', text: val }];
    if (nextStep < CHAT_QUESTIONS.length) {
      newMsgs.push(botQuestion(nextStep));
    } else {
      newMsgs.push({ role: 'bot', text: '완벽해요! 답변 잘 해주셨어요 ✦ 잠시 후 결과를 정리해드릴게요.' });
    }
    setMessages((m) => [...m, ...newMsgs]);
    setAnswers((a) => [...a, val]);
    setStep(nextStep);
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
              {m.hint && (
                <div className="mt-1.5 text-[12px] leading-[1.4]" style={{ color: DIM }}>
                  {m.hint}
                </div>
              )}
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
          placeholder={done ? '답변이 모두 끝났어요' : (currentQ?.placeholder ?? '여기에 입력하세요…')}
          rows={1}
          className="flex-1 bg-transparent outline-none resize-none text-[14px] py-2"
          style={{ color: TEXT, caretColor: ACCENT, maxHeight: 96 }}
        />
        <button
          onClick={send}
          disabled={!input.trim() || done}
          className="w-9 h-9 flex items-center justify-center rounded-full flex-shrink-0 transition-opacity"
          style={{ background: ACCENT, color: BG, opacity: input.trim() && !done ? 1 : 0.35 }}>
          ↑
        </button>
      </div>
    </div>
  );
}
