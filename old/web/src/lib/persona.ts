import type { PersonaInput, PersonaResult } from "@/lib/types";

const KEY = "shortformpulse_persona";

interface StoredPersona {
  input: PersonaInput;
  result: PersonaResult;
}

export function savePersona(input: PersonaInput, result: PersonaResult): void {
  localStorage.setItem(KEY, JSON.stringify({ input, result }));
}

export function loadPersona(): StoredPersona | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearPersona(): void {
  localStorage.removeItem(KEY);
}

export function hasPersona(): boolean {
  return loadPersona() !== null;
}

// recommend/page.tsx V0 호환용 — feature/recommend 작업 시 제거
export interface Persona {
  platform: "youtube" | "tiktok" | "instagram" | "all";
  categories: string[];
  goal: "growth" | "monetization" | "hobby";
}
