import type { Persona } from './types';

export const PERSONAS: Persona[] = [
  { name: 'THE TRENDSETTER',  tag: '트렌드 감각으로 선점하는 타입', color: '#C8FF57' },
  { name: 'THE NICHE KING',   tag: '깊이 있는 전문성으로 차별화',   color: '#57C8FF' },
  { name: 'THE HOOKER',       tag: '첫 3초로 사로잡는 타입',         color: '#FF8657' },
  { name: 'THE EXPERIMENTER', tag: '독창적인 실험으로 차별화',       color: '#C857FF' },
];

// Map Q5 style keywords → persona index
export function derivePersona(styles: string[] = []): number {
  const map: Record<string, number> = {
    challenge: 0, humor: 0, visual: 0,
    info: 1, honest: 1,
    impact: 2, emotion: 2,
    creative: 3,
  };
  const counts = [0, 0, 0, 0];
  styles.forEach(s => {
    const idx = map[s];
    if (idx !== undefined) counts[idx]++;
  });
  let maxIdx = 0;
  counts.forEach((c, i) => {
    if (c > counts[maxIdx]) maxIdx = i;
  });
  return maxIdx;
}
