# CONTEXT.md — Claude Code 작업 인계 문서

> 이 문서는 **Claude Code가 v6 작업을 이어받을 때** 참고하는 컨텍스트입니다.  
> 이전 세션(Claude.ai 채팅)에서의 디자인 결정과 다음 작업 방향을 담고 있어요.

---

## 1. 지금 어디까지 왔나

### 현재 상태
- **파일**: `demo/v6/index.html` — 단일 HTML (CSS + JS 인라인)
- **브랜치**: `main`
- **단계**: **Kraster-style 프리미엄 다크 디자인 완성**. 실제 데이터 연동 전.

### 오늘 완료한 작업 (2025-05-27)

| 커밋 | 내용 |
|------|------|
| `6809684` | Live Pulse Mode 섹션 추가 + 초기 다크 모드 |
| `7db235e` | 프리미엄 다크 (#1C1C1E / #27272A / #FA5252) |
| `6ceceea` | 3색 데이터 시스템 (성장=레드, 하락=블루, 중립=민트) |
| `f3a5677` | **Kraster-style 완성** (#0A0A0A / #FF4274 / Inter) |

### 만들어진 화면
1. Welcome (가치 우선 미리보기)
2. Q1 플랫폼 / Q2 카테고리 / Q3 연령대 (3-step 온보딩)
3. Loading
4. Dashboard (트렌드 메인) — Live Pulse Mode 포함
5. My Page

### 인터랙션 상태
- 화면 전환 작동 (`goTo`, `switchTab`)
- 선택/체크 인터랙션 작동
- 트렌드 카드 펼침 (`toggleTrendItem`)
- Live Pulse Mode 카드 펼침 (`togglePulseCard`)
- Smart Onboarding soft prompt 답변 처리
- 프로필 완성도 ring 업데이트
- `skipToSampleDashboard()` — 대시보드 바로 진입 (테스트용)

---

## 2. 디자인 결정 — 왜 이렇게 만들었나

### 컬러 시스템 (현재: Kraster-style 프리미엄 다크)

```css
--bg: #0A0A0A;          /* 깊은 블랙 — 그라디언트 없음 */
--bg-soft: #111111;
--bg-card: #1A1A1A;     /* 배경과 미묘하게 구분되는 카드 표면 */
--bg-hover: #222222;

--primary: #FF4274;     /* Vivid 핑크-레드 액센트 — 핵심 요소에만 */
--primary-deep: #E63366;
--primary-soft: rgba(255, 66, 116, 0.1);

--up: #FF4274;          /* 성장 수치 = 액센트와 동일 */
--down: #3B82F6;        /* 하락 = 일렉트릭 블루 */
--neutral: #10B981;     /* 중립 태그 = 테크 민트 */

--ink: #FFFFFF;         /* 순백 메인 텍스트 */
--ink-soft: #A1A1AA;    /* 미드 그레이 서브 텍스트 */

--line: #2A2A2A;
--line-strong: #333333;

--font-mono: 'Inter', 'Pretendard Variable', sans-serif;
```

### 3색 데이터 시스템
- **레드** (`#FF4274`) = 성장/상승/핫 — 전통 금융과 반대로, 트렌드 앱에서 "뜨거움"
- **블루** (`#3B82F6`) = 하락/식는 중
- **민트** (`#10B981`) = 중립 태그, 플랫폼 이름

### 컬러 원칙
- **메인 액센트는 코랄-핑크** (`#FF4274`) — 절대 파랑으로 바꾸지 말 것
- **배경은 순수 블랙** (`#0A0A0A`) — 그라디언트 없음, 심플
- **액센트는 아껴서** — CTA 버튼, 트렌드 수치, 라이브 닷에만

### 폰트
- **카페24 써라운드** = 친근한 헤딩
- **카페24 당당해** = 임팩트 강조 ("3배", "수진님", "1위 2위 3위")
- **Pretendard** = 본문, 보조
- **Inter** = 모든 영문 메타데이터, 숫자 (JetBrains Mono에서 변경)

**중요**: 카페24 폰트들은 **단일 weight**만 있음. `font-weight: 700/900` 써도 안 바뀜.

### 카피 톤
- **메인 콘텐츠**: 한국어 친근체 ("오늘 좋은 트렌드 왔어요")
- **라벨/메타**: 영문 + 모노 + uppercase ("Today's Big Trend", "GROWTH")

### 이모지/그림 — 일절 없음
사용자가 명시적으로 요청. **앞으로도 이모지 추가 금지**. 데이터/타이포/색만으로 위계.

예외 가능: SVG 아이콘 (line icon만), 작은 dot/도형.

---

## 3. 핵심 컴포넌트 — 건드릴 때 주의

### AI Daily Briefing 카드
- 대시보드 최상단. **앱의 차별화 포인트**
- `::before` 애니메이션 제거됨 (Kraster 작업 때). 지금은 `display: none`
- 텍스트 fade-in delay 순서: greeting → summary (0.4s) → points (1.0s)

### Live Pulse Mode 섹션 (오늘 추가)
- AI Briefing 아래, Headline block 위
- `.pulse-scroll` — 가로 스크롤 컨테이너
- `.pulse-card` — 158px 고정폭, 클릭하면 펼쳐짐 (`togglePulseCard`)
- 배지: `.rising` = 레드, `.cooling` = 블루
- 미니 바 차트: 어제(#383838) vs 오늘(액센트 레드/블루)

### WHY 인사이트 카드 (`why-card`, `headline-why`)
- 좌→우 shimmer 효과 (3-4초 사이클)
- Welcome 화면과 대시보드 헤드라인 둘 다에 있음
- **이게 다른 트렌드 앱과의 차이점** — 절대 제거 금지

### Smart Onboarding
- `skipToSampleDashboard()` → 샘플 모드 진입
- `sampleProgress` 상태로 진행도 관리
- **현재 미완성**: prompt 답변이 trend 카드를 동적으로 안 바꿈 (mock)

### 펄스 닷 (`live-dot`, `pulse-dot`, `briefing-tag-dot`)
- `pulse-glow` 또는 `ring` 애니메이션
- Pulse 브랜드 시그니처 — 함부로 제거 금지

### Pseudo-element 그라디언트 — 모두 제거됨
다음 `::before` 요소들은 `display: none` 처리:
- `.phone::before`
- `.value-card::before`
- `.headline-block::before`
- `.insight-card::before`
- `.ai-briefing::before`

---

## 4. 다음에 해볼 만한 작업

우선순위 순서:

### ✅ DONE: Live Pulse Mode (재방문 동기)
AI Briefing 아래에 "어제 본 트렌드가 어떻게 됐을까요?" 섹션 추가 완료.

### 🥇 1. Save & Collection (개인 라이브러리)
**목표**: 저장 버튼 누른 것들을 마이페이지에 모아보기  
**왜**: 현재 "저장" 버튼은 작동 안 함. 액션의 종착지 필요.

구체적으로:
- 마이페이지에 "내 컬렉션" 섹션 추가
- 저장한 트렌드를 mood board처럼 그리드로
- 태그/검색 가능

### 🥈 2. 실제 데이터 연동
**목표**: 하드코딩된 mock 데이터를 실제 API 데이터로

순서:
1. mock data를 별도 JS 파일로 분리 (`data.js`)
2. 트렌드 카드 렌더링을 동적으로 (template literal)
3. 백엔드 API 정의
4. fetch로 데이터 가져오기

### 🥉 3. 다크/라이트 토글
- CSS 변수 시스템이 잡혀있어서 라이트 토큰만 추가하면 됨
- 마이페이지 설정에 토글 추가

### 4. Comparison/Context
- 트렌드 펼쳤을 때 "비슷한 트렌드"와 비교 차트 추가
- "5월 평균 대비 +120%" 같은 컨텍스트

### 5. 모바일 제스처
- 트렌드 카드 좌우 스와이프 → 저장/스킵
- 상단 pull-to-refresh로 AI Briefing 새로고침

---

## 5. 건드릴 때 주의사항 (Footguns)

### 단일 HTML 구조
- CSS/JS 모두 `<style>` `<script>`에 인라인
- **지금은 단일 파일로 유지** (Vibe coding 단계)
- 분리는 실제 데이터 연동할 때 같이 하면 됨

### 화면 전환
- `screen` class + `active` toggle로 작동
- 새 화면 추가하려면:
  1. `.screen` div 추가
  2. `goTo('screen-xxx')` 호출 가능
  3. `resetDemo()` 함수에 리셋 로직 추가 (필요시)

### 폰트 로딩
- 카페24 폰트는 jsdelivr CDN에서 로드
- 첫 로드 시 깜빡임 있을 수 있음 (`font-display: swap`)

### Mock 데이터 위치
모든 트렌드/키워드/통계 데이터가 HTML 안에 하드코딩:
- 트렌드 리스트 (Top 5)
- 키워드 5개
- 헤드라인 카드 통계
- AI Briefing 텍스트
- Live Pulse Mode 카드 3개

데이터 변경하려면 HTML 직접 수정. JS 함수로 렌더링되지 않음.

### 색상 규칙 주의
- `.avatar-mini { background: var(--primary) }` — ink(흰색)로 바꾸면 흰 동그라미 버그
- `.toss-radio-inner { background: #F4F4F5 }` — 하드코딩 유지 (코랄 라디오 안의 흰 점)
- CTA 버튼은 `var(--primary)` 직접 사용 — `var(--ink)` 쓰면 흰 배경 됨

### Smart Onboarding 상태
- `sampleProgress` 객체에 보관 (in-memory)
- 새로고침하면 리셋됨
- 실제 앱에선 localStorage 또는 백엔드 저장 필요

---

## 6. 이전 디자인 탐색 과정

`explorations/` 폴더에 7개 시도가 있어요. 참고용입니다.

1. **pulse-japanese.html** — 메르카리/LINE 톤
2. **pulse-cute-ko.html** — 한국어 + 카페24 폰트
3. **pulse-newsprint.html** — 신문 베이지 + 잉크 빨강
4. **pulse-magazine.html** — 매거진 (Issue No. 01)
5. **pulse-toss.html** — 토스 톤 첫 시도
6. **pulse-toss-v2.html** — WHY 인사이트 + Action Layer
7. **pulse-sv.html** — SV 톤 (ambient light, AI shimmer)

**최종 (index.html)** = Kraster-style 프리미엄 다크  
= SV 톤 + Smart Onboarding + AI Daily Briefing + Live Pulse Mode + 3색 데이터 시스템

---

## 7. 작업 시작 명령어

Claude Code에서 v6 작업을 시작할 때:

```bash
# 현재 디자인 확인 (브라우저로)
open demo/v6/index.html

# 또는 로컬 서버
python3 -m http.server 8000
# → http://localhost:8000/demo/v6/
```

작업 후:
```bash
git add demo/v6/
git commit -m "v6: <뭐 변경했는지>"
git push origin main
```

---

## 8. 핵심 원칙 정리

1. **데이터에 의미를 더한다** — 숫자만 보여주면 차트 앱. WHY가 있어야 인사이트 앱
2. **이모지·캐릭터·이미지 금지** — 타이포/색/도형만으로 모든 위계 표현
3. **재방문 동기** — 매일 열 이유가 있어야 함 (AI Briefing + Live Pulse Mode)
4. **점진적 개인화** — 가입 강제 금지. 둘러보며 자연스럽게 채워가기
5. **카페24 폰트의 친근함 + Inter의 정교함** — 이 균형이 Pulse 톤
6. **코랄-핑크는 액센트, 흰색이 메인** — 액센트 남발하면 부담스러움
7. **그라디언트 없음** — Kraster-style은 flat + 강한 타이포로 승부
