import { describe, it, expect } from 'vitest';
import { tokenize, matchCategories, CATEGORY_KEYWORDS } from '../src/category-match.js';

describe('tokenize', () => {
  it('쉼표로 분리', () => {
    expect(tokenize('먹방,게임')).toEqual(['먹방', '게임']);
  });

  it('공백으로 분리', () => {
    expect(tokenize('먹방 게임')).toEqual(['먹방', '게임']);
  });

  it('쉼표+공백 혼합', () => {
    expect(tokenize('먹방, 게임, 뷰티')).toEqual(['먹방', '게임', '뷰티']);
  });

  it('소문자 변환', () => {
    expect(tokenize('OOTD 패션')).toEqual(['ootd', '패션']);
  });

  it('빈 문자열은 빈 배열', () => {
    expect(tokenize('')).toEqual([]);
  });

  it('공백만 있으면 빈 배열', () => {
    expect(tokenize('   ')).toEqual([]);
  });

  it('연속 구분자 처리', () => {
    expect(tokenize('먹방,,  게임')).toEqual(['먹방', '게임']);
  });
});

describe('matchCategories', () => {
  it('단일 카테고리 매칭 — food', () => {
    expect(matchCategories('먹방')).toEqual(['food']);
  });

  it('단일 카테고리 매칭 — game', () => {
    expect(matchCategories('게임')).toEqual(['game']);
  });

  it('여러 카테고리 동시 매칭', () => {
    const result = matchCategories('먹방, 게임, 운동');
    expect(result).toContain('food');
    expect(result).toContain('game');
    expect(result).toContain('fitness');
    expect(result).toHaveLength(3);
  });

  it('부분 문자열 매칭 — 키워드 포함 토큰', () => {
    // '브이로그일상' 토큰이 '브이로그' 키워드를 포함해야 함
    const result = matchCategories('브이로그일상');
    expect(result).toContain('vlog');
  });

  it('매칭 안 되는 단어는 무시', () => {
    expect(matchCategories('abcxyz')).toEqual([]);
  });

  it('매칭+비매칭 혼합 — 매칭만 반환', () => {
    const result = matchCategories('먹방 xyz 알수없는단어');
    expect(result).toEqual(['food']);
  });

  it('중복 없이 반환', () => {
    // '요리'와 '음식' 모두 food 키워드 → food 한 번만
    const result = matchCategories('요리, 음식');
    expect(result.filter((c) => c === 'food')).toHaveLength(1);
  });

  it('빈 입력은 빈 배열', () => {
    expect(matchCategories('')).toEqual([]);
  });

  it('카테고리 10개 모두 매칭 가능', () => {
    const allCats = Object.keys(CATEGORY_KEYWORDS);
    const input = '먹방 브이로그 댄스 패션 뷰티 운동 여행 공부 게임 반려동물';
    const result = matchCategories(input);
    for (const cat of allCats) {
      expect(result).toContain(cat);
    }
  });

  it('dance — 춤 매칭', () => {
    expect(matchCategories('춤')).toContain('dance');
  });

  it('pet — 강아지 매칭', () => {
    expect(matchCategories('강아지')).toContain('pet');
  });

  it('travel — 여행 매칭', () => {
    expect(matchCategories('여행')).toContain('travel');
  });

  it('study — 공부 매칭', () => {
    expect(matchCategories('공부')).toContain('study');
  });

  it('fashion — ootd 대소문자 무관', () => {
    expect(matchCategories('OOTD')).toContain('fashion');
  });

  // ── 추가 엣지 케이스 ──────────────────────────────────────

  it('공백만 있는 입력 — 빈 배열', () => {
    expect(matchCategories('   ')).toEqual([]);
  });

  it('탭·줄바꿈 공백 — 빈 배열', () => {
    expect(matchCategories('\t\n')).toEqual([]);
  });

  it('같은 카테고리 키워드 여러 개 — food 한 번만 반환', () => {
    const result = matchCategories('먹방 레시피 음식');
    expect(result.filter((c) => c === 'food')).toHaveLength(1);
  });

  it('같은 단어 반복 — 카테고리 중복 없음', () => {
    const result = matchCategories('게임 게임 게임');
    expect(result.filter((c) => c === 'game')).toHaveLength(1);
  });

  it('구분자 없이 이어붙인 패션 키워드 — fashion 한 번', () => {
    // 'ootd코디패션'은 단일 토큰이지만 세 키워드 포함 → fashion 한 번만
    const result = matchCategories('OOTD코디패션');
    expect(result.filter((c) => c === 'fashion')).toHaveLength(1);
  });

  it('대소문자 혼합 영문 — game 매칭', () => {
    expect(matchCategories('GAME')).toContain('game');
  });

  it('한영 혼합 입력 — 각각 정상 매칭', () => {
    const result = matchCategories('GAME 운동');
    expect(result).toContain('game');
    expect(result).toContain('fitness');
  });

  it('선행·후행 공백 포함 입력 — 정상 매칭', () => {
    expect(matchCategories('  먹방  ')).toContain('food');
  });

  it('쉼표+탭+공백 혼합 구분자', () => {
    const result = matchCategories('먹방,\t게임, 여행');
    expect(result).toContain('food');
    expect(result).toContain('game');
    expect(result).toContain('travel');
  });
});
