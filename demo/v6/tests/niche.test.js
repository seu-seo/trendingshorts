import { describe, it, expect } from 'vitest';
import {
  scoreKeywords,
  computeScores,
  classifyNiche,
  NICHE_RESULTS,
  KEYWORDS,
} from '../src/niche.js';

describe('scoreKeywords', () => {
  it('포함된 키워드 개수를 센다', () => {
    expect(scoreKeywords('나는 요리와 음식이 좋아', ['요리', '음식', '여행'])).toBe(2);
  });

  it('하나도 없으면 0', () => {
    expect(scoreKeywords('아무 관련 없는 문장', ['요리', '운동'])).toBe(0);
  });

  it('빈 문자열은 0', () => {
    expect(scoreKeywords('', ['요리'])).toBe(0);
  });
});

describe('computeScores', () => {
  it('모든 니치 키를 포함한 점수 객체를 반환', () => {
    const scores = computeScores(['', '', '', '']);
    expect(Object.keys(scores).sort()).toEqual(
      Object.keys(KEYWORDS).sort()
    );
  });

  it('대소문자 무관하게 매칭 (AI → ai)', () => {
    const scores = computeScores(['AI 개발 좋아함', '', '', '']);
    expect(scores.tech).toBeGreaterThanOrEqual(2); // 'ai', '개발'
  });

  it('여러 답변을 합쳐서 점수 계산', () => {
    const scores = computeScores(['운동', '헬스', '다이어트', '러닝']);
    expect(scores.fitness).toBe(4);
  });
});

describe('classifyNiche', () => {
  it('운동 관련 답변 → fitness', () => {
    const result = classifyNiche(['헬스장 가는 거', '운동 장비', '다이어트 식단', '러닝하는 직장인']);
    expect(result.key).toBe('fitness');
    expect(result.niche).toBe(NICHE_RESULTS.fitness.niche);
  });

  it('음식 관련 답변 → food', () => {
    const result = classifyNiche(['혼밥 레시피', '식당 투어는 아니고 집밥', '요리 칭찬받음', '밥 좋아하는 사람']);
    expect(result.key).toBe('food');
  });

  it('테크 관련 답변 → tech', () => {
    const result = classifyNiche(['앱 개발', '코딩', 'ai 기기 리뷰', '테크 좋아하는 사람']);
    expect(result.key).toBe('tech');
  });

  it('자기계발 관련 답변 → selfdev', () => {
    const result = classifyNiche(['독서', '공부 루틴', '생산성 책', '자기계발 하는 대학생']);
    expect(result.key).toBe('selfdev');
  });

  it('아무 키워드도 없으면 default', () => {
    const result = classifyNiche(['그냥 멍하니', '특별한 거 없음', '평범함', '딱히']);
    expect(result.key).toBe('default');
  });

  it('빈 답변 4개 → default', () => {
    expect(classifyNiche(['', '', '', '']).key).toBe('default');
  });

  it('동점일 때 Object.entries 순서상 앞선 니치 선택 (food vs fitness)', () => {
    // '카페'는 food와 travel 양쪽 키워드. food가 앞이므로 food 우선.
    const result = classifyNiche(['카페', '', '', '']);
    // food, travel 둘 다 1점이지만 food가 먼저 → food
    expect(result.key).toBe('food');
  });

  it('반환 객체는 필수 필드를 모두 갖춘다', () => {
    const result = classifyNiche(['운동']);
    expect(result).toHaveProperty('niche');
    expect(result).toHaveProperty('desc');
    expect(result).toHaveProperty('tags');
    expect(result).toHaveProperty('format');
    expect(result).toHaveProperty('platform');
    expect(Array.isArray(result.tags)).toBe(true);
  });
});
