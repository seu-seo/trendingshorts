# Pulse v6 — MVP 구현 계획

> 작성일: 2026-06-02  
> 목표: 학교 발표용 실제 작동 MVP

---

## 1. 현재 상태 — 뭐가 하드코딩되어 있나

`index.html` 안에 직접 박혀있는 데이터 위치:

| 데이터 | 줄 번호 | 내용 |
|---|---|---|
| 해시태그 버블 8개 | 4630~4637 | `#출근길5분 +312%`, `#짠테크루틴 +248%` 등 |
| 트렌드 카드 5개 | 4652~4797 | 제목, 플랫폼, 조회수, 성장률 |
| 트렌드 상세 데이터 | 5869~5910 | 관련 영상 3개, 태그, WHY 없음 |
| 링 차트 수치 | 4601~4617 | 인스타 +480%, 유튜브 +215%, 틱톡 +188% |
| 프로필 이름 | 5340 | "수진 님" 고정 |
| AI Briefing | 인라인 텍스트 | 고정 문구 |

모두 실제 API 데이터로 교체 대상.

---

## 2. API 선택과 이유

### 사용 가능한 API

| API | 용도 | 비용 |
|---|---|---|
| **Naver DataLab** | 한국 키워드 검색량 트렌드 + 성장률 | 무료 |
| **YouTube Data API v3** | 한국 트렌딩 영상 실제 조회수/제목 | 무료 (10K units/일) |
| **Claude API (Anthropic)** | WHY 인사이트 + AI Briefing 자동 생성 | 유료 (데모용 $5 충분) |

### 틱톡/인스타그램 API를 안 쓰는 이유

**틱톡**: 공식 API가 존재하지만 기업 심사 필수. 개인/학생팀은 승인 자체가 불가. 검색량, 트렌딩 데이터 접근 불가.

**인스타그램**: Meta Graph API는 본인 계정 데이터만 읽을 수 있음. 플랫폼 전체 트렌딩 데이터 접근 불가.

### 대안

| 플랫폼 | 방법 |
|---|---|
| YouTube | API로 실제 트렌딩 데이터 |
| 틱톡 | Naver DataLab 검색어 트렌드로 간접 추정 |
| 인스타 | Naver DataLab 검색어 트렌드로 간접 추정 |

Naver DataLab은 플랫폼 구분 없이 한국 전체 검색량을 제공. "틱톡에서 뜨는 키워드"를 직접 가져오는 건 불가능하지만, 해당 키워드의 검색 성장률은 추출 가능. 발표용 MVP로는 충분히 설득력 있음.

---

## 3. 전체 구조 변화

```
현재
└── index.html (데이터 하드코딩)

MVP 이후
├── index.html       (프론트엔드 — fetch로 데이터 요청)
├── server.js        (Node.js 로컬 서버 — API 프록시)
├── package.json
└── .env             (API 키 — git에 올리지 않음)
```

`server.js` 라우터 구조:
```
GET /api/trends   → Naver DataLab 호출 → 트렌드 카드 데이터 반환
GET /api/youtube  → YouTube API 호출  → 관련 영상 데이터 반환
GET /api/why      → Claude API 호출   → WHY 텍스트 + AI Briefing 반환
```

---

## 4. 기술 업무 분담

### a — 서버 + 프론트엔드 연동 (Claude Code)

**만드는 것:**

```
server.js (신규)
├── GET /api/trends   → Naver DataLab 호출
├── GET /api/youtube  → YouTube trending 호출
└── GET /api/why      → Claude API 호출

index.html (수정)
├── 4630~4637줄 해시태그 → fetch('/api/trends')로 교체
├── 4652~4797줄 트렌드 카드 → fetch('/api/trends')로 교체
├── AI Briefing → fetch('/api/why')로 교체
└── saveTrend() 함수 → localStorage 저장 추가
```

b, c, d 키 전달 전에 선행 가능한 것:
- server.js 골격 + 라우터 구조
- `renderTrends(data)` 동적 렌더 함수
- `.env.example` 파일 작성

---

### b — Naver DataLab API

**기술 작업 1 — API 키 발급 (30분)**
1. developers.naver.com → 애플리케이션 등록
2. 서비스 환경: PC 웹 → URL: `http://localhost:3000`
3. 사용 API: 데이터랩(검색어트렌드) 체크
4. Client ID + Client Secret → a에게 전달

**기술 작업 2 — 검색어 그룹 설계 (2시간)**

Naver DataLab는 키워드 묶음 단위로 트렌드를 조회함. 앱에 보여줄 카테고리별 키워드를 아래 포맷으로 정리해서 a에게 전달:

```
트렌드 이름          | 검색어 그룹
──────────────────────────────────────────────────
짠테크/절약          | 커피값절약, 무지출챌린지, 짠테크, 절약일기
홈카페              | 홈카페, 라떼아트, 달고나, 홈카페레시피
퇴근루틴 브이로그    | 퇴근루틴, 직장인브이로그, 퇴근후
도시락/간편요리      | 직장인도시락, 5분요리, 밀프렙, 냉털레시피
2010년대 감성        | 2010년대노래, Y2K, 레트로감성
```

a가 이 목록을 Naver API 쿼리에 그대로 사용.

---

### c — Claude API + 프롬프트 설계

**기술 작업 1 — API 키 발급 (10분)**
1. console.anthropic.com → API Keys → Create Key
2. 크레딧 충전 ($5 정도면 데모용 충분)
3. 키 복사 (한 번만 표시됨, 즉시 저장) → a에게 전달

**기술 작업 2 — WHY 프롬프트 확정 (2시간)**

Claude.ai 채팅창에서 직접 테스트하면서 출력이 마음에 들 때까지 수정. 확정본을 a에게 전달.

```
[초안 — Claude.ai에서 테스트]
트렌드: {title}
플랫폼: {platform}
성장률: {growth}
연관 키워드: {tags}

이 트렌드가 지금 한국에서 뜨는 이유를
크리에이터 관점에서 2문장으로 설명해줘.
첫 문장: 왜 사람들이 관심 갖는지 (사회/문화적 배경)
둘째 문장: 크리에이터에게 어떤 기회인지
말투: 친근한 "~해요" 체, 이모지 없이
```

**기술 작업 3 — AI Briefing 프롬프트 확정 (1시간)**

```
[초안]
오늘 Top 3 트렌드: {trend1}, {trend2}, {trend3}
사용자 플랫폼: {platform}

오늘의 크리에이터 브리핑을 작성해줘.
첫 줄: 오늘 분위기 한 줄 요약
핵심 포인트 3개 (번호, 한 줄씩)
전체 120자 이내, 친근한 한국어, 이모지 없이
```

테스트 기준: 결과물을 앱에 바로 붙여도 어색하지 않으면 완성.

---

### d — YouTube API + QA

**기술 작업 1 — YouTube API 발급 (30분)**
1. console.cloud.google.com → 새 프로젝트 생성
2. API 및 서비스 → YouTube Data API v3 → 사용 설정
3. 사용자 인증 정보 → API 키 생성 → a에게 전달
4. 한국 트렌딩 endpoint 확인: `videos?chart=mostPopular&regionCode=KR&videoCategoryId=0`

**기술 작업 2 — 서버 완성 후 엔드포인트 테스트**

a가 서버 완성하면 아래 항목 직접 확인:
```
체크리스트
[ ] node server.js 실행 → 오류 없이 시작되는지
[ ] localhost:3000/api/trends → 데이터 반환되는지
[ ] localhost:3000/api/youtube → 영상 데이터 반환되는지
[ ] localhost:3000/api/why → WHY 텍스트 반환되는지
[ ] 트렌드 카드 저장 → 새로고침 후 유지되는지 (localStorage)
[ ] 모바일 브라우저에서 화면 깨짐 없는지
```

버그 발견 시: 어떤 화면에서, 어떤 행동을 했을 때, 어떤 결과가 나왔는지 → a에게 전달.

---

## 5. 의존성 흐름

```
b → Naver 키 + 키워드 그룹 ─┐
c → Claude 키 + 프롬프트    ├──→ a 서버 완성 ──→ d 테스트
d → YouTube 키              ─┘
```

b, c, d 키 발급은 각각 독립적 — 동시에 진행 가능.  
a는 키 받기 전에 server.js 골격 + 동적 렌더 함수 선행 작성.

---

## 6. 실행 환경

```bash
# 사전 설치
node -v   # Node.js 설치 확인 (없으면 nodejs.org에서 설치)

# 서버 실행
cd demo/v6
npm install
node server.js

# 브라우저에서 확인
open http://localhost:3000
```

`.env` 파일 구조 (a가 생성, API 키는 각자 전달):
```
NAVER_CLIENT_ID=
NAVER_CLIENT_SECRET=
YOUTUBE_API_KEY=
ANTHROPIC_API_KEY=
```
