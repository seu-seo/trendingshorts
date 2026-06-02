# Pulse v6 — Architecture Analysis

> 작성일: 2026-06-02  
> 대상 파일: `demo/v6/index.html` + `src/`

---

## 1. 파일 구조

```
demo/v6/
├── index.html          # 6,758줄 — CSS + HTML + JS 전부 인라인
├── src/                # 순수 함수 추출본 (테스트 전용)
│   ├── state.js        # 저장 토글, 스탬프, 목표 진행률 (불변 스타일)
│   ├── niche.js        # 키워드 점수 → 니치 분류
│   ├── category-match.js  # Q2 자유입력 → 카테고리 매핑
│   ├── onboarding.js   # SVG ring dashoffset 계산
│   └── graph.js        # SVG 라인 그래프 계산
├── tests/              # Vitest 단위 테스트
├── SPEC.md             # 제품 스펙
├── CONTEXT.md          # 작업 인계 문서
└── ARCHITECTURE.md     # 이 파일
```

`index.html` 안의 논리적 섹션:

| 구간 (추정) | 내용 |
|---|---|
| 1–67줄 | CSS 변수 (디자인 토큰) |
| 68–~2500줄 | 컴포넌트별 CSS |
| ~2500–~5000줄 | HTML 화면 7개 |
| ~5000–6758줄 | `<script>` 전역 JS (~1700줄) |

---

## 2. 기술 스택

| 항목 | 내용 |
|---|---|
| UI | Vanilla HTML/CSS/JS, 프레임워크 없음 |
| 스타일 | CSS Custom Properties (디자인 토큰 완비) |
| 차트 | SVG 직접 렌더링 (도넛 링, 라인 그래프) |
| 테스트 | Vitest (`src/` 순수 함수 단위 테스트) |
| 폰트 | Bebas Neue, Instrument Sans, JetBrains Mono, Pretendard (CDN) |

**주요 패턴:**

- **Screen stack** — `.screen` + `.active` CSS class toggle (`goTo(id)`)
- **Tab routing** — `switchTab('trend' | 'my')`
- **Bottom sheet** — `.open` class toggle (로그 입력, 목표 설정)
- **Template literal rendering** — `innerHTML = items.map(…).join('')`
- **이중 구조** — `index.html` 안 JS는 DOM 직접 뮤테이트, `src/*.js`는 동일 로직을 순수 함수로 재추출. 테스트를 위해 분리했으나 index.html에서 import하지 않음

---

## 3. 데이터 흐름과 상태 관리

### 전역 상태 (in-memory, 새로고침 시 리셋)

```js
answers          // { platforms[], categories[], age }
savedTrends[]    // 저장된 트렌드
savedContents[]  // 저장된 대본/콘티
sampleProgress   // { answered, total, isSampleMode }
uploadLogs       // { tiktok:[], instagram:[], youtube:[] }
stampCount       // 업로드 스탬프 숫자
```

### 흐름도

```
온보딩 선택 → answers 업데이트
  → updateDonutChart()   링 차트 재계산
  → updateHeadlineTag()  헤더 텍스트 개인화

트렌드 저장 → saveTrend()
  → savedTrends[] 뮤테이트
  → renderCollection()   DOM 재렌더

콘텐츠 폼 제출 → submitDeepProfile()
  → buildDeepResult()
  → classifyNiche()      키워드 점수 기반 니치 결정
  → 결과 카드 DOM 주입

업로드 기록 → submitLog()
  → uploadLogs[] 뮤테이트
  → renderPlatformGraph() SVG path 재계산
```

### 주요 JS 함수

| 함수 | 역할 |
|---|---|
| `goTo(id)` | 화면 전환 |
| `skipToSampleDashboard()` | 온보딩 스킵, 샘플 모드 진입 |
| `updateDonutChart()` | 링 차트 + 기회 지수 업데이트 |
| `calcOpportunityScore()` | 연령대 × 카테고리 × 플랫폼 보정값 계산 |
| `submitDeepProfile()` | 7문항 수집 → AI 분석 결과 표시 |
| `buildDeepResult()` | 키워드 분류 → 니치 카드 렌더링 |
| `saveTrend()` / `renderCollection()` | 트렌드 저장/컬렉션 렌더 |
| `saveContent()` / `renderSavedContents()` | 대본/콘티 저장/렌더 |
| `renderPlatformGraph()` | SVG 라인 그래프 재계산 |

---

## 4. 컴포넌트 구조 (논리적 분해)

```
App
├── Navigation (TabBar)
│
├── screens/
│   ├── WelcomeScreen
│   ├── OnboardingScreen
│   │   ├── PlatformStep
│   │   ├── CategoryStep      ← matchCategories() 사용
│   │   └── AgeStep
│   ├── LoadingScreen
│   │
│   ├── DashboardScreen
│   │   ├── AiBriefingCard    ← 앱의 핵심 차별점
│   │   ├── LivePulseModeRow  ← 가로 스크롤 + PulseCard[]
│   │   ├── DonutRingChart    ← SVG, calcOpportunityScore()
│   │   ├── HashtagBubbles
│   │   ├── TrendList
│   │   │   └── TrendCard     ← 저장 버튼 포함
│   │   └── SoftPromptBanner  ← Smart Onboarding
│   │
│   └── MyPageScreen
│       ├── ProfileCard
│       ├── WeeklyInsights
│       ├── UploadLogSection  ← renderPlatformGraph()
│       ├── GoalTracker       ← 스탬프, 목표 설정
│       ├── Collection        ← renderCollection()
│       └── SavedContents     ← renderSavedContents()
│
└── flows/
    ├── ContentCreationFlow
    │   ├── DeepProfileForm
    │   ├── NicheResultCard   ← classifyNiche()
    │   ├── ScriptForm → ScriptResult
    │   └── StoryboardForm → StoryboardResult
    ├── LogSheet (bottom sheet)
    └── GoalEditSheet (bottom sheet)
```

---

## 5. 확장 전략

### Option A: Vanilla JS 모듈화 (점진적)

현재 `src/*.js` 패턴을 index.html에도 적용. 빌드 툴 없이 `<script type="module">` 하나로 가능.

```
src/
├── state/         # 이미 시작됨
├── components/    # renderTrendCard(data) 같은 렌더 함수
├── screens/       # 각 화면 JS
├── data/          # mock 데이터 분리 (hardcoded → data.js)
└── main.js
```

적합한 시점: 데이터 분리, localStorage 연동 수준까지.

---

### Option B: React + Vite (권장 — API 연동 시)

```
src/
├── components/    # TrendCard, PulseCard, DonutChart 등
├── screens/       # 화면별 컴포넌트
├── hooks/         # useOnboarding, useSavedTrends
├── store/         # Zustand (전역 변수 대체)
├── data/          # mock → API fetch
└── main.tsx
```

현재 패턴과의 대응:

| 현재 | React 대응 |
|---|---|
| 전역 변수 | Zustand store |
| `goTo(id)` | React Router |
| `innerHTML =` | JSX 컴포넌트 |
| CSS 변수 시스템 | 그대로 유지 |
| `src/*.js` 순수 함수 | 그대로 import |

`src/*.js`의 순수 함수들이 이미 분리되어 있어 React 마이그레이션 시 재작성 비용이 낮다.

---

## 6. 현재 구조의 한계

- **단일 전역 상태** — 상태와 뷰가 결합되어 있어 추론이 어려움
- **DOM 직접 뮤테이션** — 사이드 이펙트 추적 불가
- **논리 중복** — `src/*.js`와 `index.html` 인라인 JS가 같은 로직을 두 곳에서 관리
- **데이터 하드코딩** — 트렌드/AI 텍스트가 HTML에 직접 삽입
- **localStorage 없음** — 새로고침 시 저장 내용 전부 초기화

---

## 7. 다음 우선순위 (SPEC.md 기준)

| 순위 | 작업 | 비고 |
|---|---|---|
| 1 | 실제 API 연동 | mock 데이터 → `data.js` 분리 선행 |
| 2 | localStorage 저장 | savedTrends, sampleProgress |
| 3 | 다크/라이트 토글 | CSS 변수 시스템 준비 완료 |
| 4 | 트렌드 카드 스와이프 | 모바일 제스처 |
| 5 | React 마이그레이션 | API 연동과 함께 진행 권장 |
