# Backend Spec — `kyudong/backend-setup`

## 개요

숏폼 플랫폼(YouTube Shorts, Instagram Reels, TikTok) 트렌드 데이터를 수집·정규화하여 단일 API로 제공하는 백엔드 레이어 구현.

---

## 구현 범위

| 플랫폼 | 상태 | 방식 |
|---|---|---|
| YouTube Shorts | ✅ 완료 | YouTube Data API v3 |
| Instagram Reels | ✅ 완료 | Apify Instagram Scraper |
| TikTok | ✅ 완료 | Apify TikTok Scraper |

---

## API Endpoint

### `GET /api/trends`

쿼리 파라미터 `platform`으로 플랫폼 필터링. 미지정 시 전체 반환.

| 파라미터 | 값 | 기본값 |
|---|---|---|
| `platform` | `all` \| `youtube` \| `instagram` \| `tiktok` | `all` |

**응답 예시**
```json
{
  "data": [
    {
      "id": 1,
      "platform": "youtube",
      "title": "...",
      "creator": "@채널명",
      "views": 1200000,
      "likes": 48000,
      "comments": 3200,
      "shares": 0,
      "category": "유머",
      "growth": 0,
      "duration": "0:58",
      "thumbnail": "😂",
      "trending_since": "3시간 전",
      "tags": ["#shorts"],
      "videoUrl": "https://www.youtube.com/shorts/..."
    }
  ],
  "source": "live"
}
```

- `source: "live"` — 실제 API 데이터
- `source: "mock"` — 환경변수 미설정 시 mock 데이터 fallback

---

## 파일 구조

```
web/
├── src/
│   ├── app/
│   │   └── api/
│   │       └── trends/
│   │           └── route.ts       # API Route 진입점
│   └── lib/
│       ├── youtube.ts             # YouTube Shorts 수집 모듈
│       ├── instagram.ts           # Instagram Reels 수집 모듈
│       ├── tiktok.ts              # TikTok 수집 모듈
│       └── mock-data.ts           # Fallback mock 데이터 + 공통 타입
└── .env.local                     # API 키 (git 제외)
```

---

## 플랫폼별 수집 상세

### 1. API 호출 주기

| 플랫폼 | 캐시 TTL | 최대 호출 횟수 | 비고 |
|---|---|---|---|
| YouTube | 24시간 | 1회/일 | Next.js `revalidate: 86400` |
| Instagram | 24시간 | 1회/일 | Next.js `revalidate: 86400` |
| TikTok | 24시간 | 1회/일 | Next.js `revalidate: 86400` |

> 캐시 동작 방식: 첫 요청 시 외부 API 호출 → 24시간 캐시 → 만료 후 다음 요청 시 재호출. 사용자가 없는 시간대는 호출 자체가 발생하지 않음.

**비용 설정 옵션 (Instagram + TikTok 기준, Apify Pay-per-event)**

| 옵션 | Instagram | TikTok | 비용/회 | 월 비용(30회) |
|---|---|---|---|---|
| 현재 (프로토타입) | 15개 × 12건 | 15개 × 6건 | ~$0.94 | ~$28 |
| 절약형 | 15개 × 5건 | 15개 × 5건 | ~$0.34 | ~$10 |
| 최대형 | 15개 × 30건 | 15개 × 20건 | ~$2.62 | ~$79 |

> 실측 단가: Instagram $0.0027/건, TikTok $0.005/건

---

### 2. 카테고리 수 및 수집 콘텐츠 수

| 플랫폼 | 수집 단위 | 단위 수 | 단위당 수집 | 최대 수집(필터 전) | 실 수집(필터 후) |
|---|---|---|---|---|---|
| YouTube | 카테고리 | 12개 | 50개 | 600개 | 수십~150개 |
| Instagram | 해시태그 | 15개 | 12개 | 180개 | 수십~80개 |
| TikTok | 해시태그 | 15개 | 6개 | 90개 | 수십~50개 |

**YouTube 카테고리 (12개)**

| categoryId | YouTube 분류 | 서비스 카테고리 | 썸네일 |
|---|---|---|---|
| 1 | Film & Animation | 콘텐츠 | 🎬 |
| 10 | Music | 음악 | 🎵 |
| 15 | Pets & Animals | 펫 | 🐾 |
| 17 | Sports | 운동 | 🏃 |
| 19 | Travel & Events | 여행 | ✈️ |
| 20 | Gaming | 게임 | 🎮 |
| 22 | People & Blogs | 일상 브이로그 | ☀️ |
| 23 | Comedy | 유머 | 😂 |
| 24 | Entertainment | 댄스 | 🎭 |
| 26 | Howto & Style | 뷰티 | 💄 |
| 27 | Education | DIY | 🔨 |
| 28 | Science & Technology | 테크 | 💻 |

**Instagram·TikTok 해시태그 (15개)**

| 해시태그 | 서비스 카테고리 | 썸네일 |
|---|---|---|
| 먹방, 요리 | 먹방 | 🍽️ |
| 뷰티, 패션 | 뷰티 | 💄 |
| 댄스 | 댄스 | 🎭 |
| 게임 | 게임 | 🎮 |
| 운동 | 운동 | 🏃 |
| 쇼츠(IG), 브이로그, 일상(TK) | 일상 브이로그 | ☀️ |
| 여행 | 여행 | ✈️ |
| 음악 | 음악 | 🎵 |
| 반려동물 | 펫 | 🐾 |
| 유머 | 유머 | 😂 |
| asmr | ASMR | 🎧 |
| diy | DIY | 🔨 |

---

### 3. 콘텐츠 수집 기준

**YouTube**
- 세로형 Shorts 검증: `youtube.com/shorts/{id}` HTTP 요청 → 200 응답이면 Shorts 플레이어, 3xx 리다이렉트이면 일반 영상으로 판별·제외
- 길이 180초(3분) 이하
- 한글 타이틀 포함 (`/[가-힣]/`)

**Instagram**
- `resultsType: "reels"` — Reels 전용 수집 (posts로 호출 시 Image 타입만 반환됨)
- `type === "Video"` 인 게시물만 추출
- 한글 캡션 포함 (`/[가-힣]/`)
- 광고 제외: 해시태그 `광고 / ad / sponsored` 또는 캡션 내 `광고 / 협찬 / 유료광고 / 제품제공 / PR` 포함 시 제외
- 중복 ID 제거

**TikTok**
- 한글 텍스트 포함 (`/[가-힣]/`)
- `isAd === true` 또는 `isSponsored === true` 제외
- 중복 ID 제거

---

### 4. "Trending" 정의 기준

각 플랫폼의 Trending 기준은 **플랫폼 자체 알고리즘**에 따르며, 로그인 없이 수집하므로 개인화 없는 일반 top 콘텐츠입니다.

| 플랫폼 | Trending 기준 | 근거 |
|---|---|---|
| YouTube | YouTube가 한국(KR) 전체 사용자 기준으로 산정하는 **인기 차트** | `chart=mostPopular&regionCode=KR` — 조회수·시청 시간·좋아요·댓글 등 종합 신호 반영 |
| Instagram | 해당 해시태그 **탐색(Explore) 페이지 상위 노출 게시물** | 최근성 + 참여도(좋아요·댓글·저장) 기반으로 Instagram 알고리즘이 선별 |
| TikTok | 해당 해시태그 **검색 결과 상위 노출 영상** | 조회수·좋아요·댓글·공유 + TikTok 내부 바이럴 신호 기반으로 플랫폼이 정렬 |

---

### 5. 누락될 수 있는 요소

**YouTube**
- 한글 타이틀 없이 영어·이모지로만 작성된 한국 Shorts (타이틀 필터에서 제외)
- 업로드 직후 아직 인기 차트에 진입하지 못한 급상승 콘텐츠
- 9개 카테고리에 해당하지 않는 분야 (예: 뉴스, 교육 등)

**Instagram**
- 한글 캡션 없이 이모지·영어로만 작성된 한국 크리에이터 Reels
- 비공개 계정 또는 지역 제한 게시물
- 해시태그를 사용하지 않고 알고리즘 노출만으로 트렌딩된 콘텐츠
- 광고 필터가 잡지 못하는 비명시적 협찬 (예: "이 제품 써봤어요" 형태)

**TikTok**
- 한글 텍스트 없이 영상·음악만으로 트렌딩된 콘텐츠 (예: 챌린지 사운드 기반)
- 듀엣·스티치 형태의 파생 트렌딩 콘텐츠
- 15개 해시태그 외 새롭게 부상하는 신조어 해시태그

**공통**
- 성장률(`growth`) 미계산 — 현재 `0` 하드코딩, 시계열 DB 미구축
- 실시간성 한계 — 1시간 캐시로 인해 최대 1시간 지연

---

## YouTube Shorts 수집 (`lib/youtube.ts`)

### 수집 방식

1. **카테고리별 mostPopular 병렬 호출** — 9개 카테고리를 동시에 요청. 총 **9 units** 소비 (일 한도 10,000 units 대비 0.09%).
2. **한글 타이틀 필터** — `/[가-힣]/` 정규식으로 한국어 콘텐츠만 추출.
3. **세로형 Shorts 검증** — `youtube.com/shorts/{id}` HTTP 요청 시 200 반환이면 Shorts 플레이어, 3xx 리다이렉트이면 일반 영상으로 판별.

### 주요 결정 사항

- `search.list` 미사용 — `q` 파라미터 없이 호출 시 결과 0개, 100 units 낭비
- YouTube 내부 Shorts 피드(`FEshorts` browseId) 미사용 — 인증 없이 400 반환
- `isShort()` fetch에 `cache: "force-cache"` 적용 — `redirect: "manual"`과 `next: { revalidate }` 동시 사용 불가

---

## Instagram Reels 수집 (`lib/instagram.ts`)

### 수집 방식

Instagram Graph API는 자기 계정 데이터만 접근 가능하며, 해시태그 검색(`hashtag.search`) API는 2021년 이후 신규 앱에 미지원. **Apify Instagram Scraper** (`apify~instagram-scraper` Actor)로 대체.

`run-sync-get-dataset-items` 엔드포인트로 동기 실행 — Actor 완료까지 대기 후 결과 반환.

### 한계

- 응답 지연: Actor 실행 시간 포함으로 수십 초 소요 가능
- Instagram HTML 구조 변경 시 스크레이퍼 깨질 수 있음

---

## TikTok 수집 (`lib/tiktok.ts`)

### 수집 방식

TikTok Research API 승인 대기 대신 **Apify TikTok Scraper** (`clockworks~free-tiktok-scraper` Actor)로 대체. Instagram과 달리 `shares` 필드 실제값 존재 (`shareCount`).

### 한계

- 응답 지연: Actor 실행 시간 포함 수십 초 소요 가능
- TikTok 구조 변경 시 스크레이퍼 깨질 수 있음
- Apify 무료 크레딧을 Instagram과 공유

---

## Fallback 전략

각 플랫폼 모듈은 환경변수 미설정 또는 API 오류 시 빈 배열 반환 → `route.ts`에서 `mock-data.ts`의 해당 플랫폼 데이터로 자동 대체.

```
실데이터 성공 → 실데이터 반환
실데이터 실패 or 0개 → mock 데이터 반환
```

---

## 서브카테고리 분류 (`lib/classify.ts`)

수집된 콘텐츠에 Claude Haiku를 이용해 서브카테고리를 자동 분류하여 `TrendItem.subcategory` 필드로 반환.

### 분류 방식

- **AI 분류**: `ANTHROPIC_API_KEY` 설정 시 Claude Haiku (`claude-haiku-4-5-20251001`)로 제목·해시태그 기반 분류
- **Keyword fallback**: API 키 미설정 또는 오류 시 정규식 기반 keyword 분류 (커버리지 ~70%)

### 서브카테고리 목록

| 카테고리 | 서브카테고리 |
|---|---|
| 먹방 | 레시피, 맛집리뷰, 편의점, 카페·디저트, 먹방ASMR |
| 뷰티 | 메이크업, 스킨케어, 헤어, 패션·코디 |
| 댄스 | 챌린지, 커버댄스, 안무 |
| 일상 브이로그 | 하루일상, 출근·직장, 루틴, 모닝루틴 |
| 게임 | 게임플레이, 공략·팁, 반응·리액션 |
| 운동 | 홈트, 헬스·바디빌딩, 요가·필라테스, 다이어트 |
| 펫 | 강아지, 고양이, 특이한동물 |
| 유머 | 상황극, 몰카·반응, 밈 |
| ASMR | 먹방ASMR, 자연·환경, 일상ASMR |
| DIY | 인테리어, 공예·만들기, 요리DIY |
| 음악 | 커버·MR제거, 작곡·비트, 뮤직비디오 |
| 여행 | 국내여행, 해외여행, 맛집투어 |
| 콘텐츠 | 영화·드라마, 웹툰·애니, 리뷰 |
| 테크 | 기기리뷰, 언박싱, IT꿀팁 |

### 비용

| 모델 | 토큰/건 | 하루(~400건) | 월 비용 |
|---|---|---|---|
| Claude Haiku 4.5 | ~150 input / ~10 output | ~$0.05 | **~$1.50** |

---

## 환경변수

| 변수명 | 용도 |
|---|---|
| `YOUTUBE_API_KEY` | YouTube Data API v3 키 (Google Cloud Console) |
| `APIFY_API_TOKEN` | Apify Instagram·TikTok Scraper 공용 토큰 |
| `ANTHROPIC_API_KEY` | Claude Haiku 서브카테고리 분류용 |
| `TIKTOK_CLIENT_KEY` | TikTok Research API (미사용, 승인 대기) |
| `TIKTOK_CLIENT_SECRET` | TikTok Research API (미사용, 승인 대기) |

---

## 미구현 / 다음 단계

- [ ] 성장률(`growth`) 계산 — Supabase에 조회수 시계열 저장 후 전 주기 대비 증감률 산출
- [ ] `/api/trends` 응답 캐싱 개선 — 현재 요청마다 외부 API 호출
- [ ] Sue 브랜치(`feature/cross-platform-comparison`) 계층형 카테고리 UI에 `subcategory` 필드 연결
