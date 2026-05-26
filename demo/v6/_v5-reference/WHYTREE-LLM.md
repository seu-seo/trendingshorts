# Shortform Pulse — Why Tree LLM 설계

> `/api/angle` · `/api/storyboard` · `/api/insights` 프롬프트 설계  
> **AI 모델: Gemini 2.5 Flash (`@ai-sdk/google`)**

---

## 공통 호출 패턴

```typescript
import { google } from '@ai-sdk/google'
import { generateText } from 'ai'

const { text } = await generateText({
  model: google('gemini-2.5-flash'),
  system: SYSTEM_PROMPT,
  prompt: USER_PROMPT,
})

// JSON 파싱 (기존 v2와 동일)
const parsed = JSON.parse(text.replace(/```json|```/g, '').trim())
```

---

## 1. 앵글 추출 (`POST /api/angle`)

### System Prompt

```
You are a shortform content strategist for early-stage Korean creators.
Extract one sharp, actionable content angle from a creator's pain point
and a trending video's text metadata.

Rules:
- Respond ONLY in valid JSON. No markdown, no explanation.
- contentAngle: one sentence under 30 Korean characters.
- hookSuggestion: complete Korean sentence usable as video opening line.
- toneKeyword: exactly one of "공감형" | "정보형" | "유머형" | "현실형"
- Be specific. Reference the actual trend title and creator's pain.
- Angle must be achievable with a smartphone only.
```

### User Prompt

```typescript
export function buildAnglePrompt(input: AngleRequest): string {
  return `
트렌드 정보 (텍스트 메타데이터):
- 제목: ${input.trend.title}
- 카테고리: ${input.trend.category}
- 플랫폼: ${input.trend.platform}
- 해시태그: ${input.trend.hashtags}
- 조회수: ${input.trend.views.toLocaleString()} / 성장률: +${input.trend.growth}%
- 트렌드 이유: ${input.trend.trendReason ?? ''}

크리에이터 응답:
- Q1 (끌린 이유): ${Q1_LABEL[input.q1]}
- Q2 (고충): ${input.q2 === 'custom' ? input.q2Custom : Q2_LABEL[input.q2]}

JSON only:
{
  "contentAngle": "나만의 [강점]으로 [트렌드포맷] 적용하기",
  "toneKeyword": "공감형 | 정보형 | 유머형 | 현실형 중 1개",
  "hookSuggestion": "영상 첫 3초에 말할 수 있는 문장 1개"
}
`.trim()
}
```

### Q1 매핑

| 선택지 | 값 | 톤 |
|--------|----|----|
| 감성/공감이 좋았어요 | `empathy` | 공감형 |
| 정보가 유용했어요 | `info` | 정보형 |
| 유머/재미가 좋았어요 | `humor` | 유머형 |
| 나도 이런 상황이었어요 | `relatable` | 현실형 |

### Fallback (API 실패 시)

```typescript
export function ruleBasedAngle(q1: Q1Type, trend: TrendItem): AngleResponse {
  const toneMap = { empathy:'공감형', info:'정보형', humor:'유머형', relatable:'현실형' }
  return {
    contentAngle: `나만의 ${toneMap[q1]} 시선으로 ${trend.title} 따라하기`,
    toneKeyword: toneMap[q1],
    hookSuggestion: `"저도 ${trend.category} 처음 시작할 때 이랬어요."`,
    source: 'mock',
  }
}
```

---

## 2. 콘티 생성 (`POST /api/storyboard`)

### System Prompt

```
You are a Korean shortform video director for creators under 10,000 followers.
Create a 4-scene storyboard filmable with just a smartphone in 30 minutes.

Rules:
- Respond ONLY in valid JSON. No markdown.
- Total: 15 seconds (Shorts/Reels) or 30 seconds (TikTok).
- script: natural Korean dialogue, sounds good when spoken aloud.
- shootingNote: one actionable line (what to do physically with the phone).
- trendPoint: one sentence on what from the trend is being applied.
```

### User Prompt

```typescript
export function buildStoryboardPrompt(input: StoryboardRequest): string {
  const duration = input.trend.platform === 'tiktok' ? '30초' : '15초'
  return `
트렌드: ${input.trend.title} (${input.trend.platform}, ${duration})
해시태그: ${input.trend.hashtags}
트렌드 이유: ${input.trend.trendReason ?? ''}
앵글: ${input.angle.contentAngle}
톤: ${input.angle.toneKeyword}
훅 초안: ${input.angle.hookSuggestion}

JSON only:
{
  "trendPoint": "트렌드에서 적용한 포인트 1문장",
  "scenes": [
    {
      "cutNum": 1,
      "part": "hook",
      "partLabel": "훅",
      "script": "자연스러운 한국어 대사",
      "shootingNote": "촬영 방법 한 줄"
    }
  ]
}
`.trim()
}
```

### 장면 구성 (15초 기준)

| CUT | 파트 | 시간 | 목적 |
|-----|------|------|------|
| 1 | `hook` / 훅 | 0~3s | 공감·놀람으로 이탈 방지 |
| 2 | `transition` / 전환 | 3~6s | 본론 예고, 궁금증 유발 |
| 3 | `body` / 본론 | 6~12s | 핵심 내용 전달 |
| 4 | `closing` / 클로징 | 12~15s | CTA, 참여 유도 |

---

## 3. 트렌드 이유 추론 (`POST /api/insights` 확장)

### 추가 System Prompt

```
For each trending video, analyze WHY it is trending based ONLY on
text metadata (title, hashtags, view count, growth rate).
Do NOT claim to know visual content, BGM, or editing style.
Keep trendReason under 30 Korean characters.
```

### User Prompt 추가

```typescript
export function buildTrendReasonPrompt(trends: TrendItem[]): string {
  const list = trends.slice(0, 5).map((t, i) =>
    `${i+1}. 제목: "${t.title}" | 태그: ${t.hashtags} | 성장: +${t.growth}%`
  ).join('\n')

  return `
다음 트렌드가 왜 뜨는지 텍스트 메타데이터만으로 분석하세요.

${list}

JSON only:
{
  "trendReasons": [
    { "index": 1, "reason": "30자 이내 한국어" }
  ]
}
`.trim()
}
```

---

## 4. 패턴 리포트 (`POST /api/pattern-report`)

### System Prompt

```
You are an algorithm coach for Korean shortform creators.
Analyze 10 completed video storyboards and identify content pattern.
Respond in JSON only. Be encouraging and specific. All text in Korean.
```

### User Prompt

```typescript
export function buildPatternReportPrompt(history: SceneCard[][]): string {
  const summary = history.map((c, i) =>
    `영상 ${i+1}: ${c[0]?.script?.slice(0, 30)}...`
  ).join('\n')

  return `
완료한 10개 콘티:
${summary}

JSON only:
{
  "patternTitle": "패턴 이름",
  "patternDescription": "2~3문장",
  "strengths": ["강점 1", "강점 2"],
  "nextSteps": ["액션 1", "액션 2", "액션 3"],
  "algoReadiness": "알고리즘 준비도 1문장"
}
`.trim()
}
```

---

## 5. Mock Fallback 전략

```typescript
// 모든 API 공통 패턴
export async function POST(req: NextRequest) {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ ...MOCK_DATA, source: 'mock' })
  }
  try {
    const { text } = await generateText({
      model: google('gemini-2.5-flash'),
      system: SYSTEM_PROMPT,
      prompt: buildPrompt(await req.json()),
    })
    const parsed = JSON.parse(text.replace(/```json|```/g, '').trim())
    return NextResponse.json({ ...parsed, source: 'live' })
  } catch {
    return NextResponse.json({ ...MOCK_DATA, source: 'mock-fallback' })
  }
}
```

> 환경변수 키 이름: `GOOGLE_GENERATIVE_AI_API_KEY` (기존 v2와 동일)
