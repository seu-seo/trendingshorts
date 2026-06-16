'use client';

import { useCallback, useState } from 'react';
import type { Category, OnboardingCategory, OnboardingPrefs, PersonaInput, PersonaResult, RivalResult, Trend } from '@/lib/types';
import { saveItem } from '@/lib/saved-items';
import type { GenerateResponse } from '@/lib/prompts/types';
import type { ContiResponse } from '@/app/api/conti/route';
import WelcomeScreen from '@/components/screens/WelcomeScreen';
import ChatbotScreen from '@/components/screens/ChatbotScreen';
import OnboardingPrefsScreen from '@/components/screens/OnboardingPrefsScreen';
import LoadingScreen from '@/components/screens/LoadingScreen';
import PersonaScreen from '@/components/screens/PersonaScreen';
import TrendsScreen from '@/components/screens/TrendsScreen';
import TrendDetailScreen from '@/components/screens/TrendDetailScreen';
import ContentTopicScreen from '@/components/screens/ContentTopicScreen';
import RivalsScreen from '@/components/screens/RivalsScreen';
import ProductionScreen from '@/components/screens/ProductionScreen';
import ScriptScreen from '@/components/screens/ScriptScreen';
import StoryboardScreen from '@/components/screens/StoryboardScreen';
import DashboardScreen from '@/components/screens/DashboardScreen';
import MyScreen from '@/components/screens/MyScreen';
import MyGrowthScreen from '@/components/screens/MyGrowthScreen';
import GoalScreen from '@/components/screens/GoalScreen';
import CompareScreen from '@/components/screens/CompareScreen';
import DeepProfileScreen from '@/components/screens/DeepProfileScreen';

type Screen =
  | 'welcome'
  | 'chatbot'
  | 'prefs'
  | 'loading'
  | 'persona'
  | 'trends'
  | 'trend-detail'
  | 'content-topic'
  | 'rivals'
  | 'production'
  | 'script'
  | 'storyboard'
  | 'dashboard'
  | 'my'
  | 'my-growth'
  | 'goal'
  | 'compare'
  | 'deep-profile';

// 취향설정의 플랫폼(PlatformFilter)을 페르소나 입력(Platform | 'multi')으로 변환.
function toPersonaPlatform(p: OnboardingPrefs['platform']): PersonaInput['platform'] {
  return p === 'all' ? 'multi' : p;
}

// 취향설정의 카테고리 목록 중 첫 preset을 페르소나 카테고리로 사용. 없으면 기본값.
const PRESET_CATEGORIES: OnboardingCategory[] = ['food', 'beauty', 'lifestyle', 'edu', 'gaming', 'fitness', 'art'];
function toPersonaCategory(cats: string[]): OnboardingCategory {
  const preset = cats.find((c): c is Category => (PRESET_CATEGORIES as string[]).includes(c));
  return preset ?? 'lifestyle';
}

// 챗봇 자유 답변 + 취향설정을 /api/persona 입력 스키마로 변환. 답변 컨텍스트는
// styles에 담고, 플랫폼/카테고리는 취향설정 값을 반영한다.
function buildPersonaInput(answers: string[], prefs: OnboardingPrefs | null): PersonaInput {
  return {
    platform: prefs ? toPersonaPlatform(prefs.platform) : 'multi',
    category: prefs ? toPersonaCategory(prefs.categories) : 'lifestyle',
    experience: 1,
    goal: 'growth',
    styles: [...answers, ...(prefs?.categories ?? [])].filter(Boolean),
    pain: 'idea',
    uploadFreq: 'mid',
  };
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('welcome');
  const [answers, setAnswers] = useState<string[]>([]);
  const [prefs, setPrefs] = useState<OnboardingPrefs | null>(null);
  const [personaResult, setPersonaResult] = useState<PersonaResult | null>(null);
  const [selectedTrend, setSelectedTrend] = useState<Trend | null>(null);
  const [cachedTrendId, setCachedTrendId] = useState<number | null>(null);
  const [cachedRivals, setCachedRivals] = useState<RivalResult[] | null>(null);
  const [script, setScript] = useState<GenerateResponse | null>(null);
  const [conti, setConti] = useState<ContiResponse | null>(null);

  const fetchPersona = useCallback(async (chatAnswers: string[], chosenPrefs: OnboardingPrefs | null) => {
    try {
      const res = await fetch('/api/persona', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPersonaInput(chatAnswers, chosenPrefs)),
      });
      const data: PersonaResult = await res.json();
      setPersonaResult(data);
    } catch {
      setPersonaResult(null);
    }
    setScreen('persona');
  }, []);

  // 챗봇 완료 → 취향 설정(q-all)으로 이동.
  const handleChatComplete = useCallback((chatAnswers: string[]) => {
    setAnswers(chatAnswers);
    setScreen('prefs');
  }, []);

  // 취향 설정 완료 → 로딩 후 persona 호출(취향 데이터 포함).
  const handlePrefsComplete = useCallback((chosenPrefs: OnboardingPrefs) => {
    setPrefs(chosenPrefs);
    setScreen('loading');
    void fetchPersona(answers, chosenPrefs);
  }, [answers, fetchPersona]);

  const navigate = useCallback((next: string) => {
    setScreen(next as Screen);
  }, []);

  return (
    <div className="stage">
      <div className="phone">
        <div className="notch"></div>

        {screen === 'welcome' && (
          <WelcomeScreen onStart={() => setScreen('chatbot')} />
        )}

        {screen === 'chatbot' && (
          <ChatbotScreen onComplete={handleChatComplete} />
        )}

        {screen === 'prefs' && (
          <OnboardingPrefsScreen
            onComplete={handlePrefsComplete}
            onBack={() => setScreen('chatbot')}
            onSkip={() => { setScreen('loading'); void fetchPersona(answers, null); }}
          />
        )}

        {screen === 'loading' && (
          <LoadingScreen message="당신에게 맞는 트렌드를 찾고 있어요" />
        )}

        {screen === 'persona' && personaResult && (
          <PersonaScreen
            personaResult={personaResult}
            answers={answers}
            onNext={() => setScreen('trends')}
            onRetryChat={() => setScreen('chatbot')}
          />
        )}

        {screen === 'trends' && (
          <TrendsScreen
            category={personaResult?.personaTagline ?? '지금'}
            platform={prefs?.platform}
            categories={prefs?.categories}
            chatKeyword={answers[0]}
            onSelect={(t) => { setSelectedTrend(t); setScreen('production'); }}
            onBack={() => setScreen('persona')}
            onViewRivals={() => setScreen('rivals')}
            onNavigate={navigate}
          />
        )}

        {screen === 'trend-detail' && selectedTrend && (
          <TrendDetailScreen
            trend={selectedTrend}
            onBack={() => setScreen('dashboard')}
            onMake={(t) => { setSelectedTrend(t); setScreen('content-topic'); }}
          />
        )}

        {screen === 'content-topic' && selectedTrend && (
          <ContentTopicScreen
            trend={selectedTrend}
            onNext={() => setScreen('production')}
            onBack={() => setScreen('trends')}
            onSkip={() => setScreen('trends')}
          />
        )}

        {screen === 'rivals' && (
          <RivalsScreen
            categories={prefs?.categories ?? []}
            chatAnswers={answers}
            cachedResults={cachedRivals ?? undefined}
            onNext={() => setScreen('trends')}
            onBack={() => setScreen('trends')}
            onResultsCached={(r) => setCachedRivals(r)}
            onSave={(r: RivalResult) => saveItem({ type: 'creator', id: `creator_${r.channelId}`, channelTitle: r.channelTitle, handle: r.handle, niche: r.niche, subscribersLabel: r.subscribersLabel, thumbnail: r.thumbnail, savedAt: new Date().toISOString() })}
          />
        )}

        {screen === 'production' && selectedTrend && personaResult && (
          <ProductionScreen
            trend={selectedTrend}
            persona={personaResult}
            initialConti={selectedTrend.id === cachedTrendId ? conti ?? undefined : undefined}
            onNext={() => setScreen('trends')}
            onBack={() => setScreen('trends')}
            onScriptReady={(s) => { setScript(s); setScreen('script'); }}
            onContiReady={(c) => { setConti(c); setScreen('storyboard'); }}
            onContiGenerated={(c) => { setConti(c); setCachedTrendId(selectedTrend.id); }}
          />
        )}

        {screen === 'script' && script && (
          <ScriptScreen
            script={script}
            onNext={() => setScreen('trends')}
            onBack={() => setScreen('production')}
          />
        )}

        {screen === 'storyboard' && conti && (
          <StoryboardScreen
            conti={conti.cuts}
            subtitle={conti.trendPoint}
            onNext={() => setScreen('trends')}
            onBack={() => setScreen('production')}
          />
        )}

        {screen === 'dashboard' && (
          <DashboardScreen onNavigate={navigate} onSelectTrend={(t) => { setSelectedTrend(t); setScreen('trend-detail'); }} />
        )}

        {screen === 'my' && (
          <MyScreen onNavigate={navigate} />
        )}

        {screen === 'my-growth' && (
          <MyGrowthScreen onBack={() => setScreen('my')} />
        )}

        {screen === 'goal' && (
          <GoalScreen onBack={() => setScreen('my')} onCompare={() => setScreen('compare')} />
        )}

        {screen === 'compare' && (
          <CompareScreen onBack={() => setScreen('goal')} />
        )}

        {screen === 'deep-profile' && (
          <DeepProfileScreen
            onBack={() => setScreen('my')}
            onScript={() => setScreen('content-topic')}
            onStoryboard={() => setScreen('storyboard')}
            personaResult={personaResult}
          />
        )}
      </div>
    </div>
  );
}
