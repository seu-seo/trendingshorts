import type { UserProfile } from './types';

const LS_KEY = 'user_profile';

export function loadUserProfile(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as UserProfile) : null;
  } catch { return null; }
}

export function saveUserProfile(profile: UserProfile): void {
  try { localStorage.setItem(LS_KEY, JSON.stringify(profile)); } catch {}
}
