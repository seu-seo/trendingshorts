'use client';

import { useCallback, useEffect, useState } from 'react';
import type { PersonaResult, Trend } from '@/lib/types';
import type { ContiCut, ContiResponse } from '@/app/api/conti/route';
import type { GenerateResponse } from '@/lib/prompts/types';
import { saveItem } from '@/lib/saved-items';

interface ProductionScreenProps {
  trend: Trend;
  persona: PersonaResult;
  initialConti?: ContiResponse;
  onNext: () => void;
  onBack?: () => void;
  onScriptReady?: (script: GenerateResponse) => void;
  onContiReady?: (conti: ContiResponse) => void;
  onContiGenerated?: (conti: ContiResponse) => void;
}

type Stage = 'select' | 'loading' | 'conti' | 'script' | 'saved';

const SVG_MAP: Record<string, string> = {
  closeup: 'M12 2C9.2 2 7 4.2 7 7s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 12c-5.3 0-8 2.7-8 4v2h16v-2c0-1.3-2.7-4-8-4z',
  split: 'M3 4h18v16H3zM12 4v16',
  front: 'M3 4h18v16H3zM9 4v16',
  upper: 'M3 8h18v12H3zM12 2v6',
};

const SCRIPT_ITEMS: [string, string][] = [
  ['정보형', '"이걸 꼭 알아야 할 이유, 지금 알려드릴게요."'],
  ['스토리형', '"처음엔 저도 몰랐어요. 근데 이제는 자신 있게 만들어요."'],
  ['훅형', '"이게 된다고요? 끝까지 보면 깜짝 놀라요."'],
];

export default function ProductionScreen({ trend, persona, initialConti, onNext, onBack, onScriptReady, onContiReady, onContiGenerated }: ProductionScreenProps) {
  const [stage, setStage] = useState<Stage>(initialConti ? 'conti' : 'loading');
  const [conti, setConti] = useState<ContiResponse | null>(initialConti ?? null);
  const [script, setScript] = useState<GenerateResponse | null>(null);

  const makeConti = useCallback(async () => {
    setStage('loading');
    const hookText = `${trend.title} - 지금 바로 알려드릴게요!`;
    const bodyText = `${trend.title}의 핵심 포인트를 단계별로 설명해드릴게요. (${persona.personaType})`;
    const ctaText = `${trend.title} 지금 바로 따라해보세요!`;
    try {
      const res = await fetch('/api/conti', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script: { hook: hookText, body: bodyText, cta: ctaText },
          tone: 'hooking',
          concept: null,
        }),
      });
      const data: ContiResponse = await res.json();
      setConti(data);
      onContiGenerated?.(data);
    } catch {
      setConti(null);
    }
    setStage('conti');
  }, [trend, persona]);

  // 캐시된 콘티가 없을 때만 자동 생성
  useEffect(() => {
    if (!initialConti) void makeConti();
  }, [makeConti, initialConti]);

  const makeScript = async () => {
    setStage('loading');
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trend, persona: null }),
      });
      const data: GenerateResponse = await res.json();
      setScript(data);
    } catch {
      setScript(null);
    }
    setStage('script');
  };

  const renderContiCut = (cut: ContiCut) => (
    <div className="v7-conti-card" key={cut.index}>
      <div className="v7-conti-head">
        <span className="v7-conti-lbl">CUT {cut.index} · {cut.part}</span>
        <span className="v7-conti-time">{cut.timeRange}</span>
      </div>
      <div className="v7-conti-body">
        <div className="v7-conti-thumb">
          {cut.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cut.imageUrl} alt={cut.visualKo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={SVG_MAP[cut.sketchType] || SVG_MAP.front} /></svg>
          )}
        </div>
        <div className="v7-conti-tx">
          <div className="v7-conti-s">{cut.dialogue}</div>
          <div className="v7-conti-n">{cut.shootingMemo}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="screen active v7-screen" id="screen-v7-make">
      <div className="status-bar"><span>9:41</span><span style={{ fontSize: '12px' }}>􀙇 􀛪</span></div>
      <div className="v7-back-row"><button className="v7-back-btn" onClick={onBack}>←</button></div>
      <div className="v7-content">
        <div className="v7-topic-label">선택한 주제</div>
        <div className="v7-topic-banner">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          <span id="v7-topic-text">{trend.title}</span>
        </div>

        {stage === 'select' && (
          <div id="v7-make-select">
            <div className="v7-make-title">어떻게 만들어볼까요?</div>
            <div className="v7-make-sub">둘 다 받아볼 수도 있어요</div>
            <div className="v7-make-grid">
              <div className="v7-mc" onClick={makeScript}>
                <div className="v7-mc-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16v16H4zM8 9h8M8 13h6" /></svg></div>
                <div className="v7-mc-t">스크립트</div>
                <div className="v7-mc-d">뭐라고 말할지<br />대본 3종</div>
              </div>
              <div className="v7-mc" onClick={makeConti}>
                <div className="v7-mc-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 10h18M9 4v6" /></svg></div>
                <div className="v7-mc-t">콘티</div>
                <div className="v7-mc-d">어떻게 찍을지<br />4컷 구성</div>
              </div>
            </div>
          </div>
        )}

        {stage === 'loading' && (
          <div id="v7-make-loading"><div className="v7-make-loading"><div className="v7-spin"></div><div className="v7-loading-t">만들고 있어요...</div></div></div>
        )}

        {stage === 'conti' && (
          <div id="v7-make-result">
            <span className="v7-section-eyebrow">콘티 4컷{conti?.source === 'live' ? ' · AI 생성' : ' · 미리보기'}</span>
            <div className="v7-result-title">이 순서로 찍어보세요</div>
            {conti?.trendPoint && (
              <div style={{ fontSize: '12px', color: 'var(--gray)', marginBottom: '12px', lineHeight: 1.5 }}>{conti.trendPoint}</div>
            )}
            {(conti?.cuts ?? []).map(renderContiCut)}
            {conti && onContiReady && (
              <button className="v7-btn-ghost" onClick={() => onContiReady(conti)} style={{ marginBottom: '10px' }}>콘티 전체 보기</button>
            )}
            <button className="welcome-start-btn" onClick={() => {
              if (conti) saveItem({ type: 'conti', id: `conti_${trend.id}`, trendTitle: trend.title, trendPoint: conti.trendPoint ?? '', cutsCount: conti.cuts.length, savedAt: new Date().toISOString() });
              setStage('saved');
            }} style={{ maxWidth: '100%', margin: '6px 0 0' }}>저장하고 다음 주제 받기</button>
          </div>
        )}

        {stage === 'script' && (
          <div id="v7-make-result">
            <span className="v7-section-eyebrow">스크립트 3종</span>
            <div className="v7-result-title">마음에 드는 걸로 골라보세요</div>
            {SCRIPT_ITEMS.map(([t, s]) => (
              <div className="v7-script-card" key={t}><span className="v7-sc-tag">{t}</span><div className="v7-sc-text">{s}</div></div>
            ))}
            {script && onScriptReady && (
              <button className="v7-btn-ghost" onClick={() => onScriptReady(script)} style={{ marginBottom: '10px' }}>대본 전체 보기</button>
            )}
            <button className="v7-btn-ghost" onClick={() => setStage('select')} style={{ marginBottom: '10px' }}>콘티도 받아보기</button>
            <button className="welcome-start-btn" onClick={() => {
              saveItem({ type: 'script', id: `script_${trend.id}`, trendTitle: trend.title, items: SCRIPT_ITEMS.map(([tag, text]) => ({ tag, text })), savedAt: new Date().toISOString() });
              setStage('saved');
            }} style={{ maxWidth: '100%', margin: 0 }}>저장하고 다음 주제 받기</button>
          </div>
        )}

        {stage === 'saved' && (
          <div id="v7-make-result">
            <div className="v7-save-done">
              <div className="v7-save-done-icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--on-primary)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg></div>
              <div className="v7-save-done-title">저장했어요!</div>
              <div className="v7-save-done-sub">이제 찍어서 올려보세요.<br />다음 주제도 준비해뒀어요.</div>
              <button className="welcome-start-btn" onClick={onNext} style={{ maxWidth: '100%', margin: 0 }}>다음 트렌드 보기 →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
