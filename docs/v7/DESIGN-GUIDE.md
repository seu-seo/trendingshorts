# DESIGN GUIDE — Shortform Pulse v7

> Soft Editorial · 웜 화이트 + 인디고 · 대화형 인터페이스 중심
> v7 · 2026-06-13

---

## 디자인 방향

v6의 다크 + 형광 라임/네온 핑크에서 벗어나, **차분하고 세련된 밝은 톤**으로 전환.

1. **웜 화이트 베이스** — 순백(#FFF) 대신 따뜻한 화이트(#FAFAF8). 눈이 편하고 고급스러움
2. **인디고 포인트 한 가지** — 형광색 대신 신뢰감 있는 인디고(#5B5BD6) 하나로 절제
3. **대화형 우선** — 온보딩이 채팅이라 메신저 앱처럼 깔끔한 말풍선 UI
4. **부드러운 모서리** — 14~28px 라운드로 친근한 인상
5. **군더더기 제거** — 그림자·테두리 최소, 여백으로 위계 표현

---

## 컬러 토큰

```css
:root {
  /* 배경 */
  --bg:        #FAFAF8;   /* 웜 화이트 (메인) */
  --surface:   #FFFFFF;   /* 카드 */
  --soft:      #F3F3F0;   /* 보조 배경 */
  --lav:       #EEEEFB;   /* 연한 라벤더 (AI 말풍선) */

  /* 보더 */
  --border:    #EAEAE4;
  --border2:   #DDDDD6;

  /* 텍스트 */
  --ink:       #1A1A1A;   /* 제목·본문 */
  --ink2:      #6E6E66;   /* 보조 */
  --ink3:      #A8A8A0;   /* 캡션 */

  /* 포인트 — 인디고 하나로 통일 */
  --pri:       #5B5BD6;
  --pri-deep:  #4747C2;   /* hover */
  --pri-soft:  #EEEEFB;   /* 배경 틴트 */

  /* 상태 */
  --up:        #16A34A;   /* 성장·긍정 */
  --hot:       #E0533D;   /* 반응 폭발 */
  --warm:      #E0913D;   /* 상승 중 */

  /* 모서리 */
  --r:    14px;
  --r-lg: 20px;
  --r-xl: 28px;
}
```

---

## 타이포그래피

| 역할 | 폰트 | 크기 | 굵기 |
|------|------|------|------|
| 큰 제목 | Pretendard | 25–30px | 800 |
| 섹션 제목 | Pretendard | 18px | 700 |
| 본문 | Pretendard | 14–15px | 400–500 |
| 보조 | Pretendard | 12–13px | 500–600 |

> Pretendard 단일. letter-spacing -0.02~-0.035em로 제목을 단단하게.

---

## 핵심 컴포넌트

### 채팅 말풍선 (온보딩)
```css
/* AI */
.msg-ai{ background:var(--lav); color:var(--ink);
  border-radius:18px; border-bottom-left-radius:5px; }
/* 유저 */
.msg-user{ background:var(--pri); color:#fff;
  border-radius:18px; border-bottom-right-radius:5px; }
```

### 빠른 답변 버튼
```css
.quick-btn{ background:var(--surface); border:1.5px solid var(--border2);
  border-radius:13px; padding:13px 16px; font-weight:600; }
.quick-btn:hover{ border-color:var(--pri); background:var(--pri-soft);
  color:var(--pri); }
```

### CTA 버튼
```css
.btn-pri{ background:var(--pri); color:#fff;
  border-radius:14px; padding:16px; font-weight:700; }
.btn-pri:hover{ background:var(--pri-deep); }
```

### 결과 카드 (그라데이션)
```css
background: linear-gradient(150deg, var(--pri-soft), var(--surface));
border: 1px solid var(--border);
border-radius: 28px;
```

### 상태 뱃지
```css
.b-hot{  background:#FCEBE8; color:#E0533D; }  /* 반응 폭발 */
.b-warm{ background:#FBF1E3; color:#E0913D; }  /* 상승 중 */
border-radius:999px; padding:4px 11px; font-weight:700;
```

---

## 문구(보이스) 가이드

v6의 직접적이고 강한 카피("10개만 올리면 알고리즘이 보인다")에서, **부드럽고 곁에 있는 듯한 톤**으로.

| 상황 | 지양 | 지향 |
|------|------|------|
| 환영 | "지금 시작하세요" | "막막한 첫 영상, 같이 시작해볼까요?" |
| 온보딩 | "7개 질문에 답하세요" | "편하게 답해주시면 돼요" |
| 트렌드 | "급상승 트렌드 분석" | "이런 영상이 요즘 반응이 좋아요" |
| 벤치마크 | "경쟁자 분석" | "이 분들도 비슷하게 시작했어요" |
| 제작 유도 | "지금 제작" | "자, 그럼 첫 영상 한번 찍어볼까요?" |

원칙: 명령형 대신 청유형, 분석 용어 대신 일상어, 부담 대신 격려.

---

## 레이아웃

- 모바일 우선 (390px 폰 프레임)
- 좌우 패딩 22px
- 카드 간 간격 11px, 섹션 간 20px
- 채팅: 말풍선 최대 너비 80%, 하단 고정 입력 영역
- CTA는 화면 하단 풀폭

---

## v6 대비 변경 요약

| | v6 | v7 |
|---|----|----|
| 배경 | 다크 #050507 | 웜 화이트 #FAFAF8 |
| 포인트 | 라임 #C8FF57 + 네온핑크 | 인디고 #5B5BD6 단일 |
| 폰트 | Bebas Neue + Instrument Sans | Pretendard 단일 |
| 온보딩 | 단계별 선택 (플랫폼/카테고리/연령) | LLM 대화형 |
| 톤 | 강하고 직접적 | 부드럽고 격려하는 |
