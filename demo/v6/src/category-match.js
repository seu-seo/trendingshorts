// category-match.js
// Q2 주관식 입력 텍스트를 분석해서 기존 카테고리 키(food, vlog, …)로 매핑하는 순수 함수.
// KEYWORDS 사전 방식은 niche.js와 동일 — 각 카테고리별 Korean 키워드 배열로 관리.

export const CATEGORY_KEYWORDS = {
  food:    ['먹방', '음식', '요리', '레시피', '먹', '밥', '식당', '카페', '쿠킹', '맛집'],
  vlog:    ['브이로그', '일상', '데이로그', '하루', '라이프'],
  dance:   ['춤', '댄스', '안무', '커버댄스', '퍼포먼스'],
  fashion: ['패션', '코디', '옷', '스타일', '룩', 'ootd', '쇼핑'],
  beauty:  ['뷰티', '화장', '메이크업', '스킨케어', '피부'],
  fitness: ['운동', '헬스', '다이어트', '요가', '필라테스', '러닝', '등산', '홈트'],
  travel:  ['여행', '투어', '국내여행', '해외여행', '관광'],
  study:   ['공부', '독서', '책', '자기계발', '학습', '스터디', '생산성'],
  game:    ['게임', '게이밍', '롤', '배그', '마인크래프트', '닌텐도', 'game', 'gaming'],
  pet:     ['반려동물', '강아지', '고양이', '펫', '반려'],
};

/**
 * 텍스트를 쉼표·공백으로 분리해 소문자 토큰 배열을 반환한다.
 * @param {string} text
 * @returns {string[]}
 */
export function tokenize(text) {
  return text
    .toLowerCase()
    .split(/[,\s]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
}

/**
 * 입력 텍스트에서 매칭되는 카테고리 키 목록을 반환한다.
 * 각 토큰이 키워드를 부분 문자열로 포함하면 해당 카테고리로 분류된다.
 * 어떤 카테고리에도 매칭되지 않는 토큰은 무시한다.
 *
 * @param {string} text - 사용자 입력 텍스트
 * @returns {string[]} 매칭된 카테고리 키 배열 (중복 없음, 입력 순 보존)
 */
export function matchCategories(text) {
  const tokens = tokenize(text);
  const matched = new Set();
  for (const token of tokens) {
    for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      if (keywords.some((kw) => token.includes(kw))) {
        matched.add(cat);
      }
    }
  }
  return Array.from(matched);
}
