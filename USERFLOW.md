# Shortform Pulse — USERFLOW

> 기준: main API 정책 + V6 UX/디자인 통합안
> 최종 업데이트: 2026-06-03

---

## 전체 플로우 개요

```
[앱 최초 진입]
      │
      ▼
  온보딩 완료 여부 (localStorage)
  ├── YES → [트렌드 탭]
  └── NO  → [ONBOARDING]
                │
                ▼
         [메인 앱 — 2탭]
    [ 트렌드 ]  |  [ 마이 ]
```

---

## 1. ONBOARDING

V6 SPEC 3단계. `POST /api/persona` (main) 호출.

```
[Welcome]
  "BEGIN YOUR STORY"
  검정 배경 + 강한 타이포, 이모지 없음
      │
      ▼
Q1. 플랫폼 선택 (복수 선택)
    □ YouTube Shorts  □ TikTok  □ Instagram Reels
      │
      ▼
Q2. 카테고리
    자유입력 (연두 밑줄 스타일) + 키워드 자동 매칭
      │
      ▼
Q3. 연령대
    기회 지수 calcOpportunityScore() 입력값으로 사용
      │
      ▼
[Loading]
  POST /api/persona → Gemini 페르소나 생성
      │
      ▼
[페르소나 결과 카드]
      │
      ▼
[트렌드 탭 랜딩]
```

**localStorage 저장:** 온보딩 완료 플래그, 플랫폼, 카테고리, 연령대, personaResult

---

## 2. 트렌드 탭

V6 SPEC 기준. 카테고리 탭 7개 제거, 연령대 × 플랫폼 기반 개인화로 대체.

```
[트렌드 탭]
  │
  ├─ 기회 지수 링 차트 (애플 워치 동심원 3개)
  │   바깥 링: Instagram  #A855F7
  │   중간 링: YouTube    #FF38A0
  │   안쪽 링: TikTok     #C8FF57
  │   선택한 플랫폼만 컬러 활성화, 나머지 dim
  │   12시 방향 → 시계방향 draw 애니메이션
  │   헤더 개인화: "30대 인스타 트렌드" 등 설문 답변 반영
  │   ⚠️ 어떤 데이터로 구성할지 미정
  │
  ├─ 실시간 해시태그 버블 5개
  │   크기 = 성장률, 파란 glow
  │   POST /api/insights (Gemini, 24h 캐시)
  │   ⚠️ 해시태그 성장률 측정 불가 (TikTok만 해시태그별 누적 조회수 제공)
  │
  └─ Top 5 트렌드 리스트
      저장 버튼 포함
      GET /api/trends (YouTube live + TikTok·Instagram 스냅샷)
      트렌드 카드 탭 → TrendActionSheet
          ├─ "원본 보기"
          └─ "이 트렌드로 콘텐츠 만들기 →" → [콘텐츠 만들기 플로우]
      ⚠️ growth rate 산출 불가 (TikTok·IG: 동일 영상 재조회 구조 없음)
      ⚠️ 플랫폼 간 동일 기준 순위화 불가
```

---

## 3. 마이 탭

V6 SPEC 기준.

```
[마이 탭]
  │
  ├─ 프로필 카드
  │   닉네임 · 플랫폼 태그 · 팔로워
  │
  ├─ This Week's Insights
  │   주간 성과 KPI 카드 4개
  │   ⚠️ 데이터 소스 확정 필요 (계정 연동 전까지 수동 입력 방식 검토)
  │
  ├─ [01] 콘텐츠 만들기 →        ← 제작 플로우 진입점
  │
  ├─ [02] 목표 설정하기
  │
  ├─ [03] 계정 연결하기
  │
  ├─ 내 컬렉션
  │   저장한 트렌드 그리드
  │   saveTrend() → localStorage
  │
  └─ 저장한 대본·콘티
      saveContent() → localStorage
```

---

## 4. 콘텐츠 만들기 플로우

**진입점 2가지**
- 트렌드 탭 TrendActionSheet → "이 트렌드로 콘텐츠 만들기" (선택 트렌드 context 전달)
- 마이 탭 → [01] 콘텐츠 만들기 (트렌드 context 없이 자유 제작)

```
[진입]
  트렌드에서 진입 시: 선택한 트렌드 배너 상단 표시
      │
      ▼
[질문 폼] — 7개 질문 한 화면 (V6 SPEC)
  PASSION   열정 — 1년 내내 만들고 싶은 것
  SPENDING  소비 — 가장 돈 많이 쓰는 취미
  STRENGTH  강점 — 주변에서 칭찬받는 것
  AUDIENCE  오디언스 — 보여주고 싶은 사람
  TOPIC     주제 — 이번 영상 주제
  FORMAT    포맷 — 형식/촬영 환경
  HOOK      훅 — 첫 3초 전략
      │
      ▼
[AI 분석 시작]
  POST /api/recommend (main)
  트렌드 context 있으면 함께 전달
      │
      ▼
[AI 니치 분석 결과 카드]
  니치 타이틀 · 설명 · 키워드 태그
  FORMAT · PLATFORM 추천
      │
      ▼
  ┌──────────────────┬──────────────────┐
  │  대본 추천 받기   │  콘티 추천 받기   │
  └────────┬─────────┴────────┬──────────┘
           │                  │
           ▼                  ▼
     [주제 입력]          [주제 입력]
           │                  │
           ▼                  ▼
  POST /api/generate    POST /api/storyboard
  대본 3종               콘티 4컷
  (정보형/스토리형/훅형)  CUT1 훅(0-3s)
                         CUT2 전환(3-6s)
                         CUT3 본론(6-12s)
                         CUT4 클로징(12-15s)
           │                  │
           └────────┬─────────┘
                    ▼
          [이 대본/콘티 저장하기] → localStorage → 마이 탭 "저장한 대본·콘티"
          [마이페이지로 돌아가기]
```

---

## 5. API 매핑

| 호출 시점 | 엔드포인트 | 데이터 소스 | 캐싱 |
|----------|-----------|------------|------|
| 온보딩 완료 | POST /api/persona | Gemini 2.5 Flash | localStorage |
| 트렌드 탭 진입 | GET /api/trends | YouTube live + TikTok·IG 스냅샷 | 서버 24h |
| 트렌드 탭 진입 | POST /api/insights | Gemini 2.5 Flash | 서버 24h + Zustand |
| 콘텐츠 만들기 분석 | POST /api/recommend | Gemini 2.5 Flash | 없음 |
| 대본 요청 | POST /api/generate | Gemini 2.5 Flash | 없음 |
| 콘티 요청 | POST /api/storyboard | Gemini 2.5 Flash | 없음 (개발 필요) |

---

## 6. 디자인 시스템 (V6 SPEC)

```css
--bg:       #0A0A0A   /* 메인 배경 — 순수 블랙 */
--bg-card:  #1A1A1A   /* 카드 표면 */
--primary:  #C8FF57   /* Acid Lime — 메인 액센트 */
--up:       #FF4274   /* 성장/상승 수치 */
--down:     #38B6FF   /* 하락 */
--neutral:  #10B981   /* 중립/플랫폼 태그 */
--ink:      #FFFFFF   /* 메인 텍스트 */
--ink-soft: #A1A1AA   /* 서브 텍스트 */
```

| 역할 | 폰트 |
|------|------|
| 임팩트 헤딩 | 카페24 당당해 |
| 친근한 헤딩 | 카페24 써라운드 |
| 본문 | Pretendard |
| 데이터·레이블 | Inter |

**원칙:** 이모지·이미지 금지 / 그라디언트 없음 / 액센트는 CTA·핵심 수치에만 / WHY 인사이트 필수

---

## 7. 미확정 항목

| 항목 | 현황 |
|------|------|
| 기회 지수 데이터 산출 방식 | 어떤 데이터로 구성할지 미정 — 별도 논의 필요 |
| This Week's Insights KPI | 계정 연동 전까지 데이터 소스 확정 필요 |
| 콘티 스케치 품질 | Phase1 텍스트만 → Phase2 사전 에셋 → Phase3 이미지 생성 AI |
| /api/storyboard | 현재 minimal 구현, 4컷 SceneCard 완성 필요 |
