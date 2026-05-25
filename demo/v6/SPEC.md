# Shortform Pulse — SPEC v5

> 기준: 현재 배포 → v5 (이번 업데이트)  
> 표기: ✅ 완료 · ⚠️ 수정 필요 · 🆕 신규 · ❌ 제거

---

## 1. 제품 요약 변경

### AS-IS 
사용자는 짧은 온보딩 설문으로 페르소나를 설정하고, 트렌드 대시보드에서 트렌드를 발견하고, AI 대본 초안(Hook + Body + CTA)을 받아 제작에 착수할 수 있습니다.

### TO-BE (v5)
사용자는 **온보딩 없이 즉시 트렌드를 탐색하고**, 마음에 드는 트렌드를 선택한 뒤 LLM과 2문항 대화로 자신의 콘텐츠 앵글을 추출합니다. 트렌드 키워드 패턴과 나의 앵글이 결합된 **4컷 콘티 기획안**을 받아 오늘 바로 찍을 수 있습니다. **10개 챌린지 루프**로 알고리즘 진입까지 이어집니다.

---

## 2. AI 모델

| | AS-IS | TO-BE |
|---|---|---|
| 모델 | Gemini 2.5 Flash | **Gemini 2.5 Flash (유지)** |
| SDK | `@ai-sdk/google` | `@ai-sdk/google` (유지) |
| 기존 엔드포인트 | `/api/persona`, `/api/insights`, `/api/recommend`, `/api/generate` | 유지 |
| 신규 엔드포인트 | — | `/api/angle`, `/api/storyboard`, `/api/pattern-report` |

> Claude Sonnet 4 비용 이슈로 Gemini 2.5 Flash 유지 결정.  
> 기존 `@ai-sdk/google` SDK 그대로 사용 가능 — 코드 변경 최소화.

---

## 3. Gemini API 호출 패턴 (신규 API 공통)

```typescript
import { google } from '@ai-sdk/google'
import { generateText } from 'ai'

const { text } = await generateText({
  model: google('gemini-2.5-flash'),
  system: SYSTEM_PROMPT,
  prompt: USER_PROMPT,
})

const parsed = JSON.parse(text.replace(/```json|```/g, '').trim())
```

> 기존 v2 API와 동일한 패턴 — `generateText` + JSON 파싱

---

## 4. 기능별 AS-IS vs TO-BE

### 4.1 온보딩 (`/onboarding`)

| 항목 | AS-IS | TO-BE | 상태 |
|------|-------|-------|------|
| 진입 시점 | 앱 첫 진입 강제 | 콘티 1개 완성 후 소프트 유도 | ⚠️ |
| 문항 수 | 7문항 | 3문항 (카테고리, 플랫폼, 고충) | ⚠️ |
| 스킵 가능 | 불가 | 가능 | ⚠️ |
| 페르소나 생성 | 온보딩 완료 즉시 | 3문항 완료 시 동일 로직 | ✅ 유지 |

### 4.2 대시보드 → 트렌드 탭 (`/`)

| 항목 | AS-IS | TO-BE | 상태 |
|------|-------|-------|------|
| 카테고리 탭 | ✅ | 유지 | ✅ |
| PlatformPulse TOP 1 | ✅ | 유지 | ✅ |
| AI 키워드 버블맵 | ✅ Gemini | Gemini 유지 | ✅ |
| 트렌드 목록 | ✅ | 유지 | ✅ |
| 트렌드 이유 한 줄 | ❌ | `trendReason` 필드 추가 | 🆕 |
| ActionSheet CTA | "소재로 사용하기" | "이 포맷으로 콘티 만들기 →" | ⚠️ |
| ActionSheet 라우팅 | `/production` 직행 | `/chat` 경유 | ⚠️ |

**TrendItem 타입 추가:**
```typescript
trendReason?: string  // 예: '"고민→해결" 제목 구조가 이 시기 급상승 중'
```

### 4.3 LLM 고충 상담 (`/chat`) — 신규

| 항목 | 내용 | 상태 |
|------|------|------|
| 라우트 | `app/chat/page.tsx` | 🆕 |
| Q1 | "이 영상에서 끌린 게 뭔가요?" (4지선다) | 🆕 |
| Q2 | "올리기 힘든 이유?" (4지선다 + 직접입력) | 🆕 |
| API | `POST /api/angle` (Gemini 2.5 Flash) | 🆕 |
| 출력 | `contentAngle`, `toneKeyword`, `hookSuggestion` | 🆕 |
| Fallback | Rule-based (API 실패 시) | 🆕 |

**API Contract:**
```typescript
// POST /api/angle
Request: {
  trend: TrendItem
  q1: 'empathy' | 'info' | 'humor' | 'relatable'
  q2: 'no_idea' | 'no_reaction' | 'no_consistency' | 'custom'
  q2Custom?: string
}
Response: {
  contentAngle: string
  toneKeyword: '공감형' | '정보형' | '유머형' | '현실형'
  hookSuggestion: string
  source: 'live' | 'mock'
}
```

### 4.4 제작 탭 (`/production`)

| 항목 | AS-IS | TO-BE | 상태 |
|------|-------|-------|------|
| 대본 3종 | ✅ | 유지 | ✅ |
| 콘티 뷰 | ❌ | 4컷 장면 카드 (스케치+대사) | 🆕 |
| 초단위 타임라인 | — | 콘티 단계 제외 (편집 단계) | — |
| 알고리즘 인사이트 | — | 최상단 트렌드 포인트 1회만 | 🆕 |
| API | `POST /api/generate` | 유지 + `POST /api/storyboard` 신규 | 🆕 |

**Storyboard API:**
```typescript
// POST /api/storyboard (Gemini 2.5 Flash)
Request: { trend: TrendItem; angle: AngleResponse }
Response: {
  trendPoint: string
  scenes: SceneCard[]  // 4컷
  source: 'live' | 'mock'
}

interface SceneCard {
  cutNum: number
  part: 'hook' | 'transition' | 'body' | 'closing'
  partLabel: string
  script: string        // 대사
  shootingNote: string  // 촬영 메모 한 줄
}
```

### 4.5 챌린지 탭 (`/challenge`) — 신규

| 항목 | 내용 | 상태 |
|------|------|------|
| 라우트 | `app/challenge/page.tsx` | 🆕 |
| 루프 | 완료 체크 → 다음 트렌드 2개 자동 추천 [B안] | 🆕 |
| 탈출구 | "트렌드 피드로 돌아가기" | 🆕 |
| 10개 완료 | `POST /api/pattern-report` (Gemini) | 🆕 |

---

## 5. 신규 파일 목록

```
app/
├── chat/page.tsx                   🆕
├── challenge/page.tsx              🆕
├── api/
│   ├── angle/route.ts              🆕 Gemini 2.5 Flash
│   ├── storyboard/route.ts         🆕 Gemini 2.5 Flash
│   └── pattern-report/route.ts     🆕 Gemini 2.5 Flash

components/
├── chat/
│   ├── TrendContext.tsx             🆕
│   ├── ChatQuestion.tsx             🆕
│   └── AngleResult.tsx             🆕
├── production/
│   ├── TimelineView.tsx            🆕
│   └── SceneCard.tsx               🆕
└── challenge/
    ├── ProgressTracker.tsx         🆕
    └── NextTrendList.tsx           🆕

lib/
├── store.ts                        ⚠️ ChallengeState, AngleResponse 추가
└── types.ts                        ⚠️ SceneCard, StoryboardResponse 추가
```

---

## 6. 우선순위 작업 순서

### Phase 1 — 기존 수정 (빠른 체감)

| 순서 | 파일 | 변경 내용 | 난이도 |
|------|------|----------|--------|
| 1 | `lib/types.ts` | `trendReason` 필드 추가 | 낮음 |
| 2 | `lib/store.ts` | `selectedTrend`, `contentAngle`, `challengeState` 추가 | 낮음 |
| 3 | `components/dashboard/TrendRow.tsx` | `trendReason` 노출 | 낮음 |
| 4 | TrendActionSheet | CTA 문구 변경 + `/chat` 라우팅 | 낮음 |
| 5 | `components/TabBar.tsx` | 탭 3개 변경 | 낮음 |

### Phase 2 — 신규 추가

| 순서 | 파일 | 내용 | 난이도 |
|------|------|------|--------|
| 6 | `app/chat/page.tsx` | LLM 상담 2문항 UI | 중간 |
| 7 | `app/api/angle/route.ts` | Gemini 앵글 추출 | 낮음 |
| 8 | `app/api/storyboard/route.ts` | Gemini 콘티 생성 | 중간 |
| 9 | `components/production/TimelineView.tsx` | 콘티 뷰 | 높음 |
| 10 | `app/challenge/page.tsx` | 10개 챌린지 | 중간 |

### 브랜치 작업

```bash
git checkout -b feat/prototype-v3
# 작업 후
git push origin feat/prototype-v3
# PR → Vercel 프리뷰 자동 생성
# GEMINI_API_KEY 없어도 mock fallback으로 전체 플로우 확인 가능
```
