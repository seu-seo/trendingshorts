'use client';

import { useEffect, useRef, useState } from 'react';
import { useStore } from '@/lib/store';
import type { SurveyAnswers, RecommendConcept } from '@/lib/types';
import type { GenerateResponse } from '@/lib/prompts';
import GeneratedScriptCard from '@/components/production/GeneratedScriptCard';
import CreatorRecommendV7 from '@/components/recommend/CreatorRecommendV7';
import { applyTheme, clearTheme } from '@/lib/themes/applyTheme';
import type { ThemeName } from '@/lib/themes/types';
import ThemeSwitcher from '@/components/ThemeSwitcher';

const TREND_OPTIONS: { value: string; label: string; sub: string }[] = [
  { value: 'trend-full', label: '트렌드 그대로', sub: '지금 유행 편승' },
  { value: 'trend-mix', label: '트렌드 + 내 색깔', sub: '유행 + 개성 믹스' },
  { value: 'trend-none', label: '내 스타일로', sub: '트렌드 상관없이' },
];

const ENERGY_OPTIONS: { value: string; label: string; sub: string }[] = [
  { value: 'funny', label: '웃기고 가볍게', sub: '유머·공감' },
  { value: 'emotional', label: '공감·감성', sub: '진심·스토리' },
  { value: 'informative', label: '실용 정보', sub: '도움되는 내용' },
  { value: 'challenge', label: '새로운 시도', sub: '도전·실험' },
];

const TONE_ORDER = ['informative', 'story', 'hooking'] as const;

export default function RecommendPage() {
  const setTab = useStore((s) => s.setTab);
  const trends = useStore((s) => s.trends);
  const persona = useStore((s) => s.persona);
  const personaInput = useStore((s) => s.personaInput);
  const personaResult = useStore((s) => s.personaResult);
  const filterCategory = useStore((s) => s.filterCategory);
  const surveyAnswers = useStore((s) => s.surveyAnswers);
  const setSurveyAnswers = useStore((s) => s.setSurveyAnswers);
  const recommendResult = useStore((s) => s.recommendResult);
  const setRecommendResult = useStore((s) => s.setRecommendResult);

  const [trendUsage, setTrendUsage] = useState(surveyAnswers?.trendUsage ?? '');
  const [energy, setEnergy] = useState(surveyAnswers?.energy ?? '');
  const [targetAudience, setTargetAudience] = useState(surveyAnswers?.targetAudience ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [activeConceptIndex, setActiveConceptIndex] = useState<number | null>(null);
  const [activeConcept, setActiveConcept] = useState<import('@/lib/types').RecommendConcept | null>(null);
  const [scriptData, setScriptData] = useState<GenerateResponse | null>(null);
  const [scriptLoading, setScriptLoading] = useState(false);
  const [scriptError, setScriptError] = useState<string | null>(null);

  const scriptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTab('recommend');
  }, [setTab]);

  const [theme, setTheme] = useState<ThemeName>('indigo');
  useEffect(() => { applyTheme(theme); return () => clearTheme(); }, [theme]);

  const canSubmit = trendUsage.length > 0 && energy.length > 0 && targetAudience.trim().length > 0;

  const handleRecommend = async () => {
    if (!canSubmit) return;
    const answers: SurveyAnswers = { trendUsage, energy, targetAudience: targetAudience.trim() };
    setSurveyAnswers(answers);
    setRecommendResult(null);
    setActiveConceptIndex(null);
    setScriptData(null);
    setLoading(true);
    setError(null);

    // 온보딩 페르소나 우선 사용, 없으면 구형 persona fallback
    const effectivePersona = persona ?? (personaInput
      ? { category: personaInput.category, styles: personaInput.styles }
      : null);

    // 카테고리 필터된 트렌드 우선 전달 (없으면 전체)
    const relevantTrends = filterCategory
      ? trends.filter((t) => t.category === filterCategory)
      : trends;

    try {
      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          persona: effectivePersona,
          personaResult,
          surveyAnswers: answers,
          trends: relevantTrends,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setRecommendResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : '추천 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handlePickConcept = async (index: number, concept: RecommendConcept) => {
    setActiveConceptIndex(index);
    setActiveConcept(concept);
    setScriptData(null);
    setScriptLoading(true);
    setScriptError(null);

    setTimeout(() => scriptRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);

    const topTrend = trends[0];
    if (!topTrend) {
      setScriptError('트렌드 데이터가 없습니다. 대시보드에서 트렌드를 먼저 로드해주세요.');
      setScriptLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trend: topTrend,
          persona,
          surveyAnswers: { trendUsage, energy, targetAudience },
          concept,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: GenerateResponse = await res.json();
      setScriptData(data);
    } catch (e) {
      setScriptError(e instanceof Error ? e.message : '대본 생성 중 오류가 발생했습니다.');
    } finally {
      setScriptLoading(false);
    }
  };

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100%' }}>
      <ThemeSwitcher value={theme} onChange={setTheme} options={['indigo', 'purple']} />
      <div className="pb-8">
        {/* 헤더 */}
        <div className="px-6 pb-5 pt-1">
          <div className="font-mono text-[10px] tracking-widest uppercase mb-2.5 flex items-center gap-2" style={{ color: 'var(--color-hot)' }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-hot)', boxShadow: '0 0 8px var(--color-hot)' }} />
            추천 · 제작
          </div>
          <div className="font-display text-[34px] leading-none tracking-tight mb-1">
            <span style={{ color: 'var(--color-hot)' }}>소재</span> 추천
          </div>
          <div className="text-[13px]" style={{ color: 'var(--color-ink-2)' }}>
            오늘 찍을 영상 방향을 알려주면 맞춤 소재를 추천해드려요
          </div>
        </div>

        {/* 설문 */}
        <div className="px-6 flex flex-col gap-6">

          {/* Q1: 트렌드 활용도 */}
          <div
            className="rounded-2xl p-4"
            style={{ background: 'color-mix(in srgb, var(--color-primary) 6%, transparent)', border: '1px solid color-mix(in srgb, var(--color-primary) 18%, transparent)' }}
          >
            <div className="font-mono text-[10px] tracking-wider uppercase mb-1" style={{ color: 'color-mix(in srgb, var(--color-primary) 50%, transparent)' }}>Q1</div>
            <div className="text-[15px] font-semibold mb-3" style={{ color: 'var(--color-ink)' }}>이번 영상, 유행을 얼마나 탈 건가요?</div>
            <div className="grid grid-cols-3 gap-2">
              {TREND_OPTIONS.map((opt) => {
                const selected = trendUsage === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setTrendUsage(opt.value)}
                    className="py-3 px-2 rounded-xl border text-center transition-all"
                    style={selected
                      ? { background: 'color-mix(in srgb, var(--color-primary) 18%, transparent)', border: '1px solid color-mix(in srgb, var(--color-primary) 70%, transparent)' }
                      : { background: 'var(--color-tint)', border: '1px solid var(--color-border)' }
                    }
                  >
                    <div className="text-[13px] font-semibold mb-0.5" style={{ color: selected ? 'var(--color-primary)' : 'var(--color-ink)' }}>
                      {opt.label}
                    </div>
                    <div className="font-mono text-[9px]" style={{ color: selected ? 'color-mix(in srgb, var(--color-primary) 55%, transparent)' : 'var(--color-ink-3)' }}>{opt.sub}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Q2: 영상 에너지 */}
          <div
            className="rounded-2xl p-4"
            style={{ background: 'color-mix(in srgb, var(--color-primary) 6%, transparent)', border: '1px solid color-mix(in srgb, var(--color-primary) 18%, transparent)' }}
          >
            <div className="font-mono text-[10px] tracking-wider uppercase mb-1" style={{ color: 'color-mix(in srgb, var(--color-primary) 50%, transparent)' }}>Q2</div>
            <div className="text-[15px] font-semibold mb-3" style={{ color: 'var(--color-ink)' }}>어떤 느낌의 영상으로 갈 건가요?</div>
            <div className="grid grid-cols-2 gap-2">
              {ENERGY_OPTIONS.map((opt) => {
                const selected = energy === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setEnergy(opt.value)}
                    className="py-3 px-3 rounded-xl border text-center transition-all"
                    style={selected
                      ? { background: 'color-mix(in srgb, var(--color-primary) 18%, transparent)', border: '1px solid color-mix(in srgb, var(--color-primary) 70%, transparent)' }
                      : { background: 'var(--color-tint)', border: '1px solid var(--color-border)' }
                    }
                  >
                    <div className="text-[13px] font-semibold mb-0.5" style={{ color: selected ? 'var(--color-primary)' : 'var(--color-ink)' }}>
                      {opt.label}
                    </div>
                    <div className="font-mono text-[9px]" style={{ color: selected ? 'color-mix(in srgb, var(--color-primary) 55%, transparent)' : 'var(--color-ink-3)' }}>{opt.sub}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Q3: 타겟 오디언스 */}
          <div
            className="rounded-2xl p-4"
            style={{ background: 'color-mix(in srgb, var(--color-primary) 6%, transparent)', border: '1px solid color-mix(in srgb, var(--color-primary) 18%, transparent)' }}
          >
            <div className="font-mono text-[10px] tracking-wider uppercase mb-1" style={{ color: 'color-mix(in srgb, var(--color-primary) 50%, transparent)' }}>Q3</div>
            <div className="text-[15px] font-semibold mb-3" style={{ color: 'var(--color-ink)' }}>누구를 위한 영상인가요?</div>
            <textarea
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="예) 20대 직장인, 요리 배우고 싶은 입문자, 운동 관심 있는 학생..."
              rows={3}
              className="w-full rounded-xl px-4 py-3 text-[13px] placeholder:text-[color:var(--color-ink-3)] resize-none focus:outline-none transition-colors"
              style={{ color: 'var(--color-ink)', background: 'var(--color-tint)', border: '1px solid var(--color-border)' }}
            />
          </div>

        </div>

        {/* 성장 레퍼런스 — 온보딩 완료 시 표시 */}
        {personaInput && (
          <CreatorRecommendV7
            category={personaInput.category}
            experience={personaInput.experience}
          />
        )}

        <div className="px-6 flex flex-col gap-6">
          {/* CTA */}
          <button
            onClick={handleRecommend}
            disabled={!canSubmit || loading}
            className="w-full py-4 rounded-2xl font-semibold text-[15px] tracking-wide transition-all flex items-center justify-center gap-2"
            style={{
              background: canSubmit && !loading ? 'var(--color-primary)' : 'color-mix(in srgb, var(--color-primary) 12%, transparent)',
              color: canSubmit && !loading ? 'var(--color-bg)' : 'color-mix(in srgb, var(--color-primary) 40%, transparent)',
              cursor: canSubmit && !loading ? 'pointer' : 'not-allowed',
            }}
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Gemini 분석 중...
              </>
            ) : (
              <>✨ 소재·컨셉 추천받기</>
            )}
          </button>

          {error && (
            <div className="text-[12px] text-red-400 font-mono text-center">{error}</div>
          )}
        </div>

        {/* ── STEP 2: 컨셉 카드 ── */}
        {recommendResult && (
          <div className="px-6 mt-8">
            <div className="flex items-center justify-between mb-1">
              <div className="font-mono text-[10px] tracking-widest uppercase flex items-center gap-2" style={{ color: 'var(--color-primary)' }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--color-primary)' }} />
                이런 영상 어때요?
              </div>
              {recommendResult.source === 'mock' && (
                <span className="font-mono text-[8px] px-2 py-0.5 rounded-full" style={{ color: 'var(--color-ink-3)', border: '1px solid var(--color-border)' }}>MOCK</span>
              )}
            </div>
            <div className="text-[11px] mb-4" style={{ color: 'var(--color-ink-2)' }}>
              컨셉을 선택하면 바로 대본 3종을 생성해드려요
            </div>
            <div className="flex flex-col gap-3">
              {recommendResult.concepts.map((concept, i) => (
                <ConceptCard
                  key={i}
                  concept={concept}
                  index={i}
                  active={activeConceptIndex === i}
                  onSelect={() => handlePickConcept(i, concept)}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 3: 대본 생성 ── */}
        {(scriptLoading || scriptData || scriptError) && (
          <div ref={scriptRef} className="px-6 mt-8">
            <div className="font-mono text-[10px] tracking-widest uppercase flex items-center gap-2 mb-1" style={{ color: 'var(--color-primary-mid)' }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-primary-mid)', boxShadow: '0 0 8px var(--color-primary-mid)' }} />
              대본 생성
            </div>

            {activeConceptIndex != null && recommendResult && (
              <div className="text-[11px] mb-4" style={{ color: 'var(--color-ink-2)' }}>
                &ldquo;{recommendResult.concepts[activeConceptIndex].title}&rdquo; 기반 대본 3종
              </div>
            )}

            {scriptLoading && (
              <div className="flex flex-col gap-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="rounded-[18px] p-[18px] animate-pulse" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                    <div className="h-3 w-24 rounded mb-3" style={{ background: 'var(--color-border)' }} />
                    <div className="h-4 w-full rounded mb-2" style={{ background: 'var(--color-border)' }} />
                    <div className="h-4 w-5/6 rounded mb-4" style={{ background: 'var(--color-border)' }} />
                    <div className="h-3 w-full rounded mb-1.5" style={{ background: 'var(--color-border)' }} />
                    <div className="h-3 w-2/3 rounded" style={{ background: 'var(--color-border)' }} />
                  </div>
                ))}
              </div>
            )}

            {scriptError && !scriptLoading && (
              <div className="p-4 border border-dashed rounded-xl mb-4"
                style={{ borderColor: 'rgba(255,61,127,0.4)', background: 'rgba(255,61,127,0.05)' }}
              >
                <div className="font-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: 'var(--color-hot)' }}>FAILED</div>
                <div className="text-[12px]" style={{ color: 'var(--color-ink-2)' }}>{scriptError}</div>
              </div>
            )}

            {scriptData && !scriptLoading && (
              <div className="flex flex-col gap-3.5">
                {TONE_ORDER.map((tone, i) => (
                  <GeneratedScriptCard
                    key={tone}
                    tone={tone}
                    script={scriptData.scripts[tone]}
                    index={i + 1}
                    total={3}
                    recommended={scriptData.recommendedTone === tone}
                    concept={activeConcept}
                  />
                ))}
                <div
                  className="p-3 px-3.5 border border-dashed rounded-[10px] flex gap-2.5 items-start mt-1"
                  style={{ background: 'rgba(255,215,0,0.06)', borderColor: 'rgba(255,215,0,0.3)' }}
                >
                  <div
                    className="font-mono text-[11px] font-bold py-0.5 px-1.5 rounded flex-shrink-0"
                    style={{ color: 'var(--peak)', background: 'rgba(255,215,0,0.15)' }}
                  >
                    {scriptData.meta.source === 'live' ? 'LIVE' : 'MOCK'}
                  </div>
                  <div className="text-[11px] leading-relaxed" style={{ color: 'var(--color-ink-2)' }}>
                    {scriptData.meta.source === 'live'
                      ? `Gemini 단일 호출로 3톤 동시 생성. prompt v${scriptData.meta.promptVersion}.`
                      : 'GOOGLE_GENERATIVE_AI_API_KEY 미설정 — mock fallback.'}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ConceptCard({
  concept,
  index,
  active,
  onSelect,
}: {
  concept: RecommendConcept;
  index: number;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      className="border rounded-2xl p-4 relative overflow-hidden transition-all"
      style={active
        ? { background: 'color-mix(in srgb, var(--color-primary-mid) 6%, transparent)', border: '1px solid color-mix(in srgb, var(--color-primary-mid) 35%, transparent)' }
        : { background: 'var(--color-surface)', border: '1px solid var(--color-border)' }
      }
    >
      <div
        className="absolute top-0 left-0 right-0 h-[2px] opacity-60"
        style={{ background: 'linear-gradient(to right, var(--color-primary), var(--color-hot))' }}
      />

      <div className="flex items-start gap-2.5 mt-1 mb-2">
        <span className="font-mono text-[9px] tracking-widest mt-0.5 flex-shrink-0" style={{ color: 'var(--color-ink-3)' }}>
          0{index + 1}
        </span>
        <div className="text-[15px] font-semibold leading-snug" style={{ color: 'var(--color-ink)' }}>{concept.title}</div>
      </div>

      <div
        className="rounded-lg px-3 py-2 mb-2.5 flex items-start gap-2"
        style={{ background: 'color-mix(in srgb, var(--color-primary-mid) 6%, transparent)', border: '1px solid color-mix(in srgb, var(--color-primary-mid) 15%, transparent)' }}
      >
        <span className="font-mono text-[8px] tracking-widest uppercase mt-0.5 flex-shrink-0" style={{ color: 'var(--color-primary-mid)' }}>근거</span>
        <div className="text-[11px] leading-relaxed" style={{ color: 'var(--color-ink)' }}>{concept.trendBasis}</div>
      </div>

      <div className="text-[12px] italic mb-2.5 leading-relaxed pl-1" style={{ color: 'var(--color-ink)' }}>{concept.hook}</div>

      <div className="flex flex-wrap gap-1 mb-3">
        {concept.keywords.map((kw) => (
          <span key={kw} className="font-mono text-[9px] px-2 py-0.5 rounded-full" style={{ background: 'var(--color-soft)', border: '1px solid var(--color-border)', color: 'var(--color-ink-2)' }}>
            {kw}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="font-mono text-[10px]" style={{ color: 'var(--color-primary)' }}>예상: {concept.expectedReaction}</div>
        <button
          onClick={onSelect}
          className="font-semibold text-[11px] px-3 py-1.5 rounded-full transition-all"
          style={active
            ? { background: 'color-mix(in srgb, var(--color-primary-mid) 20%, transparent)', color: 'var(--color-primary-mid)', border: '1px solid color-mix(in srgb, var(--color-primary-mid) 40%, transparent)' }
            : { background: 'var(--color-primary)', color: 'var(--color-bg)' }
          }
        >
          {active ? '생성 중 / 재생성 →' : '대본 생성 →'}
        </button>
      </div>
    </div>
  );
}
