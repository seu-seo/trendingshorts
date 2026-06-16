# Feature: 팔로워 수 한 단계 앞선 크리에이터 추천

## 목표

Shortform Pulse 앱에 "나보다 팔로워 수가 한 단계 앞선 크리에이터 추천" 기능을 구현한다.

사용자가 온보딩에서 입력한 경력(experience 0~5)을 기반으로 현재 팔로워 티어를 추정하고,
한 단계 위 티어의 크리에이터를 카테고리별로 추천한다.

## 팔로워 티어 정의

| Tier | 팔로워 범위 | experience 매핑 |
|------|------------|-----------------|
| 1    | 0 – 1K     | experience 0-1  |
| 2    | 1K – 10K   | experience 2    |
| 3    | 10K – 100K | experience 3    |
| 4    | 100K – 500K| experience 4    |
| 5    | 500K+      | experience 5    |

추천 대상: `currentTier + 1` (최대 tier 5)

## 기술 요구사항

1. **타입 정의**: `app/lib/types.ts`에 `Creator`, `FollowerTier` 추가
2. **추천 로직**: `app/lib/creator-recommend.ts` 신규 파일
   - 카테고리 × 티어별 크리에이터 정적 데이터
   - `experienceToFollowerTier(experience)` 함수
   - `getCreatorRecommendations(category, experience, limit?)` 함수
3. **UI 컴포넌트**: `app/components/recommend/CreatorRecommendSection.tsx`
   - 추천 크리에이터 카드 (handle, 팔로워 수, 성장률, 추천 이유)
   - 현재 티어 vs 목표 티어 표시
4. **페이지 통합**: `/recommend` 페이지에 섹션 추가
5. **테스트**: `app/lib/__tests__/creator-recommend.test.ts`

## 성공 기준

- [ ] 온보딩 완료 사용자에게 카테고리 맞춤 크리에이터 3명 추천
- [ ] experience 0-1 → 1K-10K 크리에이터 추천
- [ ] experience 2 → 10K-100K 크리에이터 추천
- [ ] experience 3 → 100K-500K 크리에이터 추천
- [ ] experience 4-5 → 500K+ 크리에이터 추천
- [ ] 모든 7개 카테고리에 대한 데이터 존재
- [ ] 유닛 테스트 통과 (vitest)

## 반복 로그

### Iteration 1 — 기본 구현
- 타입 정의, 추천 로직, 정적 데이터, 기본 UI 구현

### Iteration 2 — 테스트 & 검증
- 유닛 테스트 작성 + 엣지 케이스 처리 (experience=5, 온보딩 없음)

### Iteration 3 — UI 개선
- 시각적 폴리시: 티어 배지, 성장률 표시, 애니메이션
