# SPEC — Shortform Pulse v7

> 기능 명세 (기존 구현 기반 + v7 플로우 재정렬)  
> v7 · 2026-06-13

---

## 0. v7에서 바뀐 것

기능은 이미 다 개발되어 있음. **유저 플로우와 순서, 디자인만 재정렬.**

| | 기존 | v7 |
|---|------|-----|
| 진입 | 트렌드 피드 먼저 | 온보딩 Why Tree 먼저 |
| 온보딩 | 3문항 (간소화 버전) | LLM 대화형 (Claude) |
| 온보딩 AI | Gemini | **Claude** (동기·강점 추론 품질) |
| 핵심 동선 | 트렌드 → 제작 | 온보딩 대화 → 결과 → 트렌드 + 벤치마크 → 제작 |
| 추가 | — | 벤치마크 크리에이터 추천 |
| 디자인 | 다크 (#0A0A0A) | **화이트 배경, 챌린저스 앱 톤** |

---

## 1. 온보딩 (`/onboarding`)

| 항목 | 내용 |
|------|------|
| 방식 | LLM 대화형 (정해진 문항 아님, 답변 따라 이어짐) |
| 대화 흐름 | 동기 → 강점 → 즐거움 → 타깃 |
| API | `POST /api/persona` (Claude) |
| 출력 | 콘텐츠 방향, 강점 키워드, 추천 타깃, 추천 포맷, 첫 영상 제안 |
| 저장 | localStorage (1인 1회, 결과 캐싱) |
| CTA | "그럼 첫 영상 한 번 찍어볼까요?" — 친근한 행동 유도 |

**API Contract:**
```typescript
// POST /api/persona
Request: {
  conversation: { role: 'user' | 'assistant'; content: string }[]
}
Response: {
  direction: string;      // 콘텐츠 방향 한 줄
  strengthKeywords: string[];
  recommendedTarget: string;
  recommendedFormat: string;
  firstTopicSuggestion: string; // "뭐부터 찍을까" 제안
}
```

---

## 2. 트렌드 레퍼런스 (`/trends`)

| 항목 | 내용 |
|------|------|
| 데이터 | YouTube live + TikTok·IG 스냅샷 |
| 지표 | ER% (Engagement Rate) + HOT/WARM/COLD |
| 분석 | Gemini로 "왜 떴는지" 한 줄 추론 |
| API | `GET /api/trends`, `POST /api/insights` |

> ER = {(좋아요+댓글) / 조회수} × 100

---

## 3. 라이벌 크리에이터 (`/rivals`)

| 항목 | 내용 |
|------|------|
| 추천 기준 | 같은 주제 + 비슷한(약간 앞선) 팔로워 수준 |
| 표시 | 핸들, 팔로워, 주제, 최근 성장 |
| 데이터 | 스냅샷 (수동 큐레이션 가능) |

> ⚠️ 위축 방지 프레이밍 필수

---

## 4. 제작 (`/create`)

| 항목 | 내용 |
|------|------|
| 스크립트 | 대본 3종 (정보형/스토리형/훅형) |
| 콘티 | 4컷 (훅 0-3s / 전환 3-6s / 본론 6-12s / 클로징 12-15s) |
| API | `POST /api/generate`, `POST /api/conti` |
| 저장 | localStorage |
| 폴백 | 503 시 모델 자동 폴백, 키 없으면 SVG 스케치 |

---

## 5. 기존 구현 재활용 매핑

| v7 화면 | 기존 코드 위치 (참고) | 작업 |
|---------|-------------------|------|
| 온보딩 | `web/app/onboarding/` | 3문항 → 7문항 확장, Gemini → Claude |
| 트렌드 | `web/app/` 대시보드 | 화이트 테마로 재스킨 |
| 제작 | `web/app/api/generate`, `/conti` | 그대로 사용 |
| 라이벌 | (신규) | 크리에이터 비교 컴포넌트 활용 |

---

## 6. 디자인 시스템 (v7 — 화이트)

```css
--bg:       #FFFFFF   /* 메인 배경 */
--bg-soft:  #F7F8FA   /* 카드/섹션 */
--border:   #E8EAED   /* 보더 */
--primary:  #3B82F6   /* 메인 액센트 (신뢰감 블루) */
--ink:      #1A1A1A   /* 메인 텍스트 */
--ink-soft: #6B7280   /* 서브 텍스트 */
--up:       #10B981   /* 상승/긍정 */
--hot:      #EF4444   /* HOT */
```

> 챌린저스 앱처럼 깔끔하고 가독성 높게. 화이트 기반, 둥근 모서리, 충분한 여백.

---

## 7. 미확정 항목

| 항목 | 현황 |
|------|------|
| 온보딩 7문항 최종 문구 | Why Tree 깊이 vs 가벼움 균형 조정 필요 |
| 라이벌 추천 알고리즘 | 매칭 기준 구체화 필요 |
| ER 산출 | TikTok·IG 스냅샷 데이터 정합성 확인 |
| 리텐션 트리거 | 주간 트렌드 갱신 푸시 구현 여부 |
