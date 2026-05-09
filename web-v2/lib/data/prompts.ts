import type { ProductionPrompt } from '../types';

export const PRODUCTION_PROMPTS: ProductionPrompt[] = [
  {
    toneClass: 'tone-emotional',
    toneLabel: '감성형 · STORY',
    headline: '"진짜 토너 쓰는 법, 알려드릴게요"',
    meta: ['#스킨케어', 'INSTAGRAM REELS', 'RISING'],
    reason:
      '감성·솔직 톤이 강점인 콘텐츠. 흔한 오해를 짚어주는 포맷이라 댓글 참여율이 높습니다. "내가 처음 시작했을 때 헷갈렸던 부분"부터 풀어보세요.',
  },
  {
    toneClass: 'tone-info',
    toneLabel: '정보형 · INFORMATIVE',
    headline: '아침 vs 저녁 스킨케어, 무엇이 다른가',
    meta: ['#K뷰티', 'YOUTUBE SHORTS', 'PEAK'],
    reason:
      '단계별 비교 포맷은 정보 전달에 강력합니다. 성분과 시간대별 효과를 표 형태로 보여주면 신뢰도가 올라갑니다. 30초 안에 핵심만 요약하세요.',
  },
  {
    toneClass: 'tone-trend',
    toneLabel: '후킹형 · TRENDING HOOK',
    headline: '"이거 모르고 토너 쓰면 다 헛수고예요"',
    meta: ['#클렌저', 'TIKTOK', 'RISING'],
    reason:
      '강한 도입부로 첫 3초 시청 유지율 극대화. 단정적 명제 → 반전 → 솔루션 구조로 풀면 좋습니다. 음원도 트렌딩 사운드로 매칭하세요.',
  },
];
