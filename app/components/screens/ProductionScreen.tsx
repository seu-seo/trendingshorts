'use client';

import { useState } from 'react';
import type { Category, OnboardingPrefs, PersonaResult, RecommendConcept, Trend } from '@/lib/types';
import type { ContiCut, ContiResponse } from '@/app/api/conti/route';
import type { GenerateResponse, ScriptOutput, ScriptTone } from '@/lib/prompts/types';
import { saveItem } from '@/lib/saved-items';

interface ProductionScreenProps {
  trend: Trend;
  persona: PersonaResult;
  prefs?: OnboardingPrefs | null;
  initialConti?: ContiResponse;
  onNext: () => void;
  onBack?: () => void;
  onScriptReady?: (script: GenerateResponse) => void;
  onContiReady?: (conti: ContiResponse) => void;
  onContiGenerated?: (conti: ContiResponse) => void;
}

type Stage = 'intent' | 'loading' | 'conti' | 'script' | 'saved';

const SVG_MAP: Record<string, string> = {
  closeup: 'M12 2C9.2 2 7 4.2 7 7s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 12c-5.3 0-8 2.7-8 4v2h16v-2c0-1.3-2.7-4-8-4z',
  split: 'M3 4h18v16H3zM12 4v16',
  front: 'M3 4h18v16H3zM9 4v16',
  upper: 'M3 8h18v12H3zM12 2v6',
};

const CLIENT_FALLBACK_CONTI: ContiResponse = {
  source: 'mock',
  trendPoint: '고민→해결 구조로 트렌드 흐름을 활용합니다.',
  character: '',
  subject: '',
  cuts: [
    { index: 1, part: '훅', timeRange: '0~3s', shotType: '인물 클로즈업', sketchType: 'closeup', visualKo: '크리에이터 표정 클로즈업', visualEn: '', dialogue: '이거 모르면 손해예요!', shootingMemo: '인물 표정 클로즈업 — 첫 컷에서 시선 고정', imageUrl: '' },
    { index: 2, part: '전환', timeRange: '3~6s', shotType: '제품 클로즈업', sketchType: 'split', visualKo: '제품 클로즈업 (인물 X)', visualEn: '', dialogue: '바로 이게 핵심이에요.', shootingMemo: '제품을 화면 가득 클로즈업 — 인물보다 제품', imageUrl: '' },
    { index: 3, part: '본론', timeRange: '6~12s', shotType: '제품 시연', sketchType: 'split', visualKo: '제품 시연/디테일', visualEn: '', dialogue: '이렇게만 하면 돼요.', shootingMemo: '제품 사용/시연 장면 — 제품에 맞는 손·연출', imageUrl: '' },
    { index: 4, part: '클로징', timeRange: '12~15s', shotType: '인물 정면', sketchType: 'front', visualKo: '크리에이터 정면 마무리', visualEn: '', dialogue: '저장하고 나중에 써먹어요!', shootingMemo: '다시 등장해 정면으로 밝게 마무리 + CTA', imageUrl: '' },
  ],
};

const TONE_LABEL: Record<ScriptTone, string> = {
  informative: '정보형',
  story: '스토리형',
  hooking: '후킹형',
};

const INTENT_CHIPS = ['내 일상에 적용', '챌린지 도전', '제품·서비스 소개', '정보·팁 공유'];

// PersonaResult + OnboardingPrefs → /api/generate 용 Persona 형태로 변환
function buildPersonaForGenerate(persona: PersonaResult, prefs: OnboardingPrefs | null, trendCategory: Category) {
  return {
    category: (prefs?.categories?.[0] ?? trendCategory) as Category,
    styles: persona.hookPatterns.map((h) => h.type),
  };
}

// 사용자 의도 → concept 객체 변환
function buildConcept(intentPart: string, trend: Trend): RecommendConcept | null {
  if (!intentPart) return null;
  return {
    title: intentPart,
    trendBasis: trend.title,
    hook: '',
    keywords: trend.hashtags.replace(/#/g, '').split(/\s+/).filter(Boolean),
    expectedReaction: '저장·댓글',
  };
}

// /api/generate 호출 → 추천 톤의 ScriptOutput 반환
async function fetchScript(
  trend: Trend,
  persona: ReturnType<typeof buildPersonaForGenerate>,
  concept: RecommendConcept | null,
): Promise<{ script: ScriptOutput; tone: ScriptTone; raw: GenerateResponse } | null> {
  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trend, persona, concept }),
    });
    if (!res.ok) return null;
    const data: GenerateResponse = await res.json();
    return { script: data.scripts[data.recommendedTone], tone: data.recommendedTone, raw: data };
  } catch {
    return null;
  }
}

export default function ProductionScreen({ trend, persona, prefs, initialConti, onNext, onBack, onScriptReady, onContiReady, onContiGenerated }: ProductionScreenProps) {
  const [stage, setStage] = useState<Stage>(initialConti ? 'conti' : 'intent');
  const [conti, setConti] = useState<ContiResponse | null>(initialConti ?? null);
  const [script, setScript] = useState<GenerateResponse | null>(null);
  const [userIntent, setUserIntent] = useState('');

  async function makeConti(intent: string) {
    setStage('loading');
    const intentPart = intent.trim();
    const personaForGen = buildPersonaForGenerate(persona, prefs ?? null, trend.category);
    const concept = buildConcept(intentPart, trend);

    // 1단계: /api/generate → 실제 AI 대본 생성
    let scriptForConti: ScriptOutput;
    let toneForConti: ScriptTone = 'hooking';
    const genResult = await fetchScript(trend, personaForGen, concept);
    if (genResult) {
      scriptForConti = genResult.script;
      toneForConti = genResult.tone;
    } else {
      // generate 실패 시 템플릿 fallback
      scriptForConti = {
        hook: intentPart ? `${intentPart} — 이걸 모르면 손해예요!` : `${trend.title} - 지금 바로 알려드릴게요!`,
        body: intentPart
          ? `${intentPart} 관점에서 ${trend.title}의 핵심 포인트를 보여드릴게요. (${persona.personaType})`
          : `${trend.title}의 핵심 포인트를 단계별로 설명해드릴게요. (${persona.personaType})`,
        cta: intentPart ? `${intentPart}처럼 직접 해보세요!` : `${trend.title} 지금 바로 따라해보세요!`,
      };
    }

    // 2단계: /api/conti → 실제 AI 대본 기반 4컷 콘티 생성
    try {
      const contiRes = await fetch('/api/conti', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script: scriptForConti, tone: toneForConti, concept }),
      });
      const data: ContiResponse = await contiRes.json();
      setConti(data);
      onContiGenerated?.(data);
    } catch {
      setConti(CLIENT_FALLBACK_CONTI);
    }
    setStage('conti');
  }

  async function makeScript() {
    setStage('loading');
    const intentPart = userIntent.trim();
    const personaForGen = buildPersonaForGenerate(persona, prefs ?? null, trend.category);
    const concept = buildConcept(intentPart, trend);
    const genResult = await fetchScript(trend, personaForGen, concept);
    setScript(genResult?.raw ?? null);
    setStage('script');
  }

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

        {stage === 'intent' && (
          <div id="v7-make-intent">
            <div className="v7-make-title">어떤 내용의 영상을<br />만들고 싶어요?</div>
            <div className="v7-make-sub">내 스타일로 트렌드를 풀어보세요</div>
            <div
              style={{ margin: '16px 0 10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '14px 16px', transition: 'border-color 0.2s' }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(200,255,87,0.4)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
            >
              <input
                type="text"
                placeholder={`예: 내 ${trend.category} 스타일로 ${trend.title.slice(0, 10)} 따라해보기`}
                value={userIntent}
                onChange={(e) => setUserIntent(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && userIntent.trim()) void makeConti(userIntent); }}
                maxLength={60}
                style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', fontSize: '14px', fontWeight: 600, color: 'var(--ink)', fontFamily: 'var(--font-body)', caretColor: 'var(--primary)' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
              {INTENT_CHIPS.map((chip) => (
                <button
                  key={chip}
                  onClick={() => setUserIntent(chip)}
                  style={{ background: userIntent === chip ? 'rgba(200,255,87,0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${userIntent === chip ? 'rgba(200,255,87,0.5)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '20px', padding: '6px 12px', fontSize: '12px', fontFamily: 'var(--font-body)', color: userIntent === chip ? 'var(--primary)' : 'var(--gray)', cursor: 'pointer', transition: 'all 0.15s' }}
                >
                  {chip}
                </button>
              ))}
            </div>
            <button
              className="welcome-start-btn"
              onClick={() => void makeConti(userIntent)}
              disabled={!userIntent.trim()}
              style={{ maxWidth: '100%', margin: '0 0 10px', opacity: userIntent.trim() ? 1 : 0.4, cursor: userIntent.trim() ? 'pointer' : 'not-allowed' }}
            >
              4컷 콘티 만들기 →
            </button>
            <button
              className="v7-btn-ghost"
              onClick={() => void makeScript()}
              disabled={!userIntent.trim()}
              style={{ opacity: userIntent.trim() ? 1 : 0.4, cursor: userIntent.trim() ? 'pointer' : 'not-allowed' }}
            >
              대본으로 받기
            </button>
          </div>
        )}

        {stage === 'loading' && (
          <div id="v7-make-loading">
            <div className="v7-make-loading">
              <div className="v7-spin"></div>
              <div className="v7-loading-t">AI가 대본을 쓰고 있어요...</div>
            </div>
          </div>
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
              <button className="v7-btn-ghost" onClick={() => onContiReady(conti)} style={{ marginBottom: '8px' }}>콘티 전체 보기</button>
            )}
            <button className="v7-btn-ghost" onClick={() => void makeScript()} style={{ marginBottom: '8px' }}>대본도 받아보기</button>
            <button className="welcome-start-btn" onClick={() => {
              if (conti) saveItem({ type: 'conti', id: `conti_${trend.id}`, trendTitle: trend.title, trendPoint: conti.trendPoint ?? '', cutsCount: conti.cuts.length, savedAt: new Date().toISOString() });
              setStage('saved');
            }} style={{ maxWidth: '100%', margin: '6px 0 0' }}>저장하고 다음 주제 받기</button>
          </div>
        )}

        {stage === 'script' && (
          <div id="v7-make-result">
            <span className="v7-section-eyebrow">AI 대본 3종{script?.meta.source === 'live' ? ' · AI 생성' : ' · 미리보기'}</span>
            <div className="v7-result-title">마음에 드는 걸로 골라보세요</div>
            {script ? (
              (['informative', 'story', 'hooking'] as ScriptTone[]).map((tone) => {
                const s = script.scripts[tone];
                const isRec = tone === script.recommendedTone;
                return (
                  <div className="v7-script-card" key={tone} style={isRec ? { border: '1px solid rgba(200,255,87,0.35)' } : {}}>
                    <span className="v7-sc-tag">{TONE_LABEL[tone]}{isRec ? ' ✦' : ''}</span>
                    <div className="v7-sc-text">{s.hook}</div>
                    {s.body && (
                      <div style={{ fontSize: '11px', color: 'var(--gray)', marginTop: '5px', lineHeight: 1.5 }}>{s.body.split('\n')[0]}</div>
                    )}
                  </div>
                );
              })
            ) : (
              [['정보형', '이걸 꼭 알아야 할 이유, 지금 알려드릴게요.'], ['스토리형', '처음엔 저도 몰랐어요. 근데 이제는 자신 있게 만들어요.'], ['후킹형', '이게 된다고요? 끝까지 보면 깜짝 놀라요.']].map(([t, s]) => (
                <div className="v7-script-card" key={t}><span className="v7-sc-tag">{t}</span><div className="v7-sc-text">{s}</div></div>
              ))
            )}
            {script && onScriptReady && (
              <button className="v7-btn-ghost" onClick={() => onScriptReady(script)} style={{ marginBottom: '8px' }}>대본 전체 보기</button>
            )}
            <button className="v7-btn-ghost" onClick={() => void makeConti(userIntent)} style={{ marginBottom: '8px' }}>콘티도 받아보기</button>
            <button className="welcome-start-btn" onClick={() => {
              const items = script
                ? (['informative', 'story', 'hooking'] as ScriptTone[]).map((tone) => ({ tag: TONE_LABEL[tone], text: script.scripts[tone].hook }))
                : [{ tag: '대본', text: trend.title }];
              saveItem({ type: 'script', id: `script_${trend.id}`, trendTitle: trend.title, items, savedAt: new Date().toISOString() });
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
