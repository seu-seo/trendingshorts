# Shortform Pulse

> 크리에이터를 위한 페르소나 기반 콘텐츠 추천 데모  
> 7개 질문으로 페르소나를 진단하고, 트렌드·인플루언서·콘티를 한 번에 추천합니다.

**🎯 타겟**: 30대 직장인 · 구독자 1만 이하 스몰 크리에이터

---

## 🧭 화면 흐름

```
스플래시
  ↓ (자동, 2.5초)
7개 설문 (Q1~Q7)
  ↓
페르소나 매칭 로딩
  ↓
페르소나 결과 화면 + 의도 선택
  ↓
┌──────────────┬──────────────┬──────────────┐
│ 🟢 숏폼 트렌드 │ 🩷 인플루언서  │ 🔵 콘티 추천   │
│ → Dashboard │ → Trends     │ → Conti      │
└──────────────┴──────────────┴──────────────┘
```

각 탭은 하단 탭바로 자유롭게 이동 가능합니다.

---

## 📋 7개 설문 항목

| Q | 항목 | 타입 |
|---|------|------|
| Q1 | 주력 플랫폼 (YouTube / TikTok / Instagram / 멀티) | 단일 선택 |
| Q2 | 채널 카테고리 (요리·뷰티·라이프·정보·게임·운동·예술) | 단일 선택 |
| Q3 | 크리에이터 경력 | 슬라이더 (0–5+) |
| Q4 | 가장 큰 목표 (팔로워·수익화·브랜드·팬덤) | 단일 선택 |
| Q5 | 콘텐츠 스타일 키워드 | 다중 선택 (최대 3) |
| Q6 | 가장 큰 고민 (아이디어·꾸준함·퀄리티·시간) | 단일 선택 |
| Q7 | 주당 업로드 빈도 | 슬라이더 (1–7편) |

---

## 🎭 페르소나 4종

| Type | Name | Color | 특징 |
|------|------|-------|------|
| 00 | THE TRENDSETTER | 🟢 라임 | 트렌드 감각으로 선점하는 타입 |
| 01 | THE NICHE KING | 🔵 블루 | 깊이 있는 전문성으로 차별화 |
| 02 | THE HOOKER | 🟠 오렌지 | 첫 3초로 사로잡는 타입 |
| 03 | THE EXPERIMENTER | 🟣 퍼플 | 독창적인 실험으로 차별화 |

페르소나는 **Q5 스타일 키워드**를 기반으로 자동 매칭됩니다.

---

## 📱 주요 화면

### 1. Dashboard — 카테고리 트렌드
- 카테고리 TOP 3 영상 (조회수 · 좋아요 · 해시태그)
- 주요 키워드 분석 (HOT · RISING 표시)
- Gemini AI 트렌드 인사이트

### 2. Trends — 인플루언서 추천
- ⭐ BEST MATCH 히어로 카드 (1위)
  - 매칭 점수 · 팔로워 · 업로드 빈도 · 7일 성장세 · 매칭 이유
- 컴팩트 리스트 (2~4위)

### 3. Conti — 콘티 추천
- 3문항 추가 설문 (분위기 / 영상 길이 / 강조 포인트)
- Gemini AI 생성 로딩
- 대본 3종 (정보형 · 감성형 · 유머형)
- 6컷 콘티 (시간대별 가이드)

---

## 🛠 기술 스택

- **Next.js 14** (App Router)
- **TypeScript**
- **React Context** (상태 관리)
- **글로벌 CSS** (디자인 시스템)

### 디자인 시스템
- 다크 모드 (`#0A0A0B`)
- 액센트: 라임 `#C8FF57` · 핑크 `#FF3D7F` · 블루 `#57C8FF`
- 폰트: Bebas Neue (디스플레이) · Instrument Sans (본문) · JetBrains Mono (모노)

---

## 🚀 실행 방법

```bash
npm install
npm run dev
# → http://localhost:3000
```

### 빌드 (정적 export)

```bash
npm run build
# → out/ 폴더에 정적 파일 생성
```

---

## 📂 프로젝트 구조

```
shortform-pulse/
├── app/
│   ├── layout.tsx        # 루트 레이아웃
│   ├── page.tsx          # 메인 페이지 (모든 화면 통합)
│   └── globals.css       # 전역 스타일
├── lib/
│   ├── types.ts          # 공통 타입 정의
│   ├── personas.ts       # 페르소나 + 매칭 로직
│   ├── questions.ts      # 7개 설문 데이터
│   ├── categoryData.ts   # 카테고리별 mock 데이터
│   └── SurveyContext.tsx # 설문 응답 상태
├── components/           # (추후 분리용)
└── app/api/              # (Gemini API 통합 예정)
```

---

## 🔗 API 통합 가이드 (Gemini)

`app/api/recommend/route.ts` 형태로 Route Handler 추가:

```ts
export async function POST(req: Request) {
  const { persona, category, intent } = await req.json();
  // Gemini API 호출
  return Response.json({ recommendations: [...] });
}
```

**Gemini API 호출 시점 (총 3회):**
1. 키워드 분석 (Dashboard 진입 시)
2. 영상 소재·컨셉 추천 (Conti CTA 클릭 시)
3. 대본·콘티 생성 (위와 통합 가능)

---

## 👥 팀

KAIST BIZ 699911 그룹 프로젝트  
2026.05.16 발표
