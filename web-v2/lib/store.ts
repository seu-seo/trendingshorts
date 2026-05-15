import { create } from 'zustand';
import type { Trend, PlatformFilter, Category, Persona, PersonaDraft, Tab, SurveyAnswers, RecommendResponse, PersonaInput, PersonaResult, AppIntent } from './types';
import { ALL_TRENDS } from './data/trends';

const LS_KEY = 'sfp_onboarding';

function loadOnboarding(): { input: PersonaInput; result: PersonaResult } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveOnboarding(input: PersonaInput, result: PersonaResult) {
  try { localStorage.setItem(LS_KEY, JSON.stringify({ input, result })); } catch {}
}

interface AppState {
  // Tab
  currentTab: Tab;
  setTab: (tab: Tab) => void;

  // Live trends (seeded with mock, replaced by API fetch)
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
  personaInput: PersonaInput | null;
  personaResult: PersonaResult | null;
  appIntent: AppIntent | null;
  completeOnboarding: (input: PersonaInput, result: PersonaResult, intent: AppIntent) => void;
  resetOnboarding: () => void;

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
}

export const useStore = create<AppState>((set, get) => {
  const saved = loadOnboarding();
  return {
  currentTab: 'dashboard',
  setTab: (tab) => set({ currentTab: tab }),

  trends: ALL_TRENDS,
  setTrends: (t) => set({ trends: t }),

  filterPlatform: 'all',
  filterCategory: saved ? (saved.input.category as Category) : null,
  searchQuery: '',
  setFilterPlatform: (p) => set({ filterPlatform: p }),
  setFilterCategory: (c) => set({ filterCategory: c }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  clearAllFilters: () => set({ filterPlatform: 'all', filterCategory: null }),

  onboardingDone: !!saved,
  personaInput: saved?.input ?? null,
  personaResult: saved?.result ?? null,
  appIntent: null,
  completeOnboarding: (input, result, intent) => {
    saveOnboarding(input, result);
    set({
      onboardingDone: true,
      personaInput: input,
      personaResult: result,
      appIntent: intent,
      filterCategory: input.category as Category,
    });
  },
  resetOnboarding: () => {
    try { localStorage.removeItem(LS_KEY); } catch {}
    set({ onboardingDone: false, personaInput: null, personaResult: null, appIntent: null, filterCategory: null });
  },

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
  };
});
