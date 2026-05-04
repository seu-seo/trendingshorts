# Backend Spec — `kyudong/backend-setup`

## 개요

숏폼 플랫폼(YouTube Shorts, Instagram Reels, TikTok) 트렌드 데이터를 수집·정규화하여 단일 API로 제공하는 백엔드 레이어 구현.

---

## 구현 범위

| 플랫폼 | 상태 | 방식 |
|---|---|---|
| YouTube Shorts | ✅ 완료 | YouTube Data API v3 |
| Instagram Reels | ✅ 완료 | Apify Instagram Scraper |
| TikTok | 🔍 탐색 중 | TikTok Research API 외 대안 방법 탐색 중 |

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
│       └── mock-data.ts           # Fallback mock 데이터 + 공통 타입
└── .env.local                     # API 키 (git 제외)
```

---

## YouTube Shorts 수집 (`lib/youtube.ts`)

### 수집 방식

1. **카테고리별 mostPopular 병렬 호출** — 9개 카테고리를 동시에 요청. 총 **9 units** 소비 (일 한도 10,000 units 대비 0.09%).
2. **한글 타이틀 필터** — `/[가-힣]/` 정규식으로 한국어 콘텐츠만 추출.
3. **세로형 Shorts 검증** — `youtube.com/shorts/{id}` HTTP 요청 시 200 반환이면 Shorts 플레이어, 3xx 리다이렉트이면 일반 영상으로 판별.

### 데이터 성격

`chart=mostPopular regionCode=KR` — 로그인 없이 호출하므로 **개인화 없는 일반 top 콘텐츠**. YouTube가 한국 전체 사용자 기준으로 산정하는 인기 차트.

### 주요 결정 사항

- `search.list` 미사용 — `q` 파라미터 없이 호출 시 결과 0개, 100 units 낭비
- YouTube 내부 Shorts 피드(`FEshorts` browseId) 미사용 — 인증 없이 400 반환
- `isShort()` fetch에 `cache: "force-cache"` 적용 — `redirect: "manual"`과 `next: { revalidate }` 동시 사용 불가

### 카테고리 → 썸네일 매핑

| categoryId | YouTube 분류 | 카테고리 | 썸네일 |
|---|---|---|---|
| 23 | Comedy | 유머 | 😂 |
| 24 | Entertainment | 댄스 | 🎭 |
| 17 | Sports | 운동 | 🏃 |
| 1 | Film & Animation | 일상 브이로그 | 🎬 |
| 20 | Gaming | 게임 | 🎮 |
| 26 | Howto & Style | 뷰티 | 💄 |
| 22 | People & Blogs | 일상 브이로그 | 📱 |
| 15 | Pets & Animals | 펫 | 🐾 |
| 28 | Science & Technology | 테크 | 💻 |

---

## Instagram Reels 수집 (`lib/instagram.ts`)

### 수집 방식

Instagram Graph API는 자기 계정 데이터만 접근 가능하며, 해시태그 검색(`hashtag.search`) API는 2021년 이후 신규 앱에 미지원. **Apify Instagram Scraper** (`apify~instagram-scraper` Actor)로 대체.

1. 한국 카테고리별 해시태그 탐색 페이지 10개를 입력으로 전달
   - `쇼츠`, `먹방`, `뷰티`, `브이로그`, `게임`, `운동`, `패션`, `여행`, `요리`, `댄스`
2. `resultsType: "reels"` 로 Reels 전용 수집 (posts 사용 시 Image 타입만 반환되는 문제 수정)
3. 해시태그당 최대 8개, 총 최대 80개 게시물 수집
4. 필터링 조건:
   - `type === "Video"` — Reels만 추출
   - 한글 캡션 (`/[가-힣]/`) — 한국 콘텐츠만
   - 광고 제외 — 해시태그 `광고/ad/sponsored` 또는 캡션 내 `광고/협찬/유료광고/제품제공/PR` 포함 시 제외
   - 중복 ID 제거

### 카테고리 → 썸네일 매핑

| 카테고리 | 썸네일 |
|---|---|
| 먹방 | 🍽️ |
| 뷰티 | 💄 |
| 댄스 | 🎭 |
| 게임 | 🎮 |
| 운동 | 🏃 |
| 일상 브이로그 | 📱 |
| 음악 | 🎵 |
| 펫 | 🐾 |
| 유머 | 😂 |
| 테크 | 💻 |

### 데이터 성격

`explore/tags/{해시태그}` 공개 탐색 페이지 기준 — 로그인 세션 없이 수집하므로 **개인화 없는 일반 top 콘텐츠**. 한국 불특정 다수에게 노출되는 상위 게시물 기준.

### Apify 호출 방식

`run-sync-get-dataset-items` 엔드포인트로 동기 실행 — Actor 완료까지 대기 후 결과 반환.

### 한계

- 응답 지연: Actor 실행 시간 포함으로 수십 초 소요 가능
- Instagram HTML 구조 변경 시 스크레이퍼 깨질 수 있음
- 트렌딩 지표 없음 — 성장률(`growth`) 계산 불가, `0` 하드코딩

---

## Fallback 전략

각 플랫폼 모듈은 환경변수 미설정 또는 API 오류 시 빈 배열 반환 → `route.ts`에서 `mock-data.ts`의 해당 플랫폼 데이터로 자동 대체.

```
실데이터 성공 → 실데이터 반환
실데이터 실패 or 0개 → mock 데이터 반환
```

---

## 캐싱

Next.js `fetch` 옵션 `next: { revalidate: 900 }` (15분) 적용. 동일 캐시 윈도우 내 중복 API 호출 차단.

---

## 환경변수

| 변수명 | 용도 |
|---|---|
| `YOUTUBE_API_KEY` | YouTube Data API v3 키 (Google Cloud Console) |
| `APIFY_API_TOKEN` | Apify Instagram Scraper 토큰 |
| `TIKTOK_CLIENT_KEY` | TikTok Research API (미사용, 승인 대기) |
| `TIKTOK_CLIENT_SECRET` | TikTok Research API (미사용, 승인 대기) |

---

## 미구현 / 다음 단계

- [ ] TikTok 데이터 수집 방법 확정 — Research API 외 대안 탐색 중 (`lib/tiktok.ts` 구현 예정)
- [ ] 성장률(`growth`) 계산 — Supabase에 조회수 시계열 저장 후 전 주기 대비 증감률 산출
- [ ] `/api/trends` 응답 캐싱 개선 — 현재 요청마다 외부 API 호출
