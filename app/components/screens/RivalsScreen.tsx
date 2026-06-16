'use client';

import { useEffect, useState } from 'react';
import type { RivalResult, RivalSurvey } from '@/lib/types';
import { saveItem, getSavedItems, removeItem } from '@/lib/saved-items';

const CAT_TOPICS: Record<string, string> = {
  food: '요리 먹방 레시피',
  beauty: '뷰티 메이크업 스킨케어',
  fitness: '홈트 운동 다이어트',
  lifestyle: '라이프스타일 브이로그 여행',
  gaming: '게임 공략 리뷰',
  art: '패션 코디 아트',
  edu: '교육 정보 자기계발',
};

interface RivalsScreenProps {
  categories: string[];
  chatAnswers: string[];
  cachedResults?: RivalResult[];
  onNext: () => void;
  onBack?: () => void;
  onSave?: (result: RivalResult) => void;
  onResultsCached?: (results: RivalResult[]) => void;
}

type LoadStage = 'idle' | 'stage1' | 'stage2' | 'stage3' | 'done' | 'error';

function buildSurvey(categories: string[], chatAnswers: string[]): RivalSurvey {
  const topicsFromCats = categories.flatMap((c) => (CAT_TOPICS[c] ?? c).split(' ')).slice(0, 6);
  const firstAnswerWords = (chatAnswers[0] ?? '').split(/\s+/).filter(Boolean).slice(0, 3);
  const topics = [...new Set([...topicsFromCats, ...firstAnswerWords])].filter(Boolean);

  return {
    topics: topics.length > 0 ? topics : ['라이프스타일'],
    channelSize: 'micro',
    uploadFreq: 'weekly-mid',
    contentTone: 'info',
    gender: 'any',
    lang: 'ko',
  };
}

export default function RivalsScreen({ categories, chatAnswers, cachedResults, onNext, onBack, onSave, onResultsCached }: RivalsScreenProps) {
  const [loadStage, setLoadStage] = useState<LoadStage>(cachedResults ? 'done' : 'idle');
  const [results, setResults] = useState<RivalResult[]>(cachedResults ?? []);
  const [errorMsg, setErrorMsg] = useState('');
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [sheet, setSheet] = useState<RivalResult | null>(null);

  useEffect(() => {
    const savedCreatorIds = new Set(
      getSavedItems()
        .filter((i) => i.type === 'creator')
        .map((i) => i.id)
    );
    setSaved(savedCreatorIds);
  }, []);

  const fetchRivals = () => {
    const survey = buildSurvey(categories, chatAnswers);
    setLoadStage('stage1');
    setResults([]);
    setErrorMsg('');

    void (async () => {
      try {
        const res = await fetch('/api/rival', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(survey),
        });
        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let buf = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const lines = buf.split('\n');
          buf = lines.pop() ?? '';
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const msg = JSON.parse(line.slice(6)) as {
              stage: number;
              status: string;
              count?: number;
              results?: RivalResult[];
              message?: string;
            };
            if (msg.stage === 0 && msg.status === 'error') {
              setErrorMsg(msg.message ?? '오류 발생');
              setLoadStage('error');
            } else if (msg.stage === 1 && msg.status === 'searching') {
              setLoadStage('stage1');
            } else if (msg.stage === 2 && msg.status === 'analyzing') {
              setLoadStage('stage2');
            } else if (msg.stage === 3 && msg.status === 'vision') {
              setLoadStage('stage3');
            } else if (msg.stage === 3 && msg.status === 'done' && msg.results) {
              setResults(msg.results);
              setLoadStage('done');
              onResultsCached?.(msg.results);
            }
          }
        }
        if (loadStage !== 'done' && loadStage !== 'error') {
          setLoadStage('done');
        }
      } catch (e) {
        setErrorMsg(e instanceof Error ? e.message : '네트워크 오류가 발생했습니다.');
        setLoadStage('error');
      }
    })();
  };

  useEffect(() => {
    if (!cachedResults) fetchRivals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleSave(result: RivalResult) {
    const id = `creator_${result.channelId}`;
    if (saved.has(id)) {
      removeItem(id);
      setSaved((prev) => {
        const n = new Set(prev);
        n.delete(id);
        return n;
      });
    } else {
      const item = {
        type: 'creator' as const,
        id,
        channelTitle: result.channelTitle,
        handle: result.handle,
        niche: result.niche,
        subscribersLabel: result.subscribersLabel,
        thumbnail: result.thumbnail,
        savedAt: new Date().toISOString(),
      };
      saveItem(item);
      setSaved((prev) => new Set([...prev, id]));
      onSave?.(result);
    }
  }

  const stageLabel =
    loadStage === 'stage1' ? 'YouTube에서 채널 찾는 중...' :
    loadStage === 'stage2' ? 'AI로 분석 중...' :
    loadStage === 'stage3' ? '썸네일 분석 중...' : '';

  return (
    <div className="screen active v7-screen" id="screen-v7-bench">
      <div className="status-bar"><span>9:41</span><span style={{ fontSize: '12px' }}>􀙇 􀛪</span></div>
      <div className="v7-back-row"><button className="v7-back-btn" onClick={onBack}>←</button></div>
      <div className="v7-content">
        <span className="v7-eyebrow">라이벌 크리에이터</span>
        <div className="v7-title">비슷한 크리에이터<br /><em>구경하기</em></div>

        {(loadStage === 'stage1' || loadStage === 'stage2' || loadStage === 'stage3') && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 0', gap: '16px' }}>
            <div className="v7-spin" />
            <div className="v7-sub">{stageLabel}</div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              {(['stage1', 'stage2', 'stage3'] as const).map((s, i) => (
                <div
                  key={s}
                  style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: (['stage1', 'stage2', 'stage3'] as const).indexOf(loadStage) >= i
                      ? 'var(--primary)' : 'rgba(255,255,255,0.2)',
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {loadStage === 'error' && (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <div className="v7-sub" style={{ marginBottom: '16px', color: 'rgba(255,100,100,0.8)' }}>{errorMsg}</div>
            <button className="v7-btn-ghost" onClick={fetchRivals}>다시 시도</button>
          </div>
        )}

        {loadStage === 'done' && results.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <div className="v7-sub" style={{ marginBottom: '16px' }}>조건에 맞는 채널을 찾지 못했어요</div>
            <button className="v7-btn-ghost" onClick={fetchRivals}>다시 시도</button>
          </div>
        )}

        {results.map((r) => {
          const savedId = `creator_${r.channelId}`;
          const isSaved = saved.has(savedId);
          return (
            <div className="v7-bcard" key={r.channelId} style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setSheet(r)}>
              {r.thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={r.thumbnail}
                  alt={r.channelTitle}
                  style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                />
              ) : (
                <div
                  style={{
                    width: '48px', height: '48px', borderRadius: '50%', flexShrink: 0,
                    background: 'rgba(200,255,87,0.15)', border: '1px solid rgba(200,255,87,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '16px', fontWeight: 700, color: 'var(--primary)',
                  }}
                >
                  {r.channelTitle.charAt(0)}
                </div>
              )}
              <div className="v7-binfo" style={{ flex: 1, minWidth: 0 }}>
                <div className="v7-bname">{r.channelTitle}</div>
                <div className="v7-bmeta">{r.handle} · {r.niche}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                  <div className="v7-bgrow">{r.subscribersLabel} 구독자</div>
                  <span style={{
                    fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '6px',
                    background: r.similarityScore >= 70 ? 'rgba(200,255,87,0.2)' : 'rgba(255,255,255,0.08)',
                    color: r.similarityScore >= 70 ? 'var(--primary)' : 'var(--gray)',
                  }}>
                    {r.similarityScore}% 유사
                  </span>
                </div>
                {r.matchReasons.length > 0 && (
                  <div style={{ display: 'flex', gap: '4px', marginTop: '6px', flexWrap: 'wrap' }}>
                    {r.matchReasons.slice(0, 3).map((reason) => (
                      <span
                        key={reason}
                        style={{
                          fontSize: '10px', padding: '2px 6px', borderRadius: '4px',
                          background: 'rgba(255,255,255,0.06)', color: 'var(--gray)', border: '1px solid rgba(255,255,255,0.1)',
                        }}
                      >
                        {reason}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ color: isSaved ? 'var(--primary)' : 'rgba(255,255,255,0.3)', flexShrink: 0, alignSelf: 'flex-start', padding: '4px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </div>
            </div>
          );
        })}

        {loadStage === 'done' && results.length > 0 && (
          <button className="welcome-start-btn" onClick={onNext} style={{ maxWidth: '100%', margin: '16px 0 0' }}>
            트렌드 보러가기 →
          </button>
        )}
      </div>

      {/* 크리에이터 바텀시트 */}
      {sheet && (
        <>
          <div onClick={() => setSheet(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50 }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'var(--bg-card, #1a1a1a)', borderRadius: '20px 20px 0 0', padding: '20px 20px 36px', zIndex: 51 }}>
            <div style={{ width: '36px', height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px', margin: '0 auto 20px' }} />
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
              {sheet.thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={sheet.thumbnail} alt={sheet.channelTitle} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(200,255,87,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 700, color: 'var(--primary)' }}>{sheet.channelTitle[0]}</div>
              )}
              <div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)' }}>{sheet.channelTitle}</div>
                <div style={{ fontSize: '12px', color: 'var(--gray)', marginTop: '2px' }}>{sheet.handle} · {sheet.subscribersLabel} 구독자</div>
                <div style={{ fontSize: '11px', color: 'var(--gray)', marginTop: '2px' }}>{sheet.niche}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => { toggleSave(sheet); setSheet(null); }}
                style={{ flex: 1, padding: '14px', borderRadius: '14px', border: `1px solid ${saved.has(`creator_${sheet.channelId}`) ? 'var(--primary)' : 'rgba(255,255,255,0.15)'}`, background: saved.has(`creator_${sheet.channelId}`) ? 'rgba(200,255,87,0.1)' : 'rgba(255,255,255,0.05)', color: saved.has(`creator_${sheet.channelId}`) ? 'var(--primary)' : 'var(--ink)', fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill={saved.has(`creator_${sheet.channelId}`) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                {saved.has(`creator_${sheet.channelId}`) ? '저장됨' : '저장하기'}
              </button>
              <a
                href={sheet.channelUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setSheet(null)}
                style={{ flex: 2, padding: '14px', borderRadius: '14px', border: 'none', background: 'var(--primary)', color: 'var(--on-primary, #000)', fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
              >
                채널 보러가기 →
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
