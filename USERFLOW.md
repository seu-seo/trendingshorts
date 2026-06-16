# Shortform Pulse — USERFLOW

> 기준: feat/v8-next.js SPA 아키텍처 기준
> 최종 업데이트: 2026-06-15

---

## 전체 플로우 개요

`page.tsx`가 `Screen` 유니온 타입으로 단일 페이지 내에서 화면을 전환한다. URL 라우팅 없음.

```
[Welcome]
    │
    ▼
[Chatbot]        ← LLM 대화 4문답
    │
    ▼
[Prefs]          ← 플랫폼·카테고리·연령대
    │
    ▼
[Loading → Persona]
    │
    ▼
[Trends] ────────────────► [Rivals]
    │   "비슷한 크리에이터"       │
    │                           저장 → [My]
    │ 카드 탭 → 바텀시트
    │   ├─ 저장하기
    │   └─ 이걸로 만들기 →
    ▼
[Production]
    │
    ├─ [Script]
    └─ [Storyboard]
    저장 → [My]

탭 바: [트렌드] | [마이페이지] (Trends 화면에만 표시)
```

---

## 1. ONBOARDING

```
[Welcome]
  검정 배경 + 타이포
      │
      ▼
[Chatbot]
  LLM 대화형 큐레이터 (ChatbotScreen)
  4문답 자유 텍스트 → answers: string[] 수집
      │
      ▼
[Prefs] — OnboardingPrefsScreen
  ┌─ 플랫폼: tiktok | instagram | youtube | all
  ├─ 카테고리 (복수):
  │    food(먹방/요리) · beauty(뷰티) · fitness(운동/홈트)
  │    lifestyle(여행/라이프) · gaming(게임) · art(패션/아트) · edu(교육/정보)
  │    ※ 실제 Category 타입과 동일 — 트렌드 필터링에 직접 사용됨
  └─ 연령대: 10s / 20s / 30s / 40s / 50+
      │ [건너뛰기] 가능
      ▼
[Loading]
  POST /api/persona (buildPersonaInput(answers, prefs)) → Gemini
      │
      ▼
[Persona 결과 카드]
      │
      ▼
[Trends 화면]
```

---

## 2. 트렌드 화면

```
[Trends]
  TrendsScreen — GET /api/trends (서버 24h 캐시)
  │
  ├─ 검색바 (키워드 실시간 필터)
  │
  ├─ 트렌드 카드 목록 (최대 12개)
  │   필터링 순서:
  │   1. prefs.categories로 category 일치 필터
  │   2. chatbot 첫 답변 키워드로 관련 항목 상위 정렬
  │   3. 결과 없으면 전체 중 engagementRate 정렬
  │
  │   카드 탭 → [바텀시트]
  │       ├─ 저장하기 (♥) → pulse_saved_v1 → MyScreen
  │       └─ 이걸로 만들기 → → [Production]
  │
  │   카드 ♥ 버튼 (우상단) → 즉시 저장 (바텀시트 없이)
  │
  └─ [먼저 비슷한 크리에이터 구경하기] → [Rivals]

탭 바: 트렌드(active) | 마이페이지 → [My]
```

**데이터 제약:**
- growth rate 산출 불가 (TikTok·IG 동일 영상 재조회 구조 없음)
- 플랫폼 간 동일 기준 순위화 불가

---

## 3. 라이벌 화면

```
[Rivals]
  RivalsScreen — POST /api/rival (SSE)
  │
  ├─ 진행 표시기 (3단계 도트)
  │   stage1: YouTube에서 채널 찾는 중...
  │   stage2: AI로 분석 중...
  │   stage3: 썸네일 분석 중...
  │
  ├─ 크리에이터 카드 목록
  │   channelTitle · handle · niche · 구독자 · 유사도%
  │   matchReasons 태그
  │
  │   카드 탭 → [바텀시트]
  │       ├─ 저장하기 (♥) → pulse_saved_v1 → MyScreen
  │       └─ 채널 보러가기 → (YouTube 외부 링크)
  │
  └─ [트렌드 보러가기 →] → [Trends]

캐싱: page.tsx의 cachedRivals — 재방문 시 재API 호출 없음
```

---

## 4. 마이 화면

```
[My]
  MyScreen — localStorage pulse_saved_v1 읽기
  │
  ├─ 저장한 트렌드
  │   제목 · 조회수 · heatLevel 배지 · ×삭제
  │
  ├─ 저장한 크리에이터
  │   썸네일 · 채널명 · 핸들 · 구독자 · ×삭제
  │
  ├─ 저장한 대본
  │   HOOK · BODY · CTA · ×삭제
  │
  └─ 저장한 콘티
      trendPoint + 4컷 · ×삭제
```

---

## 5. 제작(Production) 플로우

진입: Trends 바텀시트 → "이걸로 만들기 →"

```
[Production]
  ProductionScreen — selectedTrend + personaResult
  │
  ├─ 마운트 즉시 POST /api/conti 호출
  │   (initialConti prop이 있으면 재호출 없음 — 캐시 재사용)
  │
  ├─ 콘티 로딩 중: 스피너 표시
  │
  ├─ 콘티 완료 → ContiResponse 표시
  │   trendPoint 설명 + CUT1~CUT4
  │   각 컷: 장면 설명 + 대사 + 촬영 메모
  │
  ├─ [저장하기] → saveItem({type:'conti',...}) → My
  │
  ├─ [대본 보기] → POST /api/generate → [Script]
  │
  └─ [스토리보드 보기] → [Storyboard]

콘티 4컷:
  CUT1 0–3s   훅 (시선 잡기)
  CUT2 3–6s   전환 (핵심으로)
  CUT3 6–12s  본론 (주요 내용)
  CUT4 12–15s 클로징 (CTA)

캐싱: page.tsx cachedTrendId + conti — 동일 트렌드 재진입 시 즉시 표시
```

---

## 6. API 매핑

| 호출 시점 | 엔드포인트 | 캐싱 |
|----------|-----------|------|
| 온보딩 완료 | POST /api/persona | page state |
| 트렌드 화면 진입 | GET /api/trends | 서버 24h |
| 라이벌 화면 진입 | POST /api/rival (SSE) | page state cachedRivals |
| 제작 화면 진입 | POST /api/conti | page state cachedTrendId+conti |
| 대본 요청 | POST /api/generate | 없음 |

---

## 7. 디자인 시스템

```css
--bg:       #0A0A0A   /* 메인 배경 — 순수 블랙 */
--bg-card:  #1A1A1A   /* 카드 표면 */
--primary:  #C8FF57   /* Acid Lime — 메인 액센트 */
--up:       #FF4274   /* 성장/상승 수치 */
--down:     #38B6FF   /* 하락 */
--neutral:  #10B981   /* 중립/플랫폼 태그 */
--ink:      #FFFFFF   /* 메인 텍스트 */
--ink-soft: #A1A1AA   /* 서브 텍스트 */
```

| 역할 | 폰트 |
|------|------|
| 임팩트 헤딩 | 카페24 당당해 |
| 친근한 헤딩 | 카페24 써라운드 |
| 본문 | Pretendard |
| 데이터·레이블 | Inter |

**원칙:** 이모지·이미지 금지 / 그라디언트 없음 / 액센트는 CTA·핵심 수치에만 / WHY 인사이트 필수

---

## 8. 미확정 항목

| 항목 | 현황 |
|------|------|
| 저장 데이터 영속성 | localStorage → Supabase DB 연동 예정 |
| 콘티 이미지 품질 | Imagen 유료 키 없으면 텍스트만 표시 |
| 대본/콘티 캡처 저장 | html2canvas 다운로드 기능 예정 |
| This Week's Insights KPI | 계정 연동 전까지 `--` 표시 |
