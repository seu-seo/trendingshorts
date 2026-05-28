// niche.js
// 원본 HTML의 buildDeepResult() 안에 있던 니치 분류 로직을 순수 함수로 분리.
// DOM 조작은 제거하고, "4개의 답변 → 니치 결과 객체"만 반환하도록 재구성.

// 키워드 사전 (원본과 동일)
export const KEYWORDS = {
  food: ['요리', '음식', '레시피', '먹', '카페', '밥', '식당', '쿠킹'],
  fitness: ['운동', '헬스', '다이어트', '요가', '필라', '러닝', '등산'],
  travel: ['여행', '카페', '투어', '맛집', '국내', '해외'],
  tech: ['기기', '테크', '앱', '코딩', '개발', 'ai', 'gadget'],
  selfdev: ['독서', '공부', '자기계발', '책', '루틴', '생산성'],
};

// 니치별 결과 메타데이터 (원본 분기에서 추출)
export const NICHE_RESULTS = {
  food: {
    key: 'food',
    niche: '집밥 & 카페 큐레이터',
    desc: '음식에 진심인 사람이에요. "이건 진짜 맛있다"는 감각이 콘텐츠가 됩니다. 레시피보다 분위기·선택 기준을 담으면 차별화돼요.',
    tags: ['FOOD', 'HOMECAFE', 'RECIPE'],
    format: '30-60초 쇼트폼 — 재료 준비부터 완성까지 원테이크, 또는 카페 브이로그.',
    platform: '인스타그램 릴스 — 음식 콘텐츠 저장률 1위 플랫폼이에요.',
  },
  fitness: {
    key: 'fitness',
    niche: '현실 피트니스 크리에이터',
    desc: '화려한 몸보다 "나처럼 바쁜 사람도 되더라"는 현실감이 강점이에요. 변화 과정 자체가 콘텐츠입니다.',
    tags: ['FITNESS', 'HEALTH', 'ROUTINE'],
    format: '주간 기록 + 챌린지 포맷 — 7일/30일 단위 변화 기록이 팔로우 유지율 높아요.',
    platform: '틱톡 + 유튜브 쇼츠 — 운동 관련 검색량 꾸준히 상위권이에요.',
  },
  travel: {
    key: 'travel',
    niche: '로컬 여행 큐레이터',
    desc: '발품 팔아 찾은 곳들이 남들이 모르는 보물이에요. "어디서 찾았어요?"가 가장 많이 받을 DM이에요.',
    tags: ['TRAVEL', 'LOCAL', 'CURATION'],
    format: '장소 리뷰 + 코스 추천 — "당일치기 OO 코스" 포맷이 저장·공유율 최고예요.',
    platform: '인스타그램 + 유튜브 — 여행 정보는 저장 후 나중에 보는 패턴이 강해요.',
  },
  tech: {
    key: 'tech',
    niche: 'AI · 테크 라이프 크리에이터',
    desc: '새로운 도구를 빠르게 써보고 "이게 진짜 쓸 만해?"를 정직하게 말해주는 타입이에요.',
    tags: ['TECH', 'AI', 'REVIEW'],
    format: '비교 리뷰 + "써봤어요" 포맷 — 신제품/앱 출시 직후 빠른 반응 콘텐츠.',
    platform: '유튜브 쇼츠 + 틱톡 — 테크 리뷰 쇼트폼 수요 급성장 중이에요.',
  },
  selfdev: {
    key: 'selfdev',
    niche: '생산성 · 자기계발 크리에이터',
    desc: '꾸준히 뭔가를 해온 사람이에요. "저는 이렇게 했어요"가 누군가에게는 엄청난 동기부여가 됩니다.',
    tags: ['PRODUCTIVITY', 'SELFDEV', 'ROUTINE'],
    format: '루틴 공유 + 결과 기록 — "OO일 챌린지 결과" 포맷이 저장률 높아요.',
    platform: '유튜브 + 인스타그램 — 자기계발 콘텐츠는 긴 영상도 소화하는 팬층이 있어요.',
  },
  default: {
    key: 'default',
    niche: '라이프스타일 크리에이터',
    desc: '일상 속 소소한 발견을 콘텐츠로 만드는 타입이에요. 특정 트렌드보다 꾸준히 공감받는 루틴이 강점입니다.',
    tags: ['DAILY', 'ROUTINE', 'LIFESTYLE'],
    format: '짧은 브이로그 (60-90초) — 출퇴근·점심·퇴근 루틴 포맷이 잘 맞아요.',
    platform: '인스타그램 릴스 + 틱톡 — 짧고 따뜻한 일상 콘텐츠 수요가 높아요.',
  },
};

/**
 * 키워드 사전에서 텍스트에 포함된 키워드 개수를 센다.
 * @param {string} text - 검사할(이미 소문자화된) 텍스트
 * @param {string[]} keywords - 키워드 배열
 * @returns {number}
 */
export function scoreKeywords(text, keywords) {
  return keywords.filter((k) => text.includes(k)).length;
}

/**
 * 4개의 답변으로 각 니치별 점수를 계산.
 * @param {string[]} answers - 답변 문자열 배열
 * @returns {Record<string, number>}
 */
export function computeScores(answers) {
  const all = answers.map((a) => (a || '').toLowerCase()).join(' ');
  const scores = {};
  for (const [niche, kws] of Object.entries(KEYWORDS)) {
    scores[niche] = scoreKeywords(all, kws);
  }
  return scores;
}

/**
 * 답변으로부터 니치 결과를 결정.
 * 원본 로직: 최고 점수 니치를 고르되, 그 점수가 0이면 default.
 * 동점일 경우 Object.entries 순서(food>fitness>travel>tech>selfdev)상 앞선 것이 선택됨.
 * @param {string[]} answers
 * @returns {object} NICHE_RESULTS 중 하나
 */
export function classifyNiche(answers) {
  const scores = computeScores(answers);
  const top = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  const [topKey, topScore] = top;
  if (topScore > 0 && NICHE_RESULTS[topKey]) {
    return NICHE_RESULTS[topKey];
  }
  return NICHE_RESULTS.default;
}
