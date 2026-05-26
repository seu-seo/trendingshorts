# CONTEXT.md — Claude Code 작업 인계 문서

> 이 문서는 **Claude Code가 v6 작업을 이어받을 때** 참고하는 컨텍스트입니다.  
> 이전 세션(Claude.ai 채팅)에서의 디자인 결정과 다음 작업 방향을 담고 있어요.

---

## 1. 지금 어디까지 왔나

### 현재 상태
- **파일**: `demo/v6/index.html` — 단일 HTML (CSS + JS 인라인)
- **브랜치**: `wip/redesign`
- **단계**: 디자인 시안 완성 단계. **실제 데이터 연동 전**.

### 만들어진 화면
1. Welcome (가치 우선 미리보기)
2. Q1 플랫폼 / Q2 카테고리 / Q3 연령대 (3-step 온보딩)
3. Loading
4. Dashboard (트렌드 메인)
5. My Page

### 인터랙션 상태
- 화면 전환 작동 (goTo, switchTab)
- 선택/체크 인터랙션 작동
- 트렌드 카드 펼침 (`toggleTrendItem`)
- Smart Onboarding soft prompt 답변 처리
- 프로필 완성도 ring 업데이트

---

## 2. 디자인 결정 — 왜 이렇게 만들었나

작업하다가 "이거 왜 이렇게 되어있지?" 싶을 때 참고하는 섹션이에요.

### 컬러
- **메인 액센트는 코랄** (`#FF5C49`)
  - 토스 블루(`#3182F6`)랑 차별화하려고 일부러 코랄
  - 트렌드 = 뜨거운/긴급한 무드. 파랑보다 잘 맞음
  - 절대 파랑으로 바꾸지 말 것 (Pulse 정체성)
- **배경은 순백 아닌 paper white** (`#FCFCFD`)
  - 미세하게 따뜻한 톤. 종일 봐도 눈 안 아픔
- **잉크는 깊은 검정** (`#0E1116`)
  - Linear 톤. 일반적인 `#000`이나 `#191F28`보다 더 깊음

### 폰트 — 왜 3가지 한국 폰트?
- **카페24 써라운드** = 친근한 헤딩 ("어떤 플랫폼 자주 봐요?")
- **카페24 당당해** = 임팩트 강조 ("3배", "수진님", "1위 2위 3위")
- **Pretendard** = 본문, 보조
- **JetBrains Mono** = 모든 영문 메타데이터 (날짜, 라벨, 통계)

**중요**: 카페24 폰트들은 **단일 weight**만 있음. `font-weight: 700/900` 써도 안 바뀜. 굳이 변경 안 해도 되지만 헷갈리지 말 것.

### 카피 톤
- **메인 콘텐츠**: 한국어 친근체 ("오늘 좋은 트렌드 왔어요")
- **라벨/메타**: 영문 + 모노 + uppercase ("Today's Big Trend", "GROWTH", "5.26 THU")

이 mix가 의도된 것. "한국 시장 대상이지만 글로벌급 톤" 신호.

### 이모지/그림 — 일절 없음
사용자가 명시적으로 요청. **앞으로도 이모지 추가 금지**. 데이터/타이포/색만으로 위계.

예외 가능: SVG 아이콘 (line icon만), 작은 dot/도형. 캐릭터 일러스트레이션·이모지·이미지·🔥 같은 것 ❌.

---

## 3. 핵심 컴포넌트 — 건드릴 때 주의

### AI Daily Briefing 카드
- 대시보드 최상단. **앱의 차별화 포인트**
- 우상단 conic gradient가 20초로 천천히 돔 (`@keyframes rotate-bg`)
- 텍스트 fade-in delay 순서: greeting → summary (0.4s) → points (1.0s)
- **건드릴 때**: 텍스트 stream 효과가 중요하니까 animation-delay 유지

### WHY 인사이트 카드 (`why-card`, `headline-why`)
- 좌→우 shimmer 효과 (3-4초 사이클)
- Welcome 화면과 대시보드 헤드라인 둘 다에 있음
- **이게 다른 트렌드 앱과의 차이점** — 절대 제거 금지

### Smart Onboarding
- `skipToSampleDashboard()` → 샘플 모드 진입
- `sampleProgress` 상태로 진행도 관리
- soft prompt 1 답하면 자동으로 prompt 2 노출됨
- **현재 미완성**: prompt 답변이 trend 카드를 동적으로 안 바꿈 (mock)

### 펄스 닷 (`live-dot`, `pulse-dot`, `briefing-tag-dot`)
- 모두 glow shadow 있음
- `pulse-glow` 또는 `ring` 애니메이션
- Pulse 브랜드 시그니처 — 함부로 제거 금지

### Floating 카드 시스템
- `--elev-1` ~ `--elev-floating` 4단계
- value-card, headline-block, ai-briefing, insight-card가 가장 떠있음 (`--elev-floating`)
- 우상단에 radial gradient 광채가 있는 카드들 = "중요한 카드"라는 시그널

---

## 4. 다음에 해볼 만한 작업

우선순위 순서:

### 🥇 1. Live Pulse Mode (재방문 동기)
**목표**: "어제 본 트렌드의 변화" 섹션을 대시보드에 추가  
**왜**: 24시간 후 다시 열 이유를 만들어야 함

구체적으로:
- AI Briefing 아래에 "어제 본 트렌드는 어떻게 됐을까요?" 섹션
- 어제 본 트렌드 카드 2-3개를 작게 보여주되 **상승률 변화**를 표시
- 예: "어제 +312% → 오늘 +480% 🚀 더 떴어요"
- 클릭하면 펼쳐서 변화 그래프 보임

### 🥈 2. Save & Collection (개인 라이브러리)
**목표**: 저장 버튼 누른 것들을 마이페이지에 모아보기  
**왜**: 현재 "저장" 버튼은 작동 안 함. 액션의 종착지 필요.

구체적으로:
- 마이페이지에 "내 컬렉션" 섹션 추가
- 저장한 트렌드를 mood board처럼 그리드로
- 태그/검색 가능

### 🥉 3. 실제 데이터 연동
**목표**: 하드코딩된 mock 데이터를 실제 API 데이터로  
**왜**: 디자인 시안 → 실제 작동 앱으로

순서:
1. mock data를 별도 JS 파일로 분리 (`data.js`)
2. 트렌드 카드 렌더링을 동적으로 (template literal)
3. 백엔드 API 정의
4. fetch로 데이터 가져오기

### 4. 다크 모드
- SV 앱들의 강점. Linear/Vercel/Cursor가 다크 모드로 진짜 멋짐
- CSS 변수 시스템 이미 잡혀있어서 다크 토큰만 추가하면 됨

### 5. Comparison/Context
- 트렌드 펼쳤을 때 "비슷한 트렌드"와 비교 차트 추가
- "5월 평균 대비 +120%" 같은 컨텍스트

### 6. 모바일 제스처
- 트렌드 카드 좌우 스와이프 → 저장/스킵
- 상단 pull-to-refresh로 AI Briefing 새로고침

---

## 5. 건드릴 때 주의사항 (Footguns)

### 단일 HTML 구조
- CSS/JS 모두 `<style>` `<script>`에 인라인
- 나중에 파일 분리할 수 있지만, **지금은 단일 파일로 유지** (Vibe coding 단계)
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
- 로컬 호스팅 고려해볼 만하지만 지금은 CDN 유지

### Mock 데이터 위치
모든 트렌드/키워드/통계 데이터가 HTML 안에 하드코딩되어 있음:
- 트렌드 리스트 (Top 5)
- 키워드 5개
- 헤드라인 카드 통계
- AI Briefing 텍스트

데이터 변경하려면 HTML 직접 수정. JS 함수로 렌더링되지 않음.

### Smart Onboarding 상태
- `sampleProgress` 객체에 보관 (in-memory)
- 새로고침하면 리셋됨
- 실제 앱에선 localStorage 또는 백엔드 저장 필요

---

## 6. 이전 디자인 탐색 과정

`explorations/` 폴더에 7개 시도가 있어요. 참고용입니다.

1. **pulse-japanese.html** — 메르카리/LINE 톤 (크림+코랄, 마스코트, 1위/2위)
2. **pulse-cute-ko.html** — Japanese에서 일본어 제거, 한국어 + 카페24 폰트
3. **pulse-newsprint.html** — 신문 베이지 + 잉크 빨강 (인쇄 미학)
4. **pulse-magazine.html** — 매거진 (Issue No. 01, 로마 숫자, 워드 클라우드)
5. **pulse-toss.html** — 토스 톤 첫 시도 (화이트+코랄+큰 타이포)
6. **pulse-toss-v2.html** — WHY 인사이트 + Action Layer 추가
7. **pulse-sv.html** — SV 톤 (ambient light, ⌘K, AI shimmer)

**최종 (index.html)** = pulse-sv-v2.html  
= SV 톤 + Smart Onboarding + AI Daily Briefing

각 탐색은 의도된 디자인 언어가 있음. 디자인 방향성 고민될 때 비교해보면 좋아요.

---

## 7. 작업 시작 명령어

Claude Code에서 v6 작업을 시작할 때:

```bash
# 작업 폴더 진입
cd /Users/sueseo/trendingshorts/demo/v6

# 현재 디자인 확인 (브라우저로)
open index.html

# 또는 로컬 서버
python3 -m http.server 8000
# → http://localhost:8000
```

작업 후:
```bash
cd /Users/sueseo/trendingshorts
git add demo/v6/
git commit -m "v6: <뭐 변경했는지>"
git push origin wip/redesign
```

---

## 8. 핵심 원칙 정리

1. **데이터에 의미를 더한다** — 숫자만 보여주면 차트 앱. WHY가 있어야 인사이트 앱
2. **이모지·캐릭터·이미지 금지** — 타이포/색/도형만으로 모든 위계 표현
3. **재방문 동기** — 매일 열 이유가 있어야 함 (AI Briefing이 그 역할)
4. **점진적 개인화** — 가입 강제 금지. 둘러보며 자연스럽게 채워가기
5. **카페24 폰트의 친근함 + 모노 폰트의 정교함** — 이 균형이 Pulse 톤
6. **코랄은 액센트, 검정이 메인** — 코랄을 너무 많이 쓰면 부담스러움
