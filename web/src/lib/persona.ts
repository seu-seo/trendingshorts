export interface Persona {
  platform: "youtube" | "tiktok" | "instagram" | "all";
  categories: string[];
  goal: "growth" | "monetization" | "hobby";
}

const KEY = "trendpulse_persona";

export function savePersona(p: Persona) {
  localStorage.setItem(KEY, JSON.stringify(p));
}

export function loadPersona(): Persona | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearPersona() {
  localStorage.removeItem(KEY);
}
