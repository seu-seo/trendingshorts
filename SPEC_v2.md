# Shortform Pulse — SPEC v2

> 기준: main API 정책 유지 + V6 UX 통합  
> V6에서 가져온 항목은 `[V6 UX]` 표기, main에서 유지한 항목은 `[main]` 표기  
> 최종 업데이트: 2026-06-03

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

## 5. App Structure

```
[앱 최초 진입]
      │
      ▼
  온보딩 완료 여부 (localStorage)
  ├── NO  → [ONBOARDING]
  │              ↓ 완료
  └── YES ↓
         [메인 앱 — 2탭]
    [ TREND 트렌드 ]  |  [ MY 마이 ]
```

두 탭은 언제든 자유롭게 전환 가능. 콘텐츠 만들기 플로우는 두 탭 모두에서 진입 가능.

---

## 6. Functional Requirements

### 6.1 Onboarding (`/onboarding`) `[V6 UX]`

3단계 간소화 설문으로 페르소나를 도출합니다. 완료 후 `POST /api/persona`를 호출하여 Gemini 페르소나 카드를 생성합니다.

**Welcome 화면:**
- "BEGIN YOUR STORY" — 검정 배경 + 강한 타이포
- 이모지 없음, 그라디언트 없음

**설문 3문항:**

| 단계 | 질문 | 비고 |
|------|------|------|
| Q1 | 주로 활동하는 플랫폼 (복수 선택) | YouTube Shorts / TikTok / Instagram Reels |
| Q2 | 카테고리 (자유입력) | 연두 밑줄 스타일 + 키워드 자동 매칭 |
| Q3 | 연령대 | `calcOpportunityScore()` 보정값으로 사용 |

> **기존 main 7문항 대비 변경:** 경력·목표·스타일·업로드빈도·앱사용목적 문항 제거.  
> 연령대가 온보딩에 추가되어 기회 지수 계산의 입력값으로 활용됩니다.

**온보딩 완료 시 처리:**
1. `POST /api/persona` 호출 (main 엔드포인트 유지) → Gemini 페르소나 생성
2. localStorage 저장: `onboardingDone`, `platform`, `category`, `ageGroup`, `personaResult`
3. 페르소나 결과 카드 표시 후 트렌드 탭 랜딩

---

### 6.2 트렌드 탭 (`/`) `[V6 UX + main API]`

카테고리 탭 7개 방식을 제거하고, 온보딩에서 수집한 **연령대 × 플랫폼** 기반 개인화로 대체합니다.  
탭 헤더에 개인화 문구 표시 ("30대 인스타 트렌드" 등).

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

#### 6.2.3 Top 5 트렌드 리스트 `[main API]`

- **API:** `GET /api/trends` (main 구현 유지) — YouTube live + TikTok·IG 스냅샷
- 트렌드 카드: 제목 · 플랫폼 · 조회수 · 해시태그 · 저장 버튼
- 저장 버튼 → `saveTrend()` → localStorage → 마이 탭 "내 컬렉션"
- 카드 탭 → **TrendActionSheet** 하단 노출
  - "원본 보기" — 외부 플랫폼 URL 열기
  - "이 트렌드로 콘텐츠 만들기 →" — 선택 트렌드 context를 콘텐츠 만들기 플로우로 전달

> ⚠️ **데이터 제약 (main 명세 유지):**
> - growth rate 산출 불가 (TikTok·IG: 동일 영상 재조회 구조 없음)
> - 플랫폼 간 동일 기준 순위화 불가

---

### 6.3 마이 탭 (`/my`) `[V6 UX]`

#### 6.3.1 프로필 카드
닉네임 · 플랫폼 태그 · 팔로워 수 표시.

#### 6.3.2 This Week's Insights
주간 성과 KPI 카드 4개.

> ⚠️ **미확정:** 계정 연동 전까지 데이터 소스 확정 필요. 수동 입력 방식 검토 중.

#### 6.3.3 액션 메뉴
| 번호 | 항목 | 비고 |
|------|------|------|
| 01 | 콘텐츠 만들기 | 트렌드 context 없이 자유 제작 — 콘텐츠 만들기 플로우 진입 |
| 02 | 목표 설정하기 | 신규 개발 |
| 03 | 계정 연결하기 | 신규 개발 |

#### 6.3.4 컬렉션
- **내 컬렉션:** 저장한 트렌드 그리드 — `saveTrend()` → localStorage
- **저장한 대본·콘티:** 생성 결과물 목록 — `saveContent()` → localStorage

---

### 6.4 콘텐츠 만들기 플로우 (`/create`) `[V6 UX + main API]`

**진입점 2가지 (공통 플로우):**
- 트렌드 탭 TrendActionSheet → "이 트렌드로 콘텐츠 만들기" (선택 트렌드 context 전달)
- 마이 탭 [01] 콘텐츠 만들기 (트렌드 context 없이 자유 제작)

트렌드에서 진입 시 상단 배너에 선택한 트렌드 표시.

#### 6.4.1 질문 폼 — 7문항 `[V6 UX]`

한 화면에 7개 동시 표시.

| 키워드 | 질문 |
|--------|------|
| PASSION | 열정 — 1년 내내 만들고 싶은 것 |
| SPENDING | 소비 — 가장 돈 많이 쓰는 취미 |
| STRENGTH | 강점 — 주변에서 칭찬받는 것 |
| AUDIENCE | 오디언스 — 보여주고 싶은 사람 |
| TOPIC | 주제 — 이번 영상 주제 |
| FORMAT | 포맷 — 형식/촬영 환경 |
| HOOK | 훅 — 첫 3초 전략 |

> **기존 main 3문항 대비 변경:** V6 SPEC 기준으로 전면 재설계. 기존 "트렌드 활용 방법·에너지 레벨·타겟" 문항 대체.

#### 6.4.2 AI 니치 분석 `[main API]`

- [AI 분석 시작] 버튼 → `POST /api/recommend` (main 엔드포인트·로직 유지)
- 트렌드 context가 있을 경우 프롬프트에 포함하여 전달
- **결과 카드:** 니치 타이틀 · 설명 텍스트 · 키워드 태그 · FORMAT 추천 · PLATFORM 추천

#### 6.4.3 대본 생성 `[main API]`

- `POST /api/generate` (main 엔드포인트·로직 유지)
- 대본 3종: 정보형 · 스토리형 · 훅형
- 구조: HOOK (첫 3초) + BODY + CTA

#### 6.4.4 콘티 생성 `[main API]`

- `POST /api/storyboard` (main 엔드포인트 유지, 현재 minimal 구현)
- 4컷 구성:
  | 컷 | 구간 | 내용 |
  |----|------|------|
  | CUT1 | 0–3s | 훅 |
  | CUT2 | 3–6s | 전환 |
  | CUT3 | 6–12s | 본론 |
  | CUT4 | 12–15s | 클로징 |
- 장면별: 스케치 텍스트 + 대사 + 촬영 메모

> ⚠️ **미확정:** Phase1 텍스트 전용 → Phase2 사전 에셋 → Phase3 이미지 생성 AI (단계별 고도화 예정)

**결과 저장:**
- [이 대본/콘티 저장하기] → `saveContent()` → localStorage → 마이 탭 "저장한 대본·콘티"
- [마이페이지로 돌아가기]

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

### 7.2 API 엔드포인트 매핑

| 호출 시점 | 엔드포인트 | 데이터 소스 | 캐싱 | 출처 |
|----------|-----------|------------|------|------|
| 온보딩 완료 | `POST /api/persona` | Gemini 2.5 Flash | localStorage | main |
| 트렌드 탭 진입 | `GET /api/trends` | YouTube live + TikTok·IG 스냅샷 | 서버 24h | main |
| 트렌드 탭 진입 | `POST /api/insights` | Gemini 2.5 Flash | 서버 24h + Zustand | main |
| 콘텐츠 만들기 분석 | `POST /api/recommend` | Gemini 2.5 Flash | 없음 | main |
| 대본 요청 | `POST /api/generate` | Gemini 2.5 Flash | 없음 | main |
| 콘티 요청 | `POST /api/storyboard` | Gemini 2.5 Flash | 없음 | main (미완성) |

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

**Gemini 호출 5회 (최대):**

| 번호 | 엔드포인트 | 호출 시점 | 캐시 |
|------|-----------|----------|------|
| 1 | `/api/persona` | 온보딩 완료 시 1회 | localStorage (재방문 불필요) |
| 2 | `/api/insights` | 트렌드 탭 진입 시 | 서버 24h |
| 3 | `/api/recommend` | 콘텐츠 만들기 — AI 분석 | 없음 |
| 4 | `/api/generate` | 대본 요청 | 없음 |
| 5 | `/api/storyboard` | 콘티 요청 | 없음 |

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
- `/api/storyboard` 4컷 SceneCard 완성 (현재 minimal 구현)
- This Week's Insights KPI 데이터 소스 (계정 연동 전 수동 입력 방식 확정)
- 페르소나 → 추천 → 대본 생성 컨텍스트 전달 방식

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

### 완료 (main 기준)
- GitHub 저장소 기본 구조
- YouTube Data API v3 연동 모듈
- Apify Instagram·TikTok Scraper 연동 모듈
- Gemini 서브카테고리 자동 분류기
- 대본 생성 V0 (`/api/generate`)
- 페르소나 설문 V0
- `.gitignore` 및 API 키 보안 설정

### 신규 개발 필요 (V6 UX 통합)
- 온보딩 3문항 리디자인 (플랫폼·카테고리·연령대)
- 2탭 레이아웃 (TREND | MY) 전환
- 기회 지수 링 차트 컴포넌트 (데이터 구성 방식 확정 후)
- 해시태그 버블 컴포넌트 (`/api/insights` 연동)
- TrendActionSheet 컴포넌트
- 마이 탭 전체 (프로필·Insights·메뉴·컬렉션)
- 콘텐츠 만들기 7문항 폼 + 니치 분석 결과 카드
- `/api/storyboard` 4컷 SceneCard 완성

### 미확정 (별도 논의)
| 항목 | 현황 |
|------|------|
| 기회 지수 링 차트 데이터 | 구성 방식 미정 |
| This Week's Insights KPI | 계정 연동 전까지 데이터 소스 미확정 |
| 콘티 스케치 품질 | Phase1 텍스트 → Phase2 에셋 → Phase3 이미지 AI |
| `/api/storyboard` | minimal 구현, 4컷 완성 필요 |

### 향후 작업 (V3+)
- BGM·시각 콘텐츠 분류용 음원 ID 또는 비전 모델 연동
- 계정 연동 및 실제 성과 데이터 수집
- This Week's Insights 자동화

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
