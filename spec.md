# Shortform Pulse — SPEC

## 1. Product Summary

**Shortform Pulse는 팔로워 1만 명 미만의 초기 크리에이터에게 "오늘 뭘 찍을지"를 알려주는 도구입니다.**

사용자는 짧은 온보딩 설문으로 페르소나를 설정하고, 크로스플랫폼(YouTube Shorts·TikTok·Instagram Reels) 트렌드 대시보드에서 자기 채널에 맞는 트렌드를 발견하고, AI 대본 초안(Hook + 본문 + CTA)을 받아 영상 제작에 즉시 착수할 수 있습니다.

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

사용자의 개인화된 피드는 *본인의 소비 패턴*만 반영할 뿐, *대중의 집계된 행동*을 반영하지 않습니다. **콘텐츠를 만들려는 사용자에게 가장 필요한 데이터(자신의 버블 외부에서 대중이 무엇을 보는가)가, 플랫폼이 가장 노출하지 않는 데이터**라는 역설이 발생합니다.

**시장 데이터:**
- 한국 스마트폰 이용자가 주 5일 이상 소비하는 콘텐츠 1위: **숏폼 41.8%** (KCC, 2024)
- OTT 내 숏폼 이용: 58.1% → 70.7% (전년 대비 +12.6%p)
- 한국 숏폼 영상 편집 단가의 53.9%가 1만~1.5만 원 (커넥스페이스, 2025) — *시간 절감 자체가 경제적 가치*

---

## 3. Target Users

### 팔로워 1만 명 미만 초기 크리에이터
- 콘텐츠 제작 경력 3년 미만
- 월 0~10편 산출
- 부업 또는 풀타임 전환 초기
- 1만 명은 광고 수익 진입선이자 자체 데이터 인프라를 구축할 자원의 임계

---

## 4. Goals

- **G1.** 사용자가 "오늘 찍을 것"을 정하는 데 걸리는 시간을 단축한다 (현재 베이스라인 30~90분)
- **G2.** 트렌드 추천이 사용자 카테고리·페르소나에 정합적이다
- **G3.** Onboarding → Dashboard → Production 흐름이 하나로 연결된다
- **G4.** 비전공자도 데모를 보고 즉시 이해할 수 있다

---

## 5. Core User Flows

```
   앱 시작
      ↓
   온보딩 완료?
   ├── NO  → 온보딩 설문 (7문항 + 앱 사용 목적 선택)
   │              ↓ Gemini → 페르소나 생성 + localStorage 저장
   └── YES ↓
         ↓
   [대시보드 탭] 랜딩

   ① 대시보드 탭 (/)                ② 추천·제작 탭 (/recommend, /production)
   ──────────────────               ─────────────────────────────────────────
   카테고리 탭 선택                   영상 방향 설문 (분위기/길이/특징)
        ↓                                 ↓
   플랫폼별 TOP 1 (PlatformPulse)    소재·컨셉 추천 3가지 (Gemini)
        ↓                                 ↓
   AI 키워드 분석 (버블맵)            대본 3종 + 콘티 생성 (Gemini)
        ↓
   플랫폼 탭 → 트렌드 목록
   (SHORTS / TIKTOK / REELS)
```

---

## 6. Functional Requirements

### 6.1 Onboarding (`/onboarding`)

7문항 설문으로 페르소나를 도출, 결과는 `localStorage`에 저장합니다.

**설문 항목:**

| # | 질문 | 유형 | 선택지 |
|---|---|---|---|
| Q1 | 주로 활동하는 플랫폼은? | Single select | YouTube Shorts / TikTok / Instagram Reels / 멀티플랫폼 |
| Q2 | 내 채널의 주요 카테고리는? | Single select | 요리/먹방 / 뷰티/패션 / 라이프스타일/일상 / 정보/자기계발 / 게임/엔터테인먼트 / 운동/건강 / 예술/크리에이티브 |
| Q3 | 숏폼 크리에이터 경력은? | Slider (0~5) | 채널 없음 / 1개월 미만 / 1~6개월 / 6개월~1년 / 1~3년 / 3년 이상 |
| Q4 | 지금 가장 원하는 목표는? | Single select | 구독자/팔로워 증가 / 수익화 시작 / 브랜드 인지도 구축 / 팬덤/커뮤니티 |
| Q5 | 내 콘텐츠 스타일 키워드는? | Multi select (최대 3개) | 유머/웃음 / 정보/교육 / 감성/공감 / 자극/임팩트 / 솔직/현실 / 비주얼/심미 / 챌린지/트렌드 / 실험/독창성 |
| Q6 | 숏폼 제작에서 가장 힘든 부분은? | Single select | 아이디어가 안 떠올라요 / 트렌드를 어떻게 써야 할지 모르겠어요 / 영상을 만들어도 반응이 없어요 / 꾸준히 못하겠어요 |
| Q7 | 앞으로 주당 몇 편을 올리고 싶나요? | Single select | 1편 이하 / 1~2편 / 3편 이상 / 미정 |

**페르소나 생성:** Gemini 2.5 Flash 호출 → `personaType`, `personaTagline`, `personaSummary`, `topTrends`, `hookPatterns`, `actionItems`, `weeklyPlan` 포함 JSON 반환. API 실패 시 rule-based fallback으로 대체.

### 6.2 대시보드 탭 (`/`)

**위계 구조 (상위 → 하위):**

```
1. 카테고리 탭 (전체 필터)
   └── 7개: 라이프스타일 / 뷰티 / 요리 / 운동 / 게임 / 정보 / 예술
2. PlatformPulse — 3개 플랫폼 TOP 1 항상 표시 (카테고리 기준)
3. AI 키워드 분석 (KeywordInsight) — 버블맵 + 불릿 인사이트
4. 플랫폼 탭 → 트렌드 목록
   └── SHORTS / TIKTOK / REELS (전체 없음, 항상 1개 선택)
```

**트렌드 목록 정렬:** rising → peak → fading 순, 동일 lifecycle 내 engagement rate 내림차순.

**TrendActionSheet:** 트렌드 카드 탭 시 하단 액션 시트 표시 (원본 보기 / 소재로 사용하기).

**AI 키워드 분석 (Gemini):**
- 카테고리별 키워드 6개를 원형 버블맵으로 시각화 (HOT: 핑크 84px / RISING: 라임 68px / 일반: 흰색 54px)
- 인사이트 불릿 3개 (수치 기반, 명사형)
- 캐싱: 서버 인메모리 24시간 + Zustand 클라이언트 세션 영구 유지

### 6.3 추천·제작 탭 (`/recommend`, `/production`)

**영상 방향 설문 → 소재·컨셉 추천 (Gemini) → 대본 + 콘티 생성 (Gemini)**

대본 구조: HOOK (첫 3초) + BODY (3단 내러티브) + CTA

---

## 7. Data and API Plan

### 7.1 데이터 소스

| 플랫폼 | 데이터 소스 | 갱신 주기 | 수집량 |
|---|---|---|---|
| YouTube Shorts | YouTube Data API v3 (공식) | 24시간 (Edge Cache) | 7카테고리 × 10개 |
| TikTok | Apify `clockworks~free-tiktok-scraper` | 수동 갱신 (`npm run snapshot`) | 15 해시태그 × 6 = 90개 → 30일 필터 후 ~32개 |
| Instagram Reels | Apify `apify~instagram-scraper` | 수동 갱신 (`npm run snapshot`) | 15 URL × 12 = 180개 → 30일 필터 후 ~125개 |

**현재 운영 상태:** `DISABLE_APIFY=true` (Vercel 환경변수) — TikTok·Instagram은 **스냅샷 JSON** (`app/lib/data/tiktok-snapshot.json`, `app/lib/data/instagram-snapshot.json`) 사용. YouTube API는 live 데이터.

스냅샷 JSON은 Apify 실데이터를 1회 수집 후 저장한 파일. `npm run snapshot`으로 수동 갱신. 30일 이내 게시물만 표시 (오래된 바이럴 영상 제거).

**캐싱 전략:**
- Vercel Edge Cache `revalidate = 86400` (24시간) — 서버리스 콜드 스타트 무관하게 유지
- 서버 인메모리 캐시 (24시간): 동일 인스턴스 재요청 시 Apify 재호출 방지
- 캐시 히트 시 백그라운드에서 조용히 갱신 (응답 블로킹 없음)

**Trending 기준:**
- YouTube: 공식 trending 차트 (`chart=mostPopular`) + `videoCategoryId` 카테고리 매핑. 재생 시간 ≤ 180초 필터 (Shorts 판별).
- TikTok·Instagram: 한국 해시태그 기반 최신 게시물 수집 (간접적), 30일 이내만 표시

### 7.2 카테고리 체계

7개로 통일 (온보딩·대시보드·mock 데이터 모두 동일):

| 내부 키 | 표시명 |
|---|---|
| `food` | 요리/먹방 |
| `beauty` | 뷰티/패션 |
| `lifestyle` | 라이프스타일/일상 |
| `edu` | 정보/자기계발 |
| `gaming` | 게임/엔터테인먼트 |
| `fitness` | 운동/건강 |
| `art` | 예술/크리에이티브 |

### 7.3 본질적 한계

외부 API는 **텍스트 메타데이터(제목, 설명, 해시태그)만 제공**. BGM·시각 콘텐츠 자체는 분류 불가.

**영향:** 텍스트 없는 비주얼 콘텐츠 누락, 챌린지 사운드 기반 트렌드 식별 불가.

**완화:** 원본 플랫폼 URL 연결. V2에서 음원 ID 또는 비전 모델 연동 검토.

---

## 8. System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        Client (Browser)                      │
│    Next.js 14 App Router + Zustand (상태 + 인사이트 캐시)      │
└──────────────────────────┬───────────────────────────────────┘
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                     Next.js API Routes (app/)                │
│  GET /api/trends   POST /api/insights   POST /api/persona    │
│  POST /api/recommend   POST /api/generate   POST /api/storyboard │
└──────┬──────────────────────┬──────────────────────┬─────────┘
       ▼                      ▼                      ▼
┌────────────┐    ┌──────────────────────┐    ┌────────────────┐
│  YouTube   │    │  Apify (TikTok·IG)   │    │ Gemini 2.5     │
│  Data API  │    │  DISABLE_APIFY=true  │    │ Flash          │
│  (live)    │    │  → 스냅샷 JSON 사용   │    │ (4 endpoints)  │
└────────────┘    └──────────────────────┘    └────────────────┘

스냅샷 JSON 위치: app/lib/data/tiktok-snapshot.json
                  app/lib/data/instagram-snapshot.json
갱신 방법: APIFY_API_TOKEN=... npm run snapshot (app/ 디렉토리)
```

**Gemini 호출 엔드포인트 4개:**

| 엔드포인트 | 호출 시점 | 캐싱 |
|---|---|---|
| `POST /api/insights` | 카테고리 탭 전환 시 | 서버 24h + Zustand 클라이언트 |
| `POST /api/persona` | 온보딩 완료 시 1회 | localStorage |
| `POST /api/recommend` | 소재 추천 요청 시 | 없음 |
| `POST /api/generate` | 대본 생성 요청 시 | 없음 |

---

## 9. API Contract

### 공통
- 모든 외부 API 키는 서버 사이드(API Route)에서만 호출
- 응답: JSON, `source: "live" | "mock"` 필드로 실데이터/Mock 구분

### GET /api/trends

**Query params:** `platform` (youtube·tiktok·instagram·all)

> `category` 파라미터는 의도적으로 제거됨 — Apify 캐시 키 폭발 방지. 카테고리 필터는 클라이언트에서 처리.

**Response:**
```json
{ "data": [TrendItem], "source": "live | snapshot" }
```

**TrendItem 스키마:**
```typescript
{
  id: number;
  platform: 'youtube' | 'tiktok' | 'instagram';
  category: 'food' | 'beauty' | 'lifestyle' | 'edu' | 'gaming' | 'fitness' | 'art';
  lifecycle: 'rising' | 'peak' | 'fading';
  title: string;
  creator: string;
  views: number; likes: number; comments: number; shares: number;
  growth: number;        // engagement rate × 1000
  hashtags: string;
  thumb: string; time: string; duration: string;
  videoUrl: string | undefined;
}
```

### POST /api/insights

**Request:** `{ category, titles: string[], hashtags: string[] }`

**Response:**
```json
{
  "keywords": [{ "text": "#키워드", "type": "hot | rising | ''" }],
  "bullets": ["인사이트1", "인사이트2", "인사이트3"],
  "source": "live | mock"
}
```

---

## 10. Security and Privacy

- 모든 외부 API 키(Google, YouTube, Apify)는 서버 사이드에서만 호출, `.env` 및 `.vercel` 디렉토리 `.gitignore` 설정 완료
- V1 사용자 계정·로그인 없음 (익명 사용), 식별 정보 저장 안 함
- 온보딩 데이터는 `localStorage`에만 저장 (서버 전송 없음)
- 트렌드 영상은 메타데이터(제목, 통계, URL)만 캐시; 영상 파일 저장 안 함

---

## 11. Success Criteria

### V1 발표 기준

| 지표 | 목표 |
|---|---|
| End-to-end 플로우 동작 | Onboarding → Dashboard → Production 무중단 |
| 데이터 신선도 | 24시간 이내 갱신 |
| 외부 API 장애 시 동작 | Mock fallback으로 데모 유지 |
| AI 인사이트 캐싱 | 카테고리 전환 시 재호출 없음 |

---

## 12. Current Scope

### 완료
- 온보딩 설문 7문항 + Gemini 페르소나 생성 + 결과 화면
- 대시보드 카테고리 위계 구조 (카테고리 → PlatformPulse → KeywordInsight → 플랫폼탭+목록)
- YouTube Data API live 연동 + 카테고리 매핑 (`requestedCid` 기반), duration ≤ 180s Shorts 필터
- Apify TikTok·Instagram 연동 모듈 + 스냅샷 JSON 방식 도입
  - `app/lib/data/tiktok-snapshot.json` / `instagram-snapshot.json` — 실데이터 1회 수집 후 저장
  - `npm run snapshot` 스크립트로 수동 갱신
  - `DISABLE_APIFY=true` 시 스냅샷 JSON 사용, `false` 시 Apify live 호출
  - 30일 이내 게시물만 표시 (오래된 바이럴 영상 필터링)
- AI 키워드 분석 버블맵 UI + 명사형 불릿 인사이트
- 인사이트 캐싱: 서버 24h + Zustand 클라이언트 영구 유지
- TrendActionSheet (트렌드 카드 액션 시트)
- 소재·컨셉 추천 탭 + 대본 생성 탭
- Vercel 배포 (`web-v2-sand.vercel.app`), Edge Cache 24시간
- 프로젝트 구조: `web-v2/` → `app/` 리네임, 구버전 폴더 `old/`로 이동
- `DISABLE_APIFY` 환경변수: `printf` 방식으로 줄바꿈 없이 설정 (`echo` 사용 시 `"true\n"` 버그 발생)

### 향후 작업
- 스냅샷 정기 갱신 자동화 (현재 수동)
- TikTok·Instagram live 데이터 상시 운영 (`DISABLE_APIFY=false`) 검토
- 팔로워 1만 명 미만 크리에이터 대상 파일럿 테스트
- BGM·비전 모델 연동 (V2)

---

## 13. Pull Request Review Checklist

### 코드 품질
- [ ] 커밋 메시지가 변경 사항을 명확히 설명하는가
- [ ] 디버그 출력(console.log 등)이 없는가
- [ ] 들여쓰기·네이밍 컨벤션이 기존 코드와 일관되는가

### 보안
- [ ] API 키·시크릿이 코드에 하드코딩되지 않았는가
- [ ] `.env` 파일이 `.gitignore`에 포함되어 있는가
- [ ] 외부 API 호출이 서버 사이드(API Route)에서 이루어지는가

### 외부 의존성
- [ ] 새 패키지 추가 시 `package.json`과 lockfile이 함께 업데이트되었는가
- [ ] 외부 API 호출에 에러 핸들링이 있는가
- [ ] Mock fallback이 외부 의존성 장애 시 동작하는가

### 테스트
- [ ] 로컬에서 Mock 모드와 Live 모드 둘 다 정상 동작하는가
- [ ] 모바일 화면 너비(360px~)에서 레이아웃이 깨지지 않는가

### 문서
- [ ] 새 기능 추가 시 spec.md 관련 섹션이 업데이트되었는가
- [ ] 환경 변수 추가 시 설정 가이드가 함께 추가되었는가
- [ ] PR 설명에 변경 의도와 테스트 방법이 명시되어 있는가
