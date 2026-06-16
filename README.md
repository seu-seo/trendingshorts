# Shortform Pulse

초보 크리에이터(시작 1년 이하)를 위한 숏폼 가이드.

## 현재 개발 브랜치

- **v8 SPA:** `feat/v8-next.js` — Next.js App Router SPA 패턴으로 전환, 실제 YouTube SSE 라이벌 분석 포함

## What

YouTube Shorts · TikTok · Instagram Reels의 트렌드를 한 곳에서 비교하고, 자기 채널에 맞는 트렌드를 발견해, AI 대본·콘티 초안까지 받아볼 수 있는 도구입니다. 기존 도구가 "무엇이 인기인가" 까지만 보여주는 것과 달리, 본 제품은 "그래서 너는 뭘 만들어야 하는가" 까지 워크플로우를 확장합니다.

## Why

소비자 모드에서 크리에이터로 전환하는 시점에 구조적 정보 격차가 발생합니다. 개인화 알고리즘은 본인의 소비 패턴만 반영할 뿐, 대중의 집계된 행동을 보여주지 않기 때문입니다.

자체 데이터 인프라를 갖춘 기성 크리에이터(10만+)는 자체 해결 가능하지만, **초보 크리에이터(시작 1년 이하)** 는 이 격차를 해소할 수단이 없습니다. 본 제품은 이들을 대상으로 합니다.

## How — v8 플로우

```
① 챗봇 온보딩   →  ② 취향 설정      →  ③ 페르소나       →  ④ 트렌드         →  ⑤ 라이벌 / 제작
──────────────     ──────────────      ─────────────      ──────────────     ────────────────
LLM 대화형          플랫폼·카테고리       Gemini 페르소나     카테고리 필터링      YouTube SSE 라이벌
4문답              ·연령대 선택          카드 표시           바텀시트 → 만들기    + 콘티 4컷 자동생성
```

## Stack

- **Frontend / Backend:** Next.js 14 (App Router + API Routes)
- **상태 관리:** Zustand
- **외부 데이터:** YouTube Data API v3, Apify (TikTok·Instagram)
- **AI:** Google Gemini 2.5 Flash (`@ai-sdk/google`)
- **호스팅:** Vercel

## Features

- **챗봇 온보딩** — LLM 대화형 4문답 → 취향 설정(플랫폼·카테고리·연령대) → Gemini 페르소나
- **트렌드** — 온보딩 카테고리 기반 필터링 + 챗봇 키워드 정렬 / 카드 탭 → 바텀시트(저장/만들기)
- **라이벌 크리에이터** — YouTube SSE 3단계 파이프라인 (검색→AI분석→Vision점수화)
- **제작(Production)** — 트렌드 선택 즉시 콘티 4컷 자동 생성 + 캐싱
- **저장/마이페이지** — 트렌드·크리에이터·대본·콘티 localStorage 저장 / MyScreen 섹션별 표시
- **Mock fallback** — `DISABLE_APIFY=true` 시 mock 데이터로 데모 유지

## Docs

**현재 (v8):**
- [SPEC.md](SPEC.md) — 기능 명세
- [USERFLOW.md](USERFLOW.md) — 유저 플로우
- [WHYTREE.md](WHYTREE.md) — Why Tree 분석
- [PREMORTEM.md](PREMORTEM.md) — 리스크 분석
- [MANIFEST.md](MANIFEST.md) — 제품 정의 & 전략

**구버전:** [`docs_old/`](docs_old/)

## Team

KAIST BIZ 699911 Group Project · 규동 · 승연 · 지은 · 경재

Reference recommendation logic updated: now prioritizes creators one step ahead of the user in follower count and style, based on user interview insights.
