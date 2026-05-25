# Shortform Pulse — SPEC v3

> 기준: v2 (현재 배포) → v3 (이번 업데이트)  
> 표기: ✅ 완료 · ⚠️ 수정 필요 · 🆕 신규 · ❌ 제거

---

## 1. 제품 요약 변경

### AS-IS (v2)
사용자는 짧은 온보딩 설문으로 페르소나를 설정하고, 트렌드 대시보드에서 트렌드를 발견하고, AI 대본 초안(Hook + Body + CTA)을 받아 제작에 착수할 수 있습니다.

### TO-BE (v3)
사용자는 **온보딩 없이 즉시 트렌드를 탐색하고**, 마음에 드는 트렌드를 선택한 뒤 LLM과 2문항 대화로 자신의 콘텐츠 앵글을 추출합니다. 트렌드 키워드 패턴과 나의 앵글이 결합된 **4~5컷 광고 콘티 스타일 기획안**을 받아 오늘 바로 찍을 수 있습니다. **10개 챌린지 루프**로 알고리즘 진입까지 이어집니다.

---

## 2. AI 모델 변경

| | AS-IS | TO-BE |
|---|---|---|
| 모델 | Gemini 2.5 Flash | Claude Sonnet 4 (`claude-sonnet-4-20250514`) |
| 이유 | — | 한국어 콘텐츠 앵글 추출 및 콘티 생성 품질 |
| API 엔드포인트 | `/api/persona`, `/api/insights`, `/api/recommend`, `/api/generate` | 위 유지 + `/api/angle`, `/api/storyboard`, `/api/pattern-report` 신규 |

---

## 3. 기능별 AS-IS vs TO-BE

### 3.1 온보딩 (`/onboarding`)

| 항목 | AS-IS | TO-BE | 상태 |
|------|-------|-------|------|
| 진입 시점 | 앱 첫 진입 강제 | 콘티 1개 완성 후 소프트 유도 | ⚠️ |
| 문항 수 | 7문항 | 3문항 (카테고리, 플랫폼, 고충) | ⚠️ |
| 스킵 가능 | 불가 | 가능 — 핵심 기능 사용 가능 | ⚠️ |
| 페르소나 생성 | 온보딩 완료 즉시 | 3문항 완료 시 동일 로직 | ✅ 유지 |

### 3.2 대시보드 → 트렌드 탭 (`/`)

| 항목 | AS-IS | TO-BE | 상태 |
|------|-------|-------|------|
| 카테고리 탭 | ✅ 구현 | 유지 | ✅ |
| PlatformPulse TOP 1 | ✅ 구현 | 유지 | ✅ |
| AI 키워드 버블맵 | ✅ Gemini 기반 | Claude 기반으로 전환 | ⚠️ |
| 트렌드 목록 (TrendRow) | ✅ 구현 | 유지 | ✅ |
| 트렌드 키워드 이유 | ❌ 없음 | LLM 추론 한 줄 추가 (`trendReason`) | 🆕 |
| TrendActionSheet CTA | "소재로 사용하기" | "이 포맷으로 콘티 만들기 →" | ⚠️ |
| ActionSheet 라우팅 | `/production` 직행 | `/chat` 경유 | ⚠️ |

**TrendItem 타입 변경:**
```typescript
// 추가 필드
trendReason?: string;  // LLM 추론: "왜 지금 이게 뜨는지" 한 줄
```

### 3.3 추천 탭 (`/recommend`)

| 항목 | AS-IS | TO-BE | 상태 |
|------|-------|-------|------|
| 페르소나 기반 추천 | ✅ 구현 | `/chat` 흐름으로 통합 | ⚠️ |
| 영상 방향 설문 3문항 | ✅ 구현 | LLM 대화 2문항으로 대체 | ⚠️ |
| 탭 노출 | 추천 탭 | 탭 제거, `/chat` 중간 화면으로 전환 | ❌→🆕 |

### 3.4 LLM 고충 상담 (`/chat`) — 신규

| 항목 | 내용 | 상태 |
|------|------|------|
| 라우트 | `app/chat/page.tsx` | 🆕 |
| Q1 | "이 영상에서 끌린 게 뭔가요?" (4지선다) | 🆕 |
| Q2 | "올리기 힘든 이유?" (4지선다 + 직접입력) | 🆕 |
| API | `POST /api/angle` | 🆕 |
| 출력 | `contentAngle`, `toneKeyword`, `hookSuggestion` | 🆕 |
| Fallback | Rule-based (API 실패 시) | 🆕 |

**API Contract:**
```typescript
// POST /api/angle
Request: {
  trend: TrendItem;
  q1: 'empathy' | 'info' | 'humor' | 'relatable';
  q2: 'no_idea' | 'no_reaction' | 'no_consistency' | 'custom';
  q2Custom?: string;
}
Response: {
  contentAngle: string;   // "나만의 [톤]으로 [트렌드포맷] 적용하기"
  toneKeyword: '공감형' | '정보형' | '유머형' | '현실형';
  hookSuggestion: string; // 첫 3초 훅 문장 초안
  source: 'live' | 'mock';
}
```

### 3.5 제작 탭 (`/production`)

| 항목 | AS-IS | TO-BE | 상태 |
|------|-------|-------|------|
| 대본 3종 (Hook/Body/CTA) | ✅ 구현 | 유지 (탭으로 접근 가능) | ✅ |
| 콘티 뷰 | ❌ 없음 | 장면별 카드 뷰 (TimelineView) | 🆕 |
| 콘티 내용 | — | 스케치 + 대사 + 촬영 메모 한 줄 | 🆕 |
| 초단위 타임라인 | — | 콘티 단계 제외 (편집 단계) | — |
| 알고리즘 인사이트 | — | 최상단 트렌드 포인트 1회 | 🆕 |
| URL 파라미터 | — | `?view=conti` 로 뷰 분기 | 🆕 |
| API | `POST /api/generate` | 유지 + `POST /api/storyboard` 신규 | 🆕 |

**Storyboard API Contract:**
```typescript
// POST /api/storyboard
Request: {
  trend: TrendItem;
  angle: AngleResponse;
}
Response: {
  trendPoint: string;       // 트렌드에서 가져온 포인트 한 줄
  scenes: SceneCard[];
  source: 'live' | 'mock';
}

interface SceneCard {
  cutNum: number;           // 1~5
  part: 'hook' | 'transition' | 'body' | 'closing';
  partLabel: string;        // "훅" | "전환" | "본론" | "클로징"
  script: string;           // 대사 (italic 표시)
  shootingNote: string;     // 촬영 메모 한 줄
  sketchPrompt: string;     // 이미지 생성용 프롬프트 (향후 사용)
}
```

### 3.6 챌린지 탭 (`/challenge`) — 신규

| 항목 | 내용 | 상태 |
|------|------|------|
| 라우트 | `app/challenge/page.tsx` | 🆕 |
| 진행률 | 10칸 트래커 | 🆕 |
| 루프 | 완료 체크 → 다음 트렌드 2개 자동 추천 [B안] | 🆕 |
| 탈출구 | "트렌드 피드로 돌아가기" 버튼 | 🆕 |
| 10개 완료 | `POST /api/pattern-report` → 알고리즘 패턴 리포트 | 🆕 |
| 저장 | Zustand `ChallengeState` + localStorage | 🆕 |

---

## 4. 신규 파일 목록

```
app/
├── chat/page.tsx                   🆕 LLM 고충 상담
├── challenge/page.tsx              🆕 10개 챌린지
├── api/
│   ├── angle/route.ts              🆕 앵글 추출
│   ├── storyboard/route.ts         🆕 콘티 생성
│   └── pattern-report/route.ts     🆕 패턴 리포트

components/
├── chat/
│   ├── TrendContext.tsx             🆕 선택된 트렌드 배너
│   ├── ChatQuestion.tsx             🆕 질문 + 선택지 카드
│   └── AngleResult.tsx             🆕 추출된 앵글 표시
├── production/
│   ├── TimelineView.tsx            🆕 콘티 뷰 (장면별 카드)
│   └── SceneCard.tsx               🆕 장면 카드 (스케치+대사)
└── challenge/
    ├── ProgressTracker.tsx         🆕 10칸 진행률
    └── NextTrendList.tsx           🆕 다음 추천 트렌드

lib/
├── store.ts                        ⚠️ ChallengeState, AngleResponse 추가
├── types.ts                        ⚠️ SceneCard, StoryboardResponse, trendReason 추가
└── prompts/
    ├── angle.ts                    🆕 앵글 추출 프롬프트
    ├── storyboard.ts               🆕 콘티 생성 프롬프트
    └── patternReport.ts            🆕 패턴 리포트 프롬프트
```

---

## 5. Zustand Store 변경

```typescript
// lib/store.ts 추가 항목

// 선택된 트렌드 (기존 있을 수 있음 — 없으면 추가)
selectedTrend: TrendItem | null;
setSelectedTrend: (trend: TrendItem | null) => void;

// LLM 상담 결과
contentAngle: AngleResponse | null;
setContentAngle: (angle: AngleResponse | null) => void;

// 챌린지 상태
challengeCompleted: number;
challengeHistory: SceneCard[][];
incrementChallenge: () => void;
```

---

## 6. 우선순위 작업 순서

### Phase 1 — 기존 수정 (빠른 체감 변화)

| 순서 | 파일 | 변경 내용 | 난이도 |
|------|------|----------|--------|
| 1 | `lib/types.ts` | `trendReason` 필드 추가 | 낮음 |
| 2 | `lib/store.ts` | `selectedTrend`, `contentAngle`, `challengeState` 추가 | 낮음 |
| 3 | `components/dashboard/TrendRow.tsx` | `trendReason` 노출 | 낮음 |
| 4 | TrendActionSheet | CTA 문구 변경 + `/chat` 라우팅 | 낮음 |
| 5 | `components/TabBar.tsx` | 탭 3개 변경 | 낮음 |
| 6 | `app/api/insights/route.ts` | Claude 전환 + `trendReason` 생성 | 중간 |

### Phase 2 — 신규 추가

| 순서 | 파일 | 내용 | 난이도 |
|------|------|------|--------|
| 7 | `app/chat/page.tsx` | LLM 상담 2문항 UI | 중간 |
| 8 | `app/api/angle/route.ts` | Claude 앵글 추출 | 낮음 |
| 9 | `app/api/storyboard/route.ts` | Claude 콘티 생성 | 중간 |
| 10 | `components/production/TimelineView.tsx` | 콘티 뷰 | 높음 |
| 11 | `app/challenge/page.tsx` | 10개 챌린지 | 중간 |
| 12 | `app/api/pattern-report/route.ts` | 패턴 리포트 | 낮음 |

### Phase 3 — 브랜치 작업 방법

```bash
git checkout main
git pull origin main
git checkout -b feat/v3-trend-first

# Phase 1 완료 후
git commit -m "feat: 트렌드 퍼스트 플로우 기반 수정"

# Phase 2 완료 후
git commit -m "feat: LLM 상담 + 콘티 생성 신규 추가"
git push origin feat/v3-trend-first

# Vercel 프리뷰 URL 자동 생성됨
# ANTHROPIC_API_KEY 없어도 mock fallback으로 전체 플로우 확인 가능
```

