# Shortform Pulse

팔로워 1만 명 미만 초기 크리에이터를 위한 숏폼 트렌드 가이드.

## What

YouTube Shorts · TikTok · Instagram Reels의 트렌드를 한 곳에서 비교하고, 자기 채널에 맞는 트렌드를 발견해, AI 대본 초안까지 받아볼 수 있는 도구입니다. 기존 도구가 "무엇이 인기인가" 까지만 보여주는 것과 달리, 본 제품은 "그래서 너는 뭘 만들어야 하는가" 까지 워크플로우를 확장합니다.

## Why

소비자 모드에서 크리에이터로 전환하는 시점에 구조적 정보 격차가 발생합니다. 개인화 알고리즘은 본인의 소비 패턴만 반영할 뿐, 대중의 집계된 행동을 보여주지 않기 때문입니다.

자체 데이터 인프라를 갖춘 기성 크리에이터(10만+)는 자체 해결 가능하지만, **팔로워 1만 명 미만의 초기 크리에이터**는 이 격차를 해소할 수단이 없습니다. 본 제품은 이들을 대상으로 합니다.

## How

```
Onboarding          Dashboard              Production
──────────   →    ──────────────────  →   ──────────
설문 7문항           카테고리 필터            트렌드·페르소나
Gemini 페르소나      플랫폼별 TOP 1           기반 소재 추천
설정               AI 키워드 분석            대본 초안 생성
                  트렌드 목록
```

## Stack

- **Frontend / Backend:** Next.js 14 (App Router + API Routes)
- **상태 관리:** Zustand
- **외부 데이터:** YouTube Data API v3, Apify (TikTok·Instagram)
- **AI:** Google Gemini 2.5 Flash (`@ai-sdk/google`)
- **호스팅:** Vercel

## Live Demo

**https://web-v2-sand.vercel.app**

## Features

- **온보딩** — 7문항 설문 → Gemini 페르소나 분석 (카테고리·스타일·목표 기반)
- **대시보드** — 카테고리 탭 → 플랫폼별 TOP 1 → AI 키워드 버블맵 → 트렌드 목록
- **AI 키워드 분석** — 카테고리별 HOT/RISING 키워드 버블맵 + 수치 기반 인사이트 불릿 (24h 캐싱)
- **추천·제작** — 페르소나 기반 소재 추천 → 대본 3종(Hook + Body + CTA) 생성
- **Mock fallback** — Apify 비활성 시 mock 데이터로 데모 유지

## Docs

- [spec.md](spec.md) — 제품 명세서 (현재 구현 기준)
- [MANIFEST_v2.md](MANIFEST_v2.md) — 프로젝트 핵심 가치 및 원칙
- [WHYTREE_v2.md](WHYTREE_v2.md) — Why Tree 분석 결과
- [PREMORTEM_v2.md](PREMORTEM_v2.md) — 프리모텀 분석 결과

## Team

KAIST BIZ 699911 Group Project · 규동 · 승연 · 지은 · 경재

Reference recommendation logic updated: now prioritizes creators one step ahead of the user in follower count and style, based on user interview insights.

*Last updated: 2026-05-16*
