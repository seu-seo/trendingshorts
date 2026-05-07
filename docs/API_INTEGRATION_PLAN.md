# API 연동 계획 (API Integration Plan)

> 작성일: 2026-04-29  
> 브랜치: `kyudong/backend-setup`  
> 목적: YouTube, Instagram, TikTok 3개 플랫폼 API 연동 순서 및 범위 결정

---

## 현재 상태

`index.html`은 하드코딩된 mock 데이터(18개 트렌드 카드)로 동작하는 React 데모다.  
실제 API 연동은 없다. 이 문서는 어떤 순서로, 어느 수준까지 실제 데이터를 붙일지 결정하기 위한 계획이다.

---

## 플랫폼별 API 접근 난이도 요약

| 플랫폼 | API 명 | 난이도 | 승인 기간 | 트렌딩 데이터 직접 접근 |
|--------|--------|--------|----------|----------------------|
| YouTube | YouTube Data API v3 | 🟢 쉬움 | 즉시 (API 키 발급) | ✅ 가능 |
| Instagram | Instagram Graph API | 🟡 중간 | 1~3일 (앱 심사) | ⚠️ 부분적 가능 |
| TikTok | TikTok Research API | 🔴 어려움 | 수 주~수 개월 | ⚠️ 제한적 |

---

## 1순위: YouTube Data API v3

### 왜 먼저인가
- Google Cloud Console에서 API 키 발급 즉시 사용 가능
- YouTube Shorts 트렌딩 목록을 직접 조회할 수 있는 엔드포인트 존재
- 조회수, 좋아요, 댓글 수 등 핵심 engagement 지표 모두 제공
- 일일 할당량 10,000 units (기본) — MVP 운영에 충분

### 할 수 있는 것
```
videos.list (chart=mostPopular)
  → 국가별 트렌딩 영상 목록 (최대 50개)
  → 필터: videoCategoryId, regionCode=KR

video.statistics
  → viewCount, likeCount, commentCount, favoriteCount

search.list
  → 키워드/해시태그 기반 Shorts 검색
  → 필터: videoDuration=short (≤4분), order=viewCount
```

### Shorts 필터링 방법
YouTube Data API에 "Shorts 전용" 파라미터는 없다. 아래 조건으로 근사 필터링:
1. `videoDuration=short` → 4분 이하 영상
2. title 또는 description에 `#shorts` 포함 여부 확인
3. 영상 길이가 60초 이하인 경우 (contentDetails.duration 파싱)

### 할 수 없는 것
- 공유 수(shares) → YouTube API에서 제공하지 않음 (mock 데이터 또는 제거)
- "성장률" 직접 계산 → 시간 간격으로 조회수 차이를 직접 저장해야 함

### 연동 수준 결정: **Full**
```
구현 범위:
- 트렌딩 Shorts 목록 실시간 조회 (mostPopular + duration 필터)
- 카테고리별 필터링 (videoCategoryId 매핑)
- 조회수 / 좋아요 / 댓글 수 실데이터 표시
- 성장률: 1시간 간격 조회수 차이로 계산 (DB 저장 필요)
- 지역: regionCode=KR 고정
```

### API 키 발급 절차
```
1. Google Cloud Console → 프로젝트 생성
2. YouTube Data API v3 활성화
3. 사용자 인증 정보 → API 키 생성
4. 할당량 초과 대비: 캐싱 레이어 (Redis 또는 서버 메모리, TTL 15분)
```

### 비용
- 기본 10,000 units/일 무료
- videos.list 1회 호출 = 1 unit
- search.list 1회 = 100 units → 캐싱 필수

---

## 2순위: Instagram Graph API

### 왜 두 번째인가
- Facebook Developer 앱 등록 + OAuth 필요 → 1~3일 소요
- "트렌딩 Reels 피드" 엔드포인트가 없음 → 해시태그 기반으로 우회
- Business/Creator 계정만 API 접근 가능 → 일반 개인 계정 데이터 없음

### 할 수 있는 것
```
hashtag.search + hashtag/{id}/top_media
  → 특정 해시태그의 상위 미디어 (Reels 포함)
  → 좋아요 수, 댓글 수 조회 가능

ig-media/{id}/insights
  → 본인 계정 Reels 상세 지표 (reach, plays, shares)

Instagram Basic Display API (deprecated 예정)
  → 개인 계정 미디어 리스트 (제한적)
```

### 할 수 없는 것
- 전체 플랫폼 트렌딩 Reels 피드 직접 조회 → 불가
- 타인 계정의 상세 engagement 지표 조회 → 불가
- 조회수(plays) — 본인 계정 외 공개 안 됨

### 연동 수준 결정: **Hashtag 기반 Partial**
```
구현 범위:
- 사전 정의한 카테고리별 해시태그 목록으로 top_media 조회
  예: 먹방 → #먹방shorts, #shortskorea
      뷰티 → #뷰티쇼츠, #skincareroutine
- 좋아요 + 댓글 수 기반 인기도 정렬
- 조회수(plays)는 표시 불가 → UI에서 "-" 또는 제거
- 성장률 계산 불가 → 해시태그별 상위 노출로 대체
```

### 제약 사항 처리
```
트렌딩 Reels 피드가 없는 문제:
→ 해시태그 top_media로 트렌딩에 근사
→ 장기적으로: Meta Business Suite 파트너십 검토
   (공식 파트너는 더 넓은 데이터 접근 가능)

조회수 없는 문제:
→ MVP에서는 좋아요 + 댓글 기반 engagement 점수로 대체
→ UI 카드에서 "조회수" 항목 숨기고 engagement rate 표시
```

### 앱 등록 절차
```
1. developers.facebook.com → 앱 생성 (Business 유형)
2. Instagram Graph API 제품 추가
3. 테스트 계정 연결 (Instagram Business 계정 필요)
4. 권한 요청: instagram_basic, instagram_manage_insights, pages_read_engagement
5. 앱 심사 제출 (public launch 전 필요)
```

---

## 3순위: TikTok API

### 왜 마지막인가
- PREMORTEM 시나리오 1에서 이미 최고 리스크로 분류
- TikTok Research API: 학술/연구 기관 대상, 개인 개발자 승인 불투명
- TikTok for Developers (Display API): 한국 계정 접근 조건 제한
- 승인까지 수 주~수 개월 소요 가능

### API 옵션 비교
```
옵션 1: TikTok Research API
  대상: 학술/연구 기관
  접근 데이터: 공개 비디오 데이터, 사용자 공개 정보
  승인: 기관 이메일 필요, 개인 불가

옵션 2: TikTok for Developers (Content Posting API)
  대상: 앱 개발자
  접근 데이터: 본인 계정 게시/조회만 가능, 트렌딩 피드 없음
  승인: 상대적으로 빠름

옵션 3: TikTok Display API (구버전)
  현재: 신규 신청 중단 상태 (2023년 이후)

옵션 4: 비공식 방법 (스크래핑)
  TikTok unofficial API 라이브러리 존재
  → 서비스 약관 위반 가능성, 안정성 낮음
  → MVP 검증 단계에서 임시 사용 검토
```

### 연동 수준 결정: **보류 → 대안으로 시작**
```
Phase 1 (MVP):
  공식 API 신청 진행 + 대기
  → 비공식 방법으로 제한적 데이터 수집 (내부 검증용)
  → UI에서 TikTok 탭은 "데이터 수집 중" 상태로 표시

Phase 2 (승인 후):
  Research API 또는 파트너십 경로로 정식 연동
  → 해시태그 기반 트렌딩 영상 조회
  → 조회수, 좋아요, 댓글 수, 공유 수

신청 진행 항목:
  → TikTok for Developers 계정 생성 (developer.tiktok.com)
  → Content Posting API 신청 (가장 빠른 경로)
  → Research API 신청 동시 진행 (KAIST 기관 이메일 활용 검토)
```

---

## 구현 로드맵

```
Week 1~2: YouTube Data API 연동
──────────────────────────────────────────────────────────
[ ] Google Cloud Console API 키 발급
[ ] videos.list (mostPopular) 호출 → 트렌딩 목록
[ ] Shorts 필터링 로직 (duration ≤ 60s + #shorts)
[ ] 카테고리 매핑 테이블 작성 (YouTube categoryId → 한국어 카테고리)
[ ] 15분 캐싱 레이어 구현
[ ] 성장률 계산용 시계열 저장 구조 설계

Week 3~4: Instagram Graph API 연동
──────────────────────────────────────────────────────────
[ ] Facebook Developer 앱 생성 + Business 계정 연결
[ ] 카테고리별 해시태그 목록 정의
[ ] hashtag.search + top_media 연동
[ ] engagement 점수 계산 로직 (좋아요 + 댓글 × 가중치)
[ ] UI 카드에서 조회수 항목 조건부 숨김 처리

Week 5~: TikTok API 병렬 진행
──────────────────────────────────────────────────────────
[ ] developer.tiktok.com 계정 및 앱 생성
[ ] Content Posting API 신청
[ ] Research API 신청 (KAIST 기관 메일 활용 가능 여부 확인)
[ ] 승인 대기 중: 내부 검증용 비공식 데이터 수집 구조 설계
```

---

## 백엔드 구조 개요

현재 index.html 단일 파일 구조에서 API 연동을 위해 백엔드가 필요하다.  
API 키는 클라이언트에 노출되면 안 되므로 서버 사이드에서 호출해야 한다.

```
권장 구조:
  Frontend (React) → Backend API Server → 각 플랫폼 API
                          ↕
                      Cache Layer (Redis / in-memory)
                          ↕
                      DB (트렌드 시계열 저장)

기술 스택 옵션:
  - Next.js (API Routes) → 프론트+백 통합, Vercel 배포 용이
  - FastAPI (Python) → 데이터 처리 로직에 강점
  - Express.js → 가장 빠른 셋업

추천: Next.js API Routes
  → 현재 React 코드 마이그레이션 용이
  → Vercel 배포 최적화
  → 서버리스 함수로 각 플랫폼 API 호출 분리
```

---

## 데이터 수집 주기 및 비용 시뮬레이션

```
YouTube Data API:
  트렌딩 조회: 1 unit × 15분마다 = 96 units/일
  Shorts 필터링 (search): 100 units × 4회/일 = 400 units/일
  영상 상세 (statistics): 1 unit × 50개 × 4회 = 200 units/일
  합계: ~700 units/일 → 기본 할당량(10,000) 내 여유 충분

Instagram Graph API:
  해시태그 검색: 무료 (횟수 제한 있음, 주당 30회/해시태그)
  → 카테고리 12개 × 1회/시간 = 288회/일 → 제한 초과 주의
  → 실제: 6시간 간격으로 줄여서 48회/일 권장

사용자 100명 기준 월 예상 비용:
  YouTube: 무료 (할당량 내)
  Instagram: 무료
  서버 (Vercel/Railway): $0~$20
  DB (Supabase Free Tier): $0
  합계: $0~$20/월
```

---

## 다음 액션 아이템

```
kyudong 담당 (backend-setup 브랜치):
[ ] Google Cloud Console 프로젝트 생성 및 YouTube Data API 키 발급
[ ] Next.js 프로젝트 초기 셋업 (현재 index.html → 마이그레이션)
[ ] YouTube API 호출 모듈 작성 (src/lib/youtube.ts)
[ ] Facebook Developer 앱 생성 시작
[ ] TikTok Developer 계정 생성 및 API 신청 접수
```
