'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import type { SurveyAnswers, VideoFormat, RecommendConcept } from '@/lib/types';

const FORMAT_OPTIONS: { value: VideoFormat; label: string; sub: string }[] = [
  { value: 'vlog', label: '브이로그', sub: '일상 기록' },
  { value: 'info', label: '정보·튜토리얼', sub: '지식 전달' },
  { value: 'review', label: '리뷰·후기', sub: '경험 평가' },
  { value: 'challenge', label: '챌린지·트렌드', sub: '참여 유도' },
  { value: 'story', label: '스토리텔링', sub: '에피소드 중심' },
];

const MOOD_OPTIONS = ['정보 전달', '감성·공감', '유머·웃음', '챌린지·트렌드', '일상 브이로그'];

export default function RecommendPage() {
  const router = useRouter();
  const setTab = useStore((s) => s.setTab);
  const trends = useStore((s) => s.trends);
  const persona = useStore((s) => s.persona);
  const surveyAnswers = useStore((s) => s.surveyAnswers);
  const setSurveyAnswers = useStore((s) => s.setSurveyAnswers);
  const recommendResult = useStore((s) => s.recommendResult);
  const setRecommendResult = useStore((s) => s.setRecommendResult);
  const setSelectedConceptIndex = useStore((s) => s.setSelectedConceptIndex);
  const setSelectedTrendId = useStore((s) => s.setSelectedTrendId);

  const [mood, setMood] = useState(surveyAnswers?.mood ?? '');
  const [format, setFormat] = useState<VideoFormat>(surveyAnswers?.format ?? 'vlog');
  const [targetAudience, setTargetAudience] = useState(surveyAnswers?.targetAudience ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTab('recommend');
  }, [setTab]);

  const canSubmit = mood.trim().length > 0 && targetAudience.trim().length > 0;

  const handleRecommend = async () => {
    if (!canSubmit) return;
    const answers: SurveyAnswers = { mood: mood.trim(), format, targetAudience: targetAudience.trim() };
    setSurveyAnswers(answers);
    setRecommendResult(null);
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ persona, surveyAnswers: answers, trends }),
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

  const handlePickConcept = (index: number) => {
    setSelectedConceptIndex(index);
    const topTrend = trends[0];
    if (topTrend) setSelectedTrendId(topTrend.id);
    router.push('/production');
  };

  return (
    <div className="pb-8">
      {/* 헤더 */}
      <div className="px-6 pb-5 pt-1">
        <div className="font-mono text-[10px] tracking-widest text-accent-pink uppercase mb-2.5 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-pink" style={{ boxShadow: '0 0 8px var(--accent-pink)' }} />
          추천 · 제작
        </div>
        <div className="font-display text-[34px] leading-none tracking-tight mb-1">
          <span className="text-accent-pink">소재</span> 추천
        </div>
        <div className="text-[13px] text-text-dim">
          오늘 찍을 영상 방향을 알려주면 맞춤 소재를 추천해드려요
        </div>
      </div>

      {/* 설문 */}
      <div className="px-6 flex flex-col gap-5">
        {/* Q1: 분위기 */}
        <div>
          <div className="font-mono text-[10px] tracking-wider text-text-faint uppercase mb-2.5">
            Q1 · 어떤 분위기의 영상을 만들고 싶나요?
          </div>
          <div className="flex flex-wrap gap-2">
            {MOOD_OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() => setMood(opt)}
                className={`px-3 py-1.5 rounded-full font-mono text-[11px] tracking-wide border transition-all ${
                  mood === opt
                    ? 'bg-accent-pink/10 border-accent-pink text-accent-pink'
                    : 'bg-surface-1 border-border text-text-dim hover:border-border-bright'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Q2: 포맷 */}
        <div>
          <div className="font-mono text-[10px] tracking-wider text-text-faint uppercase mb-2.5">
            Q2 · 영상 포맷
          </div>
          <div className="grid grid-cols-3 gap-2">
            {FORMAT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFormat(opt.value)}
                className={`py-3 px-2 rounded-xl border text-center transition-all ${
                  format === opt.value
                    ? 'bg-accent-lime/8 border-accent-lime'
                    : 'bg-surface-1 border-border hover:border-border-bright'
                }`}
              >
                <div className={`text-[13px] font-semibold mb-0.5 ${format === opt.value ? 'text-accent-lime' : 'text-text'}`}>
                  {opt.label}
                </div>
                <div className="font-mono text-[9px] text-text-faint">{opt.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Q3: 타겟 오디언스 */}
        <div>
          <div className="font-mono text-[10px] tracking-wider text-text-faint uppercase mb-2.5">
            Q3 · 타겟 오디언스
          </div>
          <textarea
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            placeholder="예) 20대 직장인, 요리 배우고 싶은 입문자, 운동에 관심 있는 학생..."
            rows={3}
            className="w-full bg-surface-1 border border-border rounded-xl px-4 py-3 text-[13px] text-text placeholder:text-text-faint resize-none focus:outline-none focus:border-border-bright transition-colors"
          />
        </div>

        {/* CTA */}
        <button
          onClick={handleRecommend}
          disabled={!canSubmit || loading}
          className="w-full py-4 rounded-2xl font-semibold text-[15px] tracking-wide transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: canSubmit && !loading ? 'var(--accent-lime)' : undefined,
            backgroundColor: (!canSubmit || loading) ? 'rgba(200,255,87,0.15)' : undefined,
            color: canSubmit && !loading ? '#0a0a0a' : 'rgba(200,255,87,0.5)',
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

      {/* 추천 결과 */}
      {recommendResult && (
        <div className="px-6 mt-8">
          <div className="flex items-center justify-between mb-1">
            <div className="font-mono text-[10px] tracking-widest text-accent-lime uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-lime animate-pulse" />
              이런 영상 어때요?
            </div>
            {recommendResult.source === 'mock' && (
              <span className="font-mono text-[8px] text-text-faint border border-border px-2 py-0.5 rounded-full">MOCK</span>
            )}
          </div>
          <div className="text-[11px] text-text-faint mb-4">
            트렌드 + 키워드 + 내 스타일 기반 맞춤 영상 컨셉 {recommendResult.concepts.length}가지
          </div>
          <div className="flex flex-col gap-3">
            {recommendResult.concepts.map((concept, i) => (
              <ConceptCard
                key={i}
                concept={concept}
                index={i}
                onSelect={() => handlePickConcept(i)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ConceptCard({
  concept,
  index,
  onSelect,
}: {
  concept: RecommendConcept;
  index: number;
  onSelect: () => void;
}) {
  return (
    <div className="bg-surface-1 border border-border rounded-2xl p-4 relative overflow-hidden">
      <div
        className="absolute top-0 left-0 right-0 h-[2px] opacity-60"
        style={{ background: 'linear-gradient(to right, var(--accent-lime), var(--accent-pink))' }}
      />

      {/* 컨셉 번호 + 제목 */}
      <div className="flex items-start gap-2.5 mt-1 mb-2">
        <span className="font-mono text-[9px] text-text-faint tracking-widest mt-0.5 flex-shrink-0">
          0{index + 1}
        </span>
        <div className="text-[15px] font-semibold leading-snug">{concept.title}</div>
      </div>

      {/* 트렌드 근거 */}
      <div
        className="rounded-lg px-3 py-2 mb-2.5 flex items-start gap-2"
        style={{ background: 'rgba(138,180,248,0.06)', border: '1px solid rgba(138,180,248,0.15)' }}
      >
        <span className="font-mono text-[8px] text-[#8ab4f8] tracking-widest uppercase mt-0.5 flex-shrink-0">근거</span>
        <div className="text-[11px] text-text-dim leading-relaxed">{concept.trendBasis}</div>
      </div>

      {/* 훅 */}
      <div className="text-[12px] text-text-dim italic mb-2.5 leading-relaxed pl-1">
        {concept.hook}
      </div>

      {/* 키워드 */}
      <div className="flex flex-wrap gap-1 mb-3">
        {concept.keywords.map((kw) => (
          <span key={kw} className="font-mono text-[9px] px-2 py-0.5 rounded-full bg-surface-2 border border-border text-text-faint">
            {kw}
          </span>
        ))}
      </div>

      {/* 예상 반응 + CTA */}
      <div className="flex items-center justify-between">
        <div className="font-mono text-[10px] text-accent-lime">예상: {concept.expectedReaction}</div>
        <button
          onClick={onSelect}
          className="bg-accent-lime text-[#0a0a0a] font-semibold text-[11px] px-3 py-1.5 rounded-full hover:opacity-90 transition-opacity"
        >
          대본 생성 →
        </button>
      </div>
    </div>
  );
}
