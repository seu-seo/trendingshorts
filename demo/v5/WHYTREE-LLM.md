# Shortform Pulse — Why Tree LLM 설계

> `/api/angle` · `/api/storyboard` · `/api/insights` 프롬프트 설계 문서

---

## 설계 배경

### 왜 Why Tree인가

초기 크리에이터에게 "어떤 콘텐츠 만들고 싶어요?"를 직접 물으면 답이 안 나옵니다.  
자기 콘텐츠 정체성이 없는 상태에서 추상적 질문은 무답으로 끝납니다.

**트렌드를 먼저 보여주면 맥락이 생깁니다.**  
"이 영상처럼 만들고 싶은데 나는 어떻게 적용하지?"라는 질문이 자연스럽게 생긴 상태에서  
2문항만 받아도 7문항 설문보다 정확한 앵글이 나옵니다.

### 온보딩 7문항 vs Why Tree 2문항

| | 온보딩 7문항 (v2) | Why Tree 2문항 (v3) |
|---|---|---|
| 맥락 | 없음 | 선택한 트렌드 |
| 질문 성격 | 추상적 자기 진단 | 구체적 반응 기반 |
| 소요 시간 | 3~5분 | 30초 |
| 페르소나 정확도 | 중간 | 높음 (맥락 있음) |
| 이탈 위험 | 높음 | 낮음 |

---

## 1. 앵글 추출 (`POST /api/angle`)

### System Prompt

```
You are a shortform content strategist for early-stage Korean creators.
Your job: extract one sharp, actionable content angle from a creator's
pain point and a trending video's text metadata.

Rules:
- Respond ONLY in valid JSON. No markdown, no explanation, no preamble.
- contentAngle must be one sentence under 30 Korean characters.
- hookSuggestion must be a complete Korean sentence usable as a video opening line.
- toneKeyword must be exactly one of: "공감형" | "정보형" | "유머형" | "현실형"
- Be specific. Reference the actual trend title and the creator's pain.
- The angle must be achievable with a smartphone, no special equipment.
```

### User Prompt 빌더

```typescript
// lib/prompts/angle.ts
export function buildAnglePrompt(input: AngleRequest): string {
  return `
트렌드 정보 (텍스트 메타데이터):
- 제목: ${input.trend.title}
- 카테고리: ${input.trend.category}
- 플랫폼: ${input.trend.platform}
- 해시태그: ${input.trend.hashtags}
- 조회수: ${input.trend.views.toLocaleString()} / 성장률: +${input.trend.growth}%
- 트렌드 이유 (LLM 추론): ${input.trend.trendReason ?? '분석 없음'}

크리에이터 응답:
- Q1 (끌린 이유): ${Q1_LABEL[input.q1]}
- Q2 (고충): ${input.q2 === 'custom' ? input.q2Custom : Q2_LABEL[input.q2]}

위 정보를 바탕으로 이 크리에이터가 이 트렌드를 자신만의 방식으로
적용할 수 있는 콘텐츠 앵글을 추출하세요.

응답 형식 (JSON only):
{
  "contentAngle": "나만의 [강점]으로 [트렌드포맷] 적용하기",
  "toneKeyword": "공감형 | 정보형 | 유머형 | 현실형 중 1개",
  "hookSuggestion": "영상 첫 3초에 말할 수 있는 문장 1개"
}
`.trim();
}

const Q1_LABEL: Record<string, string> = {
  empathy: '감성/공감이 좋았어요',
  info: '정보가 유용했어요',
  humor: '유머/재미가 좋았어요',
  relatable: '나도 이런 상황이었어요',
};

const Q2_LABEL: Record<string, string> = {
  no_idea: '뭘 찍어야 할지 모르겠어요',
  no_reaction: '만들어도 반응이 없어요',
  no_consistency: '꾸준히 못하겠어요',
};
```

### Q1 → Q2 → 앵글 매핑 예시

| Q1 | Q2 | 출력 앵글 예시 |
|----|----|--------------|
| 공감 | 뭘 찍어야 할지 모름 | 나의 직장인 고민으로 점심 vlog 시작하기 |
| 공감 | 반응이 없음 | 공감 훅으로 직장인 점심 루틴 다시 찍기 |
| 정보 | 꾸준히 못함 | 5분 안에 찍는 점심 정보 3가지 공유 |
| 유머 | 뭘 찍어야 할지 모름 | 최악의 점심 선택 실패담으로 웃기기 |

### Fallback (API 실패 시 rule-based)

```typescript
// lib/prompts/angle.ts
export function ruleBasedAngle(
  q1: Q1Type, q2: Q2Type, trend: TrendItem
): AngleResponse {
  const toneMap: Record<Q1Type, ToneType> = {
    empathy: '공감형',
    info: '정보형',
    humor: '유머형',
    relatable: '현실형',
  };
  const tone = toneMap[q1];
  return {
    contentAngle: `나만의 ${tone} 시선으로 ${trend.title} 따라하기`,
    toneKeyword: tone,
    hookSuggestion: `"저도 ${trend.category} 처음 시작할 때 이랬어요."`,
    source: 'mock',
  };
}
```

---

## 2. 콘티 생성 (`POST /api/storyboard`)

### System Prompt

```
You are a Korean shortform video director specializing in creators
with under 10,000 followers.

Your job: create a 4-scene storyboard that a beginner can film
with just a smartphone in under 30 minutes.

Rules:
- Respond ONLY in valid JSON. No markdown, no preamble.
- Total video: 15 seconds (Shorts/Reels) or 30 seconds (TikTok).
- Each scene: partLabel, script (Korean dialogue), shootingNote (one line),
  sketchPrompt (English, for image generation).
- shootingNote must be actionable: what to do physically with the phone.
- script must sound natural when spoken aloud, not like written text.
- trendPoint: one sentence explaining what from the trend is being applied.
- All Korean text in natural conversational Korean.
```

### User Prompt 빌더

```typescript
// lib/prompts/storyboard.ts
export function buildStoryboardPrompt(input: StoryboardRequest): string {
  const duration = input.trend.platform === 'tiktok' ? '30초' : '15초';

  return `
트렌드 정보:
- 제목: ${input.trend.title}
- 플랫폼: ${input.trend.platform} → 목표 길이: ${duration}
- 해시태그: ${input.trend.hashtags}
- 트렌드 이유: ${input.trend.trendReason ?? ''}

크리에이터 앵글:
- 콘텐츠 앵글: ${input.angle.contentAngle}
- 톤: ${input.angle.toneKeyword}
- 훅 초안: ${input.angle.hookSuggestion}

위 정보를 바탕으로 스마트폰 1개로 30분 안에 찍을 수 있는
4장면 콘티를 만들어주세요.

파트 순서: hook(훅) → transition(전환) → body(본론) → closing(클로징)

응답 형식 (JSON only):
{
  "trendPoint": "이 트렌드에서 적용한 포인트 1문장",
  "scenes": [
    {
      "cutNum": 1,
      "part": "hook",
      "partLabel": "훅",
      "script": "자연스러운 한국어 대사",
      "shootingNote": "촬영 방법 한 줄 (예: 정면 클로즈업, 손을 들어올리며)",
      "sketchPrompt": "English description for storyboard sketch generation"
    }
  ]
}
`.trim();
}
```

### 장면별 sketchPrompt 작성 가이드

```typescript
// 각 파트별 sketchPrompt 패턴
const SKETCH_PATTERNS: Record<PartType, string> = {
  hook: `close-up portrait, ${tone} facial expression, 
         Korean woman in casual clothes, looking at camera,
         professional storyboard sketch style, grayscale ink`,

  transition: `upper body shot, index finger raised, 
               eureka expression, slight smile, 
               professional storyboard sketch style, grayscale ink`,

  body: `split frame: woman explaining with hand gesture (left panel),
         Korean food/object close-up (right panel),
         B-roll cutaway, professional storyboard sketch style, grayscale ink`,

  closing: `medium shot, big smile, both arms raised slightly,
            looking directly at camera, joyful expression,
            professional storyboard sketch style, grayscale ink`,
};
```

---

## 3. 트렌드 키워드 분석 (`POST /api/insights` 확장)

### 추가 System Prompt

```
Additionally, for each trending video in the results,
analyze WHY it is trending based ONLY on text metadata
(title, hashtags, view count, growth rate, upload timing).

Do NOT claim to know visual content, BGM, or editing style.
Keep trendReason under 30 Korean characters.
Be specific about text patterns and timing signals.
```

### trendReason 생성 프롬프트

```typescript
// lib/prompts/insights.ts — 기존에 추가
export function buildTrendReasonPrompt(trends: TrendItem[]): string {
  const list = trends.slice(0, 5).map((t, i) =>
    `${i+1}. 제목: "${t.title}" | 태그: ${t.hashtags} | 조회수: ${t.views.toLocaleString()} | 성장: +${t.growth}%`
  ).join('\n');

  return `
다음 숏폼 트렌드 영상들이 왜 지금 뜨는지 분석하세요.
텍스트 메타데이터(제목, 해시태그, 조회수 성장률)만 사용하세요.
영상 내용이나 편집 스타일은 추론하지 마세요.

${list}

응답 형식 (JSON only):
{
  "trendReasons": [
    { "index": 1, "reason": "30자 이내 한국어 이유" }
  ]
}
`.trim();
}
```

---

## 4. 패턴 리포트 (`POST /api/pattern-report`)

10개 완료 시 크리에이터 패턴 분석.

### System Prompt

```
You are an algorithm coach for Korean shortform creators.
Analyze a creator's 10 completed video storyboards and identify
their content pattern and algorithm readiness.

Respond in JSON only. Be encouraging but specific.
Max 3 actionable next steps.
All text in Korean.
```

### User Prompt

```typescript
export function buildPatternReportPrompt(
  history: SceneCard[][]
): string {
  const summary = history.map((conti, i) =>
    `영상 ${i+1}: ${conti[0]?.script?.slice(0, 30)}...`
  ).join('\n');

  return `
크리에이터가 완료한 10개 콘티 요약:
${summary}

이 크리에이터의 콘텐츠 패턴을 분석하고 성장 전략을 제시하세요.

응답 형식 (JSON only):
{
  "patternTitle": "패턴 이름 (예: '공감 + 정보 혼합형')",
  "patternDescription": "2~3문장 설명",
  "strengths": ["강점 1", "강점 2"],
  "nextSteps": ["다음 액션 1", "다음 액션 2", "다음 액션 3"],
  "algoReadiness": "알고리즘 준비도 평가 1문장"
}
`.trim();
}
```

---

## 5. Mock Fallback 전략

모든 API는 `ANTHROPIC_API_KEY` 미설정 시 mock fallback으로 전체 플로우 동작.

```typescript
// 공통 패턴
export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ ...MOCK_DATA, source: 'mock' });
  }
  try {
    // Claude API 호출
    const result = await callClaude(prompt);
    return NextResponse.json({ ...result, source: 'live' });
  } catch {
    return NextResponse.json({ ...MOCK_DATA, source: 'mock-fallback' });
  }
}
```

