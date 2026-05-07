# Shortform Pulse

**팔로워 1만 명 미만의 초기 크리에이터에게 "오늘 뭘 찍을지"를 알려주는 도구.**

기존 도구(VidIQ, TubeBuddy 등)가 *"무엇이 인기인가"* 까지만 보여주는 것과 달리, Shortform Pulse는 *"그래서 너는 뭘 만들어야 하는가"* 까지 워크플로우를 확장합니다.

---

## 왜 이 제품이 필요한가

플랫폼의 개인화 알고리즘은 소비자에게는 최적화되어 있지만, 크리에이터에게는 정보 비대칭을 만듭니다.

```
소비자 모드                       크리에이터 모드
─────────────                    ────────────────
개인 선호 콘텐츠                   대중 선호 콘텐츠
      ↓                                  ↓
알고리즘이 노출                     알고리즘이 노출 안 함
      ↓                                  ↓
최적화된 노출                       정보 비대칭 발생
```

자체 데이터팀을 가진 대형 크리에이터(10만+ 팔로워)는 이 격차를 자체 해결할 수 있지만, **팔로워 1만 명 미만의 초기 크리에이터**는 해소 수단이 없습니다.

**시장 데이터:**
- 한국 스마트폰 이용자가 주 5일 이상 소비하는 콘텐츠 1위: **숏폼 41.8%** (KCC, 2024)
- OTT 내 숏폼 이용: 58.1% → 70.7% (전년 대비 +12.6%p)
- 한국 숏폼 영상 편집 단가의 53.9%가 1만~1.5만 원 (커넥스페이스, 2025)

---

## 타겟 사용자

팔로워 1만 명 미만 초기 크리에이터
- 콘텐츠 제작 경력 3년 미만, 월 0~10편 산출
- 부업 또는 풀타임 전환 초기
- 1만 명은 광고 수익 진입선이자 자체 데이터 인프라 구축 임계

---

## Core Features

- **온보딩 설문** — 7문항으로 크리에이터 페르소나 도출 (Claude API)
- **트렌드 대시보드** — YouTube Shorts·TikTok·Instagram Reels 크로스플랫폼 트렌드 조감
- **개인화 추천** — 페르소나 기반 콘텐츠 레퍼런스 제시 + LLM 방향 추천
- **대본 초안 생성** — Hook + 본문 + CTA 3-part 구조, 페르소나 기반 톤 추천

---

## Product Goals

- 사용자가 "오늘 찍을 것"을 정하는 데 걸리는 시간 단축 (현재 베이스라인 30~90분)
- 트렌드 추천이 사용자 카테고리·페르소나에 정합적
- Onboarding → Dashboard → Recommend → Production 무중단 플로우

---

## Docs

- [spec_main.md](spec_main.md) — 제품 워킹 스펙 (플로우·기능 요구사항·API 계약)
- [MANIFEST.md](docs/MANIFEST.md) — 프로젝트 핵심 가치 및 원칙
- [WHYTREE.md](docs/WHYTREE.md) — Why Tree 분석 결과
- [PREMORTEM.md](docs/PREMORTEM.md) — 프리모텀 분석 결과
- [project_approach.md](docs/project_approach.md) — 프로젝트 방향

---

## Demo

[https://seu-seo.github.io/trendingshorts/](https://seu-seo.github.io/trendingshorts/)

---

## Team

KAIST BIZ 699911 Group Project
