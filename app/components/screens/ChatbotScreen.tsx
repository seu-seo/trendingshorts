'use client';

import { useEffect, useRef, useState } from 'react';

interface ChatbotScreenProps {
  onComplete: (answers: string[]) => void;
}

interface ChatMessage {
  role: 'ai' | 'user';
  text: string;
}

const CB_CONVO: { q: string; hint: string }[] = [
  { q: '조회수 0이어도 1년 내내 만들고 싶은 게 있나요?', hint: '예: 요리 영상, 일상 브이로그, 게임 리뷰...' },
  { q: '지난 1년, 가장 많은 돈을 쓴 취미는?', hint: '예: 카페 투어, 헬스장, 레고, 여행...' },
  { q: '주변에서 "넌 이거 참 잘한다" 하고 칭찬받은 게 있나요?', hint: '예: 설명 잘한다, 분위기 만든다, 손재주 있다...' },
  { q: '내일 갑자기 팔로워 2만 명이 생겼다면,\n어떤 사람들이 당신 콘텐츠를 봐줬으면 해요?', hint: '예: 자취하는 20대, 운동 시작한 직장인...' },
];

const TYPE_SPEED_MS = 28;
const TYPING_DELAY_MS = 900;

export default function ChatbotScreen({ onComplete }: ChatbotScreenProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingText, setTypingText] = useState<string | null>(null); // 타자 중인 AI 텍스트
  const [showTypingDots, setShowTypingDots] = useState(false);
  const [hint, setHint] = useState('');
  const [onlineLabel, setOnlineLabel] = useState('온라인');
  const [inputValue, setInputValue] = useState('');
  const [inputEnabled, setInputEnabled] = useState(false);
  const [step, setStep] = useState(0); // 현재 질문 index
  const [busy, setBusy] = useState(true); // AI 발화 중

  const answersRef = useRef<string[]>([]);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const scrollBottom = () => {
    const b = bodyRef.current;
    if (b) setTimeout(() => { b.scrollTop = b.scrollHeight; }, 40);
  };

  // 타이핑 인디케이터 → 타자 애니메이션으로 한 문장 출력
  const sayWithTyping = (text: string, onDone?: () => void) => {
    setBusy(true);
    setInputEnabled(false);
    setShowTypingDots(true);
    scrollBottom();
    const t1 = setTimeout(() => {
      setShowTypingDots(false);
      let i = 0;
      setTypingText('');
      const tick = setInterval(() => {
        i += 1;
        setTypingText(text.slice(0, i));
        scrollBottom();
        if (i >= text.length) {
          clearInterval(tick);
          setTypingText(null);
          setMessages((prev) => [...prev, { role: 'ai', text }]);
          scrollBottom();
          onDone?.();
        }
      }, TYPE_SPEED_MS);
    }, TYPING_DELAY_MS);
    timersRef.current.push(t1);
  };

  const askStep = (idx: number) => {
    sayWithTyping(CB_CONVO[idx].q, () => {
      setHint(CB_CONVO[idx].hint);
      setInputEnabled(true);
      setBusy(false);
      inputRef.current?.focus();
    });
  };

  // 초기 첫 질문
  useEffect(() => {
    const t = setTimeout(() => askStep(0), 400);
    timersRef.current.push(t);
    const timers = timersRef.current;
    return () => { timers.forEach(clearTimeout); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSend = () => {
    if (busy) return;
    const val = inputValue.trim();
    if (!val) return;
    setMessages((prev) => [...prev, { role: 'user', text: val }]);
    answersRef.current.push(val);
    setInputValue('');
    setHint('');
    setInputEnabled(false);
    scrollBottom();
    const nextStep = step + 1;
    setStep(nextStep);
    if (nextStep < CB_CONVO.length) {
      const t = setTimeout(() => askStep(nextStep), 500);
      timersRef.current.push(t);
    } else {
      const t = setTimeout(() => {
        sayWithTyping('좋아요! 취향에 맞는 트렌드를 찾아볼게요 ✦', () => {
          setOnlineLabel('분석 중...');
          const t2 = setTimeout(() => onComplete(answersRef.current), 900);
          timersRef.current.push(t2);
        });
      }, 400);
      timersRef.current.push(t);
    }
  };

  const progDotClass = (i: number) => {
    if (i < step) return 'cb-prog-dot done';
    if (i === step) return 'cb-prog-dot active';
    return 'cb-prog-dot';
  };

  return (
    <div className="screen active chatbot-screen" id="screen-chatbot">
      <div className="status-bar"><span>9:41</span><span style={{ fontSize: '12px' }}>􀙇 􀛪</span></div>
      <div className="cb-header">
        <div className="cb-ava">
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--on-primary)" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>
        </div>
        <div className="cb-meta">
          <div className="cb-name">Pulse 큐레이터</div>
          <div className="cb-online" id="cb-online-label">{onlineLabel}</div>
        </div>
        <button className="cb-skip" onClick={() => onComplete(answersRef.current)}>건너뛰기</button>
      </div>
      <div className="cb-body" id="cb-body" ref={bodyRef}>
        {messages.map((m, i) => (
          <div key={i} className={m.role === 'ai' ? 'cb-bubble cb-bubble-ai' : 'cb-bubble cb-bubble-user'}>
            {m.text}
          </div>
        ))}
        {typingText !== null && (
          <div className="cb-bubble cb-bubble-ai">{typingText}<span className="cb-cursor"></span></div>
        )}
        {showTypingDots && (
          <div className="cb-typing-indicator"><span></span><span></span><span></span></div>
        )}
      </div>
      <div className="cb-footer">
        <div className="cb-prog" id="cb-prog">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={progDotClass(i)}></div>
          ))}
        </div>
        <div className="cb-hint" id="cb-hint">{hint}</div>
        <div className="cb-input-row">
          <input
            type="text"
            className="cb-input"
            id="cb-input"
            placeholder="답을 입력해보세요"
            autoComplete="off"
            ref={inputRef}
            value={inputValue}
            disabled={!inputEnabled}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !busy && inputValue.trim()) handleSend(); }}
          />
          <button className="cb-send" id="cb-send" onClick={handleSend} disabled={busy || inputValue.trim() === ''}>
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--on-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
