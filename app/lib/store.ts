import { create } from 'zustand';
import type { Trend, PlatformFilter, Category, Persona, PersonaDraft, Tab, SurveyAnswers, RecommendResponse, PersonaInput, PersonaResult, AppIntent, UploadRecord } from './types';
import type { InsightsResponse } from '@/app/api/insights/route';
import { ALL_TRENDS } from './data/trends';

const LS_KEY = 'sfp_onboarding';
const LS_UPLOADS_KEY = 'sfp_uploads';

const SEED_RECORDS: UploadRecord[] = [
  { id: 'seed-1', date: '2026-05-23', platform: 'instagram', title: '직장인 아침 루틴 5분 ver.', note: '조회수 반응 좋았음, 다음엔 썸네일 바꿔볼 것' },
  { id: 'seed-2', date: '2026-05-20', platform: 'instagram', title: '런닝 전 스트레칭 루틴', url: 'https://www.instagram.com/reel/example1' },
  { id: 'seed-3', date: '2026-05-15', platform: 'instagram', title: '퇴근 후 10km 도전 브이로그' },
  { id: 'seed-4', date: '2026-05-10', platform: 'youtube',   title: '초보 러너를 위한 페이스 조절법', note: '유튜브 첫 업로드' },
  { id: 'seed-5', date: '2026-05-05', platform: 'instagram', title: '한 달 운동 결과 공개 📊' },
];

function loadUploadRecords(): UploadRecord[] {
  if (typeof window === 'undefined') return SEED_RECORDS;
  try {
    const raw = localStorage.getItem(LS_UPLOADS_KEY);
    if (!raw) {
      // 첫 방문 시 시드 데이터로 초기화
      saveUploadRecords(SEED_RECORDS);
      return SEED_RECORDS;
    }
    return JSON.parse(raw);
  } catch { return SEED_RECORDS; }
}

function saveUploadRecords(records: UploadRecord[]) {
  try { localStorage.setItem(LS_UPLOADS_KEY, JSON.stringify(records)); } catch {}
}

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

  // Action sheet
  actionSheetTrend: Trend | null;
  setActionSheetTrend: (trend: Trend | null) => void;

  // Insights cache (카테고리별, 페이지 이동 후에도 유지)
  insightsCache: Map<string, InsightsResponse>;
  setInsightsCache: (key: string, value: InsightsResponse) => void;

  // Upload records (마이페이지 — localStorage 영속)
  uploadRecords: UploadRecord[];
  addUploadRecord: (record: Omit<UploadRecord, 'id'>) => void;
  updateUploadRecord: (id: string, data: Partial<Omit<UploadRecord, 'id'>>) => void;
  deleteUploadRecord: (id: string) => void;

  // 업로드 주기 목표 (설정 페이지 연동 예정, 단위: 일)
  uploadGoalDays: number;
  setUploadGoalDays: (days: number) => void;
}

export const useStore = create<AppState>((set, get) => {
  const saved = loadOnboarding();
  return {
  currentTab: 'dashboard',
  setTab: (tab) => set({ currentTab: tab }),

  trends: ALL_TRENDS,
  setTrends: (t) => set({ trends: t }),

  filterPlatform: 'youtube',
  filterCategory: saved ? (saved.input.category as Category) : null,
  searchQuery: '',
  setFilterPlatform: (p) => set({ filterPlatform: p }),
  setFilterCategory: (c) => set({ filterCategory: c }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  clearAllFilters: () => set({ filterPlatform: 'youtube', filterCategory: null }),

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

  actionSheetTrend: null,
  setActionSheetTrend: (trend) => set({ actionSheetTrend: trend }),

  insightsCache: new Map(),
  setInsightsCache: (key, value) => set((s) => {
    const next = new Map(s.insightsCache);
    next.set(key, value);
    return { insightsCache: next };
  }),

  uploadRecords: loadUploadRecords(),
  addUploadRecord: (record) => {
    const newRecord: UploadRecord = { ...record, id: `${Date.now()}-${Math.random().toString(36).slice(2)}` };
    const records = [...get().uploadRecords, newRecord];
    saveUploadRecords(records);
    set({ uploadRecords: records });
  },
  updateUploadRecord: (id, data) => {
    const records = get().uploadRecords.map(r => r.id === id ? { ...r, ...data } : r);
    saveUploadRecords(records);
    set({ uploadRecords: records });
  },
  deleteUploadRecord: (id) => {
    const records = get().uploadRecords.filter(r => r.id !== id);
    saveUploadRecords(records);
    set({ uploadRecords: records });
  },

  uploadGoalDays: 5, // 목 페르소나: 5일 단위 업로드
  setUploadGoalDays: (days) => set({ uploadGoalDays: days }),
  };
});
