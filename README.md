# Shortform Pulse

초보 크리에이터(시작 1년 이하)를 위한 숏폼 가이드.

## 🚧 v7 리디자인

- **디자인 데모 A/B/C:** [`demo/v7/`](demo/v7/) 폴더 (A 인디고 / B 볼드 / C 퍼플)
- **v7 기획 문서:** [`docs/v7/`](docs/v7/) 폴더
- **실제 개발:** PR #53 (`feat/v7-dev`) · **디자인 시안:** PR #52 (`docs/v7-redesign`)

> 참고: 데모(`demo/v7/`)와 기획 문서 7종(`docs/v7/*.md`)은 **PR #52(`docs/v7-redesign`)** 에 있고, v7 구현 코드(`app/app/v7/`)는 **PR #53(`feat/v7-dev`)** 에 있습니다. 두 PR이 `main`에 머지되면 위 링크가 모두 한 곳에서 연결됩니다. 이 브랜치 단독으로는 [docs/v7/THEME-GUIDE.md](docs/v7/THEME-GUIDE.md)를 참고하세요.

## What

YouTube Shorts · TikTok · Instagram Reels의 트렌드를 한 곳에서 비교하고, 자기 채널에 맞는 트렌드를 발견해, AI 대본·콘티 초안까지 받아볼 수 있는 도구입니다. 기존 도구가 "무엇이 인기인가" 까지만 보여주는 것과 달리, 본 제품은 "그래서 너는 뭘 만들어야 하는가" 까지 워크플로우를 확장합니다.

## Why

소비자 모드에서 크리에이터로 전환하는 시점에 구조적 정보 격차가 발생합니다. 개인화 알고리즘은 본인의 소비 패턴만 반영할 뿐, 대중의 집계된 행동을 보여주지 않기 때문입니다.

자체 데이터 인프라를 갖춘 기성 크리에이터(10만+)는 자체 해결 가능하지만, **초보 크리에이터(시작 1년 이하)** 는 이 격차를 해소할 수단이 없습니다. 본 제품은 이들을 대상으로 합니다.

## How — v7 5단계 플로우

```
① 온보딩 대화   →  ② 특징 정리      →  ③ 트렌드        →  ④ 라이벌         →  ⑤ 콘티/스크립트
──────────────     ──────────────      ─────────────      ──────────────     ────────────────
LLM 대화형 큐레이터   CONTENT PROFILE     내 주제 기반        비슷하게 시작한      선택 주제로
4문답              (방향·강점·타깃·포맷)   반응 좋은 영상       라이벌 크리에이터     스크립트 3종 /
                  + "첫 영상 찍어볼까요?"   "왜 떴을까요?"      + 최근 영상         콘티 4컷
```

## Stack

- **Frontend / Backend:** Next.js 14 (App Router + API Routes)
- **상태 관리:** Zustand
- **외부 데이터:** YouTube Data API v3, Apify (TikTok·Instagram)
- **AI:** Google Gemini 2.5 Flash (`@ai-sdk/google`)
- **호스팅:** Vercel

## Features

- **온보딩** — LLM 대화형 큐레이터와 4문답 → 페르소나(콘텐츠 방향) 분석
- **특징 정리** — 대화 결과를 CONTENT PROFILE 한 장으로 (방향·강점·타깃·포맷)
- **트렌드** — 내 주제 기반 반응 좋은 영상 + "왜 떴을까요?" 인사이트
- **라이벌 크리에이터** — 한 단계 앞선 비슷한 채널 + 최근 영상·성장 스토리
- **콘티/스크립트** — 선택 주제로 대본 3종(Hook·Body·CTA) / 콘티 4컷 생성
- **Mock fallback** — API 키 미설정 시 mock 데이터로 데모 유지

## Docs

**최신 (v7):** [`docs/v7/`](docs/v7/)
- [docs/v7/README.md](docs/v7/README.md) — v7 개요
- [docs/v7/SPEC.md](docs/v7/SPEC.md) — v7 명세
- [docs/v7/USERFLOW.md](docs/v7/USERFLOW.md) — 유저 플로우
- [docs/v7/DESIGN-GUIDE.md](docs/v7/DESIGN-GUIDE.md) — 디자인 가이드 (A/B/C)
- [docs/v7/THEME-GUIDE.md](docs/v7/THEME-GUIDE.md) — 테마 토큰 시스템 (개발)
- [docs/v7/MANIFEST.md](docs/v7/MANIFEST.md) · [docs/v7/WHYTREE.md](docs/v7/WHYTREE.md) · [docs/v7/PREMORTEM.md](docs/v7/PREMORTEM.md)

**히스토리 (v2):** [spec.md](spec.md) · [MANIFEST_v2.md](MANIFEST_v2.md) · [WHYTREE_v2.md](WHYTREE_v2.md) · [PREMORTEM_v2.md](PREMORTEM_v2.md)

## Team

KAIST BIZ 699911 Group Project · 규동 · 승연 · 지은 · 경재

Reference recommendation logic updated: now prioritizes creators one step ahead of the user in follower count and style, based on user interview insights.
