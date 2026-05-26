# Pulse v6 — Silicon Valley Edition

> 30대 직장인 크리에이터를 위한 트렌드 인사이트 앱  
> 데이터가 아닌 **"왜?"**를 알려주는 트렌드 큐레이터

---

## 디자인 컨셉

**"Toss의 친근함 + Linear의 정교함 + Perplexity의 AI native 무드"**

### 핵심 아이덴티티
- **컬러**: 화이트 + 코랄 액센트 (`#FF5C49`)
- **타이포**: 카페24 써라운드 (둥글둥글 친근) + 당당해 (임팩트) + JetBrains Mono (데이터)
- **무드**: SV급 spatial layered UI, ambient gradient light, AI shimmer
- **카피**: 한국어 친근체 + 영문 모노 메타라벨

### 3가지 차별화 포인트
1. **WHY 인사이트** — 숫자만 아닌 "왜 이게 뜨는지"까지 분석
2. **AI Daily Briefing** — 매일 아침 8시 한 단락 요약 (재방문 동기)
3. **Smart Onboarding** — 가입 강제 없이 둘러보며 점진적 개인화

---

## 화면 구성

### 1. Welcome
- 가입 전에 **실제 트렌드 1개**(출근길 5분 루틴) 풀로 보여줌
- 7일 막대 그래프 자동 애니메이션
- WHY 인사이트 카드 (AI shimmer 효과)
- 두 가지 CTA:
  - **시작하기** → 3-step 온보딩
  - **먼저 둘러보기** → 샘플 모드 (점진적 개인화)

### 2. Onboarding (3-step)
- Q1: 플랫폼 (틱톡/인스타/유튜브/모두)
- Q2: 카테고리 칩 (먹방/브이로그/춤/패션/뷰티/운동/여행/공부/게임/반려동물)
- Q3: 연령대 (10/20/30/40/50+) - 거대 숫자

### 3. Sample Mode (Smart Onboarding 경로)
- 가입 없이 일반 트렌드 보기
- 상단에 프로필 완성도 ring (0% → 33% → 66% → 100%)
- 트렌드 사이에 soft prompt 카드 ("어떤 플랫폼 자주 봐요?")
- 답할수록 정확도 ↑, 자연스럽게 가입 완성

### 4. Dashboard (메인)
- **⌘K 검색바** (헤더)
- **AI Daily Briefing** — 가장 큰 카드, 하루 한 단락 요약
- **헤드라인 카드** — 오늘의 빅 트렌드 + 7일 그래프 + WHY 인사이트
- **트렌드 리스트** — Top 5, 펼치면 액션 3개 (저장/콘티 만들기/비슷한 거)
- **실시간 키워드** — 미니 게이지 바 + 상승률

### 5. My Page
- 프로필 카드 (이름/팔로워/태그)
- This Week's Insights — 토스풍 큰 카피 ("지난주보다 +42% 더 잘했어요")
- 더 정확한 추천 받기 액션 3개

---

## 폴더 구조

```
demo/v6/
├── index.html              ← 최종 디자인 (SV + Smart Onboarding + AI Briefing)
├── README.md               ← 이 문서
├── CONTEXT.md              ← Claude Code용 작업 컨텍스트
└── explorations/           ← 디자인 탐색 과정 (참고용)
    ├── pulse-japanese.html      ← 일본 톤 (메르카리/LINE)
    ├── pulse-cute-ko.html       ← 귀여운 한국어 (카페24 폰트)
    ├── pulse-newsprint.html     ← 신문 베이지 (잉크 미학)
    ├── pulse-magazine.html      ← 매거진 (Issue No. 01)
    ├── pulse-toss.html          ← 토스 초기 시도
    ├── pulse-toss-v2.html       ← 토스 + WHY 인사이트 추가
    └── pulse-sv.html            ← SV 톤 v1 (Briefing 전)
```

---

## 핵심 디자인 토큰

```css
/* 컬러 */
--bg: #FCFCFD              /* paper white */
--primary: #FF5C49         /* 트렌드 코랄 */
--ink: #0E1116             /* 깊은 잉크 */
--up: #15803D              /* 상승 그린 */

/* 폰트 */
--font-cute: 'Cafe24Surround'    /* 둥근 헤딩 */
--font-pop: 'Cafe24Dangdanghae'  /* 임팩트 강조 */
--font-body: 'Pretendard Variable'
--font-mono: 'JetBrains Mono'    /* 데이터 메타 */

/* Elevation */
--elev-1, --elev-2, --elev-3, --elev-floating
```

---

## 만든 사람
sueseo · 2026.5  
디자인 협업: Claude (Anthropic)
