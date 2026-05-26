# Shortform Pulse — 콘티 화면 설계

> 콘티 화면의 역할, 장면 구성, 스케치 품질 개선 방법

---

## 1. 콘티 화면의 역할 정의

### 핵심 질문
> "콘티를 받았을 때 초기 크리에이터가 가장 먼저 해야 하는 행동은?"

**→ 내가 만들고 싶은 주제와 테마를 영상으로 어떻게 기획할지 고민**

### 정보 계층

| 단계 | 역할 | 핵심 정보 |
|------|------|----------|
| 트렌드 피드 | 왜 뜨는지 이해 | 키워드 패턴, 제목 구조, 타깃 신호 |
| LLM 상담 | 내 상황에 각색 | 내 앵글, 내 톤, 내 소재 |
| **콘티 화면** | **뭘 찍고 뭘 말할지** | **장면 스케치 + 대사** |
| 편집 단계 | 어떻게 만들지 | 초단위 타이밍, 자막 → 캡컷 등 외부 툴 |

### 콘티 화면에서 제외한 것 (이유)

| 제외 항목 | 제외 이유 |
|----------|---------|
| 초단위 타임라인 | 편집 단계 정보 — 기획 단계에서 과함 |
| 자막 가이드 | 편집 툴(캡컷)이 더 잘함 |
| 알고리즘 뱃지 | 트렌드 피드에서 이미 설명됨 |
| BGM 제안 | 정보 과부하, 편집 단계 |
| 촬영 앵글 다이어그램 | 스케치가 대신함 |

---

## 2. 화면 구성

### 레이아웃

```
┌─────────────────────────────────┐
│ 콘티 가이드 · [카테고리] · [톤]  │  ← eyebrow
│ [콘텐츠 앵글 제목]              │  ← title
│ [구조 한 줄 설명]               │  ← subtitle
├─────────────────────────────────┤
│ 트렌드 포인트                    │  ← 트렌드에서 가져온 것
│ "고민→해결 제목 구조 활용 중"   │
├─────────────────────────────────┤
│ CUT 1 · 훅            0~3s     │
│ ┌──────────────────────────┐   │
│ │  [장면 스케치 16:9]      │   │  ← 핵심
│ └──────────────────────────┘   │
│ "대사 텍스트 italic"            │  ← 핵심
│ 촬영 메모 한 줄                 │
├─────────────────────────────────┤
│ CUT 2 · 전환          3~6s     │
│ [스케치 + 대사 + 메모]         │
├─────────────────────────────────┤
│ CUT 3 · 본론          6~12s    │
│ [스케치 + 대사 + 메모]         │
├─────────────────────────────────┤
│ CUT 4 · 클로징        12~15s   │
│ [스케치 + 대사 + 메모]         │
├─────────────────────────────────┤
│ [촬영했어요 ✓]  [↺ 재생성]    │
└─────────────────────────────────┘
```

### 장면 구성 (15초 기준)

| CUT | 파트 | 시간 | 목적 | 스케치 유형 |
|-----|------|------|------|------------|
| 1 | 훅 | 0~3s | 공감/놀람으로 이탈 방지 | 클로즈업, 표정 중심 |
| 2 | 전환 | 3~6s | 본론 예고, 궁금증 유발 | 상반신, 제스처 |
| 3 | 본론 | 6~12s | 핵심 내용 전달 | 분할 또는 설명 |
| 4 | 클로징 | 12~15s | CTA, 참여 유도 | 정면, 밝은 표정 |

> TikTok (30초) 기준: CUT 3을 2개로 분할하여 5컷 구성

---

## 3. 스케치 품질 — 현황 및 개선 방법

### 현재 방식의 한계

현재 프로토타입은 SVG / Canvas API로 직접 그리는 방식입니다.  
인물 비율, 표정 디테일, 명암 처리에서 실제 광고 콘티 수준에 미치지 못합니다.

**목표 레퍼런스:** 전문 광고 콘티라이터 스타일
- 연필/잉크 라인 아트 + 그레이스케일 명암
- 만화 영향을 받은 현실적 인체 비율
- 풍부한 표정 표현
- 느슨하지만 자신감 있는 선

---

### 방법 1 — 이미지 생성 AI 연동 (권장)

Stable Diffusion API 또는 DALL-E 3를 백엔드에서 호출.  
각 장면의 `sketchPrompt`를 보내면 실제 스토리보드 스케치 이미지를 반환.

#### 프롬프트 템플릿

```
professional Korean TV commercial storyboard panel,
pencil sketch style, manga-influenced realistic proportions,
grayscale ink illustration, high contrast light and shadow,
detailed facial expressions, confident brushwork,
[장면 설명],
storyboard frame border, professional animation studio quality,
no color, black and white only
```

#### 장면별 프롬프트 예시

```typescript
// CUT 1 — 훅 (고민하는 표정 클로즈업)
`professional Korean TV commercial storyboard panel,
 pencil sketch, manga-influenced, grayscale,
 close-up portrait of young Korean woman in office attire,
 worried troubled expression, chin resting on hand,
 thinking about lunch, soft office background suggestion,
 storyboard frame, high contrast ink lines`

// CUT 2 — 전환 (아이디어 떠오름)
`professional Korean TV commercial storyboard panel,
 pencil sketch, manga-influenced, grayscale,
 young Korean woman upper body shot,
 bright eureka expression, raising index finger,
 sparkle effect near hand, confident smile,
 storyboard frame, high contrast ink lines`

// CUT 3 — 본론 (설명 + B-roll)
`professional Korean TV commercial storyboard panel,
 pencil sketch, manga-influenced, grayscale,
 split frame composition: left panel woman explaining
 with hand gesture, right panel close-up Korean food
 in bowl with chopsticks, vertical dividing line,
 storyboard frame, high contrast ink lines`

// CUT 4 — 클로징 (환하게 웃음)
`professional Korean TV commercial storyboard panel,
 pencil sketch, manga-influenced, grayscale,
 young Korean woman medium shot, big beaming smile,
 both arms slightly raised, looking directly at camera,
 joyful celebratory expression, soft background,
 storyboard frame, high contrast ink lines`
```

#### API 연동 코드

```typescript
// app/api/sketch/route.ts (신규)
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { sketchPrompt } = await req.json();

  // Option A: Stable Diffusion API
  const sdResponse = await fetch('https://api.stability.ai/v1/generation/...', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.STABILITY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text_prompts: [{ text: sketchPrompt, weight: 1 }],
      cfg_scale: 7,
      height: 576,
      width: 1024,
      samples: 1,
      steps: 30,
    }),
  });

  // Option B: DALL-E 3
  // const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  // const image = await openai.images.generate({
  //   model: 'dall-e-3',
  //   prompt: sketchPrompt,
  //   size: '1792x1024',
  //   quality: 'standard',
  //   style: 'natural',
  // });

  const data = await sdResponse.json();
  const base64 = data.artifacts[0].base64;
  return NextResponse.json({ imageUrl: `data:image/png;base64,${base64}` });
}
```

#### 비용 예시

| 서비스 | 단가 | 콘티 1개 (4컷) |
|--------|------|--------------|
| DALL-E 3 (1792x1024) | $0.08/장 | $0.32 |
| Stability AI SD3 | $0.065/장 | $0.26 |
| Replicate (SDXL) | $0.0023/초 | ~$0.05 |

---

### 방법 2 — 사전 제작 스케치 에셋 (프로토타입 권장)

장면 유형을 5~6패턴으로 분류하고, 실제 스토리보드 작가에게  
베이스 스케치를 의뢰한 뒤 텍스트(대사, 촬영 메모)만 LLM으로 생성.

#### 장면 유형 분류

| 유형 ID | 설명 | 사용 파트 |
|---------|------|----------|
| `close-worried` | 클로즈업, 고민 표정 | 훅 (공감형) |
| `close-smile` | 클로즈업, 밝은 미소 | 훅 (유머형), 클로징 |
| `upper-gesture` | 상반신, 검지 제스처 | 전환 |
| `upper-explain` | 상반신, 설명 제스처 | 본론 |
| `split-broll` | 분할 화면 (인물+오브젝트) | 본론 |
| `full-celebrate` | 상반신+팔, 환하게 웃음 | 클로징 |

#### 구현 방법

```typescript
// lib/sketchAssets.ts
const SKETCH_ASSETS: Record<string, string> = {
  'close-worried': '/assets/sketches/close-worried.png',
  'close-smile':   '/assets/sketches/close-smile.png',
  'upper-gesture': '/assets/sketches/upper-gesture.png',
  'upper-explain': '/assets/sketches/upper-explain.png',
  'split-broll':   '/assets/sketches/split-broll.png',
  'full-celebrate':'/assets/sketches/full-celebrate.png',
};

export function getSketchForPart(part: PartType, tone: ToneType): string {
  if (part === 'hook' && tone === '유머형') return SKETCH_ASSETS['close-smile'];
  if (part === 'hook') return SKETCH_ASSETS['close-worried'];
  if (part === 'transition') return SKETCH_ASSETS['upper-gesture'];
  if (part === 'body') return SKETCH_ASSETS['split-broll'];
  return SKETCH_ASSETS['full-celebrate'];
}
```

---

### 방법 3 — 단계적 전환 전략 (추천 로드맵)

```
Phase 1 (현재): SVG/Canvas 스케치 — 구조 검증
    ↓
Phase 2 (프로토타입): 사전 제작 에셋 + LLM 텍스트
    ↓
Phase 3 (베타): 이미지 생성 AI 연동 (Replicate SDXL)
    ↓
Phase 4 (정식): 자체 파인튜닝 모델 (스토리보드 특화)
```

---

## 4. SceneCard 컴포넌트 설계

```typescript
// components/production/SceneCard.tsx
interface SceneCardProps {
  cutNum: number;
  part: 'hook' | 'transition' | 'body' | 'closing';
  partLabel: string;
  timeRange: string;      // "0~3s"
  sketchSrc: string;      // 이미지 URL 또는 base64
  script: string;         // 대사
  shootingNote: string;   // 촬영 메모 한 줄
}

// 레이아웃:
// ┌─────────────────────────────────┐
// │ [파트라벨]              [시간]  │ ← card head
// ├─────────────────────────────────┤
// │ [스케치 이미지 16:9 전체 폭]    │ ← 핵심 비주얼
// ├─────────────────────────────────┤
// │ "대사" (italic)                 │ ← script
// │ 촬영 메모                       │ ← shootingNote
// └─────────────────────────────────┘
```

---

## 5. TimelineView 컴포넌트 설계

```typescript
// components/production/TimelineView.tsx
// 진입점: /production?view=conti

export default function TimelineView() {
  const { selectedTrend, contentAngle } = useStore();
  const [data, setData] = useState<StoryboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 자동 호출 — 진입 즉시 콘티 생성
    fetch('/api/storyboard', {
      method: 'POST',
      body: JSON.stringify({ trend: selectedTrend, angle: contentAngle }),
    })
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); });
  }, []);

  if (loading) return <ContiSkeleton />;

  return (
    <div>
      <TrendPointBanner point={data.trendPoint} />
      {data.scenes.map((scene, i) => (
        <SceneCard key={i} {...scene} sketchSrc={getSketchSrc(scene)} />
      ))}
      <DoneButton onDone={handleDone} />
    </div>
  );
}

function getSketchSrc(scene: SceneCard): string {
  // Phase 2: 에셋 매핑
  return getSketchForPart(scene.part, store.contentAngle?.toneKeyword);
  // Phase 3: 이미지 생성 AI URL
  // return scene.generatedSketchUrl;
}
```

