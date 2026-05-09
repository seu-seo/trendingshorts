import { create } from 'zustand';
import type { PlatformFilter, Category, Persona, PersonaDraft, Tab } from './types';

interface AppState {
  // Tab
  currentTab: Tab;
  setTab: (tab: Tab) => void;

  // Dashboard filters
  filterPlatform: PlatformFilter;
  filterCategory: Category | null;
  searchQuery: string;
  setFilterPlatform: (p: PlatformFilter) => void;
  setFilterCategory: (c: Category | null) => void;
  setSearchQuery: (q: string) => void;
  clearAllFilters: () => void;

  // Persona
  persona: Persona | null;
  setPersona: (p: Persona) => void;

  // Persona modal draft
  modalDraft: PersonaDraft;
  setModalDraft: (d: PersonaDraft) => void;
  toggleDraftStyle: (s: string) => void;

  // Modals
  filterModalOpen: boolean;
  personaModalOpen: boolean;
  setFilterModalOpen: (open: boolean) => void;
  setPersonaModalOpen: (open: boolean) => void;

  // Production — selected trend
  selectedTrendId: number | null;
  setSelectedTrendId: (id: number | null) => void;
}

export const useStore = create<AppState>((set, get) => ({
  currentTab: 'dashboard',
  setTab: (tab) => set({ currentTab: tab }),

  filterPlatform: 'all',
  filterCategory: null,
  searchQuery: '',
  setFilterPlatform: (p) => set({ filterPlatform: p }),
  setFilterCategory: (c) => set({ filterCategory: c }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  clearAllFilters: () => set({ filterPlatform: 'all', filterCategory: null }),

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

  filterModalOpen: false,
  personaModalOpen: false,
  setFilterModalOpen: (open) => set({ filterModalOpen: open }),
  setPersonaModalOpen: (open) => set({ personaModalOpen: open }),

  selectedTrendId: null,
  setSelectedTrendId: (id) => set({ selectedTrendId: id }),
}));
