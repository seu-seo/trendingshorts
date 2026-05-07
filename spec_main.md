# Shortform Pulse — Working Spec

## 1. Core User Flows

### 1.1 전체 앱 흐름

```
최초 구동
    ↓
[온보딩] 설문 7문항 (지은)
    ↓ Claude API → 페르소나 생성
[페르소나 결과 화면] 확인 후 앱 진입
    ↓
┌─────────────────────────────────────────┐
│            하단 탭 네비게이션              │
│  [트렌드 대시보드 탭]   [추천 탭]          │
└─────────────────────────────────────────┘
```

### 1.2 트렌드 대시보드 탭 (기본 탭)

크로스플랫폼(YouTube Shorts·TikTok·Instagram Reels) 트렌드를 카테고리·서브카테고리 단위로 표시. 페르소나 무관하게 전체 트렌드 조감.

### 1.3 추천 탭 — 3단계 파이프라인

```
STEP 1. 레퍼런스 제시
    페르소나 + 트렌드 데이터 기반으로 트렌딩 숏폼 콘텐츠 3~5개 제시
    (썸네일·제목·플랫폼·인게이지먼트 수치 포함)
        ↓
STEP 2. LLM 콘텐츠 방향 추천  [사용자 수정 가능]
    Claude가 레퍼런스를 분석하여 "이 페르소나에게 최적의 콘텐츠 방향"을 추천
    - 추천 주제, 접근 방식, 훅 패턴 포함
    - 사용자가 방향을 직접 수정·보완 가능 (텍스트 편집)
        ↓
STEP 3. 대본 초안 생성 (경재)
    수정된 콘텐츠 방향을 컨텍스트로 Claude에 전달
    Hook (첫 3초) + 본문 3단 내러티브 + CTA 구조로 대본 생성
    페르소나 기반 추천 톤 1개 제시 + 다른 톤 토글로 제공
```

---

## 2. Functional Requirements

### 2.1 Onboarding (담당: 지은)

설문 기반 온보딩으로 사용자 페르소나를 도출합니다. 최초 앱 진입 시에만 실행.

#### 설문 문항 (7문항)

| # | 질문 | 유형 | 선택지 |
|---|---|---|---|
| Q1 | 주로 활동하는 플랫폼은? | Single select | YouTube Shorts / TikTok / Instagram Reels / 멀티플랫폼 |
| Q2 | 내 채널의 주요 카테고리는? | Single select | 요리/먹방 / 뷰티/패션 / 라이프스타일/일상 / 정보/자기계발 / 게임/엔터테인먼트 / 운동/건강 |
| Q3 | 숏폼 크리에이터 경력은? | Slider (0~5) | 채널 없음 / 1개월 미만 / 1~6개월 / 6개월~1년 / 1~3년 / 3년 이상 |
| Q4 | 지금 가장 원하는 목표는? | Single select | 구독자 증가 / 수익화 시작 / 브랜드 인지도 / 팬덤/커뮤니티 |
| Q5 | 내 콘텐츠 스타일 키워드는? | Multi select (최대 3개) | 유머/웃음 / 정보/교육 / 감성/공감 / 자극/임팩트 / 솔직/현실 / 비주얼/심미 / 챌린지/트렌드 / 실험/독창성 |
| Q6 | 숏폼 제작에서 가장 힘든 부분은? | Single select | 아이디어 / 트렌드 활용 / 반응 부재 / 지속성 |
| Q7 | 주당 목표 업로드 편수는? | Slider (1~14) | 주 1편 → 매일 2편 |

#### Claude API 호출

```
model: claude-sonnet-4-20250514
max_tokens: 1000
입력: 7개 설문 응답값 (한국어 레이블로 변환 후 전달)
출력: 페르소나 JSON
```

#### 페르소나 JSON 응답 스키마

```json
{
  "personaType": "string (영문 대문자, 예: THE TRENDSETTER)",
  "personaTagline": "string (20자 이내 한국어)",
  "personaSummary": "string (2~3문장)",
  "topTrends": [
    {
      "keyword": "string (#해시태그)",
      "state": "rising | peak | fading",
      "fitScore": "number (0~100)",
      "reason": "string (한 문장)"
    }
  ],
  "hookPatterns": [
    {
      "type": "string (훅 유형명)",
      "example": "string (예시 문장)"
    }
  ],
  "actionItems": [
    {
      "title": "string",
      "desc": "string (1~2문장)"
    }
  ],
  "weeklyPlan": "string (2~3문장)",
  "typeIndex": "number (0~3)"
}
```

#### 결과 화면 (페르소나 대시보드) — 6개 섹션

1. **페르소나 카드** — 이름·태그라인·typeIndex에 따른 accent color
2. **페르소나 분석** — 강점·특성 2~3문장
3. **채널 Fit 트렌드 TOP 3** — Lifecycle 상태(▲ RISING / ◆ PEAK / ▼ FADING) + Fit Score
4. **추천 훅 패턴 2개** — 훅 유형 + 예시 문장
5. **이번 주 콘텐츠 플랜** — 구체적 주제 포함 2~3문장
6. **지금 당장 할 일 3가지** — 실행 가능한 액션 아이템

#### Fallback 전략

API 실패(네트워크 오류, rate limit, 파싱 실패) 시 `buildFallbackResult()`로 rule-based 기본 페르소나 생성. 사용자는 실패 여부를 인지하지 않음.

#### Lifecycle Meter 알고리즘

트렌드 TOP 3의 `state` 값을 결정.

```javascript
function classifyLifecycle({ viewsRecent, viewsPrev, uploadsRecent, uploadsPrev }) {
  const safeDiv = (a, b) => b === 0 ? 1 : a / b;
  const viewGR   = safeDiv(viewsRecent, viewsPrev);
  const uploadGR = safeDiv(uploadsRecent, uploadsPrev);
  const supplyPenalty = 2 - Math.min(uploadGR, 2);
  const score = (viewGR * 0.6) + (supplyPenalty * 0.4);
  if (score > 1.4)  return 'rising';
  if (score >= 0.9) return 'peak';
  return                   'fading';
}
```

---

### 2.2 Dashboard / Discovery (담당: 승연 + 규동)

앱 진입 시 기본 탭. 전체 트렌드 조감.

- 카테고리·서브카테고리 단위 트렌드 표시
- 크로스플랫폼(YouTube·TikTok·Instagram) 비교 가능한 정보 구조
- `GET /api/trends` 엔드포인트에서 데이터 fetch

> **TBD:** 카테고리 ID 통합 표준 — 지은 6개 / 승연 8개 / 규동 12+15개 → 단일 표준으로 합의 필요.

---

### 2.3 Recommend (담당: 규동 + 경재)

추천 탭. §1.3의 3단계 파이프라인으로 동작.

#### STEP 1 — 레퍼런스 제시

페르소나 + 실시간 트렌드 데이터 기반으로 콘텐츠 레퍼런스 3~5개 표시.

각 레퍼런스 카드에 포함되는 정보:

```json
{
  "video_id": "string",
  "title": "string",
  "category": "string",
  "platform": "youtube_shorts | tiktok | instagram_reels",
  "engagement_rate": 0.082,
  "category_avg_engagement": 0.0591,
  "thumbnail_url": "string",
  "duration_sec": 30
}
```

#### STEP 2 — LLM 콘텐츠 방향 추천 (사용자 수정 가능)

Claude가 STEP 1의 레퍼런스 3~5개를 분석해 이 페르소나에게 적합한 콘텐츠 방향을 추천. 결과는 텍스트로 표시되며 사용자가 직접 수정 가능.

추천에 포함되는 내용:
- 추천 콘텐츠 주제
- 접근 방식
- 훅 패턴 제안

#### STEP 3 — 대본 초안 생성 (경재)

STEP 2의 (수정된) 방향을 컨텍스트로 Claude에 전달해 대본 생성.

**대본 구조:**
```
HOOK   첫 3초 멘트
BODY   3단 내러티브
CTA    행동 유도
```

**톤 추천 방식 (V1):**
- 페르소나에 따라 1개 톤 자동 추천 + 적합도 점수(0~10) 표시
- 나머지 2개 톤은 토글로 전환 가능

| 톤 | 설명 |
|---|---|
| 정보형 | 데이터·팁·인사이트 중심 |
| 스토리형 | 내러티브·공감 중심 |
| 후킹형 | 강한 첫인상·자극 중심 |

**페르소나-톤 매핑 (기본값):**

| 페르소나 유형 | 추천 톤 |
|---|---|
| 초보 크리에이터 | 후킹형 |
| 정보 전달형 | 정보형 |
| 스토리텔러 | 스토리형 |
| 전문 브랜드 | 정보형 |

> **TBD:** 페르소나 유형 분류 체계 확정 후 매핑 테이블 업데이트 필요.

---

## 3. Data and API Plan

### 3.1 데이터 소스

| 플랫폼 | 데이터 소스 | 갱신 주기 |
|---|---|---|
| YouTube Shorts | YouTube Data API v3 (공식, 무료 한도 내) | 일 1회 |
| Instagram Reels | Apify Instagram Scraper (유료 플랜) | 주 1회 |
| TikTok | Apify TikTok Scraper (유료 플랜) | 주 1회 |

### 3.2 본질적 한계

외부 API는 **텍스트 메타데이터(제목, 설명, 해시태그)만 제공**하며, BGM이나 시각적 콘텐츠 자체는 분류 대상에 포함되지 않습니다.

**영향:**
- 텍스트 부재 비주얼 중심 콘텐츠 분류 불가
- 한글 텍스트 없이 이모지·영어로만 작성된 영상 누락
- 챌린지 사운드 기반 파생 트렌드 식별 어려움

**완화 방안:** 사용자가 원본 플랫폼 URL로 영상 랜딩 가능하도록 설계. V2에서 음원 ID 또는 비전 모델 연동 검토.

---

## 4. System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        Client (Browser)                      │
│    Next.js 프론트엔드                                          │
│    Onboarding → 트렌드 대시보드 탭 / 추천 탭 (하단 네비)         │
└──────────────────────────────┬───────────────────────────────┘
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                     Next.js API Routes                       │
│  GET /api/trends   POST /api/recommend   POST /api/script    │
└──────┬───────────────────┬─────────────────────┬─────────────┘
       ▼                   ▼                     ▼
┌─────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Anthropic  │    │  External APIs   │    │   Anthropic     │
│  Claude     │    │  YouTube API     │    │   Claude        │
│  (온보딩 분석 │    │  + Apify (paid)  │    │  (방향 추천 +    │
│   페르소나)  │    │                  │    │   대본 생성)     │
└─────────────┘    └──────────────────┘    └─────────────────┘
```

| 레이어 | 선택 |
|---|---|
| Frontend | Next.js 14 (App Router) |
| Backend | Next.js API Routes |
| 외부 데이터 | YouTube Data API + Apify (유료) |
| AI | Claude (Anthropic) |

> **TBD:** 호스팅 플랫폼 미정.

---

## 5. API Contract

### 5.1 공통

- 모든 외부 API 키는 서버 사이드(API Route)에서만 호출
- 응답 형식: JSON, `source: "live" | "mock"` 필드로 실데이터/Mock 구분

### 5.2 GET /api/trends

플랫폼별 트렌드 데이터 반환.

**Response:**
```json
{
  "source": "live | mock",
  "trends": [
    {
      "video_id": "string",
      "title": "string",
      "category": "string",
      "platform": "youtube_shorts | tiktok | instagram_reels",
      "engagement_rate": 0.082,
      "category_avg_engagement": 0.0591,
      "thumbnail_url": "string",
      "duration_sec": 30
    }
  ]
}
```

### 5.3 POST /api/recommend

페르소나 + 레퍼런스를 받아 콘텐츠 방향 추천.

**Request:**
```json
{
  "persona": {
    "personaType": "string",
    "category": "string",
    "platform": "string",
    "styles": ["string"]
  },
  "references": [ /* TrendItem 배열 (3~5개) */ ]
}
```

**Response:**
```json
{
  "direction": "string (LLM 추천 방향, 사용자 수정 가능)",
  "suggestedTopic": "string",
  "hookPattern": "string"
}
```

### 5.4 POST /api/script

콘텐츠 방향 + 레퍼런스를 받아 대본 초안 생성.

**Request:**
```json
{
  "direction": "string (사용자 수정 반영된 최종 방향)",
  "reference": { /* TrendItem */ },
  "persona": {
    "personaType": "string",
    "typeIndex": 0
  },
  "tone": "informative | story | hooking"
}
```

**Response:**
```json
{
  "recommendedTone": "informative | story | hooking",
  "toneScore": 8,
  "scripts": {
    "informative": { "hook": "string", "body": "string", "cta": "string" },
    "story":       { "hook": "string", "body": "string", "cta": "string" },
    "hooking":     { "hook": "string", "body": "string", "cta": "string" }
  }
}
```

### 5.5 TBD

- 카테고리 ID 통합 표준 (지은 6개 / 승연 8개 / 규동 12+15개 → 단일 표준)
- 페르소나 유형 분류 체계 확정
- 멀티플랫폼 선택 시 트렌드 가중치 기준

---

## 6. Security and Privacy

- 모든 외부 API 키(Anthropic, YouTube, Apify)는 서버 사이드에서만 호출, `.gitignore` 설정 완료
- V1 사용자 계정·로그인 없음 (익명 사용), 식별 정보 저장 안 함
- 트렌드 영상은 메타데이터(제목, 통계, URL)만 캐시; 영상 파일 저장 안 함

---

## 7. Success Criteria

### V1 발표 기준

| 지표 | 목표 |
|---|---|
| End-to-end 플로우 동작 | Onboarding → 대시보드 → 추천 → 대본 생성 무중단 |
| 데이터 신선도 | 24시간 이내 갱신 |
| 외부 API 장애 시 동작 | Mock fallback으로 데모 유지 |
| 대본 생성 성공률 | 95%+ |
| 평균 응답 시간 | < 8초 |

---

## 8. Current Scope

### 완료
- 페르소나 설문 V0 — 7문항, Claude API 연동, 결과 대시보드 (지은)
- YouTube Data API 연동 모듈 (규동)
- Apify Instagram·TikTok Scraper 연동 모듈 (규동)
- Claude Haiku 서브카테고리 자동 분류기 (규동)
- 대본 생성 V0 — Hook + Body + CTA, 3가지 톤 (경재)

### 진행 중
- 메인 브랜치 통합 및 Next.js 프로젝트 구조 전환
- PR 리뷰 및 머지

### 향후
- **카테고리 ID 통합 표준 합의** (팀 전체)
- **페르소나 유형 분류 체계 확정** (지은 + 팀)
- `POST /api/recommend` 구현 (규동)
- `POST /api/script` 구현 — 경재 V0 → Next.js API Route 이전 (경재 + 규동)
- 추천 탭 UI — STEP 1~3 파이프라인 화면 (승연 + 경재)
- 대본 생성 V1 — 1톤 추천 + 적합도 점수 + 토글 (경재)
- Instagram·TikTok 실데이터 수집 (Apify 유료 플랜 활성화)
- V2: BGM·비전 모델 연동

---

## 9. PR Checklist

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
- [ ] 외부 API 호출에 timeout과 에러 핸들링이 있는가
- [ ] Mock fallback이 외부 의존성 장애 시 동작하는가

### 테스트
- [ ] 로컬에서 Mock 모드와 Live 모드 둘 다 정상 동작하는가
- [ ] 모바일 화면 너비(360px~)에서 레이아웃이 깨지지 않는가

### 문서
- [ ] 새 기능 추가 시 README나 spec_main의 관련 섹션이 업데이트되었는가
- [ ] 환경 변수 추가 시 설정 가이드가 함께 추가되었는가
- [ ] PR 설명에 변경 의도와 테스트 방법이 명시되어 있는가
