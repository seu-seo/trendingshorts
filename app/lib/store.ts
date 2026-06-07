import { create } from 'zustand';
import type { Trend, PlatformFilter, Category, Persona, PersonaDraft, Tab, SurveyAnswers, RecommendResponse, PersonaInput, PersonaResult, AppIntent, AgeGroup } from './types';
import type { InsightsResponse } from '@/app/api/insights/route';

// 개별 localStorage 키 (통일된 이름)
const LS = {
  done:   'onboardingDone',
  plat:   'platform',
  cat:    'category',
  age:    'ageGroup',
  result: 'personaResult',
} as const;

interface OnboardingSave {
  platform: string[];
  category: string;
  ageGroup: string;
  result: PersonaResult | null;
}

function loadOnboarding(): OnboardingSave | null {
  if (typeof window === 'undefined') return null;
  try {
    const done = localStorage.getItem(LS.done);

    if (done !== 'true') {
      // 구포맷 마이그레이션: sfp_onboarding 단일 키
      const legacy = localStorage.getItem('sfp_onboarding');
      if (!legacy) return null;
      const parsed = JSON.parse(legacy);
      if (parsed.input) {
        // 7단계 설문 포맷
        return { platform: [parsed.input.platform as string], category: parsed.input.category as string, ageGroup: '', result: parsed.result ?? null };
      }
      // 직전 단일 키 포맷 { platform, category, ageGroup, result }
      return parsed as OnboardingSave;
    }

    const platform: string[] = JSON.parse(localStorage.getItem(LS.plat) ?? '[]');
    const category  = localStorage.getItem(LS.cat)    ?? '';
    const ageGroup  = localStorage.getItem(LS.age)    ?? '';
    const resultRaw = localStorage.getItem(LS.result);
    const result: PersonaResult | null = resultRaw ? JSON.parse(resultRaw) : null;
    return { platform, category, ageGroup, result };
  } catch { return null; }
}

function saveOnboarding(data: OnboardingSave) {
  try {
    localStorage.setItem(LS.done,   'true');
    localStorage.setItem(LS.plat,   JSON.stringify(data.platform));
    localStorage.setItem(LS.cat,    data.category);
    localStorage.setItem(LS.age,    data.ageGroup);
    if (data.result) localStorage.setItem(LS.result, JSON.stringify(data.result));
  } catch {}
}

interface AppState {
  // Tab
  currentTab: Tab;
  setTab: (tab: Tab) => void;

  trends: Trend[];
  setTrends: (t: Trend[]) => void;

  // Dashboard filters
  filterPlatform: PlatformFilter;
  filterCategory: Category | null;
  searchQuery: string;
  setFilterPlatform: (p: PlatformFilter) => void;
  setFilterCategory: (c: Category | null) => void;
  setSearchQuery: (q: string) => void;
  clearAllFilters: () => void;

  // Onboarding
  onboardingDone: boolean;
  platform: string[];
  category: string;
  ageGroup: AgeGroup | '';
  personaResult: PersonaResult | null;
  setPlatform: (p: string[]) => void;
  setCategory: (c: string) => void;
  setAgeGroup: (a: AgeGroup) => void;
  completeOnboarding: (platform: string[], category: string, ageGroup: AgeGroup, result?: PersonaResult | null) => void;
  resetOnboarding: () => void;

  // 레거시 — 대시보드 배너 등 기존 코드 호환용
  personaInput: PersonaInput | null;
  appIntent: AppIntent | null;

  // Persona (기존 간단 버전 — PersonaModal용)
  persona: Persona | null;
  setPersona: (p: Persona) => void;

  // Persona modal draft
  modalDraft: PersonaDraft;
  setModalDraft: (d: PersonaDraft) => void;
  toggleDraftStyle: (s: string) => void;

  // 추천·제작 탭 상태
  surveyAnswers: SurveyAnswers | null;
  setSurveyAnswers: (a: SurveyAnswers | null) => void;
  recommendResult: RecommendResponse | null;
  setRecommendResult: (r: RecommendResponse | null) => void;
  selectedConceptIndex: number | null;
  setSelectedConceptIndex: (i: number | null) => void;

  // Modals
  filterModalOpen: boolean;
  personaModalOpen: boolean;
  setFilterModalOpen: (open: boolean) => void;
  setPersonaModalOpen: (open: boolean) => void;

  // Production — selected trend
  selectedTrendId: number | null;
  setSelectedTrendId: (id: number | null) => void;

  // Action sheet
  actionSheetTrend: Trend | null;
  setActionSheetTrend: (trend: Trend | null) => void;

  // Insights cache (카테고리별, 페이지 이동 후에도 유지)
  insightsCache: Map<string, InsightsResponse>;
  setInsightsCache: (key: string, value: InsightsResponse) => void;
}

export const useStore = create<AppState>((set, get) => {
  const saved = loadOnboarding();
  return {
  currentTab: 'dashboard',
  setTab: (tab) => set({ currentTab: tab }),

  trends: [],
  setTrends: (t) => set({ trends: t }),

  filterPlatform: 'youtube',
  filterCategory: saved ? (saved.category as Category) : null,
  searchQuery: '',
  setFilterPlatform: (p) => set({ filterPlatform: p }),
  setFilterCategory: (c) => set({ filterCategory: c }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  clearAllFilters: () => set({ filterPlatform: 'youtube', filterCategory: null }),

  onboardingDone: !!saved,
  platform: saved?.platform ?? [],
  category: saved?.category ?? '',
  ageGroup: (saved?.ageGroup as AgeGroup) || '',
  personaResult: saved?.result ?? null,
  setPlatform: (p) => set({ platform: p }),
  setCategory: (c) => set({ category: c }),
  setAgeGroup: (a) => set({ ageGroup: a }),
  completeOnboarding: (platform, category, ageGroup, result = null) => {
    saveOnboarding({ platform, category, ageGroup, result });
    set({
      onboardingDone: true,
      platform,
      category,
      ageGroup,
      personaResult: result,
      filterCategory: category as Category,
    });
  },
  resetOnboarding: () => {
    try {
      Object.values(LS).forEach(k => localStorage.removeItem(k));
      localStorage.removeItem('sfp_onboarding'); // 구포맷 정리
    } catch {}
    set({ onboardingDone: false, platform: [], category: '', ageGroup: '', personaResult: null, personaInput: null, appIntent: null, filterCategory: null });
  },

  // 레거시
  personaInput: null,
  appIntent: null,

  persona: null,
  setPersona: (p) => set({ persona: p }),

  modalDraft: { category: null, styles: [] },
  setModalDraft: (d) => set({ modalDraft: d }),
  toggleDraftStyle: (s) => {
    const draft = get().modalDraft;
    const styles = draft.styles.includes(s)
      ? draft.styles.filter((v) => v !== s)
      : draft.styles.length >= 3
      ? draft.styles
      : [...draft.styles, s];
    set({ modalDraft: { ...draft, styles } });
  },

  surveyAnswers: null,
  setSurveyAnswers: (a) => set({ surveyAnswers: a }),
  recommendResult: null,
  setRecommendResult: (r) => set({ recommendResult: r }),
  selectedConceptIndex: null,
  setSelectedConceptIndex: (i) => set({ selectedConceptIndex: i }),

  filterModalOpen: false,
  personaModalOpen: false,
  setFilterModalOpen: (open) => set({ filterModalOpen: open }),
  setPersonaModalOpen: (open) => set({ personaModalOpen: open }),

  selectedTrendId: null,
  setSelectedTrendId: (id) => set({ selectedTrendId: id }),

  actionSheetTrend: null,
  setActionSheetTrend: (trend) => set({ actionSheetTrend: trend }),

  insightsCache: new Map(),
  setInsightsCache: (key, value) => set((s) => {
    const next = new Map(s.insightsCache);
    next.set(key, value);
    return { insightsCache: next };
  }),
  };
});
