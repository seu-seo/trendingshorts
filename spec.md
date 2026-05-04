# Feature Spec: Creator Persona Survey

**Branch:** `jieun/feature-survey`  
**GitHub:** https://github.com/seu-seo/trendingshorts/tree/jieun/feature-survey  
**Status:** Prototype complete — pending merge with Seung-yeon's category classification  
**Last updated:** 2026-05-04

---

## 1. Overview

크리에이터가 Shortform Pulse에 처음 진입했을 때, 7개의 질문을 통해 자신의 채널 페르소나를 설정하고 — 그 결과로 플랫폼 트렌드 데이터를 개인화된 전략으로 번역해주는 온보딩 피처.

플랫폼 자체 리포트(YouTube Studio, TikTok Creative Center)가 "무엇이 뜨고 있나"를 보여주는 데 그친다면, 이 피처는 "내가 지금 뭘 만들어야 하나"까지 연결하는 다리 역할을 한다.

---

## 2. Problem Statement

초기 크리에이터가 트렌드를 봐도 행동으로 이어지지 않는 이유:

- 트렌드는 보는데 **내 채널에 어떻게 연결할지** 모른다
- 플랫폼 리포트는 모든 크리에이터에게 같은 화면 — **개인화 없음**
- 데이터를 보고 나서 **뭘 찍을지**는 여전히 크리에이터가 혼자 결정해야 한다

---

## 3. User Flow

```
인트로 화면
    ↓ [시작하기]
Q1. 플랫폼 선택        (single select)
    ↓
Q2. 카테고리 선택      (single select)
    ↓
Q3. 경력              (slider: 0~5)
    ↓
Q4. 목표              (single select)
    ↓
Q5. 콘텐츠 스타일      (multi select, max 3)
    ↓
Q6. 가장 큰 고민       (single select)
    ↓
Q7. 목표 업로드 빈도   (slider: 1~14편/주)
    ↓ [분석 시작]
로딩 화면 (Claude API 호출 중)
    ↓
결과 화면 (페르소나 대시보드)
```

---

## 4. Survey Questions — Detail

### Q1. 플랫폼
**Type:** Single select  
**Question:** 주로 활동하는 플랫폼은 어디인가요?

| 선택지 | 값 |
|---|---|
| YouTube Shorts | `youtube` |
| TikTok | `tiktok` |
| Instagram Reels | `instagram` |
| 멀티 플랫폼 | `multi` |

---

### Q2. 카테고리
**Type:** Single select  
**Question:** 내 채널의 주요 카테고리는 무엇인가요?

| 선택지 | 값 |
|---|---|
| 요리 / 먹방 | `food` |
| 뷰티 / 패션 | `beauty` |
| 라이프스타일 / 일상 | `lifestyle` |
| 정보 / 자기계발 | `edu` |
| 게임 / 엔터테인먼트 | `gaming` |
| 운동 / 건강 | `fitness` |

> **📌 Merge 예정:** 승연님의 카테고리 분류 로직과 통합하여 Niche Fit Score 개인화 정밀도를 높인다. 카테고리 taxonomy가 변경될 수 있음.

---

### Q3. 경력
**Type:** Slider (0~5)  
**Question:** 숏폼 크리에이터 경력이 얼마나 됩니까?

| 값 | 레이블 |
|---|---|
| 0 | 채널 없음 |
| 1 | 1개월 미만 |
| 2 | 1~6개월 |
| 3 | 6개월~1년 |
| 4 | 1~3년 |
| 5 | 3년 이상 |

---

### Q4. 목표
**Type:** Single select  
**Question:** 지금 가장 원하는 목표는 무엇인가요?

| 선택지 | 값 |
|---|---|
| 구독자 / 팔로워 증가 | `growth` |
| 수익화 시작 | `monetize` |
| 브랜드 인지도 구축 | `brand` |
| 팬덤 / 커뮤니티 | `community` |

---

### Q5. 콘텐츠 스타일
**Type:** Multi select (최대 3개)  
**Question:** 내 콘텐츠 스타일을 표현하는 키워드는?

| 아이콘 | 선택지 | 값 |
|---|---|---|
| 🎭 | 유머 / 웃음 | `humor` |
| 💡 | 정보 / 교육 | `info` |
| 🤍 | 감성 / 공감 | `emotion` |
| ⚡ | 자극 / 임팩트 | `impact` |
| 📝 | 솔직 / 현실 | `honest` |
| ✨ | 비주얼 / 심미 | `visual` |
| 🔥 | 챌린지 / 트렌드 | `challenge` |
| 🧪 | 실험 / 독창성 | `creative` |

---

### Q6. 가장 큰 고민
**Type:** Single select  
**Question:** 숏폼 제작에서 가장 힘든 부분은?

| 선택지 | 값 |
|---|---|
| 아이디어가 안 떠올라요 | `idea` |
| 트렌드를 어떻게 써야 할지 모르겠어요 | `trend` |
| 영상을 만들어도 반응이 없어요 | `reach` |
| 꾸준히 못하겠어요 | `consistency` |

---

### Q7. 목표 업로드 빈도
**Type:** Slider (1~14)  
**Question:** 앞으로 주당 몇 편을 올리고 싶나요?

범위: 주 1편 → 매일 2편 (14편/주)

---

## 5. Result Dashboard

설문 완료 후 Claude API(`claude-sonnet-4-20250514`)가 분석한 결과를 6개 섹션으로 표시.

### 5-1. 페르소나 카드
- **페르소나 이름:** 영문 대문자 2~3단어 (예: `THE TRENDSETTER`, `THE NICHE KING`)
- **한 줄 태그라인:** 20자 이내 한국어
- **색상 타입:** `typeIndex` 0~3에 따라 accent color 변경
  - 0 → `#C8FF57` (green)
  - 1 → `#57C8FF` (blue)
  - 2 → `#FF8657` (orange)
  - 3 → `#C857FF` (purple)

### 5-2. 페르소나 분석
- 이 크리에이터의 강점과 특성을 2~3문장으로 설명

### 5-3. 채널 Fit 트렌드 TOP 3
각 트렌드마다:
- **Lifecycle 상태:** `▲ RISING` / `◆ PEAK` / `▼ FADING`
- **키워드:** `#해시태그` 형태
- **Fit Score:** 0~100% (내 카테고리와의 적합도)
- **이유:** 이 트렌드가 내 채널에 맞는 이유 한 문장

### 5-4. 추천 훅 패턴 (2개)
- **훅 유형명:** 질문형 / 공감형 / 충격 수치형 / 즉시 시연형 등
- **예시 문장:** 실제 영상 첫 3초에 쓸 수 있는 문장

### 5-5. 이번 주 콘텐츠 플랜
- 이번 주 구체적인 주제를 포함한 2~3문장 계획

### 5-6. 지금 당장 할 일 3가지
- 제목 + 구체적인 실행 방법 (1~2문장씩)

---

## 6. API Integration

### 호출 방식
```javascript
POST https://api.anthropic.com/v1/messages
model: claude-sonnet-4-20250514
max_tokens: 1000
```

### 프롬프트 구조
설문 7개 응답값을 한국어 레이블로 변환 후 Claude에게 전달.  
출력 형식을 JSON 스키마로 명확히 지정하여 파싱 안정성 확보.

### JSON 응답 스키마
```json
{
  "personaType": "string (영문 대문자)",
  "personaTagline": "string (20자 이내)",
  "personaSummary": "string (2~3문장)",
  "topTrends": [
    {
      "keyword": "string (#해시태그)",
      "state": "rising | peak | fading",
      "fitScore": "number (0~100)",
      "reason": "string (한 문장)"
    }
  ],
  "hookPatterns": [
    {
      "type": "string (훅 유형명)",
      "example": "string (예시 문장)"
    }
  ],
  "actionItems": [
    {
      "title": "string",
      "desc": "string (1~2문장)"
    }
  ],
  "weeklyPlan": "string (2~3문장)",
  "typeIndex": "number (0~3)"
}
```

### 파싱 방어 전략 (3단계)
```javascript
// 1. 마크다운 코드블록 제거
const clean = raw.replace(/```json|```/g, '').trim();

// 2. JSON 시작점 탐색 (앞에 설명 텍스트가 붙을 경우 대비)
const jsonStart = clean.indexOf('{');
const jsonStr = clean.slice(jsonStart);

// 3. try-catch로 감싸서 UI 크래시 방지
try {
  const result = JSON.parse(jsonStr);
  renderResult(result);
} catch (e) {
  renderResult(buildFallbackResult());
}
```

### Fallback 전략
API 실패(네트워크 오류, rate limit, 파싱 실패) 시 `buildFallbackResult()`가 동작.  
설문 응답(카테고리 등)을 rule-based로 계산해 기본 페르소나 결과를 생성.  
사용자는 API 실패 여부를 인지하지 못하고 결과를 받는다.

---

## 7. Lifecycle Meter Algorithm

트렌드 TOP 3의 `state` 값을 결정하는 핵심 알고리즘.

```javascript
function classifyLifecycle({ viewsRecent, viewsPrev, uploadsRecent, uploadsPrev }) {
  const safeDiv = (a, b) => b === 0 ? 1 : a / b;

  const viewGR   = safeDiv(viewsRecent, viewsPrev);    // 수요 신호
  const uploadGR = safeDiv(uploadsRecent, uploadsPrev); // 공급 신호

  // 공급 과잉 보정: 업로드 폭증 → 점수 감소
  const supplyPenalty = 2 - Math.min(uploadGR, 2);

  // Lifecycle Score
  const score = (viewGR * 0.6) + (supplyPenalty * 0.4);

  if (score > 1.4)       return 'rising';  // 수요 > 공급 → 선점 타이밍
  if (score >= 0.9)      return 'peak';    // 공급이 수요를 따라잡음
  return                        'fading';  // 양쪽 모두 감소
}
```

**데이터 소스:** YouTube Data API v3  
- 무료 쿼터: 10,000 units/일  
- 키워드 1개당 약 100 units 소모  
- V1 기준 약 100개 키워드 모니터링 가능

---

## 8. Component Architecture

```
creator-persona-survey.html
├── screens/
│   ├── screen-intro        인트로 + 시작 버튼
│   ├── screen-q            질문 렌더러 (동적 생성)
│   ├── screen-loading      로딩 + 프로그레스 바
│   └── screen-result       결과 대시보드
├── data/
│   └── QUESTIONS[]         7개 질문 정의 (type, options, slider config)
├── state/
│   ├── answers{}           설문 응답값 저장
│   └── multiSelected{}     멀티 선택 상태 관리
└── functions/
    ├── renderQuestion()    질문 화면 동적 렌더링
    ├── startAnalysis()     Claude API 호출 + 로딩 처리
    ├── buildPrompt()       설문 응답 → 프롬프트 변환
    ├── buildFallbackResult() API 실패 시 rule-based 결과
    └── renderResult()      결과 화면 렌더링
```

---

## 9. Design System

| 토큰 | 값 |
|---|---|
| Background | `#0A0A0B` |
| Surface | `#111114`, `#18181C` |
| Text | `#F2F0EB` |
| Accent (primary) | `#C8FF57` |
| Accent (blue) | `#57C8FF` |
| Accent (orange) | `#FF8657` |
| Font (display) | Bebas Neue |
| Font (body) | Instrument Sans |
| Font (mono) | JetBrains Mono |

---

## 10. Team Feedback & Next Steps

### 팀 미팅 피드백 요약

**승연 + 지은 — Strategic Integration**
- 지은의 페르소나 설문 결과(카테고리, 스타일)를 승연의 카테고리 분류 로직과 merge
- "Channel-Fit Top 3 Trends" 개인화 정밀도를 높이는 방향으로 디벨롭 예정
- 타겟에 따라 핵심 질문/조건 수정 예정

**규동 — 3-Tab Service Architecture 제안**
서비스 전체를 주식 앱 UX에서 착안한 3개 탭으로 구조화:

| 탭 | 역할 | 기능 |
|---|---|---|
| Discovery | 정보 탐색 | YouTube 생태계 전체 트렌드 조감 |
| Interest | 관심 목록 | 페르소나 기반 개인화 트렌드 + 액션 인사이트 |
| Production | 실행 도구 | 스크립트 초안 + 비주얼 목업 생성 |

**팀 전체 합의 사항**
- "Weekly Plan"과 "Immediate Action Items"가 가장 핵심 컴포넌트 — 데이터 분석에서 실제 콘텐츠 제작으로 전환하는 역할
- "Hook Patterns"는 스크립트 작성 단계에서 즉시 활용 가능한 게임체인저
- 현재 프로토타입 기준 V1 배포는 3~5일 내 가능

### Roadmap

| 우선순위 | 작업 | 담당 |
|---|---|---|
| P0 | 승연 카테고리 분류 로직과 merge | 지은 + 승연 |
| P0 | 타겟 페르소나에 따른 질문 조건 수정 | 지은 |
| P1 | 3-Tab 구조로 서비스 재설계 | 팀 전체 |
| P1 | YouTube Data API 실제 연동 (Lifecycle Meter) | 지은 |
| P2 | Production 탭 — 스크립트 초안 생성 | TBD |

---

## 11. Open Questions

- [ ] 승연님 카테고리 분류의 taxonomy가 현재 Q2 선택지(6개)와 어떻게 매핑되는지 확인 필요
- [ ] 멀티 플랫폼 선택 시 트렌드 TOP 3를 어떤 기준으로 가중치 부여할지
- [ ] 유튜브 단일 플랫폼만 운영하는 크리에이터의 경우 — 플랫폼 선택 질문이 의미 있는지, 결과에 어떤 차별점을 줄 수 있는지
- [ ] 승연님 카테고리 분류 로직 + 지은님 페르소나 설문을 합쳤을 때 최종 피처 내 설문 조건과 항목 조율 방향
- [ ] 각 피처를 어떻게 merge할지 — 데이터 흐름, 컴포넌트 경계, API 호출 시점 사전 논의 필요
