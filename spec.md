# Shortform Pulse — SPEC v2

> 기준: main API 정책 유지 + V6 UX 통합 → V8 SPA 아키텍처 전환  
> V6에서 가져온 항목은 `[V6 UX]` 표기, main에서 유지한 항목은 `[main]` 표기, v8 신규는 `[v8]` 표기  
> 최종 업데이트: 2026-06-17 (feat/v8-next.js 반영)

---

## 1. Product Summary

**Shortform Pulse는 팔로워 1,000~50,000명의 초기 크리에이터에게 "오늘 뭘 찍을지"를 알려주는 도구입니다.**

사용자는 짧은 온보딩 설문으로 페르소나를 설정하고, 크로스플랫폼(YouTube Shorts·TikTok·Instagram Reels) 트렌드를 자신의 연령대·플랫폼 기반으로 확인하고, AI 콘텐츠 제작 플로우(니치 분석 → 대본 / 콘티)를 통해 영상 제작에 즉시 착수할 수 있습니다.

기존 도구(VidIQ, TubeBuddy 등)가 *"무엇이 인기인가"* 까지만 보여주는 것과 달리, 본 제품은 *"그래서 너는 뭘 만들어야 하는가"* 까지 워크플로우를 확장합니다.

---

## 2. Problem Statement

지난 10년간 모든 콘텐츠 플랫폼은 **개인화 추천 알고리즘**으로 진화했습니다. 소비자에게는 순기능이지만, **소비자가 크리에이터로 전환하는 시점에 구조적 정보 격차가 발생합니다.**

```
   소비자 모드                       크리에이터 모드
  ─────────────                    ────────────────
   개인 선호 콘텐츠                   대중 선호 콘텐츠
        ↓                                  ↓
   알고리즘이 노출                     알고리즘이 노출 안 함
        ↓                                  ↓
   최적화된 노출                       정보 비대칭 발생
```

사용자의 개인화된 피드는 *본인의 소비 패턴*만 반영할 뿐, *대중의 집계된 행동*을 반영하지 않습니다. 콘텐츠를 만들려는 사용자에게 가장 필요한 데이터(자신의 버블 외부에서 대중이 무엇을 보는가)가, 플랫폼이 가장 노출하지 않는 데이터라는 역설이 발생합니다.

**시장 데이터:**
- 한국 스마트폰 이용자가 주 5일 이상 소비하는 콘텐츠 1위: 숏폼 41.8% (KCC, 2024)
- OTT 내 숏폼 이용: 58.1% → 70.7% (전년 대비 +12.6%p)
- 한국 숏폼 영상 편집 단가의 53.9%가 1만~1.5만 원 (커넥스페이스, 2025) — 시간 절감 자체가 경제적 가치

---

## 3. Target Users

### 팔로워 1,000~50,000명 초기·성장기 크리에이터
- 콘텐츠 제작 경력 3년 미만
- 월 0~10편 산출
- 부업 또는 풀타임 전환 초기
- 1,000명: 알고리즘 피드 진입 최소 임계
- 50,000명: 자체 데이터 인프라 없이도 성장 가능한 상한선

---

## 4. Goals

- **G1.** 사용자가 "오늘 찍을 것"을 정하는 데 걸리는 시간을 단축한다 (현재 베이스라인 30~90분)
- **G2.** 트렌드 추천이 사용자 연령대·카테고리·플랫폼에 정합적이다
- **G3.** Onboarding → 트렌드 탭 → 콘텐츠 만들기 플로우가 하나의 흐름으로 동작한다
- **G4.** 비전공자도 데모를 보고 즉시 이해할 수 있다

---

## 5. App Structure `[v8]`

v8은 Next.js SPA 패턴. `app/app/page.tsx`가 `Screen` 유니온 타입으로 화면 상태를 관리하며, URL 라우팅 없이 단일 페이지에서 전환한다.

```
[앱 최초 진입]
      │
      ▼
 [Welcome]
      │
      ▼
 [Chatbot]  ← LLM 대화형 온보딩 (4문답)
      │
      ▼
 [Prefs]    ← 플랫폼·카테고리·연령대 설문
      │
      ▼
 [Loading → Persona]
      │
      ▼
 [Trends]   ────────── [Rivals]
      │                    │
      ▼ (바텀시트 탭)        ▼ (바텀시트 탭)
 [Production]             저장 → [My]
      │
      ├── Script
      └── Storyboard
```

탭 바: Trends ↔ My. Rivals는 Trends 화면 내 버튼으로 진입.

---

## 6. Functional Requirements

### 6.1 Onboarding `[V6 UX + v8]`

2단계 온보딩으로 페르소나를 도출합니다.

**Step 1 — Chatbot (LLM 대화형)** `[v8 신규]`

`ChatbotScreen`: Gemini 기반 대화형 큐레이터가 4개 질문을 순차로 진행. 자유 텍스트 입력. 답변은 `answers: string[]` 배열로 수집 후 `OnboardingPrefsScreen`으로 전달.

**Step 2 — Prefs (취향 설정)**

`OnboardingPrefsScreen`: 3항목 선택 설문.

| 항목 | 선택지 |
|------|--------|
| 플랫폼 | tiktok / instagram / youtube / all |
| 카테고리 (복수, 필수 1개 이상) | food(먹방/요리) / beauty(뷰티) / dance(댄스) / music(음악) / gaming(게임) / pets(반려동물) / fitness(운동/홈트) / lifestyle(여행/라이프) |
| 연령대 | 10s / 20s / 30s / 40s / 50+ |

> **카테고리 중요:** 실제 트렌드 데이터의 `Category` 타입(`food|beauty|dance|music|gaming|pets|fitness|lifestyle`)과 완전히 일치해야 트렌드 필터링이 작동함. `[v8 수정]`

**온보딩 완료 시 처리:**
1. `POST /api/persona` 호출 → Gemini 페르소나 생성 (`buildPersonaInput(answers, prefs)`)
2. 페르소나 결과 카드(`PersonaScreen`) 표시
   - **최상단 닉네임 입력 (필수):** 입력 없으면 "트렌드 보러가기" 버튼 비활성화
   - 입력 완료 → `localStorage('user_profile')` + `page.tsx` state에 `UserProfile { name }` 저장
3. Trends 화면 랜딩

---

### 6.2 트렌드 탭 `[V6 UX + main API + v8]`

`TrendsScreen` — 온보딩 카테고리 기반 개인화 필터링.

**트렌드 필터링 로직 `[v8]`:**
1. `GET /api/trends` 전체 목록 로드
2. `prefs.categories`에 해당하는 카테고리만 필터링 (결과 없으면 전체)
3. `engagementRate` 내림차순 정렬
4. 최대 12개 노출

**카드 인터랙션 `[v8]`:**
- 카드 탭 → **바텀시트** 노출 (저장하기 / 이걸로 만들기 →)
- "이걸로 만들기" → `Production` 화면으로 직행 (content-topic 스텝 제거)
- 하트 버튼(카드 우상단) → 즉시 저장 (바텀시트 없이)
- "먼저 비슷한 크리에이터 구경하기" 버튼 → `Rivals` 화면

탭 바: 트렌드(active) | 마이페이지.

#### 6.2.1 (제거됨) 기회 지수 링 차트 `[V6 UX — v8 미구현]`

> v8에서는 링 차트 대신 카테고리 기반 필터링 리스트로 대체. 아래 6.2.1~6.2.4는 v6 잔여 명세이며 현재 SPA에는 없음.

#### 6.2.1 기회 지수 링 차트 `[V6 UX]`

애플 워치 동심원 3개 형태. 12시 방향 → 시계방향 draw 애니메이션.

| 링 | 플랫폼 | 색상 |
|----|--------|------|
| 바깥 | Instagram | `#A855F7` |
| 중간 | YouTube | `#FF38A0` |
| 안쪽 | TikTok | `#C8FF57` |

- 온보딩에서 선택한 플랫폼만 컬러 활성화, 나머지 dim 처리
- `calcOpportunityScore(platform, ageGroup, category)` — 0~99 범위

> ⚠️ **미확정:** 링 차트에 표시할 실제 데이터 구성 방식 별도 논의 필요

#### 6.2.2 실시간 해시태그 버블 `[V6 UX + main API]`

키워드 5개 버블. 크기 = 성장률 상대값, 파란 glow 효과.

- **API:** `POST /api/insights` (main 엔드포인트 유지) — Gemini 2.5 Flash
- **캐싱:** 서버 24h + Zustand 클라이언트 캐시
- 카테고리 변경 시 재호출

> ⚠️ **데이터 제약:** 해시태그 성장률 직접 측정 불가 (TikTok만 해시태그별 누적 조회수 제공, Instagram·YouTube 미지원)

#### 6.2.3 이번 주 주요 이슈 `[신규 — PR #49]`

- **API:** `POST /api/weekly-issues` — Gemini 2.5 Flash로 주간 이슈 분석
- 트렌드 탭 상단에 이슈 카드 표시

#### 6.2.4 키워드 인사이트 `[신규 — PR #49]`

- **API:** `POST /api/keyword-insight` — Gemini 2.5 Flash
- 카테고리별 키워드 성장률·기회 분석

#### 6.2.5 Top 트렌드 리스트 `[main API]`

- **API:** `GET /api/trends` (main 구현 유지) — YouTube live + TikTok·IG 스냅샷
- 트렌드 카드: 제목 · 플랫폼 · 조회수 · 해시태그
- 카드 탭 → **TrendActionSheet** 하단 노출
  - "이 트렌드로 콘텐츠 만들기 →" — 선택 트렌드 context를 콘텐츠 만들기 플로우로 전달
  - "원본 보기" — 외부 플랫폼 URL 열기
  - "이 영상 저장하기" → `toggleSaveTrend()` → localStorage → 마이 탭 "내 컬렉션" ✅
  - 이미 저장된 경우: "영상 저장 취소" (빨간 버튼) → 컬렉션에서 제거 ✅

> ⚠️ **데이터 제약 (main 명세 유지):**
> - growth rate 산출 불가 (TikTok·IG: 동일 영상 재조회 구조 없음)
> - 플랫폼 간 동일 기준 순위화 불가

---

### 6.3 마이 탭 `[v8]`

`MyScreen` — 사용자 프로필 + 저장 항목 전체를 섹션별로 표시.

#### 프로필 섹션 `[v8 신규]`

| 표시 항목 | 출처 |
|----------|------|
| 아바타 (닉네임 첫 글자) | `userProfile.name[0].toUpperCase()` |
| 이름 + 님 | `userProfile.name` (localStorage `user_profile`) |
| 페르소나 타입 | `personaResult.personaType` |
| 플랫폼 배지 | `prefs.platform` |
| 카테고리 태그 | `prefs.categories.slice(0, 3)` |

#### 저장 데이터 구조 `[v8 신규]`

`lib/saved-items.ts` — 키: `pulse_saved_v1` (localStorage)

```ts
type SavedItemType = 'trend' | 'creator' | 'script' | 'conti';
```

| 섹션 | 저장 항목 | 표시 정보 |
|------|----------|----------|
| 저장한 트렌드 | trend | 제목 / 조회수 / heatLevel 배지 |
| 저장한 크리에이터 | creator | 채널명 / 핸들 / 구독자 / 썸네일 |
| 저장한 대본 | script | HOOK·BODY·CTA |
| 저장한 콘티 | conti | trendPoint + 4컷 |

각 항목 × 버튼으로 개별 삭제.

> 저장소: `localStorage('pulse_saved_v1')` — 추후 DB 전환 예정

---

### 6.4 라이벌 화면 `[v8 신규]`

`RivalsScreen` — 실제 YouTube 채널 데이터를 SSE 스트리밍으로 실시간 분석.

**진입:** Trends 화면 하단 "비슷한 크리에이터 구경하기" 버튼

**3단계 SSE 파이프라인 (`POST /api/rival`):**

| 단계 | 처리 | 화면 표시 |
|------|------|----------|
| stage1 | YouTube Data API 채널 검색 | "YouTube에서 채널 찾는 중..." |
| stage2 | Gemini AI 적합도 분석 | "AI로 분석 중..." |
| stage3 | Gemini Vision 썸네일 점수화 | "썸네일 분석 중..." |

**결과 카드 인터랙션:**
- 카드 탭 → **바텀시트** (저장하기 / 채널 보러가기 →)
- 한 번 분석된 결과는 `page.tsx`의 `cachedRivals` 상태로 캐싱 → 재방문 시 즉시 표시

**검색 파라미터:** `prefs.categories` + `chatbot 첫 답변` 기반 토픽 조합

---

### 6.5 제작(Production) 플로우 `[v8]`

`ProductionScreen` — 사용자 의도 기반 AI 2-step 콘텐츠 생성.

**진입:** Trends 바텀시트 → "이걸로 만들기 →"

**Stage 흐름:**

```
[intent] → 사용자 의도 입력
    ↓ "4컷 콘티 만들기" 또는 "대본으로 받기"
[loading] → AI가 대본을 쓰고 있어요...
    ↓
[conti / script] → 결과 표시
```

**Step 1 — POST /api/generate `[v8 신규]`:**
- 입력: `trend` + `persona` (hookPatterns → styles) + `concept` (userIntent + trendBasis)
- 출력: 3종 대본 (정보형·스토리형·후킹형) + 추천 톤
- `concept`이 `[영상 컨셉 — 최우선 지시]`로 프롬프트에 주입됨

**Step 2 — POST /api/conti `[v8]`:**
- 입력: Step 1의 추천 톤 대본 script
- 출력: `ContiResponse` (trendPoint + CUT1~4 + 각 컷 이미지)

**콘티 캐싱:** `page.tsx`의 `cachedTrendId` + `conti` 상태. `initialConti` prop 있으면 intent 스테이지를 건너뜀.

**콘티 구조 (`POST /api/conti`):**

| 컷 | 구간 | 역할 |
|----|------|------|
| CUT1 | 0–3s | 훅 |
| CUT2 | 3–6s | 전환 |
| CUT3 | 6–12s | 본론 |
| CUT4 | 12–15s | 클로징 |

**저장하기 버튼:** conti → `saveItem({type:'conti',...})` / script → `saveItem({type:'script',...})` → 마이 탭 반영

---

## 7. Data and API Plan

### 7.1 데이터 소스 `[main]`

| 플랫폼 | 데이터 소스 | 갱신 주기 | 수집량 | 비용 |
|--------|------------|-----------|--------|------|
| YouTube Shorts | YouTube Data API v3 (공식) | 일 1회 | 50개 | 무료 |
| TikTok | Apify `clockworks~free-tiktok-scraper` | 일 1회 | 15 해시태그 × 6 = 90개 | $0.10–0.30/회 |
| Instagram Reels | Apify `apify~instagram-scraper` | 일 1회 | 15 해시태그 × 12 = 180개 | $0.15–0.50/회 |

**Trending 기준 `[main]`:**
- YouTube: 플랫폼 공식 trending 차트 (`chart=mostPopular`) ✅
- TikTok·Instagram: 한국 해시태그 기반 최신 게시물 수집 (간접적) ⚠️

**운영 주의:** Vercel serverless 메모리 캐시는 cold start마다 리셋. `DISABLE_APIFY=true` 시 mock 데이터로 폴백.

### 7.2 API 엔드포인트 매핑 `[v8 업데이트]`

| 호출 시점 | 엔드포인트 | 데이터 소스 | 캐싱 | 상태 |
|----------|-----------|------------|------|------|
| 온보딩 완료 | `POST /api/persona` | Gemini 2.5 Flash | 없음 (page state) | ✅ |
| 트렌드 탭 진입 | `GET /api/trends` | YouTube live + TikTok·IG 스냅샷 | 서버 24h | ✅ |
| 트렌드 탭 진입 | `POST /api/insights` | Gemini 2.5 Flash | 서버 24h + Zustand | ✅ |
| 트렌드 탭 진입 | `POST /api/weekly-issues` | Gemini 2.5 Flash | 없음 | ✅ |
| 트렌드 탭 진입 | `POST /api/keyword-insight` | Gemini 2.5 Flash | 없음 | ✅ |
| 라이벌 화면 진입 | `POST /api/rival` (SSE) | YouTube Data API v3 + Gemini + Vision | page state cachedRivals | ✅ v8 신규 |
| 제작 intent 확정 (Step 1) | `POST /api/generate` | Gemini 2.5 Flash | 없음 | ✅ v8 신규 |
| 제작 콘티 생성 (Step 2) | `POST /api/conti` | Gemini 2.5 Flash | page state cachedTrendId+conti | ✅ |
| 니치 분석 (미사용) | `POST /api/recommend` | Gemini 2.5 Flash | 없음 | ⚠️ v8에서 미노출 |

### 7.3 데이터의 본질적 한계 `[main]`

외부 API는 **텍스트 메타데이터(제목, 설명, 해시태그)만 제공**하며, 영상의 BGM이나 시각적 콘텐츠 자체는 분류 대상에 포함되지 않습니다.

**영향:**
- 텍스트 부재 비주얼 중심 콘텐츠 분류 불가
- 한글 텍스트 없이 이모지·영어로만 작성된 영상 누락
- 챌린지 사운드 기반 파생 트렌드 식별 어려움

**완화 방안:** 사용자가 콘텐츠 URL로 원본 영상 랜딩 가능하도록 설계. V3에서 음원 ID 또는 비전 모델 연동 검토.

---

## 8. System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        Client (Browser)                      │
│    Next.js 프론트엔드 — 2탭 (TREND | MY) + 콘텐츠 만들기 플로우  │
└──────────────────────────────┬───────────────────────────────┘
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                     Next.js API Routes                       │
│                     (서버 사이드 처리)                          │
└──────┬───────────────────┬──────────────────┬────────────────┘
       ▼                   ▼                  ▼
┌─────────────┐   ┌─────────────────┐   ┌──────────────────┐
│   Gemini    │   │  External APIs  │   │     Zustand      │
│  2.5 Flash  │   │  YouTube API v3 │   │  (클라이언트 캐시)  │
│  (5 엔드포인트)│   │  + Apify (유료) │   │  /api/insights   │
└─────────────┘   └─────────────────┘   └──────────────────┘
```

| 레이어 | 선택 |
|--------|------|
| Frontend | Next.js 14 (App Router) |
| State | Zustand |
| Backend | Next.js API Routes |
| 외부 데이터 | YouTube Data API v3 + Apify (유료) |
| AI | Google Gemini 2.5 Flash (`@ai-sdk/google`) |
| 호스팅 | Vercel |

**Gemini/Imagen 호출 (최대 7회):**

| 번호 | 엔드포인트 | 호출 시점 | 캐시 |
|------|-----------|----------|------|
| 1 | `/api/persona` | 온보딩 완료 시 1회 | localStorage (재방문 불필요) |
| 2 | `/api/insights` | 트렌드 탭 진입 시 | 서버 24h |
| 3 | `/api/weekly-issues` | 트렌드 탭 진입 시 | 없음 |
| 4 | `/api/keyword-insight` | 트렌드 탭 진입 시 | 없음 |
| 5 | `/api/recommend` | 콘텐츠 만들기 — AI 분석 | 없음 |
| 6 | `/api/generate` | 대본 요청 | 없음 |
| 7 | `/api/conti` | 콘티 요청 (Gemini 분해 + Imagen 이미지) | 없음 |

---

## 9. Design System `[V6 UX]`

### 색상 토큰

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

### 타이포그래피

| 역할 | 폰트 |
|------|------|
| 임팩트 헤딩 | 카페24 당당해 |
| 친근한 헤딩 | 카페24 써라운드 |
| 본문 | Pretendard |
| 데이터·레이블 | Inter |

### 디자인 원칙

- 이모지·이미지 금지
- 그라디언트 없음
- 액센트 색상(`--primary`)은 CTA·핵심 수치에만 사용
- 모든 트렌드 카드에 WHY 인사이트 필수 표기

---

## 10. API Contract

### 10.1 합의된 사항

- **Backend는 Next.js API Routes로 구현**, 모든 외부 API 키는 서버 사이드에서만 호출
- **`GET /api/trends`** — main 백엔드 구현체 기반으로 통합. 플랫폼별 트렌드 데이터를 단일 엔드포인트에서 반환
- **응답 형식:** JSON, `source: "live" | "mock"` 필드로 실데이터/Mock 데이터 구분
- **`POST /api/persona`** — 온보딩 3문항(platform, category, ageGroup)을 입력으로 받아 Gemini 페르소나 생성
- **`POST /api/recommend`** — 7문항 응답 + 선택적 trendContext를 입력으로 받아 니치 분석 결과 반환

### 10.2 향후 합의 필요 (TBD)

- 기회 지수 링 차트 실제 데이터 구성 방식
- `TrendItem` 통합 스키마 (플랫폼별 필드 통일)
- `calcOpportunityScore(platform, ageGroup, category)` 계산 로직 확정
- This Week's Insights KPI 데이터 소스 (DB 연동 후 확정)
- 저장 데이터 DB 스키마 (`savedTrends`, `savedScripts` 테이블 설계)

---

## 11. Security and Privacy

### API 키 관리
- 모든 외부 API 키(Google Gemini, YouTube, Apify)는 Next.js API Route 서버 사이드에서만 호출
- 클라이언트 코드에 키 노출 금지
- `.gitignore` 설정 완료

### 사용자 데이터
- 사용자 계정·로그인 없음 (익명 사용)
- 서버에 사용자 식별 정보 저장하지 않음
- 온보딩 응답 및 생성 결과물은 localStorage에만 저장

### 외부 콘텐츠 처리
- 트렌드 영상은 메타데이터(제목, 통계, URL)만 캐시; 영상 파일 자체는 저장 안 함
- 사용자는 원본 플랫폼 URL을 통해 영상 시청

---

## 12. Success Criteria

### 데모 기준

| 지표 | 목표 |
|------|------|
| End-to-end 플로우 동작 | Onboarding → 트렌드 탭 → 콘텐츠 만들기 → 저장 무중단 |
| 데이터 신선도 | 24시간 이내 갱신 |
| 외부 API 장애 시 동작 | Mock fallback으로 데모 유지 |
| 콘텐츠 생성 완료 | 대본 3종 또는 콘티 4컷 정상 출력 |

### 베타 테스트 기준 (데모 이후)

- 팔로워 1,000~50,000명 크리에이터 대상 파일럿 테스트
- 현업 마케터 정성 피드백 세션
- 정량 데이터 + 정성 피드백 결합 검증

---

## 13. Current Scope and Future Work

### 구현 완료 (2026-06-15 기준 feat/v8-next.js)

**v2→v6 (main 기반):**

| 항목 | PR | 비고 |
|------|----|------|
| 온보딩 3문항 (플랫폼·카테고리·연령대) | #48 | ✅ |
| 마이 탭 전체 (프로필·Insights·메뉴) | #48 | ✅ |
| 목표 설정 (`/my/goal`) | #48 | ✅ |
| 계정 연결 (`/my/connect`) | #48 | ✅ |
| 크리에이터 추천 (`CreatorRecommendSection`) | #48 | ✅ |
| 대시보드 V6 UX (링차트·키워드·트렌드) | #49 | ✅ |
| 실제 YouTube 데이터 연동 + Gemini 분석 | #49 | ✅ |
| 이번 주 주요 이슈 (`/api/weekly-issues`) | #49 | ✅ |
| 키워드 인사이트 (`/api/keyword-insight`) | #49 | ✅ |
| 4컷 콘티 생성 (`/api/conti` + Imagen) | #50 | ✅ |
| SVG 콘티 폴백 (`ContiSketch`) | #50 | ✅ |
| 영상 저장하기 / 저장 취소 (TrendActionSheet) | #51 | ✅ |
| 내 컬렉션 — 한 줄 카드 + 액션시트 연결 | #51 | ✅ |
| 대본 저장하기 (hook+body+cta) | #51 | ✅ |
| 콘티 저장하기 + 마이페이지 펼쳐보기 | #51 | ✅ |

**v8 추가 (feat/v8-next.js):**

| 항목 | 비고 |
|------|------|
| SPA 아키텍처 전환 (page.tsx screen state union) | ✅ |
| LLM 챗봇 온보딩 (`ChatbotScreen`) | ✅ |
| 온보딩 카테고리 실제 Category 타입과 통일 | ✅ |
| 트렌드 카테고리 필터링 + 챗봇 키워드 정렬 | ✅ |
| 트렌드 카드 탭 → 바텀시트 (저장/만들기) | ✅ |
| 라이벌 화면 SSE 파이프라인 (`/api/rival`) | ✅ |
| 라이벌 카드 탭 → 바텀시트 (저장/채널이동) | ✅ |
| 라이벌 결과 캐싱 (`cachedRivals`) | ✅ |
| Production 화면 마운트 시 콘티 자동생성 | ✅ |
| 콘티 결과 캐싱 (`cachedTrendId` + `conti`) | ✅ |
| `lib/saved-items.ts` 통합 저장 모듈 | ✅ |
| MyScreen 섹션별 저장 항목 표시 + 삭제 | ✅ |

### 미확정 / 향후 작업

| 항목 | 현황 |
|------|------|
| 저장 데이터 영속성 | localStorage → Supabase DB 연동 예정 |
| This Week's Insights KPI | 팔로워·업로드 수: 계정 연동 전까지 `--` |
| 기회 지수 링 차트 데이터 | 실제 데이터 구성 방식 미정 |
| 콘티 이미지 품질 | Imagen 유료 키 없으면 SVG 폴백 |
| 대본/콘티 캡처 저장 | html2canvas 다운로드 기능 예정 |
| BGM·비전 모델 연동 | V3 이후 |
| 계정 연동 실데이터 | DB 도입 후 |

---

## 14. Pull Request Review Checklist

### 코드 품질
- [ ] 커밋 메시지가 변경 사항을 명확히 설명하는가
- [ ] 추가된 코드에 명백한 디버그 출력(console.log)이 없는가
- [ ] 들여쓰기·네이밍 컨벤션이 기존 코드와 일관되는가

### 보안
- [ ] API 키·시크릿이 코드에 하드코딩되지 않았는가
- [ ] `.env` 파일이 `.gitignore`에 포함되어 있는가
- [ ] 외부 API 호출이 서버 사이드(API Route)에서만 이루어지는가

### 외부 의존성
- [ ] 새 패키지 추가 시 `package.json`과 lockfile이 함께 업데이트되었는가
- [ ] 외부 API 호출에 timeout과 에러 핸들링이 있는가
- [ ] Mock fallback이 외부 의존성 장애 시 동작하는가

### 테스트
- [ ] 로컬에서 Mock 모드와 Live 모드 둘 다 정상 동작하는가
- [ ] 모바일 화면 너비(360px~)에서 레이아웃이 깨지지 않는가

### 문서
- [ ] 새 기능 추가 시 README나 SPEC_v2.md의 관련 섹션이 업데이트되었는가
- [ ] 환경 변수 추가 시 설정 가이드가 함께 추가되었는가
- [ ] PR 설명에 변경 의도와 테스트 방법이 명시되어 있는가

---
