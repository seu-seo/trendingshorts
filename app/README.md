# Shortform Pulse — Web v2 (Sample)

ver.2 (대시보드 진입형) 데모를 Next.js 14 구조로 변환한 샘플 프로젝트입니다.

`docs/SPEC.md v6.5`의 구조를 따르되, 실제 데이터 연동 없이 mock 기반으로 흐름·UI를 검증하는 용도입니다.

## Stack

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** — 디자인 토큰 기반 스타일
- **Zustand** — 글로벌 상태 (필터, 페르소나, 모달, 선택된 트렌드)

## Run

```bash
npm install
cp .env.example .env.local      # ANTHROPIC_API_KEY 설정 (선택)
npm run dev
```

→ http://localhost:3000 접속

`ANTHROPIC_API_KEY` 미설정 시 `/api/generate` 는 mock fallback 으로 동작합니다 (UI 동일 형태로 렌더 가능).

## Build

```bash
npm run build
npm run start
```

## Deploy (Vercel)

`vercel.json` 포함 — Seoul 리전(icn1) + `/api/generate` 함수 maxDuration 60s.

1. https://vercel.com/new → `seu-seo/trendingshorts` import
2. **Root Directory = `web-v2`** (필수)
3. Environment Variables: `ANTHROPIC_API_KEY` 추가 (없으면 mock fallback)
4. Deploy

## Structure

```
app/
├── layout.tsx              루트 레이아웃 + 폰 프레임
├── page.tsx                / 대시보드 (메인)
├── recommend/page.tsx      /recommend 추천 (페르소나 기반)
├── production/page.tsx     /production 제작 (대본 프롬프트, /api/generate 호출)
├── api/trends/route.ts     GET /api/trends (mock fallback)
├── api/generate/route.ts   POST /api/generate (Claude Sonnet 4.5, 3톤 동시 생성)
└── globals.css             디자인 토큰 + 애니메이션

components/
├── PhoneFrame.tsx          폰 외곽 + 상태바 + 헤더 + 탭바
├── StatusBar.tsx           9:41, 시계
├── AppHeader.tsx           로고 + 탭별 라벨
├── TabBar.tsx              하단 3-tab 네비게이션
├── dashboard/              대시보드 7개 컴포넌트
│   ├── PlatformPulse.tsx   플랫폼별 TOP 1 카드
│   ├── Heatmap.tsx         카테고리×플랫폼 적합도 매트릭스
│   ├── SearchBar.tsx       검색바 + 필터 버튼
│   ├── FilterModal.tsx     필터 바텀시트
│   ├── FilterSummary.tsx   활성 필터 chip
│   ├── FeaturedCard.tsx    이번 주 1위 (큰 카드)
│   └── TrendRow.tsx        컴팩트 리스트 행
├── recommend/              추천 3개 컴포넌트
│   ├── PersonaSetupCard.tsx
│   ├── PersonaModal.tsx    카테고리 + 스타일 선택 모달
│   └── RecoTrendCard.tsx
└── production/             제작 2개 컴포넌트
    ├── SelectedTrendBanner.tsx
    └── GeneratedScriptCard.tsx  hook/body/cta 카드 (LLM 결과)

lib/
├── types.ts                TypeScript 타입 정의
├── store.ts                Zustand 글로벌 상태
├── data/
│   ├── trends.ts           mock 트렌드 14개
│   └── categories.ts       카테고리 + 스타일 옵션
└── prompts/                대본 프롬프트 생성기 (LLM 모듈)
    ├── index.ts            re-exports
    ├── types.ts            ScriptTone, GenerateRequest/Response
    ├── recommend.ts        데이터 신호 기반 톤 추천 (4 신호)
    ├── system.ts           Claude system prompt 빌더
    └── parser.ts           strict JSON 파서 + mock fallback
```

## Tab Flow

```
대시보드 (/)
├── 플랫폼별 TOP 1 카드 → 클릭 시 /production
├── 카테고리 적합도 히트맵 → 셀 클릭 시 자동 필터
├── 검색 + 필터 모달
├── 이번 주 1위 (Featured 카드) → 클릭 시 /production
└── 컴팩트 리스트 → 클릭 시 /production

추천 (/recommend)
├── 페르소나 미설정 → 설정 카드 + 모달
└── 페르소나 설정 → 카테고리 기반 추천 → 클릭 시 /production

제작 (/production)
├── 선택된 트렌드 없음 → 안내 화면
└── 선택된 트렌드 있음
    └── /api/generate POST (자동) → Claude 단일 호출 → informative/story/hooking 3톤
        + 톤 결정 신호 표시 (transparency) + 추천 톤 ★ 배지 + 재생성/복사
```

## TBD

`docs/SPEC.md §9.2` 참조:

- 페르소나 분류 체계 (스타일 → 페르소나 매핑 로직)
- 페르소나 기반 추천 알고리즘
- 카테고리 ID 통합 표준
- 대본 생성 컨텍스트 입력 방식

위 항목은 mock 데이터로 가설 표현, 향후 팀 합의 후 확정.

## Notes

- 본 코드는 **검토용 샘플**이며, 정식 채택 시 `web/` 폴더의 기존 코드와 통합 방향 결정 필요.
- 디자인 시스템(다크 + 라임 + 핑크 + 블루)은 `demo/v3/` 와 동일.
