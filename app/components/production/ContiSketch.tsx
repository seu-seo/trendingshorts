'use client';

import type { SketchType } from '@/app/api/conti/route';

/**
 * 콘티용 장면 스케치 — 유료 이미지 생성(Imagen) 대신 비용 0 SVG.
 * 스타일: 마블 카툰(코믹) 패널 — 굵은 잉크 외곽선 + 하프톤(Ben-Day) 점 +
 * 셀 컬러 + 액션 라인. 컷(sketchType)마다 동일한 코믹 패널 포맷으로 그려
 * 4컷이 매번 같은 시각 언어로 나오도록 고정한다.
 */

type Palette = { accent: string; tint: string; dot: string };

// sketchType ↔ 파트(훅/전환/본론/클로징) 색을 1:1 고정 (ContiPanel의 PART_COLOR와 정렬)
const PALETTE: Record<SketchType, Palette> = {
  closeup: { accent: 'var(--color-hot)', tint: 'var(--color-surface)', dot: 'color-mix(in srgb, var(--color-hot) 30%, transparent)' }, // 훅
  upper: { accent: 'var(--color-primary-mid)', tint: 'var(--color-surface)', dot: 'color-mix(in srgb, var(--color-primary-mid) 30%, transparent)' }, // 전환
  split: { accent: 'var(--color-primary)', tint: 'var(--color-surface)', dot: 'color-mix(in srgb, var(--color-primary) 28%, transparent)' }, // 본론
  front: { accent: 'var(--color-warm)', tint: 'var(--color-surface)', dot: 'color-mix(in srgb, var(--color-warm) 28%, transparent)' }, // 클로징
};

const INK = 'var(--color-ink)';
const PAPER = 'var(--color-soft)'; // 인물/오브젝트 셀 컬러
const STROKE = 3.2;

function speedLines(corner: 'tl' | 'tr' | 'bl' | 'br', accent: string) {
  const map = {
    tl: [6, 6, 1],
    tr: [194, 6, -1],
    bl: [6, 107, 1],
    br: [194, 107, -1],
  } as const;
  const [x, y, dir] = map[corner];
  return (
    <g stroke={accent} strokeWidth={1.4} strokeLinecap="round" opacity={0.8}>
      {[0, 1, 2].map((i) => (
        <line key={i} x1={x} y1={y + (corner.startsWith('b') ? -i * 5 : i * 5)} x2={x + dir * (16 - i * 3)} y2={y + (corner.startsWith('b') ? -i * 5 : i * 5)} />
      ))}
    </g>
  );
}

function CloseUp({ accent }: { accent: string }) {
  // 훅 — 충격/고민 표정 클로즈업 + 땀방울 + 집중선
  return (
    <g>
      {speedLines('tl', accent)}
      {speedLines('tr', accent)}
      <g fill="none" stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" strokeLinecap="round">
        {/* 머리 */}
        <path d="M58 30 q42 -22 84 0 q10 30 -4 56 q-10 20 -38 20 q-28 0 -38 -20 q-14 -26 -4 -56 Z" fill={PAPER} />
        {/* 앞머리 */}
        <path d="M60 34 q18 14 40 12 q22 2 40 -12" />
        {/* 찡그린 눈썹 (굵게) */}
        <path d="M74 52 l16 6" strokeWidth={4} />
        <path d="M126 52 l-16 6" strokeWidth={4} />
        {/* 충격 눈 */}
        <circle cx={84} cy={64} r={6} fill="#fff" />
        <circle cx={116} cy={64} r={6} fill="#fff" />
        <circle cx={84} cy={64} r={2.4} fill={INK} stroke="none" />
        <circle cx={116} cy={64} r={2.4} fill={INK} stroke="none" />
        {/* 긴장한 입 */}
        <path d="M88 86 q12 -8 24 0" strokeWidth={4} />
      </g>
      {/* 땀방울 (코믹) */}
      <path d="M150 44 q-7 9 0 16 q7 -7 0 -16 Z" fill={accent} stroke={INK} strokeWidth={1.6} />
    </g>
  );
}

function UpperBody({ accent }: { accent: string }) {
  // 전환 — 아이디어! 별/번쩍임 버스트 + 검지
  return (
    <g>
      {/* 아이디어 버스트 */}
      <g transform="translate(150 34)">
        <path
          d="M0 -22 L6 -7 L22 -8 L10 2 L15 18 L0 9 L-15 18 L-10 2 L-22 -8 L-6 -7 Z"
          fill={accent}
          stroke={INK}
          strokeWidth={2}
          strokeLinejoin="round"
        />
        <text x={0} y={6} textAnchor="middle" fontSize={16} fontWeight="900" fill={INK}>!</text>
      </g>
      <g fill="none" stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" strokeLinecap="round">
        {/* 머리 */}
        <circle cx={74} cy={44} r={26} fill={PAPER} />
        <path d="M52 38 q22 -18 44 0" />
        {/* 밝은 눈 */}
        <circle cx={66} cy={44} r={2.6} fill={INK} stroke="none" />
        <circle cx={84} cy={44} r={2.6} fill={INK} stroke="none" />
        {/* 미소 */}
        <path d="M62 56 q12 10 24 0" strokeWidth={4} />
        {/* 몸통 */}
        <path d="M40 113 q4 -40 34 -40 q14 0 20 14" fill={PAPER} />
        {/* 들어올린 팔 + 검지 */}
        <path d="M92 92 q24 -10 36 -44" fill="none" />
        <path d="M128 50 l0 -16" strokeWidth={5} />
      </g>
    </g>
  );
}

function Split({ accent }: { accent: string }) {
  // 본론 — 코믹 분할: 좌(설명/가리킴) / 우(대상 클로즈업) + 지그재그 분할선
  return (
    <g>
      {/* 지그재그 분할 */}
      <path d="M100 2 l-8 18 l8 16 l-8 18 l8 16 l-8 20 l8 8" fill="none" stroke={accent} strokeWidth={3} strokeLinejoin="round" />
      <g fill="none" stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" strokeLinecap="round">
        {/* 좌: 인물 + 가리키는 손 */}
        <circle cx={42} cy={40} r={20} fill={PAPER} />
        <path d="M26 34 q16 -12 32 0" />
        <circle cx={36} cy={41} r={2.2} fill={INK} stroke="none" />
        <circle cx={50} cy={41} r={2.2} fill={INK} stroke="none" />
        <path d="M34 50 q8 6 16 0" strokeWidth={3.4} />
        <path d="M24 110 q2 -34 18 -34 q12 0 14 12" fill={PAPER} />
        <path d="M56 70 l30 8" strokeWidth={5} />
        {/* 우: 대상(스마트폰/제품) 클로즈업 */}
        <rect x={120} y={34} width={42} height={62} rx={7} fill={PAPER} />
        <rect x={127} y={44} width={28} height={36} rx={2} fill="none" />
        <line x1={134} y1={88} x2={148} y2={88} strokeWidth={3.4} />
      </g>
      {/* 줌 액션 라인 (우) */}
      {speedLines('tr', accent)}
    </g>
  );
}

function Front({ accent }: { accent: string }) {
  // 클로징 — 히어로 정면, 환한 미소, 양팔 들기 + 선버스트 배경 (CTA)
  const rays = Array.from({ length: 12 }, (_, i) => {
    const a = (i * 30 * Math.PI) / 180;
    return (
      <line
        key={i}
        x1={100}
        y1={56}
        x2={100 + Math.cos(a) * 120}
        y2={56 + Math.sin(a) * 120}
        stroke={accent}
        strokeWidth={i % 2 ? 5 : 2.5}
        opacity={0.5}
      />
    );
  });
  return (
    <g>
      <g>{rays}</g>
      <g fill="none" stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" strokeLinecap="round">
        {/* 머리 */}
        <circle cx={100} cy={42} r={24} fill={PAPER} />
        <path d="M78 36 q22 -18 44 0" />
        <circle cx={91} cy={42} r={2.6} fill={INK} stroke="none" />
        <circle cx={109} cy={42} r={2.6} fill={INK} stroke="none" />
        {/* 큰 미소 (이 활짝) */}
        <path d="M84 50 q16 16 32 0 Z" fill="#fff" />
        {/* 몸통 */}
        <path d="M72 113 q2 -36 28 -36 q26 0 28 36" fill={PAPER} />
        {/* 양팔 번쩍 */}
        <path d="M76 84 q-16 -6 -24 -22" />
        <path d="M124 84 q16 -6 24 -22" />
      </g>
    </g>
  );
}

const SKETCH: Record<SketchType, (p: { accent: string }) => React.ReactElement> = {
  closeup: CloseUp,
  upper: UpperBody,
  split: Split,
  front: Front,
};

export default function ContiSketch({
  type,
  label,
}: {
  type: SketchType;
  label?: string;
}) {
  const pal = PALETTE[type] ?? PALETTE.closeup;
  const Drawing = SKETCH[type] ?? CloseUp;
  const dotId = `ht-${type}`;

  return (
    <div className="relative w-full overflow-hidden rounded-[10px]" style={{ aspectRatio: '16 / 9' }}>
      <svg
        viewBox="0 0 200 113"
        preserveAspectRatio="xMidYMid meet"
        className="block w-full h-full"
        role="img"
        aria-label={label ? `콘티 스케치: ${label}` : '콘티 스케치'}
      >
        <defs>
          <pattern id={dotId} width="6" height="6" patternUnits="userSpaceOnUse">
            <circle cx="1.6" cy="1.6" r="1.3" fill={pal.dot} />
          </pattern>
        </defs>
        {/* 패널 배경 + 하프톤 */}
        <rect x={0} y={0} width={200} height={113} fill={pal.tint} />
        <rect x={0} y={0} width={200} height={113} fill={`url(#${dotId})`} />
        {/* 장면 */}
        <Drawing accent={pal.accent} />
        {/* 코믹 패널 굵은 테두리 */}
        <rect x={2.5} y={2.5} width={195} height={108} fill="none" stroke={INK} strokeWidth={5} rx={4} />
        <rect x={6} y={6} width={188} height={101} fill="none" stroke={pal.accent} strokeWidth={1.4} rx={3} opacity={0.7} />
      </svg>
      {label && (
        <span
          className="absolute bottom-1.5 right-2 font-mono text-[8px] font-bold tracking-wide px-1 rounded-sm"
          style={{ color: INK, background: pal.accent }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
