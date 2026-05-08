# Shortform Pulse

팔로워 1만 명 미만 초기 크리에이터를 위한 숏폼 트렌드 가이드.

## What

YouTube Shorts · TikTok · Instagram Reels의 트렌드를 한 곳에서 비교하고, 자기 채널에 맞는 트렌드를 발견해, AI 대본 초안까지 받아볼 수 있는 도구입니다. 기존 도구가 "무엇이 인기인가" 까지만 보여주는 것과 달리, 본 제품은 "그래서 너는 뭘 만들어야 하는가" 까지 워크플로우를 확장합니다.

## Why

소비자 모드에서 크리에이터로 전환하는 시점에 구조적 정보 격차가 발생합니다. 개인화 알고리즘은 본인의 소비 패턴만 반영할 뿐, 대중의 집계된 행동을 보여주지 않기 때문입니다.

자체 데이터 인프라를 갖춘 기성 크리에이터(10만+)는 자체 해결 가능하지만, **팔로워 1만 명 미만의 초기 크리에이터**는 이 격차를 해소할 수단이 없습니다. 본 제품은 이들을 대상으로 합니다.

## How

```
Onboarding          Dashboard         Production
──────────   →    ──────────────  →   ──────────
설문 기반           크로스플랫폼          트렌드·페르소나
페르소나 설정        트렌드 비교          기반 대본 초안
```

## Stack

- Frontend / Backend: Next.js 14 (App Router + API Routes)
- 외부 데이터: YouTube Data API v3, Apify (TikTok·Instagram 유료 플랜)
- AI: Anthropic Claude

## Docs

- [SPEC.md](https://github.com/seu-seo/trendingshorts/blob/main/SPEC.md) — 제품 명세서 v6.5
- [MANIFEST.md](docs/MANIFEST.md) — 프로젝트 핵심 가치 및 원칙
- [WHYTREE.md](docs/WHYTREE.md) — Why Tree 분석 결과
- [PREMORTEM.md](docs/PREMORTEM.md) — 프리모텀 분석 결과
- [project_approach.md](docs/project_approach.md) — 프로젝트 방향

## Demo (Sample)

비교 검토용 디자인 샘플입니다. 구체적인 페르소나 분류, 추천 로직, 카테고리 통합 등은 향후 팀 합의 후 확정합니다.

- [Sample 1](https://seu-seo.github.io/trendingshorts/demo/v2/) — 페르소나 설문 진입형
- [Sample 2](https://seu-seo.github.io/trendingshorts/demo/v3/) — 대시보드 진입형 + 시각화

## Team

KAIST BIZ 699911 Group Project · 규동 · 승연 · 지은 · 경재
*Last updated: 2026-05-08*
