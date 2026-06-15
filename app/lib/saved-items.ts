export type SavedItemType = 'trend' | 'creator' | 'script' | 'conti';

export interface SavedTrend {
  type: 'trend';
  id: string;
  title: string;
  views: string;
  engagementRate: string;
  heatLevel: string;
  savedAt: string;
}

export interface SavedCreator {
  type: 'creator';
  id: string;
  channelTitle: string;
  handle: string;
  niche: string;
  subscribersLabel: string;
  thumbnail?: string;
  savedAt: string;
}

export interface SavedScript {
  type: 'script';
  id: string;
  trendTitle: string;
  items: Array<{ tag: string; text: string }>;
  savedAt: string;
}

export interface SavedConti {
  type: 'conti';
  id: string;
  trendTitle: string;
  trendPoint: string;
  cutsCount: number;
  savedAt: string;
}

export type SavedItem = SavedTrend | SavedCreator | SavedScript | SavedConti;

const KEY = 'pulse_saved_v1';

export function getSavedItems(): SavedItem[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') as SavedItem[]; } catch { return []; }
}

export function saveItem(item: SavedItem): void {
  if (typeof window === 'undefined') return;
  const items = getSavedItems().filter((i) => i.id !== item.id);
  localStorage.setItem(KEY, JSON.stringify([item, ...items]));
}

export function removeItem(id: string): void {
  if (typeof window === 'undefined') return;
  const items = getSavedItems().filter((i) => i.id !== id);
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function isItemSaved(id: string): boolean {
  return getSavedItems().some((i) => i.id === id);
}
