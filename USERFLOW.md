# Shortform Pulse — USERFLOW

> 기준: feat/v8-next.js SPA 아키텍처 기준
> 최종 업데이트: 2026-06-17

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
  ├─ 카테고리 (복수, 필수 1개 이상):
  │    food(먹방/요리) · beauty(뷰티) · dance(댄스)
  │    music(음악) · gaming(게임) · pets(반려동물)
  │    fitness(운동/홈트) · lifestyle(여행/라이프)
  │    ※ 실제 Category 타입과 동일 — 트렌드 필터링에 직접 사용됨
  └─ 연령대: 10s / 20s / 30s / 40s / 50+
      │ [건너뛰기] 가능
      ▼
[Loading]
  POST /api/persona (buildPersonaInput(answers, prefs)) → Gemini
      │
      ▼
[Persona 결과 카드]
  최상단: 닉네임 입력 필드 (필수 — 미입력 시 "트렌드 보러가기" 버튼 비활성화)
  입력 완료 → UserProfile { name } → localStorage + page.tsx state 저장
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
  ├─ 트렌드 카드 목록 (최대 12개)
  │   필터링 로직:
  │   1. prefs.categories로 category 일치 필터 (결과 없으면 전체)
  │   2. engagementRate 내림차순 정렬
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
  MyScreen — localStorage pulse_saved_v1 + user_profile 읽기
  │
  ├─ 프로필 섹션 (최상단)
  │   아바타 (닉네임 첫 글자)
  │   이름: userProfile.name 님
  │   페르소나: personaResult.personaType
  │   태그: prefs.platform 배지 + prefs.categories 태그
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
[Production] — Stage: intent
  ProductionScreen — selectedTrend + personaResult + prefs
  │
  ├─ "무엇을 만들고 싶은지" 텍스트 입력
  │   퀵 칩: 내 일상에 적용 / 챌린지 도전 / 제품·서비스 소개 / 정보·팁 공유
  │
  ├─ [4컷 콘티 만들기] 또는 [대본으로 받기] 클릭
  │
  ▼
[Production] — Stage: loading
  "AI가 대본을 쓰고 있어요..."
  │
  │   Step 1: POST /api/generate
  │   입력: trend + persona (hookPatterns → styles) + concept (intent + trend 기반)
  │   출력: GenerateResponse (3종 대본 — 정보형·스토리형·후킹형)
  │
  │   Step 2: POST /api/conti (콘티 선택 시)
  │   입력: Step 1의 추천 톤 대본 script
  │   출력: ContiResponse (trendPoint + CUT1~4)
  │
  ▼
[Production] — Stage: conti / script
  │
  ├─ 콘티 표시 → ContiResponse
  │   trendPoint 설명 + CUT1~CUT4
  │   각 컷: 장면 설명 + 대사 + 촬영 메모
  │   [저장하기] → saveItem({type:'conti',...}) → My
  │   [스토리보드] → StoryboardScreen
  │
  └─ 대본 표시 → ScriptScreen
      3종 톤 전환 (정보형·스토리형·후킹형)
      추천 톤 ✦ 마커
      [저장하기] → saveItem({type:'script',...}) → My

콘티 4컷:
  CUT1 0–3s   훅 (시선 잡기)
  CUT2 3–6s   전환 (핵심으로)
  CUT3 6–12s  본론 (주요 내용)
  CUT4 12–15s 클로징 (CTA)

캐싱: page.tsx cachedTrendId + conti — 동일 트렌드 재진입 시 즉시 표시
(initialConti prop 있으면 intent 스테이지 건너뜀)
```

---

## 6. API 매핑

| 호출 시점 | 엔드포인트 | 캐싱 |
|----------|-----------|------|
| 온보딩 완료 | POST /api/persona | page state |
| 트렌드 화면 진입 | GET /api/trends | 서버 24h |
| 라이벌 화면 진입 | POST /api/rival (SSE) | page state cachedRivals |
| 제작 intent 확정 (Step 1) | POST /api/generate | 없음 |
| 제작 콘티 생성 (Step 2) | POST /api/conti | page state cachedTrendId+conti |

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
