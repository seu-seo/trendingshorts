export type QuestionType = 'single' | 'multi' | 'slider';

interface BaseQuestion {
  id: string;
  type: QuestionType;
  title: string;
  hint: string;
}

export interface SingleQuestion extends BaseQuestion {
  type: 'single';
  options: { value: string; label: string; icon: string }[];
}

export interface MultiQuestion extends BaseQuestion {
  type: 'multi';
  max: number;
  options: { value: string; label: string; icon: string }[];
}

export interface SliderQuestion extends BaseQuestion {
  type: 'slider';
  min: number;
  max: number;
  default: number;
  unit: string;
  ticks: string[];
}

export type Question = SingleQuestion | MultiQuestion | SliderQuestion;

// Brand-colored SVG logos (inlined)
const ytLogo = `<svg viewBox="0 0 28 28" width="28" height="28" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="6" width="26" height="16" rx="4" fill="#FF0000"/><polygon points="11.5,10 11.5,18 18.5,14" fill="#ffffff"/></svg>`;
const tiktokLogo = `<svg viewBox="0 0 28 28" width="28" height="28" xmlns="http://www.w3.org/2000/svg"><g><path d="M16 3 L19.5 3 C19.8 5.6 21.4 7 24 7.3 L24 10.7 C22.3 10.6 20.7 10.1 19.5 9.3 L19.5 17.5 C19.5 21.6 16.1 25 12 25 C7.9 25 4.5 21.6 4.5 17.5 C4.5 13.4 7.9 10 12 10 L12 13.5 C9.8 13.5 8 15.3 8 17.5 C8 19.7 9.8 21.5 12 21.5 C14.2 21.5 16 19.7 16 17.5 Z" fill="#25F4EE" transform="translate(-1.5,-1)"/><path d="M16 3 L19.5 3 C19.8 5.6 21.4 7 24 7.3 L24 10.7 C22.3 10.6 20.7 10.1 19.5 9.3 L19.5 17.5 C19.5 21.6 16.1 25 12 25 C7.9 25 4.5 21.6 4.5 17.5 C4.5 13.4 7.9 10 12 10 L12 13.5 C9.8 13.5 8 15.3 8 17.5 C8 19.7 9.8 21.5 12 21.5 C14.2 21.5 16 19.7 16 17.5 Z" fill="#FE2C55" transform="translate(1.5,1)"/><path d="M16 3 L19.5 3 C19.8 5.6 21.4 7 24 7.3 L24 10.7 C22.3 10.6 20.7 10.1 19.5 9.3 L19.5 17.5 C19.5 21.6 16.1 25 12 25 C7.9 25 4.5 21.6 4.5 17.5 C4.5 13.4 7.9 10 12 10 L12 13.5 C9.8 13.5 8 15.3 8 17.5 C8 19.7 9.8 21.5 12 21.5 C14.2 21.5 16 19.7 16 17.5 Z" fill="#ffffff"/></g></svg>`;
const igLogo = `<svg viewBox="0 0 28 28" width="28" height="28" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="igGrad" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stop-color="#FFDC80"/><stop offset="25%" stop-color="#FCAF45"/><stop offset="50%" stop-color="#F77737"/><stop offset="70%" stop-color="#E1306C"/><stop offset="100%" stop-color="#833AB4"/></linearGradient></defs><rect x="2" y="2" width="24" height="24" rx="7" fill="url(#igGrad)"/><circle cx="14" cy="14" r="5.5" fill="none" stroke="#ffffff" stroke-width="2"/><circle cx="20.5" cy="7.5" r="1.4" fill="#ffffff"/></svg>`;
const multiLogo = `<svg viewBox="0 0 28 28" width="28" height="28" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#C8FF57" stroke-width="2"><circle cx="14" cy="14" r="10"/><ellipse cx="14" cy="14" rx="4" ry="10"/><line x1="4" y1="14" x2="24" y2="14"/></svg>`;

export const QUESTIONS: Question[] = [
  {
    id: 'platform',
    type: 'single',
    title: '주로 활동하는<br>플랫폼은?',
    hint: '하나만 선택해주세요',
    options: [
      { value: 'youtube',   label: 'YouTube Shorts',  icon: ytLogo },
      { value: 'tiktok',    label: 'TikTok',          icon: tiktokLogo },
      { value: 'instagram', label: 'Instagram Reels', icon: igLogo },
      { value: 'multi',     label: '멀티 플랫폼',      icon: multiLogo },
    ],
  },
  {
    id: 'category',
    type: 'single',
    title: '내 채널의<br>카테고리는?',
    hint: '주력 카테고리 하나만',
    options: [
      { value: 'food',      label: '요리 / 먹방',       icon: '🍜' },
      { value: 'beauty',    label: '뷰티 / 패션',       icon: '💄' },
      { value: 'lifestyle', label: '라이프스타일 / 일상', icon: '☕' },
      { value: 'edu',       label: '정보 / 자기계발',    icon: '💡' },
      { value: 'gaming',    label: '게임 / 엔터테인먼트', icon: '🎮' },
      { value: 'fitness',   label: '운동 / 건강',        icon: '💪' },
      { value: 'art',       label: '예술 / 창작',        icon: '🎨' },
    ],
  },
  {
    id: 'experience',
    type: 'slider',
    title: '크리에이터<br>경력은?',
    hint: '0 = 시작 전, 5 = 5년 이상',
    min: 0, max: 5, default: 1, unit: '년',
    ticks: ['0', '1', '2', '3', '4', '5+'],
  },
  {
    id: 'goal',
    type: 'single',
    title: '가장 큰<br>목표는?',
    hint: '하나만 골라주세요',
    options: [
      { value: 'growth',    label: '팔로워 증가',  icon: '📈' },
      { value: 'monetize',  label: '수익화',       icon: '💰' },
      { value: 'brand',     label: '브랜드 인지도', icon: '🏷️' },
      { value: 'community', label: '팬덤 / 커뮤니티', icon: '💖' },
    ],
  },
  {
    id: 'style',
    type: 'multi',
    title: '내 콘텐츠<br>스타일은?',
    hint: '최대 3개까지',
    max: 3,
    options: [
      { value: 'humor',     label: '유머·재미',   icon: '😂' },
      { value: 'info',      label: '정보·교육',   icon: '📚' },
      { value: 'emotion',   label: '감성·공감',   icon: '🌙' },
      { value: 'impact',    label: '임팩트·자극', icon: '⚡' },
      { value: 'honest',    label: '솔직·진정성', icon: '💬' },
      { value: 'visual',    label: '비주얼·미감', icon: '🎨' },
      { value: 'challenge', label: '챌린지·트렌드', icon: '🔥' },
      { value: 'creative',  label: '창의·실험',   icon: '✨' },
    ],
  },
  {
    id: 'pain',
    type: 'single',
    title: '가장 큰<br>고민은?',
    hint: '하나만',
    options: [
      { value: 'idea',         label: '아이디어가 없어요',     icon: '💭' },
      { value: 'consistency',  label: '꾸준히 못 하겠어요',     icon: '🔄' },
      { value: 'quality',      label: '퀄리티가 부족해요',     icon: '🎯' },
      { value: 'time',         label: '시간이 부족해요',       icon: '⏱️' },
    ],
  },
  {
    id: 'frequency',
    type: 'slider',
    title: '주당<br>몇 편 올릴 예정?',
    hint: '목표 업로드 빈도',
    min: 1, max: 7, default: 3, unit: '편/주',
    ticks: ['1', '2', '3', '4', '5', '6', '7'],
  },
];
